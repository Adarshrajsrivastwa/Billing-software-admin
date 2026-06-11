import { apiRequest } from "./api";

export const getQuotations = () => apiRequest("/quotations");

export const getQuotation = (id) => apiRequest(`/quotations/${id}`);

export const createQuotation = (payload) =>
  apiRequest("/quotations", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateQuotation = (id, payload) =>
  apiRequest(`/quotations/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteQuotation = (id) =>
  apiRequest(`/quotations/${id}`, {
    method: "DELETE",
  });
