function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
}

module.exports = { notFoundHandler, errorHandler };
