const express = require("express");
const {
  getSubmissions,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  deleteSubmission,
} = require("../controllers/submissionsController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Public submission endpoint
router.post("/:resource", createSubmission);
router.post("/:resource/", createSubmission);

// Protected retrieval and modification endpoints
router.get("/:resource", authenticate, getSubmissions);
router.get("/:resource/", authenticate, getSubmissions);
router.get("/:resource/:id", authenticate, getSubmissionById);
router.get("/:resource/:id/", authenticate, getSubmissionById);

router.patch("/:resource/:id", authenticate, updateSubmission);
router.patch("/:resource/:id/", authenticate, updateSubmission);
router.put("/:resource/:id", authenticate, updateSubmission);
router.put("/:resource/:id/", authenticate, updateSubmission);

router.delete("/:resource/:id", authenticate, deleteSubmission);
router.delete("/:resource/:id/", authenticate, deleteSubmission);

module.exports = router;
