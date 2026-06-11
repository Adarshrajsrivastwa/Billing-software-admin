import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    hsn: { type: String, trim: true, default: "9954" },
    quantity: { type: Number, required: true, min: 0, default: 1 },
    unit: { type: String, trim: true, default: "nos" },
    rate: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    gstRate: { type: Number, default: 18, min: 0 },
    amount: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
  },
  { _id: false }
);

const buyerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    gstin: { type: String, trim: true, uppercase: true },
    state: { type: String, trim: true },
    stateCode: { type: String, trim: true },
    placeOfSupply: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
  },
  { _id: false }
);

const companySnapshotSchema = new mongoose.Schema(
  {
    name: String,
    address: String,
    gstin: String,
    state: String,
    stateCode: String,
    email: String,
    phone: String,
    bankName: String,
    accountNo: String,
    ifsc: String,
    jurisdiction: String,
    declaration: String,
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true, unique: true, trim: true, uppercase: true },
    invoiceDate: { type: Date, required: true, default: Date.now },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    company: { type: companySnapshotSchema, required: true },
    buyer: { type: buyerSchema, required: true },
    items: { type: [invoiceItemSchema], required: true, validate: [(v) => v.length > 0, "At least one item required"] },
    meta: {
      deliveryNote: String,
      paymentMode: String,
      reference: String,
      otherReferences: String,
      buyerOrderNo: String,
      orderDate: String,
      dispatchDocNo: String,
      deliveryNoteDate: String,
      dispatchedThrough: String,
      destination: String,
      termsOfDelivery: String,
    },
    gstType: { type: String, enum: ["intra", "inter"], default: "intra" },
    taxableTotal: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    totalGst: { type: Number, default: 0 },
    roundOffAmt: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    totalQty: { type: Number, default: 0 },
    taxRows: { type: Array, default: [] },
    paidAmount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Invoice = mongoose.model("Invoice", invoiceSchema);
