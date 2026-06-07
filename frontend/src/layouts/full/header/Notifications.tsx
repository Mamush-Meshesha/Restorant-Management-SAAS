import {
  Badge,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Button,
  alpha,
  styled,
  Stack,
} from "@mui/material";
import { useState, type MouseEvent } from "react";
import { motion } from "framer-motion";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  IconBell,
  IconTrash,
  IconUser,
  IconCash,
  IconCalendar,
  IconMail,
} from "@tabler/icons-react";

const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: theme.spacing(2),
    marginTop: theme.spacing(1),
    minWidth: 360,
    maxWidth: 400,
    maxHeight: 500,
    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  },
}));

const NotificationItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.5, 1),
  transition: "all 0.2s ease-in-out",
  alignItems: "flex-start",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
  "&.unread": {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
    borderLeft: `3px solid ${theme.palette.primary.main}`,
  },
}));

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "payment" | "user" | "system" | "calendar" | "message";
  read: boolean;
  avatar?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New Payment Received",
    message: "Student John Doe has made a payment of $500",
    timestamp: "2 minutes ago",
    type: "payment",
    read: false,
  },
  {
    id: "2",
    title: "New Student Registration",
    message: "Jane Smith has registered for Grade 10",
    timestamp: "1 hour ago",
    type: "user",
    read: false,
  },
  {
    id: "3",
    title: "System Maintenance",
    message: "Scheduled maintenance will occur tonight at 2 AM",
    timestamp: "3 hours ago",
    type: "system",
    read: true,
  },
  {
    id: "4",
    title: "Upcoming Event",
    message: "Parent-Teacher meeting scheduled for tomorrow",
    timestamp: "1 day ago",
    type: "calendar",
    read: true,
  },
];

const getNotificationIcon = (type: Notification["type"]) => {
  const iconProps = { size: 20 };
  switch (type) {
    case "payment":
      return <IconCash {...iconProps} />;
    case "user":
      return <IconUser {...iconProps} />;
    case "calendar":
      return <IconCalendar {...iconProps} />;
    case "message":
      return <IconMail {...iconProps} />;
    default:
      return <IconBell {...iconProps} />;
  }
};

const getNotificationColor = (type: Notification["type"]) => {
  switch (type) {
    case "payment":
      return "#13DEB9";
    case "user":
      return "#5D87FF";
    case "calendar":
      return "#FFAE1F";
    case "message":
      return "#49BEFF";
    default:
      return "#5A6A85";
  }
};

const Notifications = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const open = Boolean(anchorEl);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <Box>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <IconButton
          size="large"
          aria-label="show notifications"
          color="inherit"
          onClick={handleClick}
          sx={{
            "&:hover": {
              backgroundColor: "rgba(93, 135, 255, 0.1)",
            },
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            variant={unreadCount > 0 ? "standard" : "dot"}
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.75rem",
                minWidth: unreadCount > 9 ? 20 : 16,
                height: unreadCount > 9 ? 20 : 16,
              },
            }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </motion.div>

      <StyledMenu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
      >
        {/* Header */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={markAllAsRead}
                sx={{
                  textTransform: "none",
                  fontSize: "0.75rem",
                  minWidth: "auto",
                  p: 0.5,
                }}
              >
                Mark all read
              </Button>
            )}
          </Stack>
          {unreadCount > 0 && (
            <Typography variant="body2" color="text.secondary">
              You have {unreadCount} unread notification
              {unreadCount !== 1 ? "s" : ""}
            </Typography>
          )}
        </Box>

        <Divider sx={{ mx: 1 }} />

        {/* Notifications List */}
        <Box sx={{ maxHeight: 350, overflowY: "auto" }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <IconBell size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
              <Typography variant="body2" color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                className={!notification.read ? "unread" : ""}
                onClick={() =>
                  !notification.read && markAsRead(notification.id)
                }
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      backgroundColor: alpha(
                        getNotificationColor(notification.type),
                        0.1
                      ),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: getNotificationColor(notification.type),
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Box>
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: notification.read ? 400 : 600,
                          fontSize: "0.875rem",
                          flex: 1,
                        }}
                      >
                        {notification.title}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        sx={{
                          opacity: 0.5,
                          "&:hover": { opacity: 1 },
                          ml: 1,
                        }}
                      >
                        <IconTrash size={14} />
                      </IconButton>
                    </Stack>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.8rem", mt: 0.5, display: "block" }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.75rem", mt: 0.5, display: "block" }}
                      >
                        {notification.timestamp}
                      </Typography>
                    </>
                  }
                />
              </NotificationItem>
            ))
          )}
        </Box>

        {notifications.length > 0 && (
          <Box>
            <Divider sx={{ mx: 1 }} />
            <Box sx={{ p: 1 }}>
              <Button
                fullWidth
                variant="text"
                color="primary"
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                }}
                onClick={() => {
                  // Navigate to notifications page
                  handleClose();
                }}
              >
                View All Notifications
              </Button>
            </Box>
          </Box>
        )}
      </StyledMenu>
    </Box>
  );
};

export default Notifications;
