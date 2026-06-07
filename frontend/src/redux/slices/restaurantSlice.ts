import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// === STATE INTERFACE ===

interface RestaurantState {
  activeBranchId: string | null;
  activeBranchName: string | null;
}

// === INITIAL STATE ===

const initialState: RestaurantState = {
  activeBranchId: null,
  activeBranchName: null,
};

// === SLICE ===

const restaurantSlice = createSlice({
  name: "restaurant",
  initialState,
  reducers: {
    setActiveBranch(
      state,
      action: PayloadAction<{ id: string; name: string }>
    ) {
      state.activeBranchId = action.payload.id;
      state.activeBranchName = action.payload.name;
    },
    clearActiveBranch(state) {
      state.activeBranchId = null;
      state.activeBranchName = null;
    },
  },
});

// === EXPORTS ===

export const { setActiveBranch, clearActiveBranch } = restaurantSlice.actions;

export default restaurantSlice.reducer;
