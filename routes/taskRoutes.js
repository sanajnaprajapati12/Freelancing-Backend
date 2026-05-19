import express from "express";

import auth from "../middleware/authMiddleware.js";

const router = express.Router();
import taskController from "../controllers/taskController.js";
// Create Task
router.post(
  "/create/:projectId",
  auth.verifyToken,
  
  taskController.createTask
);


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
router.get(
  "/tasks/subadmin/:id",
  auth.verifyToken,
  taskController.getTasksBySubadmin
);


router.delete("/delete/:id", auth.verifyToken, taskController.deleteTask);

router.put("/:id/assign", auth.verifyToken, taskController.assignTask);
router.get("/my-tasks", auth.verifyToken, taskController.getMyTasks);
router.patch("/tasks/:id/seen",taskController.markTaskSeen);
router.patch("/tasks/:id/progress", taskController.updateProgress);
router.patch("/tasks/:id/status",taskController.updateStatus);
router.patch("/tasks/:id/remarks",  taskController.addRemarks);
export default router;
