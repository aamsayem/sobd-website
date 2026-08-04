const express = require("express");
const {
  listContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
} = require("../controllers/contentController");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Public listing and detail routes
router.get("/", listContent);
router.get("/:resource", listContent);
router.get("/:resource/", listContent);
router.get("/:resource/:id", getContentById);
router.get("/:resource/:id/", getContentById);

// Protected modifications (Admin and staff only)
router.post("/:resource", authenticate, requireAdmin, createContent);
router.post("/:resource/", authenticate, requireAdmin, createContent);

router.patch("/:resource/:id", authenticate, requireAdmin, updateContent);
router.patch("/:resource/:id/", authenticate, requireAdmin, updateContent);
router.put("/:resource/:id", authenticate, requireAdmin, updateContent);
router.put("/:resource/:id/", authenticate, requireAdmin, updateContent);

router.delete("/:resource/:id", authenticate, requireAdmin, deleteContent);
router.delete("/:resource/:id/", authenticate, requireAdmin, deleteContent);

module.exports = router;
