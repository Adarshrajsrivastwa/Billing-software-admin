import { apiRequest } from "./api";

export const login = (identifier, password) =>
  apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });

export const logout = () =>
  apiRequest("/auth/logout", {
    method: "POST",
  });

export const getMe = () => apiRequest("/auth/me");
