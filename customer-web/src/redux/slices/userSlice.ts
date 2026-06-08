import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  organization_id: string;
  organization?: { id: string; name: string };
  branch_id?: string | null;
  branch?: { id: string; name: string } | null;
  role?: { role_name: string };
}

export interface UserState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  profile: UserProfile | null;
  favoriteItems: string[];
  favoriteLocations: string[];
  loyaltyPoints: number;
}

const initialState: UserState = {
  isAuthenticated: false,
  token: null,
  refreshToken: null,
  profile: null,
  favoriteItems: [],
  favoriteLocations: [],
  loyaltyPoints: 0,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{
        token: string;
        refreshToken: string;
        user: UserProfile;
      }>
    ) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.profile = action.payload.user;
    },
    setToken: (
      state,
      action: PayloadAction<{ token: string; refreshToken: string }>
    ) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.refreshToken = null;
      state.profile = null;
      state.favoriteItems = [];
      state.favoriteLocations = [];
      state.loyaltyPoints = 0;
    },
    toggleFavoriteItem: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.favoriteItems.includes(id)) {
        state.favoriteItems = state.favoriteItems.filter((i) => i !== id);
      } else {
        state.favoriteItems.push(id);
      }
    },
    toggleFavoriteLocation: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.favoriteLocations.includes(id)) {
        state.favoriteLocations = state.favoriteLocations.filter((i) => i !== id);
      } else {
        state.favoriteLocations.push(id);
      }
    },
  },
});

export const {
  loginSuccess,
  setToken,
  logout,
  toggleFavoriteItem,
  toggleFavoriteLocation,
} = userSlice.actions;

export default userSlice.reducer;
