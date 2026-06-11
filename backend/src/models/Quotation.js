import mongoose from "mongoose";

const quotationItemSchema = new mongoose.Schema(
  {
    slNo: { type: String, trim: true, default: "" },
    description: { type: String, required: true, trim: true },
    hsn: { type: String, trim: true, default: "9403" },
    gst: { type: String, trim: true, default: "18%" },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    area: { type: Number, default: 0 },
    costPerSqft: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
  },
  { _id: false }
);

const quotationSchema = new mongoose.Schema(
  {
    quoteNo: { type: String, required: true, trim: true },
    quoteDate: { type: String, required: true, trim: true },
    customer: { type: String, required: true, trim: true },
    items: {
      type: [quotationItemSchema],
      required: true,
      validate: [(v) => v.length > 0, "At least one item required"],
    },
    totalExclGST: { type: Number, default: 0 },
    totalInclGST: { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Compound unique index: quoteNo per user
quotationSchema.index({ quoteNo: 1, createdBy: 1 }, { unique: true });

export const Quotation = mongoose.model("Quotation", quotationSchema);
