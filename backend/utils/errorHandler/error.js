const ErrorResponse = require("./AppError");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // console.log(err);

  if (err.value !== req.params.id || err.name === "CastError") {
    const message = `cast error, no records found for ID: ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  if (err.code === 11000) {
    const message = `Duplicate field value entered!`;
    error = new ErrorResponse(message, 400);
  }

  if (err.name === "ValidationError") {
    const message = `Ooops, failed to validate record!`;
    error = new ErrorResponse(message, 400);
  }

  if (err.name === "JsonWebTokenError") {
    error = new ErrorResponse(`jwt error`, 400);
  }

  res.status(error.statusCode || 400).json({
    success: false,
    error: error.message || "Server error!",
  });
};

module.exports = errorHandler;
