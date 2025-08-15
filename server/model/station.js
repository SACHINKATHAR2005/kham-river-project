import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema({
  stationName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  riverBankSide: {
    type: String,
    enum: ['Left', 'Right'],
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { 
  timestamps: true 
});

export const Station = mongoose.model('Station', stationSchema);