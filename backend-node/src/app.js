const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const routes = require("./routes");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve media folder statically
app.use("/media", express.static(path.join(__dirname, "../media")));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "sobd-node-api",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);


module.exports = app;
