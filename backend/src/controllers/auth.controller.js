import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from "../utils/token.js";
import { env } from "../config/env.js";

const REFRESH_COOKIE = "refreshToken";

const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/v1/auth",
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    path: "/api/v1/auth",
  });
};

const sendAuthResponse = async (res, user, statusCode = 200) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  await User.findByIdAndUpdate(user._id, {
    refreshTokenHash: hashToken(refreshToken),
  });

  setRefreshCookie(res, refreshToken);

  res.status(statusCode).json({
    success: true,
    message: statusCode === 201 ? "Account created successfully" : "Login successful",
    data: {
      user,
      accessToken,
    },
  });
};

export const register = asyncHandler(async (req, res) => {
  const { username, email, mobile, password, role } = req.body;

  const existing = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existing) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  const user = await User.create({
    username,
    email,
    mobile,
    password,
    role: "admin",
  });

  await sendAuthResponse(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  const user = await User.findByIdentifier(identifier);

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated");
  }

  if (user.isLocked()) {
    throw new ApiError(423, "Account temporarily locked due to too many failed attempts. Try again later.");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    await user.incrementLoginAttempts();
    throw new ApiError(401, "Invalid credentials");
  }

  await user.resetLoginAttempts();
  await sendAuthResponse(res, user);
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];

  if (!token) {
    throw new ApiError(401, "Refresh token missing");
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    clearRefreshCookie(res);
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Refresh token expired. Please log in again.");
    }
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findById(decoded.sub).select("+refreshTokenHash");

  if (!user || !user.isActive) {
    clearRefreshCookie(res);
    throw new ApiError(401, "User not found or account deactivated");
  }

  if (!user.refreshTokenHash || user.refreshTokenHash !== hashToken(token)) {
    await User.findByIdAndUpdate(user._id, { refreshTokenHash: null });
    clearRefreshCookie(res);
    throw new ApiError(401, "Refresh token revoked. Please log in again.");
  }

  const accessToken = signAccessToken(user._id);
  const newRefreshToken = signRefreshToken(user._id);

  await User.findByIdAndUpdate(user._id, {
    refreshTokenHash: hashToken(newRefreshToken),
  });

  setRefreshCookie(res, newRefreshToken);

  res.json({
    success: true,
    data: { accessToken },
  });
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { refreshTokenHash: null });
  }

  clearRefreshCookie(res);

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
});
