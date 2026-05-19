import express from "express"
const router = express.Router();

import clientProjectController from "../controllers/clientProjectController.js";
import auth from "../middleware/authMiddleware.js";
// Routes
router.post(
  "/create-project",
  auth.verifyToken,
  auth.checkRole(["client"]),
  clientProjectController.createProject
);
router.get(
  "/getAllproject",
   
  clientProjectController.getAllProjects
);
router.get("/getProjectbyId/:id", clientProjectController.getProjectById);
router.put(
  "/update-project/:id",
  auth.verifyToken ,





  
  clientProjectController.updateProject
);
router.delete("/delete-project/:id",clientProjectController.deleteProject);
router.get(
  "/getAllprojectbyClinetid",
   
   auth.verifyToken,
  clientProjectController.getProjectsByClientId
);
export default router