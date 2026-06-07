import { createTheme } from "@mui/material/styles";
import { shadows } from "./Shadows";
import { createTypography } from "./Typography";

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

const lightPalette = {
  primary: {
    main: "#2B2118",
    light: "#4A3B2E",
    dark: "#1A140F",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#D4A017",
    light: "#E1B846",
    dark: "#A67B10",
    contrastText: "#ffffff",
  },
  success: { main: "#10B981", light: "#D1FAE5", dark: "#047857", contrastText: "#ffffff" },
  info: { main: "#3B82F6", light: "#DBEAFE", dark: "#1D4ED8", contrastText: "#ffffff" },
  error: { main: "#EF4444", light: "#FEE2E2", dark: "#B91C1C", contrastText: "#ffffff" },
  warning: { main: "#F59E0B", light: "#FEF3C7", dark: "#B45309", contrastText: "#ffffff" },
  amber: { A50: "#FEF3C7", A100: "#FDE68A", A200: "#FCD34D" },
  grey: {
    100: "#F9FAFB",
    200: "#F3F4F6",
    300: "#E5E7EB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#374151",
  },
  text: { primary: "#111827", secondary: "#4B5563" },
  action: { disabledBackground: "rgba(17,24,39,0.05)", hoverOpacity: 0.04, hover: "#F3F4F6" },
  divider: "#E5E7EB",
  background: { default: "#F9FAFB", paper: "#ffffff" },
};

const darkPalette = {
  primary: {
    main: "#D4A017",
    light: "#E1B846",
    dark: "#A67B10",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#4A3B2E",
    light: "#6B5141",
    dark: "#2B2118",
    contrastText: "#ffffff",
  },
  success: { main: "#10B981", light: "#064E3B", dark: "#047857", contrastText: "#ffffff" },
  info: { main: "#3B82F6", light: "#1E3A5F", dark: "#1D4ED8", contrastText: "#ffffff" },
  error: { main: "#F87171", light: "#450A0A", dark: "#B91C1C", contrastText: "#ffffff" },
  warning: { main: "#FBBF24", light: "#451A03", dark: "#B45309", contrastText: "#1A1A1A" },
  amber: { A50: "#451A03", A100: "#78350F", A200: "#92400E" },
  grey: {
    100: "#1E1E2E",
    200: "#2A2A3E",
    300: "#3A3A50",
    400: "#6B7280",
    500: "#9CA3AF",
    600: "#D1D5DB",
  },
  text: { primary: "#F9FAFB", secondary: "#9CA3AF" },
  action: { disabledBackground: "rgba(255,255,255,0.05)", hoverOpacity: 0.08, hover: "#2A2A3E" },
  divider: "#3A3A50",
  background: { default: "#13131F", paper: "#1E1E2E" },
};

const COLOR_PALETTES = {
  espresso: { main: "#2B2118", light: "#4A3B2E", dark: "#1A140F" },
  blue: { main: "#1E3A5F", light: "#3B82F6", dark: "#1D4ED8" },
  purple: { main: "#3B1F5E", light: "#8B5CF6", dark: "#2E1065" },
  green: { main: "#14532D", light: "#10B981", dark: "#064E3B" },
};

export const createAppTheme = (
  mode: "light" | "dark",
  primaryColorKey: string = "espresso",
  fontSizeKey: "small" | "medium" | "large" = "medium"
) => {
  const basePalette = mode === "light" ? lightPalette : darkPalette;
  const selectedColor = COLOR_PALETTES[primaryColorKey as keyof typeof COLOR_PALETTES] || COLOR_PALETTES.espresso;

  return createTheme({
    direction: "ltr",
    palette: {
      mode,
      ...basePalette,
      primary: {
        ...basePalette.primary,
        main: selectedColor.main,
        light: selectedColor.light,
        dark: selectedColor.dark,
      },
    } as any,
    typography: createTypography(fontSizeKey),
    shadows,
  });
};

// Legacy light theme export for backward compatibility
const baselightTheme = createAppTheme("light");

export { baselightTheme };

