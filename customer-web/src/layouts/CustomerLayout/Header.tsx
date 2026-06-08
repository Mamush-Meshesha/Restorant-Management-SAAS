import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, alpha, Badge } from "@mui/material";
import { IconMenu2, IconUser, IconShoppingBag } from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";

export default function Header() {
  const location = useLocation();
  const { isAuthenticated } = useAppSelector(state => state.user);
  const cartItems = useAppSelector(state => state.cart.items);

  const cartItemCount = cartItems.reduce((total, item) => total + item.qty, 0);

  const navItems = [
    { label: "Locations", path: "/locations" },
    { label: "Menu", path: "/menu" },
    { label: "Reservations", path: "/reservations" },
    { label: "Account", path: "/login" },
  ];

  return (
    <AppBar position="fixed">
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ height: 80, justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton sx={{ display: { xs: "flex", md: "none" } }} color="inherit">
              <IconMenu2 />
            </IconButton>
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                textDecoration: "none",
                color: "primary.main",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                display: "flex",
                alignItems: "center"
              }}
            >
              RÉSERVER
            </Typography>
          </Box>

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 4 }}>
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Typography
                  key={item.label}
                  component={Link}
                  to={item.path}
                  sx={{
                    textDecoration: "none",
                    color: isActive ? "secondary.main" : "text.secondary",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    transition: "color 0.2s",
                    position: "relative",
                    "&:hover": {
                      color: "primary.main",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: -4,
                      left: 0,
                      width: isActive ? "100%" : "0%",
                      height: 2,
                      backgroundColor: "secondary.main",
                      transition: "width 0.3s ease",
                    }
                  }}
                >
                  {item.label}
                </Typography>
              );
            })}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              component={Link}
              to={isAuthenticated ? "/account" : "/login"}
              color="inherit"
              sx={{ '&:hover': { bgcolor: alpha('#2b2118', 0.05) } }}
            >
              <IconUser size={22} stroke={1.5} />
            </IconButton>
            <IconButton
              component={Link}
              to="/order"
              color="inherit"
              sx={{ '&:hover': { bgcolor: alpha('#2b2118', 0.05) } }}
            >
              <Badge badgeContent={cartItemCount} color="error">
                <IconShoppingBag size={22} stroke={1.5} />
              </Badge>
            </IconButton>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/order"
              sx={{ ml: 2, display: { xs: "none", sm: "flex" }, px: 4, py: 1.2, borderRadius: 8 }}
            >
              Order Now
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
