const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: null,
      trim: true,
    },
    caption: {
      type: String,
      default: null,
    },
    image_url: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "general",
      trim: true,
    },
    sort_order: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: null,
    },
    event_date: {
      type: Date,
      default: null,
    },
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MediaFile",
      },
    ],
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

module.exports = mongoose.model("Gallery", gallerySchema);
