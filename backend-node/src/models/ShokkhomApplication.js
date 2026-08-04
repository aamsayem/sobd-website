const mongoose = require("mongoose");

const shokkhomApplicationSchema = new mongoose.Schema(
  {
    applicant_name: {
      type: String,
      required: true,
      trim: true,
    },
    father_name: {
      type: String,
      default: null,
      trim: true,
    },
    mother_name: {
      type: String,
      default: null,
      trim: true,
    },
    family_information: {
      type: String,
      required: true,
    },
    income: {
      type: Number,
      default: 0,
    },
    occupation: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
    },
    supporting_documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MediaFile",
      },
    ],
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

module.exports = mongoose.model("ShokkhomApplication", shokkhomApplicationSchema);
