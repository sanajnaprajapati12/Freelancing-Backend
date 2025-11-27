// index.js
import express from "express";

import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser"; // ✅ import cookie parser
import connectDB from "./Config/db.js";
import userRoutes from "./routes/userRoutes.js" // Make sure the path is correct
import otpRoutes from "./routes/otpRoutes.js"
import uploadRoutes from "./routes/uploadRoutes.js";
import clientProjectRoutes from "./routes/clientProjectRoutes.js";
import projectassignRoutes from "./routes/projectAssignRoutes.js";
import taskRoutes from "./routes/taskRoutes.js"
// Load environment variables
dotenv.config();

const app = express();

// ✅ Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json()); // parse JSON
app.use(cookieParser());
app.use("/v1/api",userRoutes);// parse cookies
 app.use("/v1/api", otpRoutes);
 app.use("/v1/api",clientProjectRoutes)
// app.use("/v1/api",profileRoutes)
app.use("/v1/api/upload", uploadRoutes);
app.use("/v1/api",projectassignRoutes);
app.use("/v1/api",taskRoutes)
// ✅ Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ Connect to MongoDB
connectDB();

// ✅ Example: Routes (add your routes here)
// import userRoutes from './routes/userRoutes.js';
// app.use('/api/users', userRoutes);

// ✅ Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong",
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

