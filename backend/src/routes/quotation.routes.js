import { Router } from "express";
import {
  getQuotations,
  getQuotation,
  createQuotation,
  updateQuotation,
  deleteQuotation,
} from "../controllers/quotation.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.route("/").get(getQuotations).post(createQuotation);

router
  .route("/:id")
  .get(getQuotation)
  .put(updateQuotation)
  .delete(deleteQuotation);

export default router;
