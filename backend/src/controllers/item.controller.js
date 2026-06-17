import { Item } from "../models/Item.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateItemCode = async () => {
  const lastItem = await Item.findOne({ itemCode: /^ITM-\d+$/ })
    .sort({ itemCode: -1 })
    .exec();

  let nextNum = 1;
  if (lastItem) {
    const match = lastItem.itemCode.match(/^ITM-(\d+)$/);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }

  return `ITM-${String(nextNum).padStart(5, "0")}`;
};

export const createItem = asyncHandler(async (req, res) => {
  const itemCode = req.body.itemCode?.trim().toUpperCase() || (await generateItemCode());

  // Check if itemCode is already registered
  const existing = await Item.findOne({ itemCode });
  if (existing) {
    throw new ApiError(409, `Item with code ${itemCode} already exists`);
  }

  const payload = {
    itemCode,
    name: req.body.name.trim(),
    category: req.body.category,
    description: req.body.description?.trim() || undefined,
    status: req.body.status || "Active",
    createdBy: req.user._id,
  };

  const item = await Item.create(payload);

  res.status(201).json({
    success: true,
    message: "Item created successfully",
    data: { item },
  });
});

export const getItems = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [
      { name: regex },
      { category: regex },
      { itemCode: regex },
    ];
  }

  // Sort by itemCode descending to see newest / custom codes at top or standard order
  const items = await Item.find(filter).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: items.length,
    data: { items },
  });
});

export const getItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    throw new ApiError(404, "Item not found");
  }

  res.json({
    success: true,
    data: { item },
  });
});

export const updateItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    throw new ApiError(404, "Item not found");
  }

  const updatable = [
    "name",
    "category",
    "description",
    "status",
  ];

  updatable.forEach((field) => {
    if (req.body[field] !== undefined) {
      const value = req.body[field];
      if (typeof value === "string") {
        item[field] = value.trim() || undefined;
      } else {
        item[field] = value;
      }
    }
  });

  await item.save();

  res.json({
    success: true,
    message: "Item updated successfully",
    data: { item },
  });
});

export const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findByIdAndDelete(req.params.id);

  if (!item) {
    throw new ApiError(404, "Item not found");
  }

  res.json({
    success: true,
    message: "Item deleted successfully",
  });
});
