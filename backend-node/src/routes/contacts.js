const express = require("express");
const { createContact, listContacts } = require("../controllers/contactController");

const router = express.Router();

router.get("/", listContacts);
router.post("/", createContact);

module.exports = router;
