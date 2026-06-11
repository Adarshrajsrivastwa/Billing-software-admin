import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

export const validate = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formatted = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return next(new ApiError(400, "Validation failed", formatted));
  }

  next();
};
