import { Box, Typography, alpha, useTheme, LinearProgress, Stack, Tooltip } from "@mui/material";
import { IconCrown, IconAlertTriangle, IconAlertCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

// Hardcoded for now. Later this will fetch from Redux or API
const dummySubscription = {
  plan: "Professional Plan",
  status: "ACTIVE", // ACTIVE, WARNING, CRITICAL, EXPIRED
  daysRemaining: 127,
  totalDays: 365,
  branchesUsed: 8,
  branchesTotal: 20,
  usersUsed: 42,
  usersTotal: 100,
  storageUsed: 12.4,
  storageTotal: 100,
  renewalDate: "Dec 31, 2026"
};

export default function SubscriptionWidget({ compact }: { compact: boolean }) {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Intelligent styling based on days remaining
  let statusColor = theme.palette.success.main;
  let statusBg = alpha(theme.palette.success.main, 0.1);
  let alertIcon = null;
  let statusText = "Active";

  const { daysRemaining, plan } = dummySubscription;

  if (daysRemaining <= 0) {
    statusColor = theme.palette.error.main;
    statusBg = alpha(theme.palette.error.main, 0.1);
    alertIcon = <IconAlertCircle size={16} />;
    statusText = "Expired";
  } else if (daysRemaining <= 7) {
    statusColor = theme.palette.error.main;
    statusBg = alpha(theme.palette.error.main, 0.1);
    alertIcon = <IconAlertCircle size={16} />;
    statusText = "Critical";
  } else if (daysRemaining <= 14) {
    statusColor = theme.palette.warning.dark;
    statusBg = alpha(theme.palette.warning.main, 0.15);
    alertIcon = <IconAlertTriangle size={16} />;
    statusText = "Action Required";
  } else if (daysRemaining <= 30) {
    statusColor = theme.palette.warning.main;
    statusBg = alpha(theme.palette.warning.main, 0.1);
    alertIcon = <IconAlertTriangle size={16} />;
    statusText = "Expiring Soon";
  }

  const progressPercent = Math.max(0, Math.min(100, (daysRemaining / dummySubscription.totalDays) * 100));

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
            bgcolor: statusBg,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: `1px solid ${alpha(statusColor, 0.2)}`,
            "&:hover": { bgcolor: alpha(statusBg, 0.8) }
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
        p: 2,
        mx: 2,
        mb: 2,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.6),
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.03)}`,
        position: "relative",
        overflow: "hidden",
        "&:hover": { 
          borderColor: statusColor,
          boxShadow: `0 4px 20px ${alpha(statusColor, 0.1)}`,
        },
        transition: "all 0.3s ease"
      }}
    >
      {/* Top Banner indicating status if not active */}
      {daysRemaining <= 30 && (
        <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, bgcolor: statusColor }} />
      )}

      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Current Plan
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
            <IconCrown size={16} color={theme.palette.warning.main} />
            {plan}
          </Typography>
        </Box>
        <Box sx={{ bgcolor: statusBg, color: statusColor, px: 1, py: 0.25, borderRadius: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
          {alertIcon}
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.65rem", textTransform: "uppercase" }}>
            {statusText}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ mb: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" mb={0.5}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
            {daysRemaining} Days Left
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
            {dummySubscription.renewalDate}
          </Typography>
        </Stack>
        <LinearProgress 
          variant="determinate" 
          value={progressPercent} 
          sx={{ 
            height: 6, 
            borderRadius: 3,
            bgcolor: alpha(theme.palette.divider, 0.5),
            "& .MuiLinearProgress-bar": {
              bgcolor: statusColor,
              borderRadius: 3
            }
          }} 
        />
      </Box>

      {/* Usage Mini-Summary */}
      <Stack direction="row" spacing={2} sx={{ pt: 1, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
        <Box>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "0.65rem" }}>Branches</Typography>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>{dummySubscription.branchesUsed}/{dummySubscription.branchesTotal}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "0.65rem" }}>Users</Typography>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>{dummySubscription.usersUsed}/{dummySubscription.usersTotal}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "0.65rem" }}>Storage</Typography>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>{dummySubscription.storageUsed}GB</Typography>
        </Box>
      </Stack>
    </Box>
  );
}
