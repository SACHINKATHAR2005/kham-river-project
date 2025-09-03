import express from 'express';
import axios from 'axios';
import multer from 'multer';
import { parse } from 'csv-parse';
import { Readable } from 'stream';
import WaterQualityModel from '../model/waterQualityData.js';
import StationModel from '../model/stationData.js';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    fieldSize: 1024 * 1024 // 1MB field size limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed!'), false);
    }
  }
});

// Helper function to trigger ML model training
async function triggerModelTraining() {
  try {
    const response = await axios.post('http://localhost:8000/train');
    console.log('ML model training triggered:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to trigger ML model training:', error.message);
    // Don't throw error - allow the main operation to complete
    return { success: false, error: error.message };
  }
}

// Get all water quality data
router.get('/getall', async (req, res) => {
  try {
    const waterQualityData = await WaterQualityModel.find({})
      .populate('stationId')
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      data: waterQualityData
    });
  } catch (error) {
    console.error('Error fetching water quality data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching water quality data',
      error: error.message
    });
  }
});

// CSV upload route
router.post('/upload-csv', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  try {
    const results = [];
    const errors = [];
    let rowNumber = 0;

    // Create a readable stream from the buffer
    const stream = Readable.from(req.file.buffer.toString());
    
    // Setup CSV parser
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    // Pre-fetch all stations to avoid repeated database queries
    const stations = await StationModel.find({});
    const stationMap = new Map();
    stations.forEach(station => {
      // Map by MongoDB _id
      stationMap.set(station._id.toString(), station);
      // Map by stationId (the numeric ID from your CSV)
      stationMap.set(station.stationId.toString(), station);
      // Also map by name if available
      if (station.stationName) {
        stationMap.set(station.stationName.toLowerCase(), station);
      }
    });

    // Process each row
    for await (const row of stream.pipe(parser)) {
      rowNumber++;
      
      try {
        // Find station by stationId or name
        let station = stationMap.get(row.stationId);
        if (!station && row.stationName) {
          station = stationMap.get(row.stationName.toLowerCase());
        }

        if (!station) {
          errors.push({ 
            row: rowNumber, 
            error: `Station ID/Name ${row.stationId || row.stationName} not found` 
          });
          continue;
        }

        // Create water quality data object
        const waterQualityData = {
          stationId: station._id,
          timestamp: new Date(row.timestamp),
          pH: parseFloat(row.pH),
          temperature: parseFloat(row.temperature),
          ec: parseFloat(row.ec),
          tds: parseFloat(row.tds),
          turbidity: parseFloat(row.turbidity)
        };

        // Validate data
        if (!validateData(waterQualityData)) {
          errors.push({ 
            row: rowNumber, 
            error: 'Invalid data values' 
          });
          continue;
        }

        results.push(waterQualityData);
      } catch (error) {
        errors.push({ 
          row: rowNumber, 
          error: error.message 
        });
      }
    }

    // Handle validation errors
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors found',
        errors
      });
    }

    // Save data if we have valid results
    if (results.length > 0) {
      await WaterQualityModel.insertMany(results);
      
      // Trigger model training after successful upload
      await triggerModelTraining();
      
      return res.json({
        success: true,
        message: 'Data uploaded successfully',
        rowsProcessed: results.length
      });
    }

    return res.status(400).json({
      success: false,
      message: 'No valid data to process'
    });

  } catch (error) {
    console.error('CSV Upload Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing CSV file',
      error: error.message
    });
  }
});

// Add single water quality data entry
router.post('/add', async (req, res) => {
  try {
    const { stationId, pH, temperature, ec, tds, turbidity, timestamp } = req.body;

    // Validate required fields
    if (!stationId || pH === undefined || temperature === undefined || 
        ec === undefined || tds === undefined || turbidity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All water quality parameters are required'
      });
    }

    // Verify station exists
    const station = await StationModel.findById(stationId);
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    // Create water quality data object
    const waterQualityData = {
      stationId,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      pH: parseFloat(pH),
      temperature: parseFloat(temperature),
      ec: parseFloat(ec),
      tds: parseFloat(tds),
      turbidity: parseFloat(turbidity)
    };

    // Validate data
    if (!validateData(waterQualityData)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data values. Please check parameter ranges.'
      });
    }

    // Save the data
    const newReading = new WaterQualityModel(waterQualityData);
    await newReading.save();

    // Trigger model training after successful single entry
    await triggerModelTraining();

    res.status(201).json({
      success: true,
      message: 'Water quality data added successfully',
      data: newReading
    });

  } catch (error) {
    console.error('Error adding water quality data:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding water quality data',
      error: error.message
    });
  }
});

// Get water quality data by station
router.get('/station/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    const { limit = 100, page = 1 } = req.query;

    const skip = (page - 1) * limit;
    
    const waterQualityData = await WaterQualityModel.find({ stationId })
      .populate('stationId')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await WaterQualityModel.countDocuments({ stationId });

    res.json({
      success: true,
      data: waterQualityData,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching station water quality data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching station water quality data',
      error: error.message
    });
  }
});

// Get latest water quality reading for a station
router.get('/latest/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    
    const latestReading = await WaterQualityModel.findOne({ stationId })
      .populate('stationId')
      .sort({ timestamp: -1 });
    
    if (!latestReading) {
      return res.status(404).json({
        success: false,
        message: 'No readings found for this station'
      });
    }
    
    res.json({
      success: true,
      data: latestReading
    });
  } catch (error) {
    console.error('Error fetching latest reading:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching latest reading',
      error: error.message
    });
  }
});

// Helper function to validate data
function validateData(data) {
  return (
    !isNaN(data.pH) && data.pH >= 0 && data.pH <= 14 &&
    !isNaN(data.temperature) && data.temperature >= 0 &&
    !isNaN(data.ec) && data.ec >= 0 &&
    !isNaN(data.tds) && data.tds >= 0 &&
    !isNaN(data.turbidity) && data.turbidity >= 0
  );
}

export default router;