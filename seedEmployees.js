import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import User from "./models/User.js";

const __dirname = path.resolve();
const employees = JSON.parse(
  fs.readFileSync(path.join(__dirname, "employees.json"), "utf-8")
);

const MONGO_URI = "mongodb://127.0.0.1:27017/FreeLancer";

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    // await User.deleteMany({ role: "employee" });
    await User.insertMany(employees);

    console.log("✅ Employee Data Inserted");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
