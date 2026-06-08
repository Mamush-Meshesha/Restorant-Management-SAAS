import {
  Box,
  Drawer,
  useMediaQuery,
  Typography,
  alpha,
  styled,
} from "@mui/material";
import SidebarItems from "./SidebarItems";
import SubscriptionWidget from "./SubscriptionWidget";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";

import { IconToolsKitchen2 } from "@tabler/icons-react";

const MSidebar = ({
  isSidebarOpen,
  isMobileSidebarOpen,
  onSidebarClose,
}: {
  isSidebarOpen: boolean;
  isMobileSidebarOpen: boolean;
  onSidebarClose: () => void;
}) => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const sidebarCompact = useSelector((state: RootState) => state.theme?.sidebarCompact ?? false);
  const sidebarWidth = lgUp && sidebarCompact ? "85px" : "280px";
  // Enhanced scrollbar styles
  const scrollbarStyles = {
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: alpha("#5D87FF", 0.3),
      borderRadius: "8px",
      "&:hover": {
        backgroundColor: alpha("#5D87FF", 0.5),
      },
    },
  };

  const LogoSection = styled(Box)(({ theme }) => ({
    height: "80px",
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  }));

  const FooterSection = styled(Box)(({ theme }) => ({
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing(1.5),
    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    background: alpha(theme.palette.background.paper, 0.9),
    backdropFilter: "blur(10px)",
  }));

  if (lgUp) {
    return (
      <Box
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
        }}
      >
        {/* ------------------------------------------- */}
        {/* Sidebar for desktop */}
        {/* ------------------------------------------- */}
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          variant="permanent"
          PaperProps={{
            sx: {
              boxSizing: "border-box",
              width: sidebarWidth,
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              bgcolor: "background.paper",
              boxShadow: "none",
              ...scrollbarStyles,
            },
          }}
          ModalProps={{
            // Prevent aria-hidden issues
            keepMounted: true,
            disableEnforceFocus: true,
            disableAutoFocus: true,
            disableRestoreFocus: true,
          }}
        >
          {/* ------------------------------------------- */}
          {/* Sidebar Box */}
          {/* ------------------------------------------- */}
          <Box
            sx={{
              height: "100%",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Enhanced Logo Section */}
            <LogoSection>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: (theme) => theme.palette.primary.main,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "none",
                  }}
                >
                  <IconToolsKitchen2 size={32} color="white" />
                </Box>
                {!sidebarCompact && (
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        lineHeight: 1.2,
                      }}
                    >
                      Restaurant POS
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.75rem",
                      }}
                    >
                      Management System
                    </Typography>
                  </Box>
                )}
              </motion.div>
            </LogoSection>

            {/* Navigation Items */}
            <Box sx={{ flex: 1, overflowY: "auto", py: 2 }}>
              <SidebarItems />
            </Box>

            <Box sx={{ mt: "auto", display: sidebarCompact ? "none" : "block", pb: 6 }}>
              <SubscriptionWidget compact={sidebarCompact} />
            </Box>

            {/* Footer Section */}
            <FooterSection sx={{ display: sidebarCompact ? "none" : "block" }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.7rem",
                  textAlign: "center",
                  display: "block",
                }}
              >
                © 2025 Restaurant Management System
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "primary.main",
                  fontSize: "0.7rem",
                  textAlign: "center",
                  display: "block",
                  mt: 0.5,
                  fontWeight: 500,
                }}
              >
                v1.0.0
              </Typography>
            </FooterSection>
          </Box>
        </Drawer>
      </Box>
    );
  }
  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant="temporary"
      PaperProps={{
        sx: {
          width: sidebarWidth,
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: "background.paper",
          boxShadow: (theme) => theme.shadows[8],
          ...scrollbarStyles,
        },
      }}
      ModalProps={{
        // Prevent aria-hidden focus conflicts
        disableEnforceFocus: true,
        disableAutoFocus: true,
        disableRestoreFocus: true,
        keepMounted: false,
      }}
    >
      <Box
        sx={{
          height: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Enhanced Logo Section for Mobile */}
        <LogoSection>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              cursor: "pointer",
              width: "100%",
            }}
            onClick={onSidebarClose}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: (theme) => theme.palette.primary.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "none",
              }}
            >
              <IconToolsKitchen2 size={32} color="white" />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  lineHeight: 1.2,
                }}
              >
                Restaurant POS
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.75rem",
                }}
              >
                Management System
              </Typography>
            </Box>
          </motion.div>
        </LogoSection>

        {/* Navigation Items */}
        <Box sx={{ flex: 1, overflowY: "auto", py: 2 }}>
          <SidebarItems />
        </Box>

        <Box sx={{ mt: "auto", pb: 6 }}>
          <SubscriptionWidget compact={false} />
        </Box>

        {/* Footer Section */}
        <FooterSection>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.7rem",
              textAlign: "center",
              display: "block",
            }}
          >
            © 2024 Restaurant Management System
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "primary.main",
              fontSize: "0.7rem",
              textAlign: "center",
              display: "block",
              mt: 0.5,
              fontWeight: 500,
            }}
          >
            v2.1.0
          </Typography>
        </FooterSection>
      </Box>
    </Drawer>
  );
};
export default MSidebar;
