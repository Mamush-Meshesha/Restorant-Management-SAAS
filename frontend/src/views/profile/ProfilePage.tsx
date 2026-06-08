import { useState } from "react";
import {
  Box, Card, CardContent, Typography, Avatar, Grid, TextField,
  Button, Stack, Chip, Divider, Alert, CircularProgress, alpha,
  InputAdornment, IconButton, Tab, Tabs, Paper, Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  IconUser, IconMail, IconLock, IconEye, IconEyeOff,
  IconCamera, IconShield, IconBuildingStore, IconClock,
  IconCheck, IconBrightness2,
} from "@tabler/icons-react";
import { useAppSelector, useAppDispatch } from "@/hooks/auth";
import { updateUser } from "@/api/_users";
import { loginFinished } from "@/redux/slices/authSlice";
import { toast } from "react-toastify";
import ProfileImg from "@/assets/images/profile/user-1.jpg";

const ProfilePage = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { currentUser, token, refreshToken, loginExpiry } = useAppSelector((s) => s.auth);

  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profileForm, setProfileForm] = useState({
    first_name: currentUser?.first_name ?? "",
    last_name: currentUser?.last_name ?? "",
    email: currentUser?.email ?? "",
    username: currentUser?.username ?? "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [passwordError, setPasswordError] = useState("");

  const handleProfileSave = async () => {
    if (!currentUser?.id) return;
    setSaving(true);
    try {
      await updateUser(currentUser.id, {
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        email: profileForm.email,
        username: profileForm.username,
      });
      dispatch(loginFinished({
        token: token!,
        refreshToken: refreshToken!,
        loginExpiry: loginExpiry!,
        message: "updated",
        user: {
          ...currentUser!,
          ...profileForm,
        },
      }));
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (passwordForm.new_password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (!currentUser?.id) return;
    setPasswordError("");
    setSaving(true);
    try {
      await updateUser(currentUser.id, { password: passwordForm.new_password });
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
      toast.success("Password changed successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const fullName = `${currentUser?.first_name ?? ""} ${currentUser?.last_name ?? ""}`.trim() || currentUser?.username || "User";
  const initials = (currentUser?.first_name?.[0] ?? "") + (currentUser?.last_name?.[0] ?? "");

  const statCards = [
    { label: "Role", value: currentUser?.role?.name ?? "—", icon: IconShield, color: theme.palette.primary.main },
    { label: "Organization", value: currentUser?.organization?.name ?? "—", icon: IconBuildingStore, color: theme.palette.info.main },
    { label: "Branch", value: currentUser?.branch?.name ?? "Main Branch", icon: IconBrightness2, color: theme.palette.success.main },
    { label: "Last Login", value: currentUser?.last_login ? new Date(currentUser.last_login).toLocaleDateString() : "Active now", icon: IconClock, color: theme.palette.secondary.main },
  ];

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", py: 2 }}>
      {/* Hero Banner */}
      <Paper
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          mb: 3,
          position: "relative",
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
        }}
      >
        <Box sx={{ height: 140 }} />
        <Box
          sx={{
            px: 4,
            pb: 3,
            display: "flex",
            alignItems: "flex-end",
            gap: 3,
            mt: -7,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={ProfileImg}
              sx={{
                width: 100,
                height: 100,
                border: `4px solid ${theme.palette.background.paper}`,
                boxShadow: theme.shadows[4],
                fontSize: "2rem",
                fontWeight: 700,
                bgcolor: theme.palette.secondary.main,
              }}
            >
              {initials || "U"}
            </Avatar>
            <Tooltip title="Change photo (coming soon)">
              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  bottom: 4,
                  right: 4,
                  bgcolor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  width: 28,
                  height: 28,
                  "&:hover": { bgcolor: theme.palette.grey[100] },
                }}
              >
                <IconCamera size={14} />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ color: theme.palette.background.paper, mb: 1 }}>
            <Typography variant="h4" fontWeight={700} sx={{ color: "white", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
              {fullName}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, color: "white" }}>
              {currentUser?.email}
            </Typography>
          </Box>
          <Box sx={{ ml: "auto", mb: 1 }}>
            <Chip
              label={currentUser?.is_active ? "Active" : "Inactive"}
              icon={<IconCheck size={14} />}
              color={currentUser?.is_active ? "success" : "error"}
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Stats Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((stat) => (
          <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
            <Card variant="outlined" sx={{ borderRadius: 2, transition: "box-shadow 0.2s", "&:hover": { boxShadow: theme.shadows[3] } }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      bgcolor: alpha(stat.color, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: stat.color,
                      flexShrink: 0,
                    }}
                  >
                    <stat.icon size={18} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={600} noWrap>
                      {stat.value}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Card sx={{ borderRadius: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            px: 2,
            "& .MuiTab-root": { fontWeight: 600, minHeight: 52, textTransform: "none" },
          }}
        >
          <Tab icon={<IconUser size={16} />} iconPosition="start" label="Personal Info" />
          <Tab icon={<IconLock size={16} />} iconPosition="start" label="Change Password" />
        </Tabs>

        <CardContent sx={{ p: 4 }}>
          {/* Personal Info Tab */}
          {tab === 0 && (
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Personal Information</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Update your name, email and username.
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, first_name: e.target.value }))}
                    InputProps={{ startAdornment: <InputAdornment position="start"><IconUser size={16} /></InputAdornment> }}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, last_name: e.target.value }))}
                    InputProps={{ startAdornment: <InputAdornment position="start"><IconUser size={16} /></InputAdornment> }}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                    InputProps={{ startAdornment: <InputAdornment position="start"><IconMail size={16} /></InputAdornment> }}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
                    InputProps={{ startAdornment: <InputAdornment position="start"><IconUser size={16} /></InputAdornment> }}
                    size="small"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() =>
                    setProfileForm({
                      first_name: currentUser?.first_name ?? "",
                      last_name: currentUser?.last_name ?? "",
                      email: currentUser?.email ?? "",
                      username: currentUser?.username ?? "",
                    })
                  }
                  disabled={saving}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  onClick={handleProfileSave}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <IconCheck size={16} />}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </Stack>
            </Box>
          )}

          {/* Change Password Tab */}
          {tab === 1 && (
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Change Password</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Ensure your account is using a long, random password to stay secure.
              </Typography>

              {passwordError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{passwordError}</Alert>
              )}

              <Stack spacing={3} sx={{ maxWidth: 480 }}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, current_password: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><IconLock size={16} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="New Password"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><IconLock size={16} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowNewPassword(!showNewPassword)}>
                          {showNewPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                  helperText="Minimum 6 characters"
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirm_password: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><IconLock size={16} /></InputAdornment>,
                  }}
                  size="small"
                  error={!!passwordError}
                />
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => { setPasswordForm({ current_password: "", new_password: "", confirm_password: "" }); setPasswordError(""); }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePasswordSave}
                  disabled={saving || !passwordForm.new_password}
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <IconLock size={16} />}
                >
                  {saving ? "Updating…" : "Update Password"}
                </Button>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
