import mongoose from 'mongoose';

const stationDataSchema = new mongoose.Schema({
    stationId: {
        type: Number,
        required: true,
        unique: true
    },
    stationName: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: {
            latitude: { type: Number },
            longitude: { type: Number }
        }
    },
    region: {
        type: String
    },
    riverBankSide: {
        type: String,
        enum: ["Left", "Right", "Center"],
        default: "Center"
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model('StationData', stationDataSchema);
//export default mongoose.model("Admin", adminSchema);