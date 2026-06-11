import { Project, ENDED_PROJECT_STATUSES } from "../models/Project.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateProjectCode = () =>
  `PRJ-${Date.now().toString().slice(-5)}`;

const parseDate = (value) => (value ? new Date(value) : undefined);

const normalizeFinancialDetails = (items = []) =>
  items
    .filter((item) => item?.title?.trim() && Number(item.amount) > 0)
    .map((item) => ({
      title: item.title.trim(),
      amount: Number(item.amount) || 0,
      type: item.type || "Payment",
      date: parseDate(item.date),
      note: item.note?.trim() || undefined,
    }));

const buildProjectPayload = (body, userId) => ({
  projectCode: body.projectCode?.toUpperCase() || generateProjectCode(),
  projectName: body.projectName,
  clientName: body.clientName,
  phone: body.phone || undefined,
  email: body.email || undefined,
  projectType: body.projectType,
  projectStatus: body.projectStatus,
  siteAddress: body.siteAddress || undefined,
  city: body.city || undefined,
  state: body.state || undefined,
  pincode: body.pincode || undefined,
  startDate: parseDate(body.startDate),
  completionDate: parseDate(body.completionDate),
  budget: Number(body.budget) || 0,
  advanceAmount: Number(body.advanceAmount) || 0,
  financialDetails: normalizeFinancialDetails(body.financialDetails),
  notes: body.notes || undefined,
  createdBy: userId,
});

export const createProject = asyncHandler(async (req, res) => {
  const payload = buildProjectPayload(req.body, req.user._id);

  const existing = await Project.findOne({ projectCode: payload.projectCode });
  if (existing) {
    payload.projectCode = generateProjectCode();
  }

  const project = await Project.create(payload);

  res.status(201).json({
    success: true,
    message: "Project created successfully",
    data: { project },
  });
});

export const getProjects = asyncHandler(async (req, res) => {
  const { search, status, activeOnly } = req.query;
  const filter = {};

  if (activeOnly === "true") {
    filter.projectStatus = { $nin: ENDED_PROJECT_STATUSES };
  } else if (status && status !== "All") {
    filter.projectStatus = status;
  }

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [
      { projectName: regex },
      { clientName: regex },
      { projectCode: regex },
    ];
  }

  const projects = await Project.find(filter).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: projects.length,
    data: { projects },
  });
});

export const getBillingProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    projectStatus: { $nin: ENDED_PROJECT_STATUSES },
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: projects.length,
    data: { projects },
  });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  res.json({
    success: true,
    data: { project },
  });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const updatable = [
    "projectName",
    "clientName",
    "phone",
    "email",
    "projectType",
    "projectStatus",
    "siteAddress",
    "city",
    "state",
    "pincode",
    "notes",
  ];

  updatable.forEach((field) => {
    if (req.body[field] !== undefined) {
      project[field] = req.body[field] || undefined;
    }
  });

  if (req.body.projectType !== undefined) project.projectType = req.body.projectType;
  if (req.body.type !== undefined) project.projectType = req.body.type;
  if (req.body.projectStatus !== undefined) project.projectStatus = req.body.projectStatus;
  if (req.body.status !== undefined) project.projectStatus = req.body.status;

  if (req.body.startDate !== undefined) {
    project.startDate = parseDate(req.body.startDate);
  }
  if (req.body.completionDate !== undefined) {
    project.completionDate = parseDate(req.body.completionDate);
  }
  if (req.body.budget !== undefined) {
    project.budget = Number(req.body.budget) || 0;
  }
  if (req.body.advanceAmount !== undefined) {
    project.advanceAmount = Number(req.body.advanceAmount) || 0;
  }
  if (req.body.pendingAmount !== undefined && req.body.budget === undefined) {
    const budget = project.budget || 0;
    project.advanceAmount = Math.max(0, budget - (Number(req.body.pendingAmount) || 0));
  }
  if (req.body.financialDetails !== undefined) {
    project.financialDetails = normalizeFinancialDetails(req.body.financialDetails);
  }

  await project.save();

  res.json({
    success: true,
    message: "Project updated successfully",
    data: { project },
  });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  res.json({
    success: true,
    message: "Project deleted successfully",
  });
});
