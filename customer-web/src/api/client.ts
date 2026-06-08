import axios, { type AxiosError } from "axios";
import { store } from "../redux/store";
import { logout, setToken } from "../redux/slices/userSlice";

// Extend AxiosRequestConfig to include _retry property
declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "https://restorant-management-saas.onrender.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor: attach token ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.user?.token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: auto-refresh on 401 ─────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/")
    ) {
      originalRequest._retry = true;

      try {
        const state = store.getState();
        const refreshToken = state.user?.refreshToken;

        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
          (import.meta.env.VITE_API_URL || "https://restorant-management-saas.onrender.com/api/v1") + "/auth/refresh",
          { refreshToken }
        );

        store.dispatch(setToken({ token: data.token, refreshToken: data.refreshToken }));

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
        }
        return api(originalRequest);
      } catch {
        store.dispatch(logout());
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
