const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    first_name: {
      type: String,
      default: "",
    },
    last_name: {
      type: String,
      default: "",
    },
    is_staff: {
      type: Boolean,
      default: false,
    },
    is_superuser: {
      type: Boolean,
      default: false,
    },
    date_joined: {
      type: Date,
      default: Date.now,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    photo: {
      type: String, // Path or URL to the user photo
      default: null,
    },
    nid_or_birth_certificate: {
      type: String,
      default: null,
    },
    emergency_contact_name: {
      type: String,
      default: null,
    },
    emergency_contact_phone: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      default: "member",
      index: true,
    },
    // BaseModel common fields
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
      enum: ["draft", "pending_review", "published", "archived", "rejected", "active"],
      default: "active",
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

module.exports = mongoose.model("User", userSchema);
