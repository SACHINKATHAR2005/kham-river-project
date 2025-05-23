import express from "express";
import { CreateStation, deleteStationData, getAllStationData, getStationDataById, updateStationData } from "../controllers/stationData.js";

const Router = express.Router();

Router.post("/create",CreateStation);
// http://localhost:5000/api/station/create
Router.get("/getall",getAllStationData);
// http://localhost:5000/api/station/getall
Router.get("/get/:id",getStationDataById);
// http://localhost:5000/api/station/get/:id
Router.put("/update/:id",updateStationData);
// http://localhost:5000/api/station/update/:id
Router.delete("/delete/:id",deleteStationData);
// http://localhost:5000/api/station/delete/:id


export default Router;
