const express = require("express");
const { upload, uploadFile, listFiles, deleteFile } = require("../controllers/mediaController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Public route for file upload (so anonymous donors can upload proof screenshots)
router.post("/files", upload.single("file"), uploadFile);
router.post("/files/", upload.single("file"), uploadFile);

// Protected routes for managing files
router.get("/files", authenticate, listFiles);
router.get("/files/", authenticate, listFiles);
router.delete("/files/:id", authenticate, deleteFile);
router.delete("/files/:id/", authenticate, deleteFile);

module.exports = router;
