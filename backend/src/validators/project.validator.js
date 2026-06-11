import { body, param, query } from "express-validator";
import {
  PROJECT_TYPE_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  FINANCIAL_TYPE_OPTIONS,
} from "../models/Project.js";

const financialDetailsRules = [
  body("financialDetails").optional().isArray(),
  body("financialDetails.*.title")
    .trim()
    .notEmpty()
    .withMessage("Financial detail title is required")
    .isLength({ max: 100 }),
  body("financialDetails.*.amount")
    .isFloat({ min: 0 })
    .withMessage("Financial detail amount must be positive"),
  body("financialDetails.*.type")
    .optional()
    .isIn(FINANCIAL_TYPE_OPTIONS)
    .withMessage("Invalid financial detail type"),
  body("financialDetails.*.date")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Invalid financial detail date"),
  body("financialDetails.*.note")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 500 }),
];

const optionalPhone = body("phone")
  .optional({ values: "falsy" })
  .trim()
  .matches(/^[6-9]\d{9}$/)
  .withMessage("Please provide a valid 10-digit phone number");

const optionalEmail = body("email")
  .optional({ values: "falsy" })
  .trim()
  .isEmail()
  .withMessage("Please provide a valid email")
  .normalizeEmail();

const optionalPincode = body("pincode")
  .optional({ values: "falsy" })
  .trim()
  .matches(/^\d{6}$/)
  .withMessage("Pincode must be 6 digits");

export const createProjectValidator = [
  body("projectName")
    .trim()
    .notEmpty()
    .withMessage("Project name is required")
    .isLength({ max: 150 }),
  body("projectCode")
    .optional()
    .trim()
    .matches(/^PRJ-[A-Z0-9-]+$/i)
    .withMessage("Invalid project code format"),
  body("clientName").trim().notEmpty().withMessage("Client name is required"),
  optionalPhone,
  optionalEmail,
  body("projectType").optional().isIn(PROJECT_TYPE_OPTIONS),
  body("projectStatus").optional().isIn(PROJECT_STATUS_OPTIONS),
  body("siteAddress").optional({ values: "falsy" }).trim().isLength({ max: 300 }),
  body("city").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
  body("state").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
  optionalPincode,
  body("startDate").optional({ values: "falsy" }).isISO8601(),
  body("completionDate").optional({ values: "falsy" }).isISO8601(),
  body("budget").optional().isFloat({ min: 0 }),
  body("advanceAmount").optional().isFloat({ min: 0 }),
  body("notes").optional({ values: "falsy" }).trim().isLength({ max: 2000 }),
  ...financialDetailsRules,
];

export const updateProjectValidator = [
  param("id").isMongoId().withMessage("Invalid project ID"),
  body("projectName").optional().trim().notEmpty().isLength({ max: 150 }),
  body("clientName").optional().trim().notEmpty().isLength({ max: 100 }),
  optionalPhone,
  optionalEmail,
  body("projectType").optional().isIn(PROJECT_TYPE_OPTIONS),
  body("projectStatus").optional().isIn(PROJECT_STATUS_OPTIONS),
  body("type").optional().isIn(PROJECT_TYPE_OPTIONS),
  body("status").optional().isIn(PROJECT_STATUS_OPTIONS),
  body("siteAddress").optional({ values: "falsy" }).trim().isLength({ max: 300 }),
  body("city").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
  body("state").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
  optionalPincode,
  body("startDate").optional({ values: "falsy" }).isISO8601(),
  body("completionDate").optional({ values: "falsy" }).isISO8601(),
  body("budget").optional().isFloat({ min: 0 }),
  body("advanceAmount").optional().isFloat({ min: 0 }),
  body("pendingAmount").optional().isFloat({ min: 0 }),
  body("notes").optional({ values: "falsy" }).trim().isLength({ max: 2000 }),
  ...financialDetailsRules,
];

export const projectIdValidator = [
  param("id").isMongoId().withMessage("Invalid project ID"),
];

export const listProjectsValidator = [
  query("search").optional().trim().isLength({ max: 100 }),
  query("status")
    .optional()
    .isIn([...PROJECT_STATUS_OPTIONS, "All"])
    .withMessage("Invalid status filter"),
  query("activeOnly")
    .optional()
    .isIn(["true", "false"])
    .withMessage("activeOnly must be true or false"),
];
