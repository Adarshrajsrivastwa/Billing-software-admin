import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/token.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub);

    if (!user || !user.isActive) {
      throw new ApiError(401, "User not found or account deactivated");
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired");
    }
    if (err.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid access token");
    }
    throw err;
  }
});

export const authorize = (...roles) =>
  asyncHandler(async (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "You do not have permission to perform this action");
    }
    next();
  });
