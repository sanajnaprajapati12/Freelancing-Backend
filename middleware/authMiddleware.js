import jwt from "jsonwebtoken"
import User from "../models/User.js";
// Verify JWT token middleware
const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

    console.log("🔹 Incoming token:", token); 
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔹 Decoded token:", decoded); 

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = { id: user._id, role: user.role };
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    res
      .status(403)
      .json({ message: "Invalid or expired token", status: "failed" });
  }
};

// Role-based middleware
 const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. You do not have permission.",
        status: "failed",
      });
    }
    next();
  };
};
export default{
  verifyToken,
   checkRole
}