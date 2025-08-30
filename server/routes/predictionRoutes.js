import express from 'express';
import axios from 'axios';

const router = express.Router();

// Get predictions for all stations
router.get('/:days', async (req, res) => {
  try {
    const mlResp = await axios.get(`http://localhost:8000/predict/${req.params.days}`);
    const payload = mlResp.data;
    // Normalize shape: ensure predictions array and alias data for backward compatibility
    const predictions = Array.isArray(payload) ? payload : payload.predictions || [];
    const standards = Array.isArray(payload) ? undefined : payload.standards;
    res.json({
      success: true,
      standards,
      predictions,
      data: predictions, // alias for existing clients
    });
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
    // Attempt station-specific endpoint first; if ML service lacks it, fall back to general
    let mlResp;
    try {
      mlResp = await axios.get(
        `http://localhost:8000/predict/station/${req.params.stationId}/${req.params.days}`
      );
    } catch (e) {
      // Fallback to general predictions
      mlResp = await axios.get(`http://localhost:8000/predict/${req.params.days}`);
    }
    const payload = mlResp.data;
    const predictions = Array.isArray(payload) ? payload : payload.predictions || [];
    const standards = Array.isArray(payload) ? undefined : payload.standards;
    res.json({
      success: true,
      standards,
      predictions,
      data: predictions,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch station predictions',
      error: error.message 
    });
  }
});

// Optional: expose standards directly via server
router.get('/standards', async (_req, res) => {
  try {
    const mlResp = await axios.get('http://localhost:8000/standards');
    res.json({ success: true, standards: mlResp.data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch standards', error: error.message });
  }
});

export default router;