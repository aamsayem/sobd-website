const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "sobd-super-secret-key-change-in-prod";

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: "User not found or inactive" });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || (req.user.role !== "admin" && !req.user.is_superuser && !req.user.is_staff)) {
    return res.status(403).json({ success: false, message: "Access denied. Admins only." });
  }
  if (req.user.email !== "aamsayem01@gmail.com") {
    return res.status(403).json({ success: false, message: "Access denied. Invalid admin account." });
  }
  next();
}

module.exports = {
  authenticate,
  requireAdmin,
  JWT_SECRET,
};
