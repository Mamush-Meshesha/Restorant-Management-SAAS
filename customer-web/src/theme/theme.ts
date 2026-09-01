import { createTheme, alpha } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#000000",
      light: "#333333",
      dark: "#000000",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#D32F2F", // A refined, appetizing red accent
      light: "#E57373",
      dark: "#C62828",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FFFFFF", // Pure white for crisp contrast
      paper: "#F8F8F8", // Very subtle gray for cards
    },
    text: {
      primary: "#000000",
      secondary: "#666666",
    },
    divider: alpha("#000000", 0.08),
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
      fontWeight: 600,
      letterSpacing: "-0.02em",
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
    },
    h4: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
    },
    button: {
      textTransform: "none", // Modern apps avoid all-caps buttons
      fontWeight: 500,
      letterSpacing: "0em",
      fontFamily: '"Inter", sans-serif',
    },
    overline: {
      letterSpacing: "0.1em",
      fontWeight: 600,
      textTransform: "uppercase",
      fontFamily: '"Inter", sans-serif',
    },
    body1: {
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontWeight: 400,
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8, // Rounded corners are more standard for modern web
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#FFFFFF",
          color: "#000000",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 100, // Pill-shaped buttons are very modern
          padding: "12px 28px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            transform: "translateY(-1px)",
          },
          transition: "all 0.2s ease-in-out",
        },
        containedPrimary: {
          backgroundColor: "#000000",
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#333333",
          },
        },
        containedSecondary: {
          backgroundColor: "#D32F2F",
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#B71C1C",
          },
        },
        outlinedPrimary: {
          borderColor: "#E0E0E0",
          borderWidth: "1px",
          color: "#000000",
          "&:hover": {
            borderColor: "#000000",
            borderWidth: "1px",
            backgroundColor: "#F5F5F5",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          border: `1px solid #EAEAEA`,
          borderRadius: 16,
          backgroundColor: "#FFFFFF",
          transition: "box-shadow 0.2s ease",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          color: "#000000",
          boxShadow: "none",
          borderBottom: `1px solid #EAEAEA`,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderTop: `1px solid #EAEAEA`,
          height: 70,
          paddingBottom: "env(safe-area-inset-bottom)", 
        }
      }
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: "#999999",
          "&.Mui-selected": {
            color: "#000000",
          }
        },
        label: {
          fontFamily: '"Inter", sans-serif',
          fontWeight: 500,
          fontSize: "0.7rem",
          marginTop: "4px",
          "&.Mui-selected": {
            fontSize: "0.7rem",
            fontWeight: 600,
          }
        }
      }
    },
  },
});

export default theme;
