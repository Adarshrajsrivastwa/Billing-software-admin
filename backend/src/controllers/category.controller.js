import { Category } from "../models/Category.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createCategory = asyncHandler(async (req, res) => {
  const name = req.body.name.trim();

  // Check if category with this name already exists
  const existing = await Category.findOne({ name: new RegExp(`^${name}$`, "i") });
  if (existing) {
    throw new ApiError(409, `Category "${name}" already exists`);
  }

  const payload = {
    name,
    description: req.body.description?.trim() || undefined,
    status: req.body.status || "Active",
    createdBy: req.user._id,
  };

  const category = await Category.create(payload);

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: { category },
  });
});

export const getCategories = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [
      { name: regex },
      { description: regex },
    ];
  }

  const categories = await Category.find(filter).sort({ name: 1 });

  res.json({
    success: true,
    count: categories.length,
    data: { categories },
  });
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  res.json({
    success: true,
    data: { category },
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const name = req.body.name?.trim();
  if (name && name.toLowerCase() !== category.name.toLowerCase()) {
    const existing = await Category.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existing) {
      throw new ApiError(409, `Another category named "${name}" already exists`);
    }
  }

  const updatable = ["name", "description", "status"];
  updatable.forEach((field) => {
    if (req.body[field] !== undefined) {
      const value = req.body[field];
      category[field] = typeof value === "string" ? value.trim() || undefined : value;
    }
  });

  await category.save();

  res.json({
    success: true,
    message: "Category updated successfully",
    data: { category },
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  res.json({
    success: true,
    message: "Category deleted successfully",
  });
});
