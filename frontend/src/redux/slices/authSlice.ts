import type { AuthResponse, User } from "@/types/__auth";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// === STATE INTERFACE ===

interface AuthState {
  currentUser?: User;
  token: string | null;
  refreshToken: string | null;
  loginExpiry: string | null;
  avatar: string | null;
}

// === INITIAL STATE ===

const initialState: AuthState = {
  currentUser: undefined,
  token: null,
  refreshToken: null,
  loginExpiry: null,
  avatar: null,
};

// === SLICE ===

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginFinished(state, action: PayloadAction<AuthResponse>) {
      const user = action.payload.user;
      if (user?.role) {
        // Normalize role_name from backend to name for frontend compatibility
        const anyRole = user.role as any;
        if (anyRole.role_name && !anyRole.name) {
          anyRole.name = anyRole.role_name;
        }
      }
      state.currentUser = user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.loginExpiry = action.payload.loginExpiry;
    },
    setRefreshedToken(
      state,
      action: PayloadAction<{
        token: string;
        refreshToken: string;
        loginExpiry: string;
      }>
    ) {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.loginExpiry = action.payload.loginExpiry;
    },
    setAuthTokenExpiry(state, action: PayloadAction<string>) {
      state.loginExpiry = action.payload;
    },
    logoutFinished(state) {
      state.currentUser = undefined;
      state.avatar = null;
      state.token = null;
      state.refreshToken = null;
      state.loginExpiry = null;
    },
    addAvatar(state, action: PayloadAction<string>) {
      state.avatar = action.payload;
    },
    setFirstTime(state) {
      if (state.currentUser) {
        (state.currentUser as User & { firstTime: boolean }).firstTime = false; // Optional: if you really expect this
      }
    },
  },
});

// === EXPORTS ===

export const {
  loginFinished,
  logoutFinished,
  addAvatar,
  setFirstTime,
  setAuthTokenExpiry,
  setRefreshedToken,
} = authSlice.actions;

export default authSlice.reducer;
