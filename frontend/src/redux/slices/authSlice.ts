import type { AuthResponse, User } from "@/types/__auth";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// === STATE INTERFACE ===

interface AuthState {
  currentUser?: User;
  token: string | null;
  refreshToken: string | null;
  loginExpiry: string | null;
  avatar: string | null;
  subscription?: any | null; // Stores the active subscription object
}

// === INITIAL STATE ===

const initialState: AuthState = {
  currentUser: undefined,
  token: null,
  refreshToken: null,
  loginExpiry: null,
  avatar: null,
  subscription: undefined,
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
    setSubscription(state, action: PayloadAction<any>) {
      state.subscription = action.payload;
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
    updateUserOrganization(state, action: PayloadAction<any>) {
      if (state.currentUser) {
        state.currentUser.organization = {
          ...state.currentUser.organization,
          ...action.payload
        };
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
  setSubscription,
  updateUserOrganization,
} = authSlice.actions;

export default authSlice.reducer;
