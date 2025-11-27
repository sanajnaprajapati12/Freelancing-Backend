// ✅ controllers/userController.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto"

// Generate JWT token
const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// ✅ Step 1: Signup
const signupStep1 = async (req, res) => {
  
  try {
    const { fullname, email, password, mobile } = req.body;

    if (!fullname || !email || !password || !mobile)
      return res.status(400).json({ message: "All fields are required" });

    const exists = await User.findOne({ $or: [{ email }] });
    if (exists)
      return res
        .status(400)
        .json({ message: "User with email or mobile already exists" });

    const user = await User.create({ fullname, email, password, mobile });
    // user.password = undefined;

    const token = generateToken(user);
    // Calculate updated profile completion
   

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "Step 1 complete. Proceed to Step 2",
      user,
      token,
     
    });
  } catch (err) {
    console.error("🔴 Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Step 2: Complete Profile (using uploaded image URL)
const completeProfile = async (req, res) => {

  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    const { city, state, bio, dob, currentDesignation, role, profilePhoto } =
      req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        city,
        state,
        bio,
        dob,
        currentDesignation,
        role: role || req.user.role,
        profilePhoto, // directly save Cloudinary URL or file path
        isProfileComplete: true,
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
     
    });
  } catch (err) {
    console.error(" Step 2 Error:", err);
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};


// ✅ LOGIN Controller (simple password check)
const login = async (req, res) => {

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check email verification
    if (!user.is_emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified. Please verify before login.",
        user: {
          _id: user._id,
          email: user.email,
          fullname: user.fullname,
          role: user.role,
          isEmailVerified: false, // explicitly send false
        },
      });
    }

    // Check password
    if (user.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send user data with isEmailVerified
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        isEmailVerified: user.is_emailVerified || false, // ✅ important
      },
    });
  } catch (err) {
    console.error("🔴 Login error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};




// ✅ Step 1: Forgot Password (send email link)
 const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "No user found with this email" });

    // Generate a reset token
    const token = crypto.randomBytes(20).toString("hex");

    // Save token and expiry in DB
    user.resetPasswordToken = token;
    user.resetPasswordExpiry = Date.now() + 3600000; 
    await user.save();

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // Send email
    const html = `
      <h2>Password Reset</h2>
      <p>Click below to reset your password. This link will expire in 1 hour.</p>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
    `;

    await sendEmail(user.email, "Password Reset Request", html);

    res.status(200).json({
      success: true,
      message: "Reset link sent to your email.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Step 2: Reset Password (update password)
 const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password)
      return res
        .status(400)
        .json({ message: "Token and new password are required" });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }, // check expiry
    });

    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successful!" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

 const getAllUsers = async (req, res) => {
   try {
     // Only admin and client can access
     if (!["admin", "client"].includes(req.user?.role)) {
       return res.status(403).json({ message: "Access denied" });
     }

     // Find all users with role = "freelancer"
     const users = await User.find({ role: "freelancer" }).select(
       "-password -resetPasswordToken -resetPasswordExpiry"
     );

     // Map users with profile completion status
     const data = users.map((user) => {
       const profileCompletion =
         (user.profileStep1?.completed ? 50 : 0) +
         (user.profileStep2?.completed ? 50 : 0);

       return {
         _id: user._id,
         fullname: user.fullname,
         email: user.email,
         role: user.role,
         profileStep1: user.profileStep1,
         profileStep2: user.profileStep2,
         profileCompletion,
       };
     });

     res.status(200).json({
       success: true,
       count: data.length,
       users: data,
     });
   } catch (error) {
     console.error("Get Users Error:", error);
     res.status(500).json({ message: "Server error", error: error.message });
   }
 };

 // ✅ GET ALL SUBADMINS
 const getAllSubAdmins = async (req, res) => {
   try {
     // Assuming your User model has a 'role' field like: role: "admin" | "subadmin" | "client"
     const subAdmins = await User.find({ role: "subadmins" }).select(
       "name email phone role createdAt"
     );

     if (!subAdmins || subAdmins.length === 0) {
       return res.status(404).json({
         success: false,
         message: "No subadmins found.",
       });
     }

     res.status(200).json({
       success: true,
       message: "Subadmins fetched successfully.",
       count: subAdmins.length,
       data: subAdmins,
     });
   } catch (error) {
     console.error("Error fetching subadmins:", error);
     res.status(500).json({
       success: false,
       message: "Server error while fetching subadmins.",
     });
   }
 };


 // ✅ Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" }).select("-password"); // hide password

    if (!employees || employees.length === 0) {
      return res.status(404).json({ message: "No employees found" });
    }

    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


export default { signupStep1,getAllEmployees, completeProfile ,login,resetPassword,forgotPassword,getAllUsers,getAllSubAdmins};
