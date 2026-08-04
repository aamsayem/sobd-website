const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const User = require("../models/User");
const { JWT_SECRET } = require("../middleware/auth");

const signupSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(["member", "admin", "staff"]).default("member"),
});

const loginSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  password: z.string(),
});

async function signup(req, res, next) {
  try {
    const data = signupSchema.parse(req.body);
    const email = data.email.toLowerCase();

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    let username = data.username;
    if (!username) {
      const emailPrefix = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
      username = emailPrefix;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${emailPrefix}${counter}`;
        counter++;
      }
    } else {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ success: false, message: "Username already taken" });
      }
    }

    let first_name = data.first_name || "";
    let last_name = data.last_name || "";
    if (data.full_name && !first_name && !last_name) {
      const parts = data.full_name.trim().split(/\s+/);
      first_name = parts[0] || "";
      last_name = parts.slice(1).join(" ") || "";
    }

    let role = data.role;
    let is_staff = false;
    let is_superuser = false;

    if (role === "admin" || role === "staff") {
      if (email === "aamsayem01@gmail.com") {
        is_staff = true;
        is_superuser = true;
        role = "admin";
      } else {
        role = "member";
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      first_name,
      last_name,
      phone: data.phone,
      role,
      is_staff,
      is_superuser,
      is_active: true,
    });

    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "24h" });

    const userResponse = user.toObject();
    delete userResponse.password;
    userResponse.id = userResponse._id.toString();

    res.status(201).json({
      success: true,
      access: token,
      refresh: token,
      user: userResponse,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);
    const identifier = data.username || data.email;

    if (!identifier) {
      return res.status(400).json({ success: false, message: "Username or Email is required" });
    }

    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier.toLowerCase() }
      ],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid username/email or password" });
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid username/email or password" });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: "Account is inactive" });
    }

    // Double-check and enforce admin role constraints on login
    if ((user.role === "admin" || user.is_staff || user.is_superuser) && user.email !== "aamsayem01@gmail.com") {
      user.role = "member";
      user.is_staff = false;
      user.is_superuser = false;
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "24h" });

    const userResponse = user.toObject();
    delete userResponse.password;
    userResponse.id = userResponse._id.toString();

    res.json({
      success: true,
      access: token,
      refresh: token,
      user: userResponse,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    res.json({ success: true, message: "Successfully logged out" });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const userResponse = req.user.toObject();
    delete userResponse.password;
    userResponse.id = userResponse._id.toString();

    res.json(userResponse);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  signup,
  login,
  logout,
  getMe,
  signupSchema,
  loginSchema,
};
