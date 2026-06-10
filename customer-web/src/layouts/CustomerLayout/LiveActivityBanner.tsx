import { Box, Typography, alpha } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { IconBellRinging, IconToolsKitchen2 } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveActivityBanner() {
  const location = useLocation();
  const [waitlistId, setWaitlistId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage whenever location changes (so we pick up new sessions)
    setWaitlistId(localStorage.getItem("active_waitlist_id"));
    setSessionToken(localStorage.getItem("active_table_session"));
  }, [location]);

  // Don't show the banner if they are ALREADY on the status page
  if (location.pathname.includes("/waitlist/status") || location.pathname.includes("/session")) {
    return null;
  }

  return (
    <AnimatePresence>
      {waitlistId && !sessionToken && (
        <Box 
          component={motion.div}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          sx={{ bgcolor: "secondary.main", color: "primary.main", overflow: "hidden" }}
        >
          <Box
            component={Link}
            to={`/waitlist/status/${waitlistId}`}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 1.5,
              px: 2,
              textDecoration: "none",
              color: "inherit",
              "&:hover": { bgcolor: alpha("#d4af37", 0.8) }
            }}
          >
            <IconBellRinging size={20} className="animate-bounce" style={{ marginRight: 12 }} />
            <Typography variant="body2" fontWeight={700}>
              You have an active Waitlist session! Tap here to view live status.
            </Typography>
          </Box>
        </Box>
      )}

      {sessionToken && (
        <Box 
          component={motion.div}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          sx={{ bgcolor: "primary.main", color: "white", overflow: "hidden" }}
        >
          <Box
            component={Link}
            to={`/session/${sessionToken}`}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 1.5,
              px: 2,
              textDecoration: "none",
              color: "inherit",
              "&:hover": { bgcolor: "primary.light" }
            }}
          >
            <IconToolsKitchen2 size={20} style={{ marginRight: 12 }} />
            <Typography variant="body2" fontWeight={700}>
              Live Table Session Active. Tap to return to menu & cart.
            </Typography>
          </Box>
        </Box>
      )}
    </AnimatePresence>
  );
}
