const { connectDB, testConnection, mongoose } = require("./config/database");

// Import all models to ensure they load and register correctly
const User = require("./models/User");
const Campaign = require("./models/Campaign");
const Donation = require("./models/Donation");
const VolunteerApplication = require("./models/VolunteerApplication");
const ShokkhomApplication = require("./models/ShokkhomApplication");
const ContactMessage = require("./models/ContactMessage");
const MediaFile = require("./models/MediaFile");

async function main() {
  console.log("Loading schemas and connecting to MongoDB...");
  console.log("Registered Mongoose models:", mongoose.modelNames());

  try {
    const result = await testConnection();
    if (result.ok) {
      console.log("SUCCESS: Connection to MongoDB Atlas established successfully!");
      process.exit(0);
    } else {
      console.error("FAILURE: Database connection test failed:", result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error("UNEXPECTED ERROR testing connection:", error);
    process.exit(1);
  }
}

main();
