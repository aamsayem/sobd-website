const express = require("express");
const { signup, login, logout, getMe } = require("../controllers/accountsController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);

module.exports = router;
