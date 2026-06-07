import { useState } from "react";
import {
  Box, Card, CardContent, Typography, Stack, Divider,
  Switch, FormControlLabel, Button, Grid, Paper, Chip, alpha,
  ToggleButtonGroup, ToggleButton, Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  IconMoon, IconSun, IconPalette, IconBell,
  IconDeviceDesktop, IconCheck, IconLayout,
} from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "@/hooks/auth";
import {
  toggleThemeMode, setPrimaryColor, setFontSize, setSidebarCompact,
} from "@/redux/slices/themeSlice";
import { toast } from "react-toastify";

const COLOR_OPTIONS = [
  { key: "espresso", label: "Espresso", main: "#2B2118", accent: "#D4A017" },
  { key: "blue", label: "Ocean", main: "#1E3A5F", accent: "#3B82F6" },
  { key: "purple", label: "Violet", main: "#3B1F5E", accent: "#8B5CF6" },
  { key: "green", label: "Forest", main: "#14532D", accent: "#10B981" },
];

const AppSettingsPage = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const themeState = useAppSelector((s) => s.theme);

  const mode = themeState?.mode ?? "light";
  const fontSize = themeState?.fontSize ?? "medium";
  const sidebarCompact = themeState?.sidebarCompact ?? false;
  const primaryColor = themeState?.primaryColor ?? "espresso";

  const [notifs, setNotifs] = useState({
    orders: true,
    kitchen: true,
    inventory: false,
    email: false,
    browser: true,
  });

  const SectionCard = ({ title, description, icon: Icon, children }: any) => (
    <Card
      sx={{
        borderRadius: 3,
        mb: 3,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "none",
        "&:hover": { boxShadow: theme.shadows[2] },
        transition: "box-shadow 0.2s",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.palette.primary.main,
            }}
          >
            <Icon size={20} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>{title}</Typography>
            <Typography variant="body2" color="text.secondary">{description}</Typography>
          </Box>
        </Stack>
        <Divider sx={{ mb: 2.5 }} />
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ maxWidth: 760, mx: "auto", py: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>App Settings</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Customize your experience — theme, notifications, and layout preferences.
        </Typography>
      </Box>

      {/* ── APPEARANCE ─────────────────────────────────────── */}
      <SectionCard title="Appearance" description="Adjust the visual style of the app." icon={IconPalette}>
        {/* Dark Mode Toggle */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Color Mode</Typography>
          <Grid container spacing={2}>
            {[
              { label: "Light Mode", value: "light", icon: IconSun, desc: "Clean & bright" },
              { label: "Dark Mode", value: "dark", icon: IconMoon, desc: "Easy on the eyes" },
            ].map((opt) => (
              <Grid size={6} key={opt.value}>
                <Paper
                  onClick={() => dispatch(toggleThemeMode())}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    cursor: "pointer",
                    border: `2px solid ${mode === opt.value ? theme.palette.primary.main : theme.palette.divider}`,
                    bgcolor: mode === opt.value ? alpha(theme.palette.primary.main, 0.06) : "transparent",
                    transition: "all 0.2s",
                    "&:hover": { borderColor: theme.palette.primary.main },
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <opt.icon size={22} color={mode === opt.value ? theme.palette.primary.main : theme.palette.text.secondary} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>{opt.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{opt.desc}</Typography>
                  </Box>
                  {mode === opt.value && (
                    <Chip label="Active" size="small" color="primary" sx={{ ml: "auto", height: 20, fontSize: "0.7rem" }} />
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Color Palette */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Color Theme</Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            {COLOR_OPTIONS.map((c) => (
              <Tooltip key={c.key} title={c.label}>
                <Box
                  onClick={() => dispatch(setPrimaryColor(c.key as any))}
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    cursor: "pointer",
                    position: "relative",
                    background: `linear-gradient(135deg, ${c.main} 50%, ${c.accent} 100%)`,
                    border: `3px solid ${primaryColor === c.key ? theme.palette.primary.main : "transparent"}`,
                    outline: `2px solid ${primaryColor === c.key ? alpha(theme.palette.primary.main, 0.3) : "transparent"}`,
                    transition: "all 0.2s",
                    "&:hover": { transform: "scale(1.1)" },
                  }}
                >
                  {primaryColor === c.key && (
                    <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <IconCheck size={18} color="white" />
                    </Box>
                  )}
                </Box>
              </Tooltip>
            ))}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            Note: Color theme fully applies after next login refresh.
          </Typography>
        </Box>

        {/* Font Size */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Font Size</Typography>
          <ToggleButtonGroup
            value={fontSize}
            exclusive
            onChange={(_, val) => val && dispatch(setFontSize(val))}
            size="small"
          >
            <ToggleButton value="small" sx={{ px: 2.5, textTransform: "none", fontWeight: 600 }}>Small</ToggleButton>
            <ToggleButton value="medium" sx={{ px: 2.5, textTransform: "none", fontWeight: 600 }}>Medium</ToggleButton>
            <ToggleButton value="large" sx={{ px: 2.5, textTransform: "none", fontWeight: 600 }}>Large</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </SectionCard>

      {/* ── LAYOUT ─────────────────────────────────────────── */}
      <SectionCard title="Layout" description="Control sidebar and display preferences." icon={IconLayout}>
        <FormControlLabel
          control={
            <Switch
              checked={sidebarCompact}
              onChange={(e) => dispatch(setSidebarCompact(e.target.checked))}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>Compact Sidebar</Typography>
              <Typography variant="caption" color="text.secondary">Show icons only in the sidebar to save space</Typography>
            </Box>
          }
          sx={{ mx: 0, alignItems: "flex-start", gap: 1 }}
        />
      </SectionCard>

      {/* ── NOTIFICATIONS ─────────────────────────────────── */}
      <SectionCard title="Notifications" description="Choose which events trigger notifications." icon={IconBell}>
        <Stack spacing={2}>
          {[
            { key: "orders", label: "New Orders", desc: "Get notified when a new order is placed" },
            { key: "kitchen", label: "Kitchen Alerts", desc: "Alerts when orders are ready or delayed" },
            { key: "inventory", label: "Inventory Warnings", desc: "Low-stock and reorder notifications" },
            { key: "browser", label: "Browser Push Notifications", desc: "Show desktop notifications" },
            { key: "email", label: "Email Digest", desc: "Daily summary sent to your email" },
          ].map((item) => (
            <Box key={item.key}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifs[item.key as keyof typeof notifs]}
                    onChange={(e) => setNotifs((p) => ({ ...p, [item.key]: e.target.checked }))}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Box sx={{ ml: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={600}>{item.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                  </Box>
                }
                sx={{ mx: 0, alignItems: "center" }}
              />
              <Divider sx={{ mt: 1.5 }} />
            </Box>
          ))}
        </Stack>

        <Button
          variant="contained"
          startIcon={<IconCheck size={16} />}
          onClick={() => toast.success("Notification preferences saved!")}
          sx={{ mt: 2 }}
        >
          Save Preferences
        </Button>
      </SectionCard>

      {/* ── SYSTEM INFO ───────────────────────────────────── */}
      <SectionCard title="System" description="Information about this installation." icon={IconDeviceDesktop}>
        <Grid container spacing={2}>
          {[
            { label: "App Version", value: "v1.0.0" },
            { label: "API Base URL", value: "http://localhost:3000/api/v1" },
            { label: "Environment", value: "Development" },
            { label: "Build", value: new Date().toLocaleDateString() },
          ].map((item) => (
            <Grid size={6} key={item.label}>
              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.divider, 0.4) }}>
                <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                <Typography variant="subtitle2" fontWeight={600} sx={{ fontFamily: "monospace" }}>
                  {item.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </SectionCard>
    </Box>
  );
};

export default AppSettingsPage;
