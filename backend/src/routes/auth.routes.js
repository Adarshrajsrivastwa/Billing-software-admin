import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  getMe,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.middleware.js";
import {
  registerValidator,
  loginValidator,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", authLimiter, registerValidator, validate, register);
router.post("/login", authLimiter, loginValidator, validate, login);
router.post("/refresh", authLimiter, refresh);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;
