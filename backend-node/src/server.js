require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./config/database");
const { seedDatabase } = require("./controllers/contentController");

const PORT = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    await connectDB();
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`SOBD Node backend listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server due to database connection issue:", error);
    process.exit(1);
  }
}

startServer();


