import { useEffect, useState } from "react";
import { Box, Typography, Button, alpha, useTheme } from "@mui/material";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api";

export default function GlobalSubscriptionBanner() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sub, setSub] = useState<any>(null);

  useEffect(() => {
    api.get("/billing/subscription")
      .then(res => setSub(res.data.data))
      .catch(() => {});
  }, [location.pathname]);

  if (!sub || location.pathname.includes("/settings/billing")) return null;

  const daysRemaining = sub.end_date ? Math.ceil((new Date(sub.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 365;
  
  if (daysRemaining > 14 && sub.status === 'ACTIVE') return null;

  let message = "";
  let color = theme.palette.warning.main;
  let bg = alpha(theme.palette.warning.main, 0.1);
  if (sub.status === 'EXPIRED' || daysRemaining <= 0) {
    message = "Your subscription has expired. You are in a read-only grace period.";
    color = theme.palette.error.main;
    bg = alpha(theme.palette.error.main, 0.1);
  } else if (daysRemaining <= 3) {
    message = `Urgent: Your subscription expires in ${daysRemaining} days.`;
    color = theme.palette.error.main;
    bg = alpha(theme.palette.error.main, 0.1);
  } else if (daysRemaining <= 7) {
    message = `Critical: Your subscription expires in ${daysRemaining} days.`;
    color = theme.palette.error.main;
    bg = alpha(theme.palette.error.main, 0.1);
  } else if (daysRemaining <= 14) {
    message = `Warning: Your subscription expires in ${daysRemaining} days.`;
  }

  return (
    <Box 
      sx={{ 
        bgcolor: bg, 
        color: color,
        px: 3, 
        py: 1.5, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        gap: 2,
        borderBottom: `1px solid ${alpha(color, 0.2)}`,
        zIndex: 9999,
        position: "relative"
      }}
    >
      <IconAlertTriangle size={20} />
      <Typography variant="body2" fontWeight={600}>
        {message}
      </Typography>
      <Button 
        size="small" 
        variant="contained" 
        color="primary" 
        sx={{ ml: 2 }}
        onClick={() => navigate("/settings/billing")}
      >
        Manage Billing
      </Button>
    </Box>
  );
}
