const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const routes = require("./routes");

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const allowedOriginPatterns = [
  /^https:\/\/.*\.vercel\.app$/,
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== "*") {
      const origins = process.env.CORS_ORIGIN.split(",").map((o) => o.trim());
      if (origins.includes(origin)) return callback(null, true);
    }

    if (allowedOriginPatterns.some((pattern) => pattern.test(origin))) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));
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
