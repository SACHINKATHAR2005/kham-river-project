import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './db/db.js';
import authRouter from "./routes/authRoute.js"
import stationDataRouter from "./routes/stationRoute.js"
import waterQualityData from './routes/waterQualityRoutes.js';

const app = express();
const allowedOrigins = ['http://localhost:5173', 
  'https://kham-river-project.vercel.app',
  'https://kham-river-project-git-main-sachinkathar2005.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

app.use("/api/auth",authRouter)
app.use("/api/station",stationDataRouter)
app.use("/api/waterQuality",waterQualityData)

app.listen(process.env.PORT || 50000, () => {
    connectDB()
    console.log(`Server is running on port ${process.env.PORT}`);
})