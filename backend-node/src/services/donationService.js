const BaseModel = require("../models/baseModel");

class DonationService {
  async getDonations() {
    return BaseModel.findAll("donations", {}, "created_at DESC");
  }

  async createDonation(payload) {
    return BaseModel.create("donations", {
      donor_name: payload.donorName,
      donor_email: payload.donorEmail,
      amount: payload.amount,
      campaign: payload.campaign || "general",
      status: "pending",
      created_at: new Date(),
    });
  }
}

module.exports = new DonationService();
