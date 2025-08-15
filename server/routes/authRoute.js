import express from "express";
import { Login, Register } from "../controllers/auth.js";

const router = express.Router();

router.post("/register",Register);

// http://localhost:5000/api/auth/register
router.post("/login",Login);
// http://localhost:5000/api/auth/login

export default router;