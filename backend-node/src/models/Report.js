const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    bn_title: {
      type: String,
      default: null,
      trim: true,
    },
    year: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
    summary: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      default: "annual",
      trim: true,
    },
    publish_date: {
      type: Date,
      default: null,
    },
    published: {
      type: Boolean,
      default: true,
    },
    file_url: {
      type: String,
      default: null,
    },
    cover_url: {
      type: String,
      default: null,
    },
    sort_order: {
      type: Number,
      default: 0,
    },
    pdf_file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MediaFile",
      default: null,
    },
    cover_image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MediaFile",
      default: null,
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
      default: "published",
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

module.exports = mongoose.model("Report", reportSchema);
