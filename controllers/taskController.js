import Task from "../models/task.js"; 

import ClientProject from "../models/client.js";
import clientProjectController from "./clientProjectController.js";
const createTask = async (req, res) => {
  try {
    const { projectId, taskTitle, taskDescription, extraMessage, assignedTo,image } =
      req.body;
    const createdBy = req.user?.id; // subadmin ID

    if (!projectId || !taskTitle || !taskDescription) {
      return res.status(400).json({
        success: false,
        message: "projectId, taskTitle and taskDescription are required",
      });
    }

    // Check project exists
    const project = await ClientProject.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Create task
    const task = await Task.create({
      projectId,
      taskTitle,
      taskDescription,
      extraMessage,
      assignedTo,
      createdBy,
      image
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

 const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("projectId", "projectName status")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};



const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("projectId", "projectName status")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndUpdate(
      id,
      { status: req.body.status },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Status updated",
      task,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate("assignedTo", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const getTasksByAssignedUser = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.userId })
      .populate("projectId", "projectName")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const updateTask = async (req, res) => {
  try {
    const allowed = [
      "taskTitle",
      "taskDescription",
      "extraMessage",
      "assignedTo",
      "image",
    ];

    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowed.includes(key)) updates[key] = req.body[key];
    });

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const getTasksBySubadmin = async (req, res) => {
  try {
    const subadminId = req.user?.id;

    if (!subadminId) {
      return res.status(400).json({
        success: false,
        message: "Subadmin ID missing.",
      });
    }

    const tasks = await Task.find({ createdBy: subadminId })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Error fetching subadmin tasks:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
export default {
    createTask,
   getAllTasks,
    getTaskById,
    updateTask,
    getTasksByAssignedUser,
    getTasksByProject,
    getTasksBySubadmin,
    
    updateTaskStatus,
    deleteTask

}