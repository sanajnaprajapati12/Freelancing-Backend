import ClientProject from "../models/client.js";
import auth from "../middleware/authMiddleware.js";

const createProject = async (req, res) => {
  try {
    const projectData = req.body;

    // If user is authenticated, attach their ID
    if (req.user) {
      projectData.clientId = req.user.id;
    }

    const newProject = await ClientProject.create(projectData);

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: newProject,
    });
  } catch (error) {
    console.error("❌ Error creating project:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const filter = {};

    if (req.query.clientId) {
      filter.clientId = req.query.clientId;
    }

    const projects = await ClientProject.find(filter)
      .populate("clientId", "fullname email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("❌ Error fetching projects:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// 📌 Get projects by specific client ID (dedicated route)
// ===============================
const getProjectsByClientId = async (req, res) => {
  try {
    const clientId = req.user?.id;

    if (!clientId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const projects = await ClientProject.find({ clientId })
      .populate("assignedSubadmins", "fullname email role") // ⭐ SHOW ASSIGNED SUBADMINS
      .populate("clientId", "fullname email") // ⭐ CLIENT DETAILS
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (err) {
    console.error("❌ Error fetching client projects:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
// ===============================
const getProjectById = async (req, res) => {
  try {
    const project = await ClientProject.findById(req.params.id)
      .populate("assignedSubadmins", "fullname email role") // ⭐ SHOW SUBADMINS
      .populate("clientId", "fullname email role");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("❌ Error fetching project:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const updatedProject = await ClientProject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updatedProject,
    });
  } catch (error) {
    console.error("❌ Error updating project:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// 📌 Delete project by ID
// ===============================
const deleteProject = async (req, res) => {
  try {
    const deletedProject = await ClientProject.findByIdAndDelete(req.params.id);

    if (!deletedProject) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting project:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// ✅ Export all controllers
// ===============================
export default {
  createProject,
  getAllProjects,
  getProjectsByClientId,
  getProjectById,
  updateProject,
  deleteProject,
};
