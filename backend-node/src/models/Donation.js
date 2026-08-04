const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor_name: {
      type: String,
      required: true,
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
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    payment_method: {
      type: String,
      required: true,
      trim: true,
    },
    transaction_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },
    proof_screenshot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MediaFile",
      default: null,
    },
    verification_status: {
      type: String,
      default: "pending",
      index: true,
    },
    verified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verified_at: {
      type: Date,
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

module.exports = mongoose.model("Donation", donationSchema);
