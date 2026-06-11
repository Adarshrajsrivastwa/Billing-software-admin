import { InvoiceSettings } from "../models/InvoiceSettings.js";

const DEFAULT_SETTINGS = {
  companyName: "S2 Urban Gaze Interiors",
  companyAddress:
    "2nd Floor No 203 Platinum City Apartment, Hmt Main Road Near Peenya Metro Station, Yeshwanthapura Bengaluru, Karnataka",
  gstin: "29ENVPR9277Q1Z4",
  state: "Karnataka",
  stateCode: "29",
  email: "admin@gmail.com",
  phone: "9876543210",
  bankName: "Union Bank of India",
  accountNo: "139811100004818",
  ifsc: "UBIN0813982",
  invoicePrefix: "SUGI",
  lastInvoiceNumber: 0,
  defaultGstRate: 18,
  gstType: "intra",
  defaultHsn: "9954",
  jurisdiction: "KARNATAKA",
};

export const seedInvoiceSettings = async () => {
  const exists = await InvoiceSettings.findOne();
  if (exists) return;

  await InvoiceSettings.create(DEFAULT_SETTINGS);
  console.log("Default invoice settings created");
};

export const getOrCreateSettings = async () => {
  let settings = await InvoiceSettings.findOne();
  if (!settings) {
    settings = await InvoiceSettings.create(DEFAULT_SETTINGS);
  }
  return settings;
};
