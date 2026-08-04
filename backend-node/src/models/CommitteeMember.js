const mongoose = require("mongoose");

const committeeMemberSchema = new mongoose.Schema(
  {
    panel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommitteePanel",
      default: null,
      index: true,
    },
    name: {
      type: String,
      default: null,
      trim: true,
    },
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "Leadership",
      trim: true,
    },
    photo_url: {
      type: String,
      default: null,
    },
    facebook_url: {
      type: String,
      default: null,
    },
    sort_order: {
      type: Number,
      default: 0,
    },
    photo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MediaFile",
      default: null,
    },
    facebook: {
      type: String,
      default: null,
      trim: true,
    },
    email: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    joining_date: {
      type: Date,
      default: null,
    },
    display_order: {
      type: Number,
      default: 0,
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

module.exports = mongoose.model("CommitteeMember", committeeMemberSchema);
