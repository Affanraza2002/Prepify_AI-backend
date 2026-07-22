const errorHandler = (err, req, res, next) => {
  console.error("Global Error Interceptor:", err.stack || err.message);
  
  // Fallback status code
  const statusCode = err.status || err.statusCode || 500;
  
  res.status(statusCode).json({
    message: err.message || "An unexpected server error occurred.",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
};

module.exports = { errorHandler };
