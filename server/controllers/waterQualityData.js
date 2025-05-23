import waterQualityData from "../model/waterQualityData.js";
import stationData from "../model/stationData.js";

export const createWaterQualityData = async (req, res) => {
    try {
        const { stationId, timestamp, pH, temperature, turbidity, tds, ec, remarks } = req.body;

        if (!stationId || !timestamp) {
            return res.status(400).json({
                message: "Station ID and Timestamp are required",
                success: false,
            });
        }

        const stationExists = await stationData.findById(stationId);
        if (!stationExists) {
            return res.status(404).json({
                message: "Station not found",
                success: false,
            });
        }

        const newData = await waterQualityData.create({
            stationId, timestamp, pH, temperature, turbidity, tds, ec, remarks
        });

        return res.status(201).json({
            message: "Water Quality Data created successfully",
            success: true,
            data: newData,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
};

export const getAllWaterQualityData = async (req, res) => {
    try {
        const allData = await waterQualityData.find().populate("stationId"); // Optional populate
        return res.status(200).json({
            message: "All Water Quality Data",
            success: true,
            data: allData,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
};

export const getWaterQualityDataByStation = async (req, res) => {
    try {
        const { stationId } = req.params;
        const data = await waterQualityData.find({ stationId });
        if (data.length === 0) {
            return res.status(404).json({
                message: "No data found for this station",
                success: false,
            });
        }
        return res.status(200).json({
            message: "Data fetched successfully",
            success: true,
            data,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
};

export const updateWaterQualityData = async (req, res) => {
    try {
        const updatedData = await waterQualityData.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedData) {
            return res.status(404).json({
                message: "Data not found",
                success: false,
            });
        }
        return res.status(200).json({
            message: "Water Quality Data updated successfully",
            success: true,
            data: updatedData,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
};

export const deleteWaterQualityData = async (req, res) => {
    try {
        const deleted = await waterQualityData.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                message: "Data not found",
                success: false,
            });
        }
        return res.status(200).json({
            message: "Water Quality Data deleted successfully",
            success: true,
            data: deleted,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
};
