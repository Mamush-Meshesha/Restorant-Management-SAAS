import { useState, useEffect } from "react";
import { Box, Button, Typography, Stack, IconButton, alpha } from "@mui/material";
import { IconDownload, IconX } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt if user hasn't dismissed it before
      if (!localStorage.getItem("pwaPromptDismissed")) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwaPromptDismissed", "true");
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          style={{ position: "fixed", bottom: 20, left: 20, right: 20, zIndex: 9999 }}
        >
          <Box
            sx={{
              maxWidth: 400,
              mx: "auto",
              bgcolor: "primary.main",
              color: "white",
              p: 2,
              borderRadius: 3,
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                bgcolor: "white",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img src="/pwa-192x192.png" alt="App Icon" style={{ width: 36, height: 36, borderRadius: 8 }} onError={(e) => (e.currentTarget.style.display = "none")} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Install Digital Hotel
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Add to home screen for a better experience.
              </Typography>
            </Box>
            <Stack spacing={1}>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={handleInstall}
                startIcon={<IconDownload size={16} />}
                sx={{ borderRadius: 8, px: 2, py: 0.5 }}
              >
                Install
              </Button>
            </Stack>
            <IconButton size="small" onClick={handleDismiss} sx={{ color: alpha("#fff", 0.6), alignSelf: "flex-start", mt: -0.5, mr: -0.5 }}>
              <IconX size={18} />
            </IconButton>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
