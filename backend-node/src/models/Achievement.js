const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    year: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
    image_url: {
      type: String,
      default: null,
    },
    sort_order: {
      type: Number,
      default: 0,
    },
    published: {
      type: Boolean,
      default: true,
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MediaFile",
      default: null,
    },
    achievement_date: {
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

module.exports = mongoose.model("Achievement", achievementSchema);
