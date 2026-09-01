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
): Promise<AxiosResponse<AuthResponse | { message: string, requires_2fa: boolean, userId: string }>> => api.post("/auth/login", credential);

export const verify2FA = (
  data: { userId: string, code: string }
): Promise<AxiosResponse<AuthResponse>> => api.post("/auth/verify-2fa", data);

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
