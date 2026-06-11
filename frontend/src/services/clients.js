import { apiRequest } from "./api";

export const formatClient = (client) => ({
  _id: client._id,
  id: client.clientCode,
  clientCode: client.clientCode,
  clientName: client.clientName,
  company: client.companyName || "—",
  companyName: client.companyName || "",
  mobile: client.mobile,
  altMobile: client.altMobile || "",
  email: client.email || "—",
  address: client.address || "",
  city: client.city || "",
  state: client.state || "",
  pincode: client.pincode || "",
  gst: client.gst || "",
  pan: client.pan || "",
  remarks: client.remarks || "",
  totalProjects: client.totalProjects || 0,
  totalBilling: client.totalBilling || 0,
  pendingAmount: client.pendingAmount || 0,
});

export const toCreatePayload = (form) => ({
  clientName: form.clientName.trim(),
  companyName: form.companyName?.trim() || undefined,
  mobile: form.mobile.trim(),
  altMobile: form.altMobile?.trim() || undefined,
  email: form.email?.trim() || undefined,
  address: form.address?.trim() || undefined,
  city: form.city?.trim() || undefined,
  state: form.state?.trim() || undefined,
  pincode: form.pincode?.trim() || undefined,
  gst: form.gst?.trim() || undefined,
  pan: form.pan?.trim() || undefined,
  remarks: form.remarks?.trim() || undefined,
});

const clean = (v) => {
  const s = v?.trim();
  return s && s !== "—" ? s : undefined;
};

export const toUpdatePayload = (form) => ({
  clientName: form.clientName?.trim(),
  companyName: clean(form.company) || clean(form.companyName),
  mobile: form.mobile?.trim(),
  altMobile: clean(form.altMobile),
  email: clean(form.email),
  address: clean(form.address),
  city: clean(form.city),
  state: clean(form.state),
  pincode: clean(form.pincode),
  gst: clean(form.gst),
  pan: clean(form.pan),
  remarks: clean(form.remarks),
});

export const getClients = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  const qs = query.toString();
  const res = await apiRequest(`/clients${qs ? `?${qs}` : ""}`);
  return res.data.clients.map(formatClient);
};

export const createClient = async (form) => {
  const res = await apiRequest("/clients", {
    method: "POST",
    body: JSON.stringify(toCreatePayload(form)),
  });
  return formatClient(res.data.client);
};

export const updateClient = async (id, form) => {
  const res = await apiRequest(`/clients/${id}`, {
    method: "PUT",
    body: JSON.stringify(toUpdatePayload(form)),
  });
  return formatClient(res.data.client);
};

export const deleteClient = async (id) => {
  await apiRequest(`/clients/${id}`, { method: "DELETE" });
};
