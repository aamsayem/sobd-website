const donationService = require("../services/donationService");

async function listDonations(req, res, next) {
  try {
    const donations = await donationService.getDonations();
    res.json({ success: true, data: donations });
  } catch (error) {
    next(error);
  }
}

async function createDonation(req, res, next) {
  try {
    const donation = await donationService.createDonation(req.body);
    res.status(201).json({ success: true, data: donation });
  } catch (error) {
    next(error);
  }
}

module.exports = { listDonations, createDonation };
