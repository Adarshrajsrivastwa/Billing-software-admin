import mongoose from "mongoose";

const invoiceSettingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
      default: "S2 Urban Gaze Interiors",
    },
    companyAddress: {
      type: String,
      required: true,
      trim: true,
    },
    gstin: { type: String, required: true, trim: true, uppercase: true },
    state: { type: String, required: true, trim: true, default: "Karnataka" },
    stateCode: { type: String, required: true, trim: true, default: "29" },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    bankName: { type: String, trim: true },
    accountNo: { type: String, trim: true },
    ifsc: { type: String, trim: true, uppercase: true },
    invoicePrefix: { type: String, trim: true, uppercase: true, default: "SUGI" },
    lastInvoiceNumber: { type: Number, default: 0 },
    defaultGstRate: { type: Number, default: 18, min: 0, max: 100 },
    gstType: { type: String, enum: ["intra", "inter"], default: "intra" },
    defaultHsn: { type: String, trim: true, default: "9954" },
    jurisdiction: { type: String, trim: true, default: "KARNATAKA" },
    declaration: {
      type: String,
      trim: true,
      default:
        "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
    },
  },
  { timestamps: true }
);

export const InvoiceSettings = mongoose.model("InvoiceSettings", invoiceSettingsSchema);
