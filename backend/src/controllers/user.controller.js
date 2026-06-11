import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/v1/users  – list all users (admin only)
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 });
  res.json({ success: true, data: { users } });
});

// GET /api/v1/users/:id  – single user
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, data: { user } });
});

// POST /api/v1/users  – create new user (admin only)
export const createUser = asyncHandler(async (req, res) => {
  const { username, email, mobile, password, role } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { username }] });
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

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: { user },
  });
});

// PUT /api/v1/users/:id  – update user (admin only)
export const updateUser = asyncHandler(async (req, res) => {
  const { username, email, mobile, role, isActive, password } = req.body;

  const user = await User.findById(req.params.id).select("+password");
  if (!user) throw new ApiError(404, "User not found");

  // Prevent admin from deactivating themselves
  if (req.user._id.toString() === req.params.id && isActive === false) {
    throw new ApiError(400, "You cannot deactivate your own account");
  }

  if (username !== undefined) user.username = username;
  if (email !== undefined) user.email = email;
  if (mobile !== undefined) user.mobile = mobile;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (password && password.trim() !== "") user.password = password;

  await user.save();

  // Return fresh user without sensitive fields
  const updatedUser = await User.findById(user._id);
  res.json({
    success: true,
    message: "User updated successfully",
    data: { user: updatedUser },
  });
});

// DELETE /api/v1/users/:id  – delete user (admin only)
export const deleteUser = asyncHandler(async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    throw new ApiError(400, "You cannot delete your own account");
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  res.json({ success: true, message: "User deleted successfully" });
});

// PATCH /api/v1/users/:id/toggle-status  – toggle active/inactive
export const toggleUserStatus = asyncHandler(async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    throw new ApiError(400, "You cannot change your own status");
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
    data: { user },
  });
});
