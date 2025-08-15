import mongoose from 'mongoose';

const waterQualitySchema = new mongoose.Schema({
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },
  pH: {
    type: Number,
    required: true
  },
  temperature: {
    type: Number,
    required: true
  },
  ec: {
    type: Number,
    required: true
  },
  tds: {
    type: Number,
    required: true
  },
  turbidity: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

export const WaterQuality = mongoose.model('WaterQuality', waterQualitySchema);