import { Quotation } from "../models/Quotation.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/v1/quotations
export const getQuotations = asyncHandler(async (req, res) => {
  const quotations = await Quotation.find({ createdBy: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, data: quotations });
});

// GET /api/v1/quotations/:id
export const getQuotation = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
  }).lean();

  if (!quotation) throw new ApiError(404, "Quotation not found");

  res.json({ success: true, data: quotation });
});

// POST /api/v1/quotations
export const createQuotation = asyncHandler(async (req, res) => {
  const { quoteNo, quoteDate, customer, items, totalExclGST, totalInclGST } =
    req.body;

  if (!quoteNo || !customer || !items?.length) {
    throw new ApiError(400, "quoteNo, customer and items are required");
  }

  const quotation = await Quotation.create({
    quoteNo,
    quoteDate: quoteDate || new Date().toLocaleDateString("en-IN"),
    customer,
    items,
    totalExclGST: totalExclGST || 0,
    totalInclGST: totalInclGST || 0,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: quotation });
});

// PUT /api/v1/quotations/:id
export const updateQuotation = asyncHandler(async (req, res) => {
  const { quoteNo, quoteDate, customer, items, totalExclGST, totalInclGST } =
    req.body;

  const quotation = await Quotation.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user._id },
    { quoteNo, quoteDate, customer, items, totalExclGST, totalInclGST },
    { new: true, runValidators: true }
  );

  if (!quotation) throw new ApiError(404, "Quotation not found");

  res.json({ success: true, data: quotation });
});

// DELETE /api/v1/quotations/:id
export const deleteQuotation = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findOneAndDelete({
    _id: req.params.id,
    createdBy: req.user._id,
  });

  if (!quotation) throw new ApiError(404, "Quotation not found");

  res.json({ success: true, message: "Quotation deleted successfully" });
});
