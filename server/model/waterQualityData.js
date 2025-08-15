import mongoose from 'mongoose';

const waterQualitySchema = new mongoose.Schema({
    stationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StationData',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    pH: {
        type: Number,
        min: 0,
        max: 14,
        required: true
    },
    temperature: {
        type: Number,
        required: true
    },
    turbidity: {
        type: Number,
        required: true
    },
    tds: {
        type: Number,
        required: true
    },
    ec: {
        type: Number,
        required: true
    },
    remarks: {
        type: String,
        default: ''
    }
}, { timestamps: true });

export default mongoose.model('WaterQuality', waterQualitySchema);