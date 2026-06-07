import { extractErrorMessage } from "@/lib/errorUtils";
import { refreshAuthToken } from "@/lib/tokenUtils";
import { store } from "@/redux/store";
import axios, { type AxiosError } from "axios";
// process.env.NODE_ENV "https://sms.hummflytech.com/api/v1",

// Extend AxiosRequestConfig to include _retry property
declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth?.token;

    // Skip token refresh for refresh token endpoint to avoid infinite loops
    if (config.url?.includes("/auth/refresh_token")) {
      return config;
    }

    // Add token to request headers
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Check if the error is 401 and we haven't already tried to refresh
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshSuccess = await refreshAuthToken();

        if (refreshSuccess) {
          // Get the new token and retry the original request
          const state = store.getState();
          const newToken = state.auth?.token;

          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error(
          "Token refresh failed:",
          extractErrorMessage(refreshError)
        );
        // Redirect to login or show login modal
        store.dispatch({ type: "auth/logoutFinished" });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
