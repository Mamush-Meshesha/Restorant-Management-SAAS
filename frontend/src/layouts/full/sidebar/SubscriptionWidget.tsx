import { Box, Typography, alpha, useTheme, LinearProgress, Stack, Tooltip } from "@mui/material";
import { IconCrown } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBillingSubscription } from "../../../api/_billing";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";

export default function SubscriptionWidget({ compact }: { compact: boolean }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const authSub = useSelector((state: RootState) => state.auth.subscription);
  const [sub, setSub] = useState<any>(null);

  useEffect(() => {
    if (authSub) {
      setSub(authSub);
    } else {
      getBillingSubscription().then(res => setSub(res.data.data)).catch(() => {});
    }
  }, [authSub]);

  if (!sub) return null; // Don't render if no sub data

  const daysRemaining = sub.end_date ? Math.ceil((new Date(sub.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 365;
  const totalDays = 365;
  const plan = sub.plan?.name || "Free";

  // Intelligent styling based on days remaining
  let statusColor = theme.palette.success.main;
  let gradient = `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`;
  
  let statusText = sub.status === 'CANCELED' ? 'Canceled' : "Active";

  if (sub.status === 'CANCELED') {
    statusColor = theme.palette.error.main;
    gradient = `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.light, 0.05)} 100%)`;
    
  } else if (daysRemaining <= 0) {
    statusColor = theme.palette.error.main;
    gradient = `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.light, 0.05)} 100%)`;
    
    statusText = "Expired";
  } else if (daysRemaining <= 14) {
    statusColor = theme.palette.warning.main;
    gradient = `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.light, 0.05)} 100%)`;
    
    statusText = "Expiring Soon";
  }

  const progressPercent = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100));

  if (compact) {
    return (
      <Tooltip title={`${plan} - ${daysRemaining} days left`} placement="right">
        <Box
          onClick={() => navigate("/settings/billing")}
          sx={{
            cursor: "pointer",
            p: 1.5,
            mb: 1,
            mx: 1,
            borderRadius: 2,
            bgcolor: alpha(statusColor, 0.1),
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: `1px solid ${alpha(statusColor, 0.2)}`,
            "&:hover": { bgcolor: alpha(alpha(statusColor, 0.1), 0.8) }
          }}
        >
          <IconCrown size={24} color={statusColor} />
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box
      onClick={() => navigate("/settings/billing")}
      sx={{
        cursor: "pointer",
        p: 1.5,
        mx: 2,
        mb: 2,
        borderRadius: 3,
        background: gradient,
        border: `1px solid ${alpha(statusColor, 0.3)}`,
        boxShadow: `0 4px 15px ${alpha(statusColor, 0.1)}`,
        position: "relative",
        overflow: "hidden",
        "&:hover": { 
          borderColor: statusColor,
          boxShadow: `0 6px 20px ${alpha(statusColor, 0.2)}`,
          transform: "translateY(-2px)"
        },
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      {/* Top Banner indicating status if not active */}
      {sub.status !== 'ACTIVE' && (
        <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, bgcolor: statusColor }} />
      )}

      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 800, color: statusColor, textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.6rem" }}>
            {statusText}
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconCrown size={18} color={theme.palette.warning.main} />
            {plan} Plan
          </Typography>
        </Box>
      </Stack>

      <Box>
        <Stack direction="row" justifyContent="space-between" mb={0.5}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, fontSize: "0.65rem" }}>
            {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : 'N/A'}
          </Typography>
          <Typography variant="caption" sx={{ color: statusColor, fontWeight: 700, fontSize: "0.65rem" }}>
            {daysRemaining} Days
          </Typography>
        </Stack>
        <LinearProgress 
          variant="determinate" 
          value={progressPercent} 
          sx={{ 
            height: 4, 
            borderRadius: 2,
            bgcolor: alpha(statusColor, 0.15),
            "& .MuiLinearProgress-bar": {
              bgcolor: statusColor,
              borderRadius: 2
            }
          }} 
        />
      </Box>
    </Box>
  );
}
