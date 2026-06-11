import { apiRequest } from "./api";

export const formatItem = (item) => ({
  _id: item._id,
  id: item.itemCode,
  name: item.name,
  category: item.category,
  description: item.description || "",
  unit: item.unit,
  rate: item.rate,
  gst: item.gst,
  status: item.status,
});

export const toPayload = (form) => ({
  name: (form.name || form.itemName || "").trim(),
  category: form.category,
  description: form.description?.trim() || undefined,
  unit: form.unit,
  rate: Number(form.rate),
  gst: form.gst !== "" && form.gst !== undefined ? Number(form.gst) : 0,
  status: form.status,
});

export const getItems = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  const qs = query.toString();
  const res = await apiRequest(`/items${qs ? `?${qs}` : ""}`);
  return res.data.items.map(formatItem);
};

export const createItem = async (form) => {
  const res = await apiRequest("/items", {
    method: "POST",
    body: JSON.stringify(toPayload(form)),
  });
  return formatItem(res.data.item);
};

export const updateItem = async (id, form) => {
  const res = await apiRequest(`/items/${id}`, {
    method: "PUT",
    body: JSON.stringify(toPayload(form)),
  });
  return formatItem(res.data.item);
};

export const deleteItem = async (id) => {
  await apiRequest(`/items/${id}`, { method: "DELETE" });
};
