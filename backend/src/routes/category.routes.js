import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdValidator,
  listCategoriesValidator,
} from "../validators/category.validator.js";

const router = Router();

// Protect all routes under /api/v1/categories
router.use(protect);

router
  .route("/")
  .get(listCategoriesValidator, validate, getCategories)
  .post(createCategoryValidator, validate, createCategory);

router
  .route("/:id")
  .get(categoryIdValidator, validate, getCategory)
  .put(updateCategoryValidator, validate, updateCategory)
  .delete(categoryIdValidator, validate, deleteCategory);

export default router;
