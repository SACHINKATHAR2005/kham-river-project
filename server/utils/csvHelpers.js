import StationData from '../model/stationData.js';
import WaterQuality from '../model/waterQualityData.js';

export const validateRow = async (row) => {
    try {
        const station = await StationData.findOne({ stationId: row.stationId });
        if (!station) {
            return `Invalid station ID: ${row.stationId}`;
        }

        // Validate pH (0-14)
        const pH = parseFloat(row.pH);
        if (isNaN(pH) || pH < 0 || pH > 14) {
            return `Invalid pH value: ${row.pH}`;
        }

        // Validate temperature (0-100°C)
        if (row.temperature && (row.temperature < 0 || row.temperature > 100)) {
            return `Invalid temperature value: ${row.temperature}`;
        }

        // Validate EC (positive number)
        if (row.ec && row.ec < 0) {
            return `Invalid EC value: ${row.ec}`;
        }

        // Validate TDS (positive number)
        if (row.tds && row.tds < 0) {
            return `Invalid TDS value: ${row.tds}`;
        }

        // Validate turbidity (positive number)
        if (row.turbidity && row.turbidity < 0) {
            return `Invalid turbidity value: ${row.turbidity}`;
        }

        return null;
    } catch (error) {
        console.error('Validation error:', error);
        return 'Internal validation error';
    }
};

export const cleanData = async (row) => {
    try {
        const station = await StationData.findOne({ stationId: row.stationId });
        if (!station) return null;

        return {
            stationId: station._id,
            timestamp: new Date(row.timestamp),
            pH: parseFloat(row.pH),
            temperature: parseFloat(row.temperature),
            ec: parseFloat(row.ec),
            tds: parseFloat(row.tds),
            turbidity: parseFloat(row.turbidity),
            remarks: row.remarks?.trim() || ''
        };
    } catch (error) {
        console.error('Data cleaning error:', error);
        return null;
    }
};