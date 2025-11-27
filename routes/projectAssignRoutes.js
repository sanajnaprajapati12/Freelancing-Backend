import express from "express";
import projectAssignController from "../controllers/projectAssignController.js";

const router = express.Router();

// 🔹 Assign a project
router.post("/assignProject", projectAssignController.assignProject);

// 🔹 Get all assigned projects
router.get(
  "/getAllAssignedProjects",
  projectAssignController.getAllAssignedProjects
);

// 🔹 Get assigned projects for a specific subadmin
router.get(
  "/getSubAdminProjects/:subAdminId",
  projectAssignController.getSubAdminProjects
);

// 🔹 Update project status/progress
router.put(
  "/updateAssignment/:id",
  projectAssignController.updateAssignmentStatus
);

export default router;
