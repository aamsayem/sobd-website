const express = require("express");
const { createDonation, listDonations } = require("../controllers/donationController");

const router = express.Router();

router.get("/", listDonations);
router.post("/", createDonation);

module.exports = router;
