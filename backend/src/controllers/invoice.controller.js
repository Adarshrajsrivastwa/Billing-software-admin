import mongoose from "mongoose";
import { Invoice } from "../models/Invoice.js";
import { InvoiceSettings } from "../models/InvoiceSettings.js";
import { Project } from "../models/Project.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { calculateInvoice } from "../utils/invoiceCalc.js";
import { getOrCreateSettings } from "../config/seedInvoiceSettings.js";

const toCompanySnapshot = (settings) => ({
  name: settings.companyName,
  address: settings.companyAddress,
  gstin: settings.gstin,
  state: settings.state,
  stateCode: settings.stateCode,
  email: settings.email,
  phone: settings.phone,
  bankName: settings.bankName,
  accountNo: settings.accountNo,
  ifsc: settings.ifsc,
  jurisdiction: settings.jurisdiction,
  declaration: settings.declaration,
});

const toCompanyForFrontend = (company) => ({
  name: company.name,
  address: company.address,
  gstin: company.gstin,
  state: company.state,
  stateCode: company.stateCode,
  email: company.email,
  phone: company.phone,
  bankName: company.bankName,
  accountNo: company.accountNo,
  ifsc: company.ifsc,
  jurisdiction: company.jurisdiction,
  declaration: company.declaration,
});

const buildBuyerFromProject = (project) => ({
  name: project.clientName,
  address:
    [project.siteAddress, project.city, project.state].filter(Boolean).join(", ") ||
    project.city ||
    "—",
  state: project.state || "Karnataka",
  stateCode: "29",
  placeOfSupply: project.state || "Karnataka",
  phone: project.phone,
  email: project.email,
});

const buildItemsFromProject = (project, settings) => [
  {
    description: `${project.projectName} — ${project.projectType} Interior Design & Execution`,
    hsn: settings.defaultHsn,
    quantity: 1,
    unit: "nos",
    rate: project.budget || 0,
    discount: 0,
    gst: settings.defaultGstRate,
  },
];

const formatInvoiceNumber = (prefix, number) =>
  `${prefix}${String(number).padStart(7, "0")}`;

const previewInvoiceNo = (settings) =>
  formatInvoiceNumber(settings.invoicePrefix, settings.lastInvoiceNumber + 1);

const nextInvoiceNo = async (settings) => {
  const updated = await InvoiceSettings.findByIdAndUpdate(
    settings._id,
    { $inc: { lastInvoiceNumber: 1 } },
    { new: true }
  );

  return formatInvoiceNumber(updated.invoicePrefix, updated.lastInvoiceNumber);
};

const formatInvoiceResponse = (invoice, calc) => ({
  _id: invoice._id,
  invoiceNo: invoice.invoiceNo,
  invoiceDate: invoice.invoiceDate,
  projectId: invoice.projectId,
  company: toCompanyForFrontend(invoice.company),
  buyer: invoice.buyer,
  items: invoice.items,
  meta: invoice.meta || {},
  gstType: invoice.gstType,
  paidAmount: invoice.paidAmount,
  calculation: calc || {
    lines: invoice.items.map((item, i) => ({
      slNo: i + 1,
      ...item.toObject?.() || item,
    })),
    taxableTotal: invoice.taxableTotal,
    cgst: invoice.cgst,
    sgst: invoice.sgst,
    igst: invoice.igst,
    totalGst: invoice.totalGst,
    roundOffAmt: invoice.roundOffAmt,
    grandTotal: invoice.grandTotal,
    totalQty: invoice.totalQty,
    taxRows: invoice.taxRows,
  },
});

export const getSettings = asyncHandler(async (_req, res) => {
  const settings = await getOrCreateSettings();

  res.json({
    success: true,
    data: {
      nextInvoiceNo: previewInvoiceNo(settings),
      settings: {
        companyName: settings.companyName,
        companyAddress: settings.companyAddress,
        gstin: settings.gstin,
        state: settings.state,
        stateCode: settings.stateCode,
        email: settings.email,
        phone: settings.phone,
        bankName: settings.bankName,
        accountNo: settings.accountNo,
        ifsc: settings.ifsc,
        invoicePrefix: settings.invoicePrefix,
        lastInvoiceNumber: settings.lastInvoiceNumber,
        defaultGstRate: settings.defaultGstRate,
        gstType: settings.gstType,
        defaultHsn: settings.defaultHsn,
        jurisdiction: settings.jurisdiction,
        declaration: settings.declaration,
      },
      company: toCompanyForFrontend(toCompanySnapshot(settings)),
    },
  });
});

export const getNextInvoiceNumber = asyncHandler(async (_req, res) => {
  const settings = await getOrCreateSettings();

  res.json({
    success: true,
    data: { nextInvoiceNo: previewInvoiceNo(settings) },
  });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  const updatable = [
    "companyName",
    "companyAddress",
    "gstin",
    "state",
    "stateCode",
    "email",
    "phone",
    "bankName",
    "accountNo",
    "ifsc",
    "invoicePrefix",
    "defaultGstRate",
    "gstType",
    "defaultHsn",
    "jurisdiction",
    "declaration",
  ];

  updatable.forEach((field) => {
    if (req.body[field] !== undefined) {
      settings[field] = req.body[field];
    }
  });

  await settings.save();

  res.json({
    success: true,
    message: "Invoice settings updated",
    data: { settings },
  });
});

export const generateInvoice = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  const gstType = req.body.gstType || settings.gstType;
  const shouldSave = req.body.save !== false;

  let buyer = req.body.buyer;
  let items = req.body.items;
  let projectId = req.body.projectId;

  if (projectId) {
    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");

    buyer = buyer || buildBuyerFromProject(project);
    items = items || buildItemsFromProject(project, settings);
  }

  if (!items?.length) {
    throw new ApiError(400, "Invoice must have at least one item");
  }

  const normalizedItems = items.map((item) => ({
    description: item.description,
    hsn: item.hsn || settings.defaultHsn,
    quantity: Number(item.quantity) || 1,
    unit: item.unit || "nos",
    rate: Number(item.rate) || 0,
    discount: Number(item.discount) || 0,
    gst: Number(item.gst ?? item.gstRate ?? settings.defaultGstRate),
  }));

  const calc = calculateInvoice({ items: normalizedItems, gstType });

  const invoicePayload = {
    invoiceDate: req.body.invoiceDate ? new Date(req.body.invoiceDate) : new Date(),
    projectId: projectId || undefined,
    company: toCompanySnapshot(settings),
    buyer,
    items: calc.lines.map((line) => ({
      description: line.description,
      hsn: line.hsn,
      quantity: line.quantity,
      unit: line.unit,
      rate: line.rate,
      discount: line.discount,
      gstRate: line.gstRate,
      amount: line.amount,
      gstAmount: line.gstAmount,
    })),
    meta: req.body.meta || {},
    gstType,
    taxableTotal: calc.taxableTotal,
    cgst: calc.cgst,
    sgst: calc.sgst,
    igst: calc.igst,
    totalGst: calc.totalGst,
    roundOffAmt: calc.roundOffAmt,
    grandTotal: calc.grandTotal,
    totalQty: calc.totalQty,
    taxRows: calc.taxRows,
    paidAmount: Number(req.body.paidAmount) || 0,
    createdBy: req.user._id,
  };

  if (!shouldSave) {
    const previewNo = previewInvoiceNo(settings);
    return res.status(200).json({
      success: true,
      message: "Invoice preview generated",
      data: {
        invoice: formatInvoiceResponse(
          { ...invoicePayload, invoiceNo: previewNo },
          calc
        ),
      },
    });
  }

  const invoiceNo = await nextInvoiceNo(settings);
  const invoice = await Invoice.create({ ...invoicePayload, invoiceNo });

  res.status(201).json({
    success: true,
    message: "Invoice generated successfully",
    data: { invoice: formatInvoiceResponse(invoice, calc) },
  });
});

export const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw new ApiError(404, "Invoice not found");

  res.json({
    success: true,
    data: { invoice: formatInvoiceResponse(invoice) },
  });
});

export const getInvoices = asyncHandler(async (req, res) => {
  const filter = {};
  console.log("getInvoices query params:", req.query);
  if (req.query.projectId && mongoose.Types.ObjectId.isValid(req.query.projectId)) {
    filter.projectId = new mongoose.Types.ObjectId(req.query.projectId);
  } else if (req.query.projectId) {
    // If projectId was passed but was invalid, return empty array to prevent returning all invoices
    return res.json({
      success: true,
      count: 0,
      data: { invoices: [] },
    });
  }

  const invoices = await Invoice.find(filter).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: invoices.length,
    data: {
      invoices: invoices.map((inv) => formatInvoiceResponse(inv)),
    },
  });
});

export const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw new ApiError(404, "Invoice not found");

  const settings = await getOrCreateSettings();

  let buyer = req.body.buyer;
  let items = req.body.items;
  let projectId = req.body.projectId;

  if (projectId && projectId !== invoice.projectId?.toString()) {
    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");
    buyer = buyer || buildBuyerFromProject(project);
    items = items || buildItemsFromProject(project, settings);
  } else {
    buyer = buyer || invoice.buyer;
    items = items || invoice.items;
  }

  if (!items?.length) {
    throw new ApiError(400, "Invoice must have at least one item");
  }

  const normalizedItems = items.map((item) => ({
    description: item.description,
    hsn: item.hsn || settings.defaultHsn,
    quantity: Number(item.quantity) || 1,
    unit: item.unit || "nos",
    rate: Number(item.rate) || 0,
    discount: Number(item.discount) || 0,
    gst: Number(item.gst ?? item.gstRate ?? settings.defaultGstRate),
  }));

  const gstType = req.body.gstType || invoice.gstType;
  const calc = calculateInvoice({ items: normalizedItems, gstType });

  invoice.invoiceDate = req.body.invoiceDate ? new Date(req.body.invoiceDate) : invoice.invoiceDate;
  if (projectId) invoice.projectId = projectId;
  invoice.buyer = buyer;
  invoice.items = calc.lines.map((line) => ({
    description: line.description,
    hsn: line.hsn,
    quantity: line.quantity,
    unit: line.unit,
    rate: line.rate,
    discount: line.discount,
    gstRate: line.gstRate,
    amount: line.amount,
    gstAmount: line.gstAmount,
  }));
  invoice.meta = req.body.meta || invoice.meta;
  invoice.gstType = gstType;
  invoice.taxableTotal = calc.taxableTotal;
  invoice.cgst = calc.cgst;
  invoice.sgst = calc.sgst;
  invoice.igst = calc.igst;
  invoice.totalGst = calc.totalGst;
  invoice.roundOffAmt = calc.roundOffAmt;
  invoice.grandTotal = calc.grandTotal;
  invoice.totalQty = calc.totalQty;
  invoice.taxRows = calc.taxRows;
  if (req.body.paidAmount !== undefined) {
    invoice.paidAmount = Number(req.body.paidAmount) || 0;
  }

  await invoice.save();

  res.json({
    success: true,
    message: "Invoice updated successfully",
    data: {
      invoice: formatInvoiceResponse(invoice, calc),
    },
  });
});
