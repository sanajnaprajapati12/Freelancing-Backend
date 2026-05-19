import express from "express";
import userController from "../controllers/userController.js";
import auth from "../middleware/authMiddleware.js";
import teamController from "../controllers/teamController.js";
const router = express.Router();

// Step 1: Signup (no token)
router.post("/register-step1", userController.signupStep1);

// Step 2: Complete Profile (token + multer)
router.put(
  "/complete-profile",
  // ✅ must come first

  auth.verifyToken,

  userController.completeProfile // ✅ finally controller
);

router.post("/login",userController.login)

router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password/:token", userController.resetPassword);

router.get("/freelancers", auth.verifyToken ,userController.getAllUsers);
router.get("/getAllSubAdmins", userController.getAllSubAdmins);
router.get("/employees", userController.getAllEmployees);
router.delete(
  "/employees/:id",
  auth.verifyToken,
  auth.checkRole(["admin"]),
  userController.deleteEmployee
);

router.put("/employees/:id", auth.verifyToken, userController.updateEmployee);
router.put(
  "/employees/:id/role",
  auth.verifyToken,
  auth.checkRole(["admin"]),
  userController.assignRole
);


router.post(
  "/createTeam/:projectId",

  auth.verifyToken,
  auth.checkRole(["subadmins"]),

  teamController.createTeam,
);
router.get(
  "/viewTeams/:projectId",
  auth.verifyToken,
  auth.checkRole(["subadmins"]),
  teamController.viewTeamsByProject,
);

router.get("/singleProject/:projectId", auth.verifyToken, teamController.getSingleProject);
router.get(
  "/subadmins/developers",
  auth.verifyToken,
  auth.checkRole(["subadmins"]),
  teamController.getSubadminDevelopers,
);


export default router;
