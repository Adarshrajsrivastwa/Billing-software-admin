import { body, param, query } from "express-validator";
import { Category } from "../models/Category.js";

const itemFields = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Item name is required")
    .isLength({ max: 150 })
    .withMessage("Item name cannot exceed 150 characters"),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .custom(async (value) => {
      const exists = await Category.findOne({ name: new RegExp(`^${value.trim()}$`, "i"), status: "Active" });
      if (!exists) {
        throw new Error(`Category "${value}" is not a valid active category`);
      }
      return true;
    }),
  body("description")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),
  body("status")
    .optional()
    .trim()
    .isIn(["Active", "Inactive"])
    .withMessage("Status must be Active or Inactive"),
];

export const createItemValidator = [
  body("itemCode")
    .optional()
    .trim()
    .matches(/^ITM-[A-Z0-9-]+$/i)
    .withMessage("Invalid item code format (e.g. ITM-XXXXX)"),
  ...itemFields,
];

export const updateItemValidator = [
  param("id").isMongoId().withMessage("Invalid item ID"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Item name cannot be empty")
    .isLength({ max: 150 }),
  body("category")
    .optional()
    .trim()
    .custom(async (value) => {
      const exists = await Category.findOne({ name: new RegExp(`^${value.trim()}$`, "i"), status: "Active" });
      if (!exists) {
        throw new Error(`Category "${value}" is not a valid active category`);
      }
      return true;
    }),
  body("description")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 1000 }),
  body("status")
    .optional()
    .trim()
    .isIn(["Active", "Inactive"])
    .withMessage("Status must be Active or Inactive"),
];

export const itemIdValidator = [
  param("id").isMongoId().withMessage("Invalid item ID"),
];

export const listItemsValidator = [
  query("search").optional().trim().isLength({ max: 100 }),
];
