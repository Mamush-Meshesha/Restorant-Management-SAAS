import { Box, Typography } from "@mui/material";
import { Outlet, Link } from "react-router-dom";

export default function AuthLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Left side - Cinematic Background (hidden on small screens) */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          width: { md: "50%", lg: "60%" },
          position: "relative",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          p: 6,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=2070&auto=format&fit=crop")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.3,
          }}
        />
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h4"
            component={Link}
            to="/"
            sx={{
              textDecoration: "none",
              color: "inherit",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            RÉSERVER
          </Typography>
        </Box>
        <Box sx={{ position: "relative", zIndex: 1, maxWidth: 500 }}>
          <Typography variant="h2" sx={{ mb: 2, lineHeight: 1.1 }}>
            Unforgettable <br /> Dining Experiences
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8, fontSize: "1.1rem" }}>
            Sign in to access your exclusive reservations, personalized menu recommendations, and loyalty rewards.
          </Typography>
        </Box>
      </Box>

      {/* Right side - Auth Form Area */}
      <Box
        sx={{
          width: { xs: "100%", md: "50%", lg: "40%" },
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
          position: "relative",
        }}
      >
        {/* Mobile Header */}
        <Box sx={{ display: { xs: "flex", md: "none" }, p: 4, justifyContent: "center" }}>
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              textDecoration: "none",
              color: "primary.main",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            RÉSERVER
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 4, sm: 8, md: 6, lg: 8 },
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 420 }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
