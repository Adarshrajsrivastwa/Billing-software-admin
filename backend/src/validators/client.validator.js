import { body, param, query } from "express-validator";

const optionalMobile = (field) =>
  body(field)
    .optional({ values: "falsy" })
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage(`Please provide a valid 10-digit ${field}`);

const clientFields = [
  body("clientName")
    .trim()
    .notEmpty()
    .withMessage("Client name is required")
    .isLength({ max: 100 }),
  body("companyName").optional({ values: "falsy" }).trim().isLength({ max: 150 }),
  body("mobile")
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Please provide a valid 10-digit mobile number"),
  optionalMobile("altMobile"),
  body("email")
    .optional({ values: "falsy" })
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("address").optional({ values: "falsy" }).trim().isLength({ max: 300 }),
  body("city").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
  body("state").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
  body("pincode")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^\d{6}$/)
    .withMessage("Pincode must be 6 digits"),
  body("gst")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i)
    .withMessage("Invalid GST number"),
  body("pan")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i)
    .withMessage("Invalid PAN number"),
  body("remarks").optional({ values: "falsy" }).trim().isLength({ max: 2000 }),
];

export const createClientValidator = [
  body("clientCode")
    .optional()
    .trim()
    .matches(/^CLT[A-Z0-9-]+$/i)
    .withMessage("Invalid client code format"),
  ...clientFields,
];

export const updateClientValidator = [
  param("id").isMongoId().withMessage("Invalid client ID"),
  body("clientName").optional().trim().notEmpty().isLength({ max: 100 }),
  body("companyName").optional({ values: "falsy" }).trim().isLength({ max: 150 }),
  body("company").optional({ values: "falsy" }).trim().isLength({ max: 150 }),
  body("mobile")
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Please provide a valid 10-digit mobile number"),
  optionalMobile("altMobile"),
  body("email")
    .optional({ values: "falsy" })
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("address").optional({ values: "falsy" }).trim().isLength({ max: 300 }),
  body("city").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
  body("state").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
  body("pincode")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^\d{6}$/)
    .withMessage("Pincode must be 6 digits"),
  body("gst")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i)
    .withMessage("Invalid GST number"),
  body("pan")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i)
    .withMessage("Invalid PAN number"),
  body("remarks").optional({ values: "falsy" }).trim().isLength({ max: 2000 }),
];

export const clientIdValidator = [
  param("id").isMongoId().withMessage("Invalid client ID"),
];

export const listClientsValidator = [
  query("search").optional().trim().isLength({ max: 100 }),
];
