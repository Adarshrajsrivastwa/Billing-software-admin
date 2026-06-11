import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from "../controllers/user.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerValidator } from "../validators/auth.validator.js";

const router = Router();

// All routes require login + admin role
router.use(protect, authorize("admin"));

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", registerValidator, validate, createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.patch("/:id/toggle-status", toggleUserStatus);

export default router;
