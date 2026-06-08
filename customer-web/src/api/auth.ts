import api from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}

export const loginApi = async (payload: LoginPayload) => {
  const { data } = await api.post("/auth/login", payload);
  return data; // { token, refreshToken, user, loginExpiry }
};

export const registerApi = async (payload: any) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};

export const getMeApi = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const changePasswordApi = async (current_password: string, new_password: string) => {
  const { data } = await api.post("/auth/change-password", { current_password, new_password });
  return data;
};
