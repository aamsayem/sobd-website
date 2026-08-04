const mongoose = require("mongoose");

const mediaFileSchema = new mongoose.Schema(
  {
    original_file_name: {
      type: String,
      required: true,
      trim: true,
    },
    stored_file_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    file_type: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    upload_date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    file_path: {
      type: String,
      required: true,
    },
    mime_type: {
      type: String,
      default: null,
      trim: true,
    },
    // BaseModel fields
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "pending_review", "published", "archived", "rejected"],
      default: "draft",
      index: true,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("MediaFile", mediaFileSchema);
