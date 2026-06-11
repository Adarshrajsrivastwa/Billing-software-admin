import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    clientCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
      maxlength: 100,
    },
    companyName: { type: String, trim: true, maxlength: 150 },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please provide a valid 10-digit mobile number"],
    },
    altMobile: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please provide a valid alternate mobile number"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    address: { type: String, trim: true, maxlength: 300 },
    city: { type: String, trim: true, maxlength: 80 },
    state: { type: String, trim: true, maxlength: 80 },
    pincode: {
      type: String,
      trim: true,
      match: [/^\d{6}$/, "Pincode must be 6 digits"],
    },
    gst: {
      type: String,
      trim: true,
      uppercase: true,
      match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST number"],
    },
    pan: {
      type: String,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number"],
    },
    remarks: { type: String, trim: true, maxlength: 2000 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

clientSchema.pre("validate", function normalizeCode() {
  if (this.clientCode) {
    this.clientCode = this.clientCode.toUpperCase();
  }
});

export const Client = mongoose.model("Client", clientSchema);
