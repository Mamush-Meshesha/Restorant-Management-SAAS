import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, alpha, Badge, Drawer, List, ListItem, ListItemButton, ListItemText, Divider } from "@mui/material";
import { IconMenu2, IconUser, IconShoppingBag, IconBell } from "@tabler/icons-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";
import { useEffect, useState } from "react";
import { getNotificationsApi } from "../../api/notifications";
import LiveActivityBanner from "./LiveActivityBanner";

export default function Header() {
  const location = useLocation();
  const { isAuthenticated } = useAppSelector(state => state.user);
  const cartItems = useAppSelector(state => state.cart.items);
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const notifs = await getNotificationsApi();
        setUnreadCount(notifs.filter(n => !n.is_read).length);
      } catch (e) {
        console.error("Failed to fetch notifications", e);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const cartItemCount = cartItems.reduce((total, item) => total + item.qty, 0);

  const navItems = [
    { label: "Locations", path: "/locations" },
    { label: "Menu", path: "/menu" },
    { label: "Reservations", path: "/reservations" },
    { label: "Account", path: isAuthenticated ? "/account" : "/login" },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, color: 'primary.main', fontWeight: 700 }}>
        RÉSERVER
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.label} disablePadding>
              <ListItemButton component={Link} to={item.path} sx={{ textAlign: 'center' }}>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ 
                    color: isActive ? 'secondary.main' : 'text.primary',
                    fontWeight: isActive ? 600 : 400
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
        {isAuthenticated && (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/account" sx={{ textAlign: 'center' }}>
              <ListItemText primary="My Account" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" sx={{ top: 0, zIndex: 1100 }}>
      <LiveActivityBanner />
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ height: 80, justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton 
              sx={{ display: { xs: "flex", md: "none" } }} 
              color="inherit"
              onClick={handleDrawerToggle}
            >
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

            {isAuthenticated && (
              <IconButton
                color="inherit"
                onClick={() => {
                  navigate("/account", { state: { tab: 3 } });
                }}
                sx={{ '&:hover': { bgcolor: alpha('#2b2118', 0.05) } }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <IconBell size={22} stroke={1.5} />
                </Badge>
              </IconButton>
            )}

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
      
      <nav>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250, bgcolor: 'background.paper' },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </AppBar>
  );
}

