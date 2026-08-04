const mongoose = require("mongoose");
const dns = require("dns");
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (e) {}
require("dotenv").config();

const mongoUri = process.env.MONGODB_URI;
const SiteSetting = require("./src/models/SiteSetting");
const Activity = require("./src/models/Activity");

async function run() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB!");
    
    const settings = await SiteSetting.find({});
    console.log("SETTINGS FOUND IN DB:", settings.length);
    settings.forEach(s => {
      console.log(`- ${s.key}: ${s.value}`);
    });
    
    const activities = await Activity.find({});
    console.log("ACTIVITIES FOUND IN DB:", activities.length);
    activities.forEach(a => {
      console.log(`- ${a.title} (${a.icon_name}): ${a.sort_order}`);
    });
    
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err.message);
  }
}
run();
