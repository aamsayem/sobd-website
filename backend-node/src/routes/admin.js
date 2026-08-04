const express = require("express");
const User = require("../models/User");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/user-roles", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const users = await User.find({}).exec();
    const formatted = users.map(u => {
      const obj = u.toObject();
      obj.id = obj._id.toString();
      delete obj.password;
      return obj;
    });

    if (req.query.page_size || req.query.page) {
      return res.json({
        count: formatted.length,
        results: formatted,
      });
    }

    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
