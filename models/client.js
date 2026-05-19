import mongoose from "mongoose";

const ClientProjectSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    projectName: {
      type: String,
      required: true,
      trim: true,
    },

    projectPurpose: {
      type: String,
      required: true,
      trim: true,
    },

    techStack: {
      frontend: { type: [String], default: [] },
      backend: { type: [String], default: [] },
      database: { type: [String], default: [] },
      otherTools: { type: [String], default: [] },
    },

    maintenance: {
      isRequired: { type: Boolean, default: false },
      timesPerYear: { type: Number, default: 0 },
    },

    development: {
      isRequired: { type: Boolean, default: false },
      details: { type: String, default: "" },
    },

    testing: {
      isRequired: { type: Boolean, default: false },
      details: { type: String, default: "" },
    },

    SEO: {
      isRequired: { type: Boolean, default: false },
      details: { type: String, default: "" },
    },

    figma: {
      isRequired: { type: Boolean, default: false },
      link: { type: String, default: "" },
    },

    timeDuration: {
      from: { type: Date },
      to: { type: Date },
      estimatedWeeks: { type: Number },
    },

    budget: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "INR" },
    },

    teamSize: {
      developers: { type: Number, default: 1 },
      designers: { type: Number, default: 0 },
      testers: { type: Number, default: 0 },
      others: { type: Number, default: 0 },
    },
    

    projectType: {
      type: String,
      enum: ["self", "client", "company"],
      required: true,
    },

    clientDetails: {
      clientname: { type: String },
      contactPerson: { type: String },
      email: { type: String },
      mobile: { type: String },
      address: { type: String },
    },

    // ⭐ ONLY Current Status
    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "in-progress",
        "completed",
        "on-hold",
        "cancelled",
      ],
      default: "pending",
    },

    companyDetails: {
      companyname: { type: String },
      contactPerson: { type: String },
      email: { type: String },
      mobile: { type: String },
      address: { type: String },
    },

    assignedSubadmins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // link or uploaded file path
    projectDocumentation: { type: String },

    // previous project links
    projectReference: { type: String },
  },
  { timestamps: true }
);

const ClientProject = mongoose.model("ClientProject", ClientProjectSchema);
export default ClientProject;
