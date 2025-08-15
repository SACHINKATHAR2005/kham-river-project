import express from 'express';
import axios from 'axios';

const router = express.Router();

// Get predictions for all stations
router.get('/:days', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:8000/predict/${req.params.days}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch predictions',
      error: error.message 
    });
  }
});

// Get predictions for specific station
router.get('/station/:stationId/:days', async (req, res) => {
  try {
    const response = await axios.get(
      `http://localhost:8000/predict/station/${req.params.stationId}/${req.params.days}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch station predictions',
      error: error.message 
    });
  }
});

export default router;