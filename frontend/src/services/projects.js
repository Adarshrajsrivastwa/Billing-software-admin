import { apiRequest } from "./api";
import { sanitizeFinancialDetails } from "../components/FinancialDetailsFields";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatProject = (project) => ({
  _id: project._id,
  id: project.projectCode,
  projectCode: project.projectCode,
  projectName: project.projectName,
  clientName: project.clientName,
  type: project.projectType,
  status: project.projectStatus,
  startDate: formatDate(project.startDate),
  completionDate: project.completionDate
    ? project.completionDate.split("T")[0]
    : "",
  budget: project.budget || 0,
  advanceAmount: project.advanceAmount || 0,
  pendingAmount: project.pendingAmount ?? Math.max(0, (project.budget || 0) - (project.advanceAmount || 0)),
  phone: project.phone || "",
  email: project.email || "",
  siteAddress: project.siteAddress || "",
  city: project.city || "",
  state: project.state || "",
  pincode: project.pincode || "",
  address:
    [project.city, project.state].filter(Boolean).join(", ") ||
    project.siteAddress ||
    "—",
  notes: project.notes || "",
  financialDetails: (project.financialDetails || []).map((item) => ({
    _id: item._id,
    title: item.title,
    amount: item.amount,
    type: item.type,
    date: item.date ? item.date.split("T")[0] : "",
    note: item.note || "",
  })),
  totalReceived: project.totalReceived ?? 0,
  totalExpenses: project.totalExpenses ?? 0,
});

export const toCreatePayload = (form) => ({
  projectName: form.projectName.trim(),
  projectCode: form.projectCode,
  clientName: form.clientName.trim(),
  phone: form.phone || undefined,
  email: form.email || undefined,
  projectType: form.projectType,
  projectStatus: form.projectStatus,
  siteAddress: form.siteAddress || undefined,
  city: form.city || undefined,
  state: form.state || undefined,
  pincode: form.pincode || undefined,
  startDate: form.startDate || undefined,
  completionDate: form.completionDate || undefined,
  budget: Number(form.budget) || 0,
  advanceAmount: Number(form.advanceAmount) || 0,
  financialDetails: sanitizeFinancialDetails(form.financialDetails),
  notes: form.notes || undefined,
});

export const toUpdatePayload = (form) => ({
  projectName: form.projectName?.trim(),
  clientName: form.clientName?.trim(),
  phone: form.phone || undefined,
  email: form.email || undefined,
  projectType: form.type || form.projectType,
  projectStatus: form.status || form.projectStatus,
  siteAddress: form.siteAddress || undefined,
  city: form.city || undefined,
  state: form.state || undefined,
  pincode: form.pincode || undefined,
  startDate: form.startDate || undefined,
  completionDate: form.completionDate || undefined,
  budget: form.budget !== undefined ? Number(form.budget) || 0 : undefined,
  pendingAmount:
    form.pendingAmount !== undefined
      ? Number(form.pendingAmount) || 0
      : undefined,
  notes: form.notes || undefined,
  address: form.address || undefined,
  financialDetails:
    form.financialDetails !== undefined
      ? sanitizeFinancialDetails(form.financialDetails)
      : undefined,
  advanceAmount:
    form.advanceAmount !== undefined
      ? Number(form.advanceAmount) || 0
      : undefined,
});

export const getProjects = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status && params.status !== "All") query.set("status", params.status);
  if (params.activeOnly) query.set("activeOnly", "true");

  const qs = query.toString();
  const res = await apiRequest(`/projects${qs ? `?${qs}` : ""}`);
  return res.data.projects.map(formatProject);
};

export const getActiveProjects = async () => {
  const res = await apiRequest("/projects/billing/active");
  return res.data.projects.map(formatProject);
};

export const getProjectById = async (id) => {
  const res = await apiRequest(`/projects/${id}`);
  return formatProject(res.data.project);
};

export const createProject = async (form) => {
  const res = await apiRequest("/projects", {
    method: "POST",
    body: JSON.stringify(toCreatePayload(form)),
  });
  return formatProject(res.data.project);
};

export const updateProject = async (id, form) => {
  const res = await apiRequest(`/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(toUpdatePayload(form)),
  });
  return formatProject(res.data.project);
};

export const deleteProject = async (id) => {
  await apiRequest(`/projects/${id}`, { method: "DELETE" });
};
