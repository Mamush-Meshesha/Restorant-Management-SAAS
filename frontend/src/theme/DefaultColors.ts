import { createTheme } from "@mui/material/styles";
import { shadows } from "./Shadows";
import typography from "./Typography";

declare module "@mui/material/styles" {
  interface Palette {
    amber: {
      A50: string;
      A100: string;
      A200: string;
    };
  }
  interface PaletteOptions {
    amber?: {
      A50: string;
      A100: string;
      A200: string;
    };
  }
}

// Enterprise SaaS Theme — clean, professional, high-contrast, data-dense
const baselightTheme = createTheme({
  direction: "ltr",
  palette: {
    primary: {
      main: "#2B2118",      // Deep Espresso — primary actions, intense focus
      light: "#4A3B2E",
      dark: "#1A140F",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#D4A017",      // Rich Amber — highlights, secondary focus
      light: "#E1B846",
      dark: "#A67B10",
      contrastText: "#ffffff",
    },
    success: {
      main: "#10B981",      // Emerald Green
      light: "#D1FAE5",
      dark: "#047857",
      contrastText: "#ffffff",
    },
    info: {
      main: "#3B82F6",      // Professional Blue
      light: "#DBEAFE",
      dark: "#1D4ED8",
      contrastText: "#ffffff",
    },
    error: {
      main: "#EF4444",      // Professional Red
      light: "#FEE2E2",
      dark: "#B91C1C",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#F59E0B",      // Warm Orange
      light: "#FEF3C7",
      dark: "#B45309",
      contrastText: "#ffffff",
    },
    amber: {
      A50: "#FEF3C7",
      A100: "#FDE68A",
      A200: "#FCD34D",
    },
    grey: {
      100: "#F9FAFB",       // Soft off-white backgrounds
      200: "#F3F4F6",
      300: "#E5E7EB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#374151",
    },
    text: {
      primary: "#111827",   // High contrast near-black
      secondary: "#4B5563", // Readable slate grey
    },
    action: {
      disabledBackground: "rgba(17,24,39,0.05)",
      hoverOpacity: 0.04,
      hover: "#F3F4F6",
    },
    divider: "#E5E7EB",
    background: {
      default: "#F9FAFB",   // Very subtle off-white for app background
      paper: "#ffffff",     // Pure white for cards to pop
    },
  },
  typography,
  shadows,
});

export { baselightTheme };
