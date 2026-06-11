import { Client } from "../models/Client.js";
import { Project } from "../models/Project.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateClientCode = () =>
  `CLT${Date.now().toString().slice(-6)}`;

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const attachProjectStats = async (client) => {
  const projects = await Project.find({
    clientName: new RegExp(`^${escapeRegex(client.clientName.trim())}$`, "i"),
  });

  const doc = client.toObject ? client.toObject() : client;

  return {
    ...doc,
    totalProjects: projects.length,
    totalBilling: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    pendingAmount: projects.reduce((sum, p) => {
      const pending =
        p.pendingAmount ??
        Math.max(0, (p.budget || 0) - (p.advanceAmount || 0));
      return sum + pending;
    }, 0),
  };
};

const buildClientPayload = (body, userId) => ({
  clientCode: body.clientCode?.toUpperCase() || generateClientCode(),
  clientName: body.clientName.trim(),
  companyName: body.companyName?.trim() || undefined,
  mobile: body.mobile.trim(),
  altMobile: body.altMobile?.trim() || undefined,
  email: body.email?.trim() || undefined,
  address: body.address?.trim() || undefined,
  city: body.city?.trim() || undefined,
  state: body.state?.trim() || undefined,
  pincode: body.pincode?.trim() || undefined,
  gst: body.gst?.trim().toUpperCase() || undefined,
  pan: body.pan?.trim().toUpperCase() || undefined,
  remarks: body.remarks?.trim() || undefined,
  createdBy: userId,
});

export const createClient = asyncHandler(async (req, res) => {
  const payload = buildClientPayload(req.body, req.user._id);

  const existing = await Client.findOne({ clientCode: payload.clientCode });
  if (existing) {
    payload.clientCode = generateClientCode();
  }

  const duplicateMobile = await Client.findOne({ mobile: payload.mobile });
  if (duplicateMobile) {
    throw new ApiError(409, "Client with this mobile number already exists");
  }

  const client = await Client.create(payload);
  const enriched = await attachProjectStats(client);

  res.status(201).json({
    success: true,
    message: "Client created successfully",
    data: { client: enriched },
  });
});

export const getClients = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [
      { clientName: regex },
      { clientCode: regex },
      { mobile: regex },
      { email: regex },
      { companyName: regex },
    ];
  }

  const clients = await Client.find(filter).sort({ createdAt: -1 });
  const enriched = await Promise.all(clients.map(attachProjectStats));

  res.json({
    success: true,
    count: enriched.length,
    data: { clients: enriched },
  });
});

export const getClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    throw new ApiError(404, "Client not found");
  }

  const enriched = await attachProjectStats(client);

  res.json({
    success: true,
    data: { client: enriched },
  });
});

export const updateClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    throw new ApiError(404, "Client not found");
  }

  const updatable = [
    "clientName",
    "companyName",
    "mobile",
    "altMobile",
    "email",
    "address",
    "city",
    "state",
    "pincode",
    "gst",
    "pan",
    "remarks",
  ];

  updatable.forEach((field) => {
    if (req.body[field] !== undefined) {
      const value = req.body[field];
      client[field] = typeof value === "string" ? value.trim() || undefined : value;
    }
  });

  if (req.body.company !== undefined && req.body.companyName === undefined) {
    client.companyName = req.body.company?.trim() || undefined;
  }

  if (req.body.mobile && req.body.mobile !== client.mobile) {
    const duplicateMobile = await Client.findOne({
      mobile: req.body.mobile,
      _id: { $ne: client._id },
    });
    if (duplicateMobile) {
      throw new ApiError(409, "Another client already uses this mobile number");
    }
  }

  await client.save();
  const enriched = await attachProjectStats(client);

  res.json({
    success: true,
    message: "Client updated successfully",
    data: { client: enriched },
  });
});

export const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findByIdAndDelete(req.params.id);

  if (!client) {
    throw new ApiError(404, "Client not found");
  }

  res.json({
    success: true,
    message: "Client deleted successfully",
  });
});
