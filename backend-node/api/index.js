// Vercel serverless adapter for Express app
// This file exports the Express app as a Vercel serverless function handler

require("dotenv").config();

const dns = require("dns");
// Set DNS servers for MongoDB Atlas resolution on Vercel
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (err) {
  // ignore
}

const app = require("../src/app");
const { connectDB } = require("../src/config/database");
const { seedDatabase } = require("../src/controllers/contentController");

let isInitialized = false;

async function init() {
  if (isInitialized) return;
  await connectDB();
  await seedDatabase();
  isInitialized = true;
}

// Export handler for Vercel serverless
module.exports = async (req, res) => {
  await init();
  return app(req, res);
};
