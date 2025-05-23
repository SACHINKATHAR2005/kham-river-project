import stationData from "../model/stationData.js";


export const CreateStation = async(req,res)=>{
    try {
        const{stationId,stationName,location,region,riverBankSide,lastUpdated}=req.body;
        const StationData = await stationData.create({
            stationId,stationName,location,region,riverBankSide,lastUpdated
        })

        if(StationData){
            return res.status(201).json({
                message: "Station Data created successfully",
                success: true,
                data: StationData
            });
        }


        return res.status(201).json({
            message: "add releven data",
            success: false,
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
        
    }
}

export const getAllStationData = async(req,res)=>{
    try {
        const StationData = await stationData.find();
        if(StationData){
            return res.status(200).json({
                message: "All Station Data",
                success: true,
                data: StationData
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
        
    }
}

export const getStationDataById = async(req,res)=>{
    try {
        const StationData = await stationData.findById(req.params.id);
        if(StationData){
            return res.status(200).json({
                message: "Station Data",
                success: true,
                data: StationData
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });

    }
}

export const updateStationData = async (req,res)=>{
    try {
        const {stationId,stationName,location,region,riverBankSide,lastUpdated}=req.body;
        const StationData = await stationData.findByIdAndUpdate(req.params.id,{
            stationId,stationName,location,region,riverBankSide,lastUpdated
        },{new:true})
        if(StationData){
            return res.status(200).json({
                message: "Station Data updated successfully",
                success: true,
                data: StationData
            });
        }

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
        
    }
}

export const deleteStationData = async (req,res)=>{
    try {
        const StationData = await stationData.findByIdAndDelete(req.params.id);
        if(StationData){
            return res.status(200).json({
                message: "Station Data deleted successfully",
                success: true,
                data: StationData
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
        
    }
}