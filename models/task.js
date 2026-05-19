import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientProject",
      required: true, // ⭐ NOW EVERY TASK BELONGS TO A PROJECT
    },

    taskTitle: {
      type: String,
      required: true,
      trim: true,
    },

    taskDescription: {
      type: String,
      required: true,
      trim: true,
    },

    extraMessage: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isSeen: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Hold", "assigned"],
      default: "Pending",
    },

    // 👇 Optional but very useful
    progress: {
      percent: { type: Number, default: 0 },
      remarks: { type: String, default: "" },
      updatedAt: { type: Date, default: Date.now },
    },

    activityLogs: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        action: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },

  { timestamps: true }
);

export default mongoose.model("Task", TaskSchema);
