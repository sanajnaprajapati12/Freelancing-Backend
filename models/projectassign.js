import mongoose from "mongoose";

const ProjectAssignSchema = new mongoose.Schema(
  {
    isAssigned: { type: Boolean, default: false },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientProject",
      required: true,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    teamMembers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["dev", "design", "test", "other"],
        },
      },
    ],

    assignmentDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["Pending", "assigned", "In Progress", "On Hold", "Completed"],
      default: "Pending",
    },
    
    progress: {
      percent: { type: Number, default: 0 },
      remarks: { type: String, default: "" },
      updatedAt: { type: Date },
    },

    activityLogs: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        action: { type: String },
        message: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    attachments: [
      {
        filename: { type: String },
        fileUrl: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    // teamMembers: [
    //   {
    //     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    //     role: { type: String, enum: ["dev", "design", "test", "other"] },
    //   },
    // ],

    // teamMembersCount: {
    //   dev: { type: Number, default: 0 },
    //   design: { type: Number, default: 0 },
    //   test: { type: Number, default: 0 },
    //   other: { type: Number, default: 0 },
    // },

    approval: {
      isApproved: { type: Boolean, default: false },
      approvedAt: { type: Date },
      remarks: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model("ProjectAssign", ProjectAssignSchema);
