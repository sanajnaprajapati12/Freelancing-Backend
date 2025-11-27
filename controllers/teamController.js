import User from "../models/User.js";
import ClientProject from "../models/client.js";
import Team from "../models/Team.js";
import projectassign from "../models/projectassign.js";
const createTeam = async (req, res) => {
  try {
    const { teamName, members } = req.body;
    const { projectId } = req.params; // ✅ get from URL
    const userId = req.user?._id || req.user?.id;

    if (!teamName || !projectId || !members || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Team name, project ID & members are required",
      });
    }

    const project = await ClientProject.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const newTeam = await Team.create({
      projectId,
      teamName,
      members,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      team: newTeam,
    });
  } catch (error) {
    console.error("Create Team Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
// ✅ View all teams of a project
const viewTeamsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const teams = await Team.find({ projectId })
      .populate("members", "fullname email currentDesignation") // only selected fields
      .populate("createdBy", "fullname email role") // who created the team
      .sort({ createdAt: -1 });

    if (!teams || teams.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No teams found for this project",
      });
    }

    res.status(200).json({
      success: true,
      count: teams.length,
      teams,
    });
  } catch (error) {
    console.error("View Teams Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
const getSingleProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    // ✅ Find project details
    const project = await ClientProject.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // ✅ Find assignment related to this project
    const assignment = await projectassign.findOne({ projectId })
      .populate("assignedBy", "fullname email role")
      .populate("assignedTo", "fullname email currentDesignation");

    // ✅ Find teams linked to this project
    const teams = await Team.find({ projectId })
      .populate("members", "fullname email currentDesignation")
      .populate("createdBy", "fullname email role");

    // ✅ Combine everything
    res.status(200).json({
      success: true,
      project,
      assignment: assignment || null,
      teams: teams || [],
    });
  } catch (error) {
    console.error("Get Single Project Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
export default{
    createTeam,
    viewTeamsByProject,
    getSingleProject
}