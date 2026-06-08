import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  category: string;
  image: string;
}

interface CartState {
  items: CartItem[];
  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
}

const initialState: CartState = {
  items: [],
  orderType: "DINE_IN",
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, "qty">>) => {
      const existing = state.items.find((item) => item.id === action.payload.id);
      if (existing) {
        existing.qty += 1;
      } else {
        state.items.push({ ...action.payload, qty: 1 });
      }
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; delta: number }>) => {
      const { id, delta } = action.payload;
      const existing = state.items.find((item) => item.id === id);
      if (existing) {
        existing.qty = Math.max(0, existing.qty + delta);
      }
      state.items = state.items.filter((item) => item.qty > 0);
    },
    setOrderType: (state, action: PayloadAction<"DINE_IN" | "TAKEAWAY" | "DELIVERY">) => {
      state.orderType = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, updateQuantity, setOrderType, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
