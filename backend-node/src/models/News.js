const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      default: null,
    },
    content: {
      type: String,
      default: null,
    },
    cover_url: {
      type: String,
      default: null,
    },
    published: {
      type: Boolean,
      default: true,
    },
    published_at: {
      type: Date,
      default: Date.now,
    },
    featured_image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MediaFile",
      default: null,
    },
    category: {
      type: String,
      default: "general",
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
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

module.exports = mongoose.model("News", newsSchema);
