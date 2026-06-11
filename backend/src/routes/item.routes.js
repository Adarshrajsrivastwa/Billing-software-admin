import { Router } from "express";
import {
  createItem,
  getItems,
  getItem,
  updateItem,
  deleteItem,
} from "../controllers/item.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createItemValidator,
  updateItemValidator,
  itemIdValidator,
  listItemsValidator,
} from "../validators/item.validator.js";

const router = Router();

// Protect all routes under /api/v1/items
router.use(protect);

router
  .route("/")
  .get(listItemsValidator, validate, getItems)
  .post(createItemValidator, validate, createItem);

router
  .route("/:id")
  .get(itemIdValidator, validate, getItem)
  .put(updateItemValidator, validate, updateItem)
  .delete(itemIdValidator, validate, deleteItem);

export default router;
