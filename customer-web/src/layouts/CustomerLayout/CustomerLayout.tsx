import { Box, BottomNavigation, BottomNavigationAction, useMediaQuery, useTheme } from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { IconHome, IconMenu, IconCalendar, IconUser } from "@tabler/icons-react";
import Header from "./Header";
import Footer from "./Footer";
import ChatWidget from "../../components/ChatWidget";
import PwaPrompt from "../../components/PwaPrompt";

export default function CustomerLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveValue = () => {
    if (location.pathname.startsWith("/menu")) return "/menu";
    if (location.pathname.startsWith("/reservations")) return "/reservations";
    if (location.pathname.startsWith("/account")) return "/account";
    return "/";
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", paddingBottom: isMobile ? "70px" : 0 }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Outlet />
      </Box>
      {!isMobile && <Footer />}

      {isMobile && (
        <BottomNavigation
          value={getActiveValue()}
          onChange={(_, newValue) => navigate(newValue)}
          showLabels
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
        >
          <BottomNavigationAction label="Home" value="/" icon={<IconHome size={22} />} />
          <BottomNavigationAction label="Menu" value="/menu" icon={<IconMenu size={22} />} />
          <BottomNavigationAction label="Reserve" value="/reservations" icon={<IconCalendar size={22} />} />
          <BottomNavigationAction label="Profile" value="/account" icon={<IconUser size={22} />} />
        </BottomNavigation>
      )}
      
      <ChatWidget />
      <PwaPrompt />
    </Box>
  );
}
