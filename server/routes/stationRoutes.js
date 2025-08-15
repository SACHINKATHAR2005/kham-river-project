import express from 'express';
import { Station } from '../model/station.js';

const router = express.Router();

// Get all stations
router.get('/getall', async (req, res) => {
  try {
    const stations = await Station.find({});
    res.json({ success: true, data: stations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add new station
router.post('/add', async (req, res) => {
  try {
    const station = new Station(req.body);
    await station.save();
    res.status(201).json({ success: true, data: station });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update station
router.put('/update/:id', async (req, res) => {
  try {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: station });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete station
router.delete('/delete/:id', async (req, res) => {
  try {
    await Station.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Station deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;