import Task from "../models/task.js"; 

import ClientProject from "../models/client.js";
import clientProjectController from "./clientProjectController.js";
const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { taskTitle, taskDescription, extraMessage, assignedTo, image } =
      req.body;

    const createdBy = req.user?.id || req.body.createdBy;

    if (!projectId || !taskTitle || !taskDescription) {
      return res.status(400).json({
        success: false,
        message: "projectId, taskTitle and taskDescription are required.",
      });
    }

    const project = await ClientProject.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const task = await Task.create({
      projectId,
      taskTitle,
      taskDescription,
      extraMessage,
      assignedTo,
      createdBy,
      image: image || "", // URL will come here
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully.",
      data: task,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
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
// Assign task to a user
const assignTask = async (req, res) => {
  try {
    const taskId = req.params.id; // use params.id (NOT taskId)
    const { assignedTo } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.assignedTo = assignedTo;
    task.assignedBy = req.user.id;
    task.status = "assigned"; // <-- UPDATE HERE

    await task.save();

    const updatedTask = await Task.findById(taskId); // fetch updated data

    res.json({
      success: true,
      message: "Task assigned successfully",
      data: updatedTask,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getMyTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await Task.find({
      assignedTo: userId,
    })
      .populate("projectId", "projectName")
      .populate("assignedBy", "fullname role email");

    res.status(200).json({
      success: true,
      tasks,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const getTasksByAssignedUser = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.params.userId,
    })
      .populate("projectId", "projectName")
      .populate("assignedBy", "fullname email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const markTaskSeen = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { isSeen: true },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Task marked as seen",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const updateProgress = async (req, res) => {
  try {
    const { percent } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        "progress.percent": percent,
        "progress.updatedAt": new Date(),
      },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Progress updated",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Status updated",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const addRemarks = async (req, res) => {
  try {
    const { remarks } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        "progress.remarks": remarks,
        "progress.updatedAt": new Date(),
      },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Remarks added",
      task,
    });
  } catch (error) {
    res.status(500).json({
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
    assignTask,
    updateTaskStatus,
    deleteTask,
    getMyTasks,
    markTaskSeen,
    updateProgress,
    updateStatus,
    addRemarks

}