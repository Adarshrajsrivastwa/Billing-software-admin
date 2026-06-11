import { apiRequest } from "./api";

export const formatCategory = (category) => ({
  _id: category._id,
  name: category.name,
  description: category.description || "",
  status: category.status,
});

export const toPayload = (form) => ({
  name: form.name.trim(),
  description: form.description?.trim() || undefined,
  status: form.status,
});

export const getCategories = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  const qs = query.toString();
  const res = await apiRequest(`/categories${qs ? `?${qs}` : ""}`);
  return res.data.categories.map(formatCategory);
};

export const createCategory = async (form) => {
  const res = await apiRequest("/categories", {
    method: "POST",
    body: JSON.stringify(toPayload(form)),
  });
  return formatCategory(res.data.category);
};

export const updateCategory = async (id, form) => {
  const res = await apiRequest(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(toPayload(form)),
  });
  return formatCategory(res.data.category);
};

export const deleteCategory = async (id) => {
  await apiRequest(`/categories/${id}`, { method: "DELETE" });
};
