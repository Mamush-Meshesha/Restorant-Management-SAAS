import { createTheme, alpha } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2b2118", // Deep Espresso
      light: "#4a3c31",
      dark: "#140f0b",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#d4af37", // Champagne Gold
      light: "#eadd99",
      dark: "#997e24",
      contrastText: "#2b2118",
    },
    background: {
      default: "#faf9f6", // Off-white/pearl
      paper: "#ffffff",
    },
    text: {
      primary: "#2b2118",
      secondary: "#6e6259",
    },
    divider: alpha("#2b2118", 0.1),
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
    },
    h4: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
    },
    h5: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
      letterSpacing: "0.02em",
    },
    overline: {
      letterSpacing: "0.1em",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: "10px 24px",
          boxShadow: "none",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(43, 33, 24, 0.15)",
            transform: "translateY(-1px)",
          },
        },
        containedPrimary: {
          backgroundColor: "#2b2118",
          "&:hover": {
            backgroundColor: "#140f0b",
          },
        },
        containedSecondary: {
          backgroundColor: "#d4af37",
          color: "#2b2118",
          "&:hover": {
            backgroundColor: "#c29d2b",
          },
        },
        outlinedPrimary: {
          borderColor: alpha("#2b2118", 0.3),
          "&:hover": {
            borderColor: "#2b2118",
            backgroundColor: "transparent",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          border: `1px solid ${alpha("#2b2118", 0.08)}`,
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
        },
        elevation2: {
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          color: "#2b2118",
          boxShadow: "none",
          borderBottom: `1px solid ${alpha("#2b2118", 0.05)}`,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: alpha("#2b2118", 0.2),
              transition: "border-color 0.3s ease",
            },
            "&:hover fieldset": {
              borderColor: alpha("#2b2118", 0.4),
            },
            "&.Mui-focused fieldset": {
              borderColor: "#d4af37",
            },
          },
        },
      },
    },
  },
});

export default theme;
