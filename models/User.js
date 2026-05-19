import mongoose from "mongoose"; 

import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: false,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: true, // hide password when fetching
    },
    mobile: {
      type: String,
      required: true,
    },
    city: String,
    state: String,
    bio: String,
    // profilePhoto: {
    //   type: String, // store Cloudinary URL
    //   default: "",
    // },
    dob: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["employee", "client", "admin", "subadmins", "freelancer"],
      default: "employee",
    },
    currentDesignation: {
      type: String,
      default: "freelancer",
    },
    profilePhoto: {
      type: String, // stores Cloudinary URL
      default: "", // optional default
    },

    // For OTP & verification
    is_emailVerified: {
      type: Boolean,
      default: false,
    },
    is_mobileVerified: {
      type: Boolean,
      default: false,
    },
    profileCompletion: { type: Number, default: 0 }, // 0 - 100%
    isProfileComplete: { type: Boolean, default: false },

    // For Google login
    googleId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);



const User = mongoose.model("User", userSchema);
export default User