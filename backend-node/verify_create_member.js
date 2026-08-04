const mongoose = require("mongoose");
const path = require("path");
const dns = require("dns");

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (err) {
  console.warn("Failed to set explicit DNS servers:", err.message);
}

// Load env variables
require("dotenv").config();

const mongoUri = process.env.MONGODB_URI;
console.log("Connecting to:", mongoUri);

const CommitteeMember = require("./src/models/CommitteeMember");

async function run() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB!");

    const payload = {
      full_name: "Test Member",
      designation: "Developer",
      category: "Board of Directors",
      photo_url: "/media/test.jpg",
      facebook_url: "https://facebook.com/test",
      sort_order: 1
    };

    const doc = new CommitteeMember(payload);
    await doc.save();
    console.log("Success! Member saved successfully:", doc.toObject());

    // Cleanup
    await CommitteeMember.findByIdAndDelete(doc._id);
    console.log("Cleanup: deleted test member");
  } catch (error) {
    console.error("FAILED to save member:", error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
