import type { AuthResponse } from "@/types/__auth";
import type { AxiosResponse } from "axios";
import api from ".";

// ── Login ────────────────────────────────────────────────────────────────────
export interface Credential {
  email: string;
  password: string;
}

export const loginUser = (
  credential: Credential
): Promise<AxiosResponse<AuthResponse>> => api.post("/auth/login", credential);

// ── Refresh Token ────────────────────────────────────────────────────────────
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  loginExpiry: string;
}

export const refreshToken = (
  data: RefreshTokenRequest
): Promise<AxiosResponse<RefreshTokenResponse>> =>
  api.post("/auth/refresh", data);

// ── Get Current User Profile ─────────────────────────────────────────────────
export const getProfile = (): Promise<AxiosResponse<AuthResponse["user"]>> =>
  api.get("/auth/me");

// ── Change Password ───────────────────────────────────────────────────────────
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export const changePassword = (
  data: ChangePasswordRequest
): Promise<AxiosResponse<{ message: string }>> =>
  api.post("/auth/change-password", data);

// ── Password Reset (Mocked for build) ─────────────────────────────────────────
export const requestPasswordReset = (
  data: { email: string }
): Promise<AxiosResponse<{ message: string }>> =>
  api.post("/auth/request-password-reset", data);

export const resetPassword = (
  data: { email: string; newPassword: string; resetToken: string }
): Promise<AxiosResponse<{ message: string }>> =>
  api.post(`/auth/reset-password/${data.resetToken}`, data);
