const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const apiRequest = async (endpoint, options = {}) => {
  let token = localStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    // Handle token expired (401)
    if (
      response.status === 401 &&
      endpoint !== "/auth/refresh" &&
      endpoint !== "/auth/login"
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            const retryHeaders = {
              ...headers,
              Authorization: `Bearer ${newToken}`,
            };
            return fetch(`${API_URL}${endpoint}`, {
              ...options,
              headers: retryHeaders,
              credentials: "include",
            }).then((r) => r.json());
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const newAccessToken = refreshData.data.accessToken;
          localStorage.setItem("accessToken", newAccessToken);

          processQueue(null, newAccessToken);
          isRefreshing = false;

          // Retry original request
          const retryHeaders = {
            ...headers,
            Authorization: `Bearer ${newAccessToken}`,
          };
          const retriedResponse = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: retryHeaders,
            credentials: "include",
          });
          return await retriedResponse.json();
        } else {
          processQueue(new Error("Refresh token expired"), null);
          isRefreshing = false;
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          throw new Error("Session expired. Please log in again.");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        throw refreshError;
      }
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const detail = data.errors?.[0]?.message;
      throw new Error(detail || data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    throw error;
  }
};
