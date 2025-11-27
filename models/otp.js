import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["email", "mobile"], // you can add more types like "password_reset"
      required: true,
    },
    value: {
      type: String,
      required: true, // email or mobile number
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Optional: Auto delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Otp", otpSchema);
