import { body } from "express-validator";

const passwordRules = body("password")
  .trim()
  .isLength({ min: 8, max: 128 })
  .withMessage("Password must be between 8 and 128 characters")
  .matches(/[a-z]/)
  .withMessage("Password must contain at least one lowercase letter")
  .matches(/[A-Z]/)
  .withMessage("Password must contain at least one uppercase letter")
  .matches(/\d/)
  .withMessage("Password must contain at least one number");

export const registerValidator = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("email").trim().isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("mobile")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Please provide a valid 10-digit Indian mobile number"),
  passwordRules,
  body("role").optional().isIn(["admin"]).withMessage("Invalid role"),
];

export const loginValidator = [
  body("identifier")
    .trim()
    .notEmpty()
    .withMessage("Email, username, or mobile is required"),
  body("password").notEmpty().withMessage("Password is required"),
];
