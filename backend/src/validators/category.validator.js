import { body, param, query } from "express-validator";

const categoryFields = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ max: 100 })
    .withMessage("Category name cannot exceed 100 characters"),
  body("description")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
  body("status")
    .optional()
    .trim()
    .isIn(["Active", "Inactive"])
    .withMessage("Status must be Active or Inactive"),
];

export const createCategoryValidator = [
  ...categoryFields,
];

export const updateCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid category ID"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category name cannot be empty")
    .isLength({ max: 100 }),
  body("description")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 500 }),
  body("status")
    .optional()
    .trim()
    .isIn(["Active", "Inactive"])
    .withMessage("Status must be Active or Inactive"),
];

export const categoryIdValidator = [
  param("id").isMongoId().withMessage("Invalid category ID"),
];

export const listCategoriesValidator = [
  query("search").optional().trim().isLength({ max: 100 }),
];
