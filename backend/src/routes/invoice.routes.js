import { Router } from "express";
import {
  getSettings,
  getNextInvoiceNumber,
  updateSettings,
  generateInvoice,
  getInvoice,
  getInvoices,
  updateInvoice,
} from "../controllers/invoice.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  generateInvoiceValidator,
  updateSettingsValidator,
  invoiceIdValidator,
  listInvoicesValidator,
} from "../validators/invoice.validator.js";

const router = Router();

router.use(protect);

router.get("/settings", getSettings);
router.get("/next-number", getNextInvoiceNumber);
router.put("/settings", authorize("admin"), updateSettingsValidator, validate, updateSettings);

router
  .route("/")
  .get(listInvoicesValidator, validate, getInvoices)
  .post(generateInvoiceValidator, validate, generateInvoice);

router.get("/:id", invoiceIdValidator, validate, getInvoice);
router.put("/:id", invoiceIdValidator, validate, updateInvoice);

export default router;
