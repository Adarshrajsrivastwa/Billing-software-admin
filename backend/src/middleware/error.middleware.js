import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

const handleCastError = (err) =>
  new ApiError(400, `Invalid ${err.path}: ${err.value}`);

const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new ApiError(409, `${field} already exists`);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return new ApiError(400, "Validation failed", errors);
};

const handleJWTError = () => new ApiError(401, "Invalid token");

const handleJWTExpired = () => new ApiError(401, "Token expired");

export const errorHandler = (err, _req, res, _next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    if (error.name === "CastError") error = handleCastError(error);
    else if (error.code === 11000) error = handleDuplicateKey(error);
    else if (error.name === "ValidationError") error = handleValidationError(error);
    else if (error.name === "JsonWebTokenError") error = handleJWTError();
    else if (error.name === "TokenExpiredError") error = handleJWTExpired();
    else error = new ApiError(500, "Internal server error");
  }

  const response = {
    success: false,
    message: error.message,
  };

  if (error.errors?.length) {
    response.errors = error.errors;
  }

  if (!env.isProduction && err.stack) {
    response.stack = err.stack;
  }

  res.status(error.statusCode || 500).json(response);
};
