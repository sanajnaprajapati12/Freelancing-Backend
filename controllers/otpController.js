import Otp from "../models/otp.js";
import crypto from "crypto";
import User from "../models/User.js";

// Function to generate a 6-digit  OTP
const generateOtpCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ✅ Generate OTP
const sendOtp = async (req, res) => {
  try {
    const { type, value } = req.body;

    if (!type || !value) {
      return res
        .status(400)
        .json({ success: false, message: "Type and value are required" });
    }

    // Generate random 6-digit OTP
    const otpCode = generateOtpCode();

    // Set expiry (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP in DB
    const otp = await Otp.create({
      type,
      value,


      otp: otpCode,
      expiresAt,
    });

   
    console.log(`✅ OTP for ${value}: ${otpCode}`);

    return res.status(200).json({
      success: true,
      message: "OTP generated successfully",
      otpId: otp._id,
      otp: otpCode, 
    });
  } catch (error) {
    console.error("Error generating OTP:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { value, otp } = req.body;

    if (!value || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Value and OTP are required" });
    }

    // Find the OTP document
    const otpRecord = await Otp.findOne({ value, otp });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Check if expired
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // Mark verified
    otpRecord.verified = true;
    await otpRecord.save();
    await User.findOneAndUpdate(
      { email: value.trim().toLowerCase() },
      { is_emailVerified: true }
    );

    return res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export default {
  sendOtp,
  verifyOtp,
};
