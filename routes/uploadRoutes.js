import express from "express";
import parser from "../Config/multerCloudinary.js";
import uploadController from "../controllers/uploadController.js";

const router = express.Router();

// Single image
router.post(
  "/single",
  parser.single("image"),
  uploadController.uploadSingleImage
);

// Multiple images
router.post(
  "/multiple",
  parser.array("images", 10),
  uploadController.uploadMultipleImages
);

export default router;
