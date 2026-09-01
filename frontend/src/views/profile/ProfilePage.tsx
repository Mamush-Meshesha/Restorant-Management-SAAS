import { useState } from "react";
import {
  Box, Card, CardContent, Typography, Avatar, Grid, TextField,
  Button, Stack, Chip, Divider, Alert, CircularProgress, alpha,
  InputAdornment, IconButton, Tab, Tabs, Paper, Tooltip, Fade
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  IconUser, IconMail, IconLock, IconEye, IconEyeOff,
  IconCamera, IconShield, IconBuildingStore, IconClock,
  IconCheck, IconBrightness2, IconMapPin, IconPhone
} from "@tabler/icons-react";
import { useAppSelector, useAppDispatch } from "@/hooks/auth";
import { updateUser, toggle2fa } from "@/api/_users";
import { loginFinished } from "@/redux/slices/authSlice";
import { toast } from "react-toastify";
import ProfileImg from "@/assets/images/profile/user-1.jpg";
import PageContainer from "@/components/container/PageContainer";

const ProfilePage = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { currentUser, token, refreshToken, loginExpiry } = useAppSelector((s) => s.auth);

  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [is2faEnabled, setIs2faEnabled] = useState((currentUser as any)?.is_2fa_enabled || false);
  const [toggling2fa, setToggling2fa] = useState(false);

  const [profileForm, setProfileForm] = useState({
    first_name: currentUser?.first_name ?? "",
    last_name: currentUser?.last_name ?? "",
    email: currentUser?.email ?? "",
    username: currentUser?.username ?? "",
    phone: "",
    address: ""
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

  const handleToggle2FA = async () => {
    try {
      setToggling2fa(true);
      const { data } = await toggle2fa();
      setIs2faEnabled(data.is_2fa_enabled);
      toast.success(data.message);
      dispatch(loginFinished({
        token: token!,
        refreshToken: refreshToken!,
        loginExpiry: loginExpiry!,
        message: "updated",
        user: {
          ...currentUser!,
          is_2fa_enabled: data.is_2fa_enabled,
        } as any,
      }));
    } catch(err: any) {
      toast.error(err?.response?.data?.message || "Failed to toggle 2FA");
    } finally {
      setToggling2fa(false);
    }
  };

  const fullName = `${currentUser?.first_name ?? ""} ${currentUser?.last_name ?? ""}`.trim() || currentUser?.username || "Enterprise User";
  const initials = (currentUser?.first_name?.[0] ?? "") + (currentUser?.last_name?.[0] ?? "");

  const statCards = [
    { label: "Current Role", value: currentUser?.role?.name ?? "—", icon: IconShield, color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.1) },
    { label: "Organization", value: currentUser?.organization?.name ?? "—", icon: IconBuildingStore, color: theme.palette.info.main, bg: alpha(theme.palette.info.main, 0.1) },
    { label: "Assigned Branch", value: currentUser?.branch?.name ?? "Main Branch", icon: IconBrightness2, color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1) },
    { label: "Last Active", value: currentUser?.last_login ? new Date(currentUser.last_login).toLocaleDateString() : "Just now", icon: IconClock, color: theme.palette.secondary.main, bg: alpha(theme.palette.secondary.main, 0.1) },
  ];

  return (
    <PageContainer title="My Profile" description="Manage your account settings">
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        
        {/* Header Hero */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} mb={0.5}>My Profile</Typography>
          <Typography color="text.secondary">Manage your personal information and security settings.</Typography>
        </Box>

        {/* Hero Banner */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            mb: 4,
            border: `1px solid ${theme.palette.divider}`,
            position: "relative",
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 60%, ${alpha(theme.palette.secondary.main, 0.9)} 100%)`,
          }}
        >
          <Box sx={{ height: 160 }} />
          <Box
            sx={{
              px: { xs: 3, md: 5 },
              pb: 4,
              display: "flex",
              alignItems: "flex-end",
              gap: 4,
              mt: -8,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={ProfileImg}
                sx={{
                  width: 130,
                  height: 130,
                  border: `4px solid ${theme.palette.background.paper}`,
                  boxShadow: theme.shadows[8],
                  fontSize: "3rem",
                  fontWeight: 800,
                  bgcolor: theme.palette.secondary.main,
                }}
              >
                {initials || "U"}
              </Avatar>
              <Tooltip title="Upload new photo">
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    bottom: 6,
                    right: 6,
                    bgcolor: theme.palette.primary.main,
                    color: "#fff",
                    boxShadow: theme.shadows[3],
                    width: 34,
                    height: 34,
                    "&:hover": { bgcolor: theme.palette.primary.dark },
                  }}
                >
                  <IconCamera size={18} />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box sx={{ color: theme.palette.background.paper, mb: 1, flex: 1 }}>
              <Typography variant="h3" fontWeight={800} sx={{ color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                {fullName}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, color: "white", display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <IconMail size={18} /> {currentUser?.email}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Chip
                label={currentUser?.is_active ? "Account Active" : "Inactive"}
                icon={<IconCheck size={16} />}
                sx={{ 
                  fontWeight: 700, 
                  px: 1, 
                  py: 2.5,
                  borderRadius: 2,
                  bgcolor: currentUser?.is_active ? alpha(theme.palette.success.main, 0.9) : alpha(theme.palette.error.main, 0.9),
                  color: "#fff",
                  backdropFilter: "blur(4px)",
                  border: 'none',
                  "& .MuiChip-icon": { color: "#fff" }
                }}
              />
            </Box>
          </Box>
        </Paper>

        {/* Two Column Layout */}
        <Grid container spacing={4}>
          
          {/* Left Column: Stats & Info */}
          <Grid size={{ xs: 12, lg: 4 }} >
            <Stack spacing={4}>
              
              <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2], border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={3}>Account Details</Typography>
                  <Stack spacing={3}>
                    {statCards.map((stat, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: stat.bg, color: stat.color, width: 48, height: 48, borderRadius: 2 }}>
                          <stat.icon size={24} />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                            {stat.label}
                          </Typography>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {stat.value}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 3, boxShadow: "none", border: `1px dashed ${theme.palette.divider}`, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: 56, height: 56, mx: "auto", mb: 2 }}>
                    <IconShield size={28} />
                  </Avatar>
                  <Typography variant="h6" fontWeight={700} mb={1}>Security Status</Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Your account is protected with industry-standard encryption. Enable two-factor authentication for extra security.
                  </Typography>
                  <Button 
                    variant={is2faEnabled ? "contained" : "outlined"} 
                    color={is2faEnabled ? "success" : "primary"} 
                    fullWidth 
                    sx={{ borderRadius: 2, py: 1 }}
                    onClick={handleToggle2FA}
                    disabled={toggling2fa}
                  >
                    {toggling2fa ? "Processing..." : is2faEnabled ? "2FA is Enabled" : "Enable 2FA"}
                  </Button>
                </CardContent>
              </Card>

            </Stack>
          </Grid>

          {/* Right Column: Edit Forms */}
          <Grid size={{ xs: 12, lg: 8 }} >
            <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2], border: `1px solid ${theme.palette.divider}` }}>
              
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="fullWidth"
                sx={{
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  "& .MuiTab-root": { 
                    fontWeight: 600, 
                    minHeight: 64, 
                    textTransform: "none", 
                    fontSize: 15,
                    transition: "all 0.2s"
                  },
                }}
              >
                <Tab icon={<IconUser size={20} />} iconPosition="start" label="Personal Information" />
                <Tab icon={<IconLock size={20} />} iconPosition="start" label="Security & Password" />
              </Tabs>

              <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                
                {/* Tab 0: Personal Info */}
                {tab === 0 && (
                  <Fade in={true}>
                    <Box>
                      <Box mb={4}>
                        <Typography variant="h5" fontWeight={700} mb={1}>Edit Profile</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Update your personal information. Changes will reflect across the entire organization.
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }} >
                          <Typography variant="subtitle2" fontWeight={600} mb={1}>First Name</Typography>
                          <TextField
                            fullWidth
                            placeholder="John"
                            value={profileForm.first_name}
                            onChange={(e) => setProfileForm((p) => ({ ...p, first_name: e.target.value }))}
                            InputProps={{ startAdornment: <InputAdornment position="start"><IconUser size={18} /></InputAdornment> }}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }} >
                          <Typography variant="subtitle2" fontWeight={600} mb={1}>Last Name</Typography>
                          <TextField
                            fullWidth
                            placeholder="Doe"
                            value={profileForm.last_name}
                            onChange={(e) => setProfileForm((p) => ({ ...p, last_name: e.target.value }))}
                            InputProps={{ startAdornment: <InputAdornment position="start"><IconUser size={18} /></InputAdornment> }}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }} >
                          <Typography variant="subtitle2" fontWeight={600} mb={1}>Email Address</Typography>
                          <TextField
                            fullWidth
                            type="email"
                            placeholder="john@example.com"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                            InputProps={{ startAdornment: <InputAdornment position="start"><IconMail size={18} /></InputAdornment> }}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }} >
                          <Typography variant="subtitle2" fontWeight={600} mb={1}>Username</Typography>
                          <TextField
                            fullWidth
                            placeholder="johndoe"
                            value={profileForm.username}
                            onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
                            InputProps={{ startAdornment: <InputAdornment position="start"><IconUser size={18} /></InputAdornment> }}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }} >
                          <Typography variant="subtitle2" fontWeight={600} mb={1}>Phone Number (Optional)</Typography>
                          <TextField
                            fullWidth
                            placeholder="+1 234 567 890"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                            InputProps={{ startAdornment: <InputAdornment position="start"><IconPhone size={18} /></InputAdornment> }}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }} >
                          <Typography variant="subtitle2" fontWeight={600} mb={1}>Location (Optional)</Typography>
                          <TextField
                            fullWidth
                            placeholder="New York, USA"
                            value={profileForm.address}
                            onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))}
                            InputProps={{ startAdornment: <InputAdornment position="start"><IconMapPin size={18} /></InputAdornment> }}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                          />
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 4 }} />

                      <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          size="large"
                          sx={{ borderRadius: 2, px: 4 }}
                          onClick={() =>
                            setProfileForm({
                              first_name: currentUser?.first_name ?? "",
                              last_name: currentUser?.last_name ?? "",
                              email: currentUser?.email ?? "",
                              username: currentUser?.username ?? "",
                              phone: "",
                              address: ""
                            })
                          }
                          disabled={saving}
                        >
                          Reset
                        </Button>
                        <Button
                          variant="contained"
                          size="large"
                          sx={{ borderRadius: 2, px: 4, boxShadow: theme.shadows[4] }}
                          onClick={handleProfileSave}
                          disabled={saving}
                          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <IconCheck size={20} />}
                        >
                          {saving ? "Saving…" : "Save Changes"}
                        </Button>
                      </Stack>
                    </Box>
                  </Fade>
                )}

                {/* Tab 1: Security */}
                {tab === 1 && (
                  <Fade in={true}>
                    <Box>
                      <Box mb={4}>
                        <Typography variant="h5" fontWeight={700} mb={1}>Change Password</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ensure your account is using a long, random password to stay secure.
                        </Typography>
                      </Box>

                      {passwordError && (
                        <Alert severity="error" sx={{ mb: 4, borderRadius: 2, alignItems: 'center' }}>{passwordError}</Alert>
                      )}

                      <Stack spacing={4} sx={{ maxWidth: 500 }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} mb={1}>Current Password</Typography>
                          <TextField
                            fullWidth
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your current password"
                            value={passwordForm.current_password}
                            onChange={(e) => setPasswordForm((p) => ({ ...p, current_password: e.target.value }))}
                            InputProps={{
                              startAdornment: <InputAdornment position="start"><IconLock size={18} /></InputAdornment>,
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                          />
                        </Box>
                        
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} mb={1}>New Password</Typography>
                          <TextField
                            fullWidth
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Create a new password"
                            value={passwordForm.new_password}
                            onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))}
                            InputProps={{
                              startAdornment: <InputAdornment position="start"><IconLock size={18} /></InputAdornment>,
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton size="small" onClick={() => setShowNewPassword(!showNewPassword)}>
                                    {showNewPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                            helperText="Must be at least 6 characters long."
                          />
                        </Box>
                        
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} mb={1}>Confirm New Password</Typography>
                          <TextField
                            fullWidth
                            type="password"
                            placeholder="Confirm your new password"
                            value={passwordForm.confirm_password}
                            onChange={(e) => setPasswordForm((p) => ({ ...p, confirm_password: e.target.value }))}
                            InputProps={{
                              startAdornment: <InputAdornment position="start"><IconLock size={18} /></InputAdornment>,
                            }}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                            error={!!passwordError && passwordForm.confirm_password !== passwordForm.new_password}
                          />
                        </Box>
                      </Stack>

                      <Divider sx={{ my: 4 }} />

                      <Stack direction="row" spacing={2} justifyContent="flex-start">
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          sx={{ borderRadius: 2, px: 4, boxShadow: theme.shadows[4] }}
                          onClick={handlePasswordSave}
                          disabled={saving || !passwordForm.new_password}
                          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <IconLock size={20} />}
                        >
                          {saving ? "Updating…" : "Update Password"}
                        </Button>
                        <Button
                          variant="outlined"
                          size="large"
                          sx={{ borderRadius: 2, px: 4 }}
                          onClick={() => { setPasswordForm({ current_password: "", new_password: "", confirm_password: "" }); setPasswordError(""); }}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </Box>
                  </Fade>
                )}
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      </Box>
    </PageContainer>
  );
};

export default ProfilePage;
