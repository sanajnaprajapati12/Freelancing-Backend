import ProjectAssign from "../models/projectassign.js";
import User from "../models/User.js";
import ClientProject from "../models/client.js";

// ================================
// ✅ Assign Project to SubAdmin
// ================================
const assignProject = async (req, res) => {
  try {
    const { projectId, assignedBy, assignedTo, dueDate, priority } = req.body;

    if (!projectId || !assignedBy || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: "projectId, assignedBy, and assignedTo are required.",
      });
    }

    // Check project exists
    const projectExists = await ClientProject.findById(projectId);
 
    if (!projectExists) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Check if assignedTo is a SubAdmin
    const subAdmin = await User.findById(assignedTo);
    if (!subAdmin || subAdmin.role !== "subadmins") {
      return res.status(400).json({
        success: false,
        message: "Invalid SubAdmin ID.",
      });
    }

    // Check project already assigned
    const alreadyAssigned = await ProjectAssign.findOne({ projectId });
    if (alreadyAssigned) {
      return res.status(400).json({
        success: false,
        message: "This project is already assigned.",
      });
    }

    // Create assignment
    const newAssignment = await ProjectAssign.create({
      isAssigned: true,
      projectId,
      assignedBy,
      assignedTo,
      dueDate,
      priority,
      status: "assigned",
    });

    // ⭐ VERY IMPORTANT: Add assigned subadmin inside ClientProject
    await ClientProject.findByIdAndUpdate(
      projectId,
      {
        assignDetails: newAssignment._id,
        $addToSet: { assignedSubadmins: assignedTo }, // ⭐ Correct place
        status: "assigned",
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Project successfully assigned to subadmin.",
      data: newAssignment,
    });
  } catch (error) {
    console.error("Error assigning project:", error);
    res.status(500).json({
      success: false,
      message: "Server error while assigning project.",
    });
  }
};

// ================================
// ✅ Get All Assigned Projects
// ================================
const getAllAssignedProjects = async (req, res) => {
  try {
    const assignments = await ProjectAssign.find()
      .populate("projectId", "projectName projectPurpose status")
      .populate("assignedBy", "name email role")
      .populate("assignedTo", "name email role");

    res.status(200).json({
      success: true,
      message: "All assigned projects fetched successfully.",
      data: assignments,
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching assigned projects.",
    });
  }
};

// ================================
// ✅ Get Projects by SubAdmin
// ================================
const getSubAdminProjects = async (req, res) => {
  try {
    const { subAdminId } = req.params;

    const projects = await ProjectAssign.find({ assignedTo: subAdminId })
      .populate("projectId", "projectName projectPurpose status")
      .populate("assignedBy", "name email role");

    res.status(200).json({
      success: true,
      message: "Projects assigned to this SubAdmin fetched successfully.",
      data: projects,
    });
  } catch (error) {
    console.error("Error fetching SubAdmin projects:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching SubAdmin projects.",
    });
  }
};

// ================================
// ✅ Update Assignment Status (SubAdmin Dashboard)
// ================================
const updateAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, progress, remarks } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Assignment ID is required.",
      });
    }

    const assignment = await ProjectAssign.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    // Update fields
    if (status) assignment.status = status;
    if (progress !== undefined) assignment.progress.percent = progress;
    if (remarks) assignment.progress.remarks = remarks;
    assignment.progress.updatedAt = new Date();

    // Activity Log
    assignment.activityLogs.push({
      userId,
      action: "status_update",
      message: `Status changed to ${status || "unchanged"}`,
      timestamp: new Date(),
    });

    await assignment.save();

 
    if (status) {
      await ClientProject.findByIdAndUpdate(
        assignment.projectId,
        { status },
        { new: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Assignment & Project updated successfully.",
      data: assignment,
    });
  } catch (error) {
    console.error("Error updating assignment:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating assignment.",
      error: error.message,
    });
  }
};

export default {
  assignProject,
  getAllAssignedProjects,
  getSubAdminProjects,
  updateAssignmentStatus,
};
