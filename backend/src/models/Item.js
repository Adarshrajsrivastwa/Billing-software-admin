import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    itemCode: {
      type: String,
      required: [true, "Item code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: 150,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: {
        values: ["Active", "Inactive"],
        message: "{VALUE} is not a valid status",
      },
      default: "Active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

itemSchema.pre("validate", function normalizeCode() {
  if (this.itemCode) {
    this.itemCode = this.itemCode.toUpperCase();
  }
});

export const Item = mongoose.model("Item", itemSchema);
