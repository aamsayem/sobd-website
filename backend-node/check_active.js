const mongoose = require("mongoose");
const dns = require("dns");
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (e) {}
require("dotenv").config();
const SiteSetting = require("./src/models/SiteSetting");

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const settings = await SiteSetting.find({});
  settings.forEach(s => {
    console.log(`${s.key}: is_active = ${s.is_active} (${typeof s.is_active})`);
  });
  await mongoose.disconnect();
})();
