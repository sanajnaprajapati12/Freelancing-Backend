import express from "express";
import otpController from "../controllers/otpController.js";

const router = express.Router();

// Routes
router.post("/send-otp", otpController.sendOtp);
router.post("/verify-otp", otpController.verifyOtp);

export default router;
