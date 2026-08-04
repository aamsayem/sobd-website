const mongoose = require("mongoose");
const dns = require("dns");

// Set default DNS servers to avoid querySrv ECONNREFUSED issues in Node.js on some Windows networks
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (err) {
  console.warn("Failed to set explicit DNS servers:", err.message);
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://aamsayem01_db_user:vZOWJBmgDkujYpOB@cluster0.gcjphyp.mongodb.net/sobd?appName=Cluster0";

async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
    });
    console.log("MongoDB connected successfully to:", conn.connection.host);
    return conn.connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

async function testConnection() {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    // Ping DB to verify it's working
    await mongoose.connection.db.admin().ping();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

module.exports = {
  connectDB,
  testConnection,
  mongoose,
};
