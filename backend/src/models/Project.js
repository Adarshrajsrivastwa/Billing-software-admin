import mongoose from "mongoose";

const PROJECT_TYPES = [
  "Residential",
  "Commercial",
  "Office",
  "Industrial",
  "Renovation",
];

const PROJECT_STATUSES = ["Pending", "In Progress", "Completed", "Cancelled"];

const FINANCIAL_TYPES = ["Payment", "Expense", "Advance", "Other"];

const financialDetailSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Financial detail title is required"],
      trim: true,
      maxlength: 100,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },
    type: {
      type: String,
      enum: FINANCIAL_TYPES,
      default: "Payment",
    },
    date: { type: Date },
    note: { type: String, trim: true, maxlength: 500 },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    projectCode: {
      type: String,
      required: [true, "Project code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    projectName: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: 150,
    },
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please provide a valid 10-digit phone number"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    projectType: {
      type: String,
      enum: PROJECT_TYPES,
      default: "Residential",
    },
    projectStatus: {
      type: String,
      enum: PROJECT_STATUSES,
      default: "Pending",
    },
    siteAddress: { type: String, trim: true, maxlength: 300 },
    city: { type: String, trim: true, maxlength: 80 },
    state: { type: String, trim: true, maxlength: 80 },
    pincode: {
      type: String,
      trim: true,
      match: [/^\d{6}$/, "Pincode must be 6 digits"],
    },
    startDate: { type: Date },
    completionDate: { type: Date },
    budget: { type: Number, default: 0, min: 0 },
    advanceAmount: { type: Number, default: 0, min: 0 },
    financialDetails: {
      type: [financialDetailSchema],
      default: [],
    },
    notes: { type: String, trim: true, maxlength: 2000 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const getTotalReceived = (project) => {
  const extraPaid = (project.financialDetails || [])
    .filter((d) => ["Payment", "Advance"].includes(d.type))
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  return (project.advanceAmount || 0) + extraPaid;
};

projectSchema.virtual("pendingAmount").get(function pendingAmount() {
  return Math.max(0, (this.budget || 0) - getTotalReceived(this));
});

projectSchema.virtual("totalReceived").get(function totalReceived() {
  return getTotalReceived(this);
});

projectSchema.virtual("totalExpenses").get(function totalExpenses() {
  return (this.financialDetails || [])
    .filter((d) => d.type === "Expense")
    .reduce((sum, d) => sum + (d.amount || 0), 0);
});

projectSchema.pre("validate", function normalizeCode() {
  if (this.projectCode) {
    this.projectCode = this.projectCode.toUpperCase();
  }
});

export const PROJECT_TYPE_OPTIONS = PROJECT_TYPES;
export const PROJECT_STATUS_OPTIONS = PROJECT_STATUSES;
export const FINANCIAL_TYPE_OPTIONS = FINANCIAL_TYPES;
export const ENDED_PROJECT_STATUSES = ["Completed", "Cancelled"];
export const Project = mongoose.model("Project", projectSchema);
