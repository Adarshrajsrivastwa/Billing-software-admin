import { apiRequest } from "./api";

const BASE = "/users";

export const getUsers = () => apiRequest(BASE);

export const createUser = (data) =>
  apiRequest(BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateUser = (id, data) =>
  apiRequest(`${BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteUser = (id) =>
  apiRequest(`${BASE}/${id}`, { method: "DELETE" });

export const toggleUserStatus = (id) =>
  apiRequest(`${BASE}/${id}/toggle-status`, { method: "PATCH" });
