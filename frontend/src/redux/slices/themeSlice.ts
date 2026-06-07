import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type ThemeMode = "light" | "dark";
type PrimaryColor = "espresso" | "blue" | "purple" | "green";

interface ThemeState {
  mode: ThemeMode;
  primaryColor: PrimaryColor;
  sidebarCompact: boolean;
  fontSize: "small" | "medium" | "large";
}

const initialState: ThemeState = {
  mode: "light",
  primaryColor: "espresso",
  sidebarCompact: false,
  fontSize: "medium",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
    toggleThemeMode(state) {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setPrimaryColor(state, action: PayloadAction<PrimaryColor>) {
      state.primaryColor = action.payload;
    },
    setSidebarCompact(state, action: PayloadAction<boolean>) {
      state.sidebarCompact = action.payload;
    },
    setFontSize(state, action: PayloadAction<"small" | "medium" | "large">) {
      state.fontSize = action.payload;
    },
  },
});

export const { setThemeMode, toggleThemeMode, setPrimaryColor, setSidebarCompact, setFontSize } = themeSlice.actions;
export default themeSlice.reducer;
