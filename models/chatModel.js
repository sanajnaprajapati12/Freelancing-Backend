import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // later you can replace with ObjectId
    },
    role: {
      type: String, // "user" | "assistant"
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    userRole: {
      type: String, // "admin" | "client" | "guest"
      default: "client",
    },
    fileUrl: String,
    fileType: String,
  },
  { timestamps: true },
);

export default mongoose.model("Message", messageSchema);
