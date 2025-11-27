import express from "express";

import auth from "../middleware/authMiddleware.js";
const router = express.Router();
import taskController from "../controllers/taskController.js";
// Create Task
router.post("/create",auth.verifyToken, taskController.createTask);

// Get all tasks
router.get("/all",taskController.getAllTasks);

// Get task by ID
router.get("/:id", taskController.getTaskById);

// Get tasks by project ID
router.get("/project/:projectId", taskController.getTasksByProject);

// Get tasks by assigned user
router.get("/assigned/:userId", taskController.getTasksByAssignedUser);

// Update task
router.put("/update/:id", auth.verifyToken, taskController.updateTask);

// Delete task
router.delete("/delete/:id", auth.verifyToken, taskController.deleteTask);

export default router;
