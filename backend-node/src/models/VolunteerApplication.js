const mongoose = require("mongoose");

const volunteerApplicationSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    present_address: {
      type: String,
      required: true,
    },
    permanent_address: {
      type: String,
      required: true,
    },
    education: {
      type: String,
      required: true,
      trim: true,
    },
    occupation: {
      type: String,
      required: true,
      trim: true,
    },
    skills: {
      type: String,
      default: null,
    },
    blood_group: {
      type: String,
      default: null,
      trim: true,
    },
    nid_or_birth_certificate: {
      type: String,
      default: null,
      trim: true,
    },
    nid: {
      type: String,
      default: null,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    father_name: {
      type: String,
      default: null,
    },
    mother_name: {
      type: String,
      default: null,
    },
    dob: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      default: null,
    },
    whatsapp: {
      type: String,
      default: null,
    },
    facebook: {
      type: String,
      default: null,
    },
    district: {
      type: String,
      default: null,
    },
    upazilla: {
      type: String,
      default: null,
    },
    institution: {
      type: String,
      default: null,
    },
    availability: {
      type: String,
      default: null,
    },
    interest_areas: {
      type: [String],
      default: [],
    },
    motivation: {
      type: String,
      default: null,
    },
    reference: {
      type: String,
      default: null,
    },
    emergency_contact_name: {
      type: String,
      required: true,
      trim: true,
    },
    emergency_contact_phone: {
      type: String,
      required: true,
      trim: true,
    },
    photo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MediaFile",
      default: null,
    },
    application_status: {
      type: String,
      default: "pending",
      index: true,
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

module.exports = mongoose.model("VolunteerApplication", volunteerApplicationSchema);
