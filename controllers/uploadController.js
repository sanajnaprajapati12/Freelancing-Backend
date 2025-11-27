// Controller for uploading images

const uploadSingleImage = async (req, res) => {
  try {
    console.log("req.file:", req.file);
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      fileUrl: req.file.path,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const uploadMultipleImages = async (req, res) => {
  try {
    console.log("req.files:", req.files);
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    const urls = req.files.map((file) => file.path);

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      files: urls,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export default { uploadSingleImage, uploadMultipleImages };
