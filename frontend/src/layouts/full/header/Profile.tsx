import {
  Avatar,
  Box,
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
  Divider,
  Chip,
  alpha,
  styled,
} from "@mui/material";
import { useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  IconListCheck,
  IconMail,
  IconUser,
  IconSettings,
  IconLogout,
  IconChevronDown,
} from "@tabler/icons-react";

// logout is handled locally via Redux only
import ProfileImg from "@/assets/images/profile/user-1.jpg";
import { useAppDispatch, useAppSelector } from "@/hooks/auth";
import { logoutFinished } from "../../../redux/slices/authSlice";

const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: theme.spacing(2),
    marginTop: theme.spacing(1),
    minWidth: 280,
    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    "& .MuiMenuItem-root": {
      padding: theme.spacing(1.5, 2),
      borderRadius: theme.spacing(1),
      margin: theme.spacing(0.5, 1),
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        transform: "translateX(4px)",
      },
    },
  },
}));

const ProfileButton = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.spacing(3),
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    borderColor: alpha(theme.palette.primary.main, 0.3),
    transform: "translateY(-1px)",
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
}));

const Profile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { currentUser } = useAppSelector((state) => state?.auth);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const logoutUser = () => {
    dispatch(logoutFinished());
    navigate("/auth/login", { replace: true });
  };

  const menuItems = [
    {
      icon: IconUser,
      label: "My Profile",
      action: () => navigate("/my-profile"),
    },
    { icon: IconMail, label: "Messages", action: () => navigate("/messages") },
    {
      icon: IconListCheck,
      label: "My Tasks",
      action: () => navigate("/tasks"),
    },
    {
      icon: IconSettings,
      label: "Settings",
      action: () => navigate("/app-settings"),
    },
  ];

  return (
    <Box>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <ProfileButton
          onClick={handleClick}
          aria-controls={open ? "profile-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <Avatar
            src={ProfileImg}
            alt="Profile"
            sx={{
              width: 40,
              height: 40,
              border: (theme) =>
                `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          />
          <Box sx={{ display: { xs: "none", sm: "block" }, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                fontSize: "0.875rem",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 120,
              }}
            >
              {currentUser?.username || "Default User"}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "0.75rem",
                lineHeight: 1,
              }}
            >
              {currentUser?.role?.name || "Administrator"}
            </Typography>
          </Box>
          <IconChevronDown
            size={16}
            style={{
              transition: "transform 0.2s ease-in-out",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </ProfileButton>
      </motion.div>

      <StyledMenu
        id="profile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
      >
        {/* User Info Header */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={ProfileImg}
              alt="Profile"
              sx={{ width: 48, height: 48 }}
            />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {currentUser?.username || "Default User"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentUser?.email || "user@example.com"}
              </Typography>
              <Chip
                label={currentUser?.role?.name || "Administrator"}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mt: 0.5, fontSize: "0.75rem", height: 20 }}
              />
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ mx: 1 }} />

        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              item.action();
              handleClose();
            }}
          >
            <ListItemIcon>
              <item.icon size={20} />
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </MenuItem>
        ))}

        <Divider sx={{ mx: 1, my: 1 }} />

        {/* Logout Button */}
        <Box sx={{ p: 1 }}>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={logoutUser}
            startIcon={<IconLogout size={18} />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: "rgba(250, 137, 107, 0.08)",
              },
            }}
          >
            Sign Out
          </Button>
        </Box>
      </StyledMenu>
    </Box>
  );
};

export default Profile;
