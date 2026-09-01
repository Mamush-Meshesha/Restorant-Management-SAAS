import { useState, useEffect } from "react";
import {
  Box, Card, CardContent, CardHeader, Typography, Stack, Button, useTheme,
  TextField, Grid, Divider
} from "@mui/material";
import { IconDeviceFloppy, IconBuildingStore } from "@tabler/icons-react";
import PageContainer from "@/components/container/PageContainer";
import { toast } from "react-toastify";
import ImageUpload from "@/components/widgets/ImageUpload";
import { useAppDispatch } from "@/hooks/auth";
import { updateUserOrganization } from "@/redux/slices/authSlice";

import { getOrganizationProfile, updateOrganizationProfile, type UpdateOrganizationData } from "@/api/_organization";

export default function SettingsPage() {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  // Data

  const [form, setForm] = useState<UpdateOrganizationData>({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    tax_id: "",
    logo: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getOrganizationProfile();

      setForm({
        name: res.data.data.name || "",
        address: res.data.data.address || "",
        phone: res.data.data.phone || "",
        email: res.data.data.email || "",
        website: res.data.data.website || "",
        tax_id: res.data.data.tax_id || "",
        logo: res.data.data.logo || "",
      });
    } catch (error) {
      toast.error("Failed to load organization profile");
    }
  };

  const handleSave = async () => {
    try {
      if (!form.name) return toast.error("Organization Name is required");
      
      setLoading(true);
      await updateOrganizationProfile(form);
      toast.success("Settings saved successfully");
      dispatch(updateUserOrganization(form));
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="System Settings" description="Configure organization details">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">System Settings</Typography>
          <Typography variant="body2" color="textSecondary">Manage your restaurant organization profile.</Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<IconDeviceFloppy size={20} />}
          onClick={handleSave}
          disabled={loading}
          sx={{ borderRadius: "8px", px: 4 }}
        >
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </Stack>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <CardHeader 
              title="Company Profile" 
              subheader="These details appear on receipts and invoices."
              avatar={<IconBuildingStore size={28} color={theme.palette.primary.main} />}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField 
                    label="Organization Name" 
                    fullWidth 
                    required
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Organization Logo</Typography>
                  <ImageUpload
                    value={form.logo || ""}
                    onChange={url => setForm({ ...form, logo: url })}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    label="Email Address" 
                    type="email"
                    fullWidth 
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})} 
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    label="Phone Number" 
                    fullWidth 
                    value={form.phone} 
                    onChange={e => setForm({...form, phone: e.target.value})} 
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField 
                    label="Headquarters Address" 
                    fullWidth 
                    multiline
                    rows={3}
                    value={form.address} 
                    onChange={e => setForm({...form, address: e.target.value})} 
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    label="Website" 
                    fullWidth 
                    placeholder="https://"
                    value={form.website} 
                    onChange={e => setForm({...form, website: e.target.value})} 
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    label="Tax ID / VAT Number" 
                    fullWidth 
                    value={form.tax_id} 
                    onChange={e => setForm({...form, tax_id: e.target.value})} 
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
}
