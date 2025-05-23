import express from 'express';
import { createWaterQualityData, deleteWaterQualityData, getAllWaterQualityData, updateWaterQualityData } from '../controllers/waterQualityData.js';

const router = express.Router();

router.post("/create", createWaterQualityData);

// http://localhost:5000/api/waterQuality/create
router.get("/getall", getAllWaterQualityData);
// http://localhost:5000/api/waterQuality/getall
router.put("/update/:id", updateWaterQualityData);
// http://localhost:5000/api/waterQuality/update/:id
router.delete("/delete/:id", deleteWaterQualityData);
// http://localhost:5000/api/waterQuality/delete/:id

export default router;