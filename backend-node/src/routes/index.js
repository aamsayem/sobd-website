const express = require("express");
const donationsRouter = require("./donations");
const contactsRouter = require("./contacts");
const contentRouter = require("./content");
const accountsRouter = require("./accounts");
const submissionsRouter = require("./submissions");
const mediaRouter = require("./media");
const adminRouter = require("./admin");

const router = express.Router();

// Legacy routes
router.use("/donations", donationsRouter);
router.use("/contacts", contactsRouter);

// Versioned v1 routes
router.use("/v1/content", contentRouter);
router.use("/v1/accounts", accountsRouter);
router.use("/v1/submissions", submissionsRouter);
router.use("/v1/media", mediaRouter);
router.use("/v1/admin", adminRouter);

module.exports = router;
