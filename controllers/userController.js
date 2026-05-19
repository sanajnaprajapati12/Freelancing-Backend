// ✅ controllers/userController.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto"
import nodemailer from "nodemailer";
import  calculateProfileCompletion from "../profileCompletion.js"
import ClientProject from "../models/client.js";
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

    const exists = await User.findOne({ email });
    if (exists)
      return res
        .status(400)
        .json({ message: "User with this email already exists" });

    const user = await User.create({ fullname, email, password, mobile });

    // Step 1 completion = 50%
   user.profileCompletion = calculateProfileCompletion(user);
    
    await user.save();

    const token = generateToken(user);

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
      profileCompletion: user.profileCompletion,
    });
  } catch (err) {
    console.error("🔴 Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ✅ Step 2: Complete Profile (using uploaded image URL)

  const completeProfile = async (req, res) => {
    try {
      const userId = req.user.id; // auth middleware se aa rahi ID

      // Allow only allowed fields
      const allowedFields = [
        "city",
        "state",
        "country",
        "bio",
        "dob",
        "gender",
        "skills",
        "profileImage",
      ];

      const updates = {};

      // Only allowed fields ko hi update karo
      for (let key of allowedFields) {
        if (req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      }

      // ⭐ Update user by ID
      let user = await User.findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // ⭐ Recalculate profile completion
      user.profileCompletion = calculateProfileCompletion(user);
      user.isProfileComplete = user.profileCompletion === 100;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user,
        profileCompletion: user.profileCompletion,
        isProfileComplete: user.isProfileComplete,
      });
    } catch (err) {
      console.error("Profile update error:", err);
      res.status(500).json({
        success: false,
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
    // Send user data with profileCompletion info
   res.status(200).json({
     success: true,
     message: user.isProfileComplete
       ? "Login successful"
       : "Your profile is incomplete. Please complete your profile to access the dashboard.",
     token,
     user: {
       _id: user._id,
       fullname: user.fullname,
       email: user.email,
       role: user.role,
       isEmailVerified: user.is_emailVerified || false,
       profileCompletion: user.profileCompletion || 0,
       isProfileComplete: user.isProfileComplete || false,
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




const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not found" });

    // create reset token
    const resetToken = jwt.sign({ id: user._id }, "RESET_SECRET", {
      expiresIn: "15m",
    });

    user.resetPasswordToken = resetToken;
    await user.save();

    res.json({
      message: "Reset token generated",
      resetToken,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const { newPassword } = req.body;

    // verify the token
    const decoded = jwt.verify(token, "RESET_SECRET");

    // find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    // update password
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password reset successful!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    // Fetch all sub-admins
    const subAdmins = await User.find({ role: "subadmins" }).select(
      "fullname email mobile role createdAt"
    );

    if (!subAdmins || subAdmins.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No subadmins found.",
      });
    }

    // For each sub-admin, count assigned projects
    const subAdminsWithProjects = await Promise.all(
      subAdmins.map(async (sub) => {
        const projectCount = await ClientProject.countDocuments({
          subAdminId: sub._id,
        });
        return {
          ...sub.toObject(),
          assignedProjects: projectCount,
          status: "Active", // optional, you can have real status field
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Subadmins fetched successfully.",
      count: subAdminsWithProjects.length,
      data: subAdminsWithProjects,
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
 
const assignRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const updated = await User.findByIdAndUpdate(id, { role }, { new: true });

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Role updated", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // If NOT admin, user can update ONLY themselves
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own profile",
      });
    }

    // Prevent non-admin from updating role
    if (req.user.role !== "admin" && req.body.role) {
      delete req.body.role;
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Employee updated", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
 const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export default { signupStep1,getAllEmployees, completeProfile ,login,resetPassword,forgotPassword,getAllUsers,getAllSubAdmins,updateEmployee,deleteEmployee,assignRole};
