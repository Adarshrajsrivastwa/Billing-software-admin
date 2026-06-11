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
    unit: {
      type: String,
      required: [true, "Unit is required"],
      enum: {
        values: ["Sq.ft", "Running Feet", "Meter", "Piece", "Nos", "Lump Sum"],
        message: "{VALUE} is not a valid unit",
      },
      default: "Sq.ft",
    },
    rate: {
      type: Number,
      required: [true, "Rate is required"],
      min: [0, "Rate cannot be negative"],
    },
    gst: {
      type: Number,
      enum: {
        values: [0, 5, 12, 18, 28],
        message: "{VALUE}% is not a valid GST rate",
      },
      default: 0,
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
