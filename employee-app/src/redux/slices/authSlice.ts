import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  profile: any | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('employee_token'),
  profile: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ token: string; profile: any }>) => {
      state.token = action.payload.token;
      state.profile = action.payload.profile;
      localStorage.setItem('employee_token', action.payload.token);
    },
    logout: (state) => {
      state.token = null;
      state.profile = null;
      localStorage.removeItem('employee_token');
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
