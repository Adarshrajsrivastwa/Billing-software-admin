import { body, param, query } from "express-validator";

const buyerRules = [
  body("buyer.name").optional().trim().notEmpty(),
  body("buyer.address").optional().trim(),
  body("buyer.gstin").optional().trim(),
  body("buyer.state").optional().trim(),
  body("buyer.stateCode").optional().trim(),
  body("buyer.placeOfSupply").optional().trim(),
  body("buyer.phone").optional().trim(),
  body("buyer.email").optional({ values: "falsy" }).trim().isEmail(),
];

const itemRules = [
  body("items").optional().isArray({ min: 1 }),
  body("items.*.description").trim().notEmpty(),
  body("items.*.hsn").optional().trim(),
  body("items.*.quantity").optional().isFloat({ min: 0 }),
  body("items.*.unit").optional().trim(),
  body("items.*.rate").isFloat({ min: 0 }),
  body("items.*.discount").optional().isFloat({ min: 0, max: 100 }),
  body("items.*.gst").optional().isFloat({ min: 0, max: 100 }),
  body("items.*.gstRate").optional().isFloat({ min: 0, max: 100 }),
];

export const generateInvoiceValidator = [
  body("projectId").optional().isMongoId(),
  body("invoiceDate").optional().isISO8601(),
  body("paidAmount").optional().isFloat({ min: 0 }),
  body("save").optional().isBoolean(),
  body("gstType").optional().isIn(["intra", "inter"]),
  ...buyerRules,
  ...itemRules,
  body().custom((_, { req }) => {
    if (!req.body.projectId && (!req.body.items || req.body.items.length === 0)) {
      throw new Error("Either projectId or items are required");
    }
    if (!req.body.projectId && !req.body.buyer?.name) {
      throw new Error("Buyer name is required when projectId is not provided");
    }
    return true;
  }),
];

export const updateSettingsValidator = [
  body("companyName").optional().trim().notEmpty(),
  body("companyAddress").optional().trim().notEmpty(),
  body("gstin").optional().trim().notEmpty(),
  body("state").optional().trim().notEmpty(),
  body("stateCode").optional().trim().notEmpty(),
  body("email").optional().trim().isEmail(),
  body("phone").optional().trim(),
  body("bankName").optional().trim(),
  body("accountNo").optional().trim(),
  body("ifsc").optional().trim(),
  body("invoicePrefix").optional().trim().notEmpty(),
  body("defaultGstRate").optional().isFloat({ min: 0, max: 100 }),
  body("gstType").optional().isIn(["intra", "inter"]),
  body("defaultHsn").optional().trim(),
  body("jurisdiction").optional().trim(),
  body("declaration").optional().trim(),
];

export const invoiceIdValidator = [param("id").isMongoId()];

export const listInvoicesValidator = [
  query("projectId").optional().isMongoId(),
];
