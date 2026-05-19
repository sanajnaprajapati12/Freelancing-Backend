import jwt from "jsonwebtoken";
import User from "../models/User.js";

// -------------------------
// VERIFY TOKEN
// -------------------------
const verifyToken = async (req, res, next) => {
  try {
    let token = null;

    // 1️⃣ Check Cookie
    if (req.cookies?.token) token = req.cookies.token;

    // 2️⃣ Check Authorization header (Bearer token)
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        token = parts[1];
      }
    }

    // 3️⃣ No token found
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // 4️⃣ Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5️⃣ Find user from DB
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 6️⃣ Attach user to req
    req.user = { id: user._id, role: user.role };

    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    return res
      .status(403)
      .json({ message: "Invalid or expired token", status: "failed" });
  }
};

// -------------------------
// ROLE CHECK MIDDLEWARE
// -------------------------
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. You do not have permission.",
        status: "failed",
      });
    }
    next();
  };
};
const checkProfileComplete = async (req, res, next) => {
  try {
    const userId = req.user.id; // comes from your auth middleware
    const user = await User.findById(userId);

    if (!user.isProfileComplete) {
      return res.status(403).json({
        success: false,
        message: "Please complete your profile before accessing the dashboard",
        profileCompletion: user.profileCompletion,
      });
    }

    next(); // profile complete, allow access
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Correct Export (Named Exports)
export default { verifyToken, checkRole ,checkProfileComplete};
