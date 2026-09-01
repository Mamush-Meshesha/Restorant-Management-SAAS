import { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Typography, Stack, Button, useTheme, alpha,
  Grid, Switch, TextField, InputAdornment, Divider, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from "@mui/material";
import {
  IconTrophy, IconStar, IconSettings, IconHistory, IconGift,
  IconCoins, IconCheck, IconTrash
} from "@tabler/icons-react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import PageContainer from "@/components/container/PageContainer";
import { toast } from "react-toastify";
import { getLoyaltyData, updateLoyaltySettings, createTier, deleteTier } from "@/api/_loyalty";

export default function LoyaltyPage() {
  const theme = useTheme();
  
  // States
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    pointsPerDollar: 1,
    minRedemption: 100,
    discountPerPoint: 0
  });
  
  const [tiers, setTiers] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  // Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTier, setNewTier] = useState({ name: "", min_points: 0, discount_rate: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getLoyaltyData();
      const { program, tiers, recentTransactions } = res.data.data;
      if (program) {
        setIsActive(program.is_active);
        setSettings({
          pointsPerDollar: program.points_per_currency,
          minRedemption: program.min_redemption,
          discountPerPoint: 0 // Placeholder, wait, do we have discount_value? Not in schema.
        });
      }
      setTiers(tiers || []);
      setRecentTransactions(recentTransactions || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load loyalty settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await updateLoyaltySettings({
        points_per_currency: settings.pointsPerDollar,
        min_redemption: settings.minRedemption,
        is_active: isActive
      });
      toast.success("Loyalty program settings updated successfully.");
    } catch (err) {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddTier = async () => {
    try {
      await createTier(newTier);
      toast.success("Tier added successfully.");
      setAddModalOpen(false);
      setNewTier({ name: "", min_points: 0, discount_rate: 0 });
      fetchData();
    } catch (err) {
      toast.error("Failed to add tier.");
    }
  };

  const handleDeleteTier = async (id: string) => {
    if (!window.confirm("Delete this tier?")) return;
    try {
      await deleteTier(id);
      toast.success("Tier deleted.");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete tier.");
    }
  };

  const columns: GridColDef[] = [
    { field: "customer", headerName: "Customer", flex: 1 },
    {
      field: "type",
      headerName: "Action",
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value === "EARN" ? "Earned" : "Redeemed"} 
          size="small"
          sx={{ 
            fontWeight: 700, 
            bgcolor: params.value === "EARN" ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.info.main, 0.1),
            color: params.value === "EARN" ? theme.palette.success.main : theme.palette.info.main
          }}
        />
      )
    },
    {
      field: "points",
      headerName: "Points",
      width: 130,
      renderCell: (params) => (
        <Typography fontWeight={700} color={params.value > 0 ? "success.main" : "text.primary"}>
          {params.value > 0 ? `+${params.value}` : params.value} pts
        </Typography>
      )
    },
    { field: "order_id", headerName: "Reference", width: 130 },
    { field: "date", headerName: "Date", width: 160, valueFormatter: (v: any) => new Date(v).toLocaleString() }
  ];

  if (loading) return null;

  return (
    <PageContainer title="Loyalty & Rewards" description="Manage your customer loyalty program">
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        
        {/* Header Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight={800} mb={0.5} display="flex" alignItems="center" gap={1.5}>
              <IconTrophy size={32} color={theme.palette.warning.main} /> 
              Loyalty & Rewards Program
            </Typography>
            <Typography color="text.secondary">Configure how customers earn and redeem points.</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2} bgcolor={theme.palette.background.paper} p={1} pr={2} borderRadius={3} border={`1px solid ${theme.palette.divider}`}>
            <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} color="success" />
            <Typography fontWeight={600} color={isActive ? "success.main" : "text.secondary"}>
              {isActive ? "Program Active" : "Program Disabled"}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={4}>
          
          {/* Settings Column */}
          <Grid size={{ xs: 12, lg: 4 }} >
            <Stack spacing={4}>
              
              {/* Core Settings */}
              <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2], border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={3} display="flex" alignItems="center" gap={1}>
                    <IconSettings size={20} /> Program Rules
                  </Typography>
                  
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} mb={1}>Points Earned</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={settings.pointsPerDollar}
                        onChange={(e) => setSettings(s => ({ ...s, pointsPerDollar: Number(e.target.value) }))}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">pts per $1 spent</InputAdornment>,
                          startAdornment: <InputAdornment position="start"><IconStar size={16} /></InputAdornment>
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} mb={1}>Minimum Redemption</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={settings.minRedemption}
                        onChange={(e) => setSettings(s => ({ ...s, minRedemption: Number(e.target.value) }))}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">pts minimum</InputAdornment>,
                          startAdornment: <InputAdornment position="start"><IconCoins size={16} /></InputAdornment>
                        }}
                      />
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 3 }} />
                  
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleSaveSettings}
                    disabled={saving}
                    startIcon={saving ? undefined : <IconCheck size={18} />}
                  >
                    {saving ? "Saving..." : "Save Settings"}
                  </Button>
                </CardContent>
              </Card>

              {/* Tiers Card */}
              <Card sx={{ borderRadius: 3, boxShadow: "none", border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={3} display="flex" alignItems="center" gap={1}>
                    <IconGift size={20} /> Customer Tiers
                  </Typography>
                  <Stack spacing={2}>
                    {tiers.length === 0 && <Typography variant="body2" color="text.secondary">No tiers defined.</Typography>}
                    {tiers.map((tier, i) => {
                      const color = i === 0 ? "#B0BEC5" : (i === 1 ? theme.palette.warning.main : theme.palette.info.main);
                      return (
                        <Box key={tier.id} p={2} borderRadius={2} bgcolor={alpha(color, 0.05)} border={`1px solid ${alpha(color, 0.2)}`}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                            <Typography variant="subtitle1" fontWeight={700} color={color}>{tier.name}</Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="caption" fontWeight={600}>{tier.min_points} pts</Typography>
                              <IconButton size="small" onClick={() => handleDeleteTier(tier.id)} sx={{ color: 'error.main' }}>
                                <IconTrash size={16} />
                              </IconButton>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary">Discount Rate: {tier.discount_rate}%</Typography>
                        </Box>
                      )
                    })}
                  </Stack>
                  <Button variant="outlined" fullWidth sx={{ mt: 3, borderStyle: 'dashed' }} onClick={() => setAddModalOpen(true)}>
                    + Add New Tier
                  </Button>
                </CardContent>
              </Card>

            </Stack>
          </Grid>

          {/* Transactions Column */}
          <Grid size={{ xs: 12, lg: 8 }} >
            <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2], border: `1px solid ${theme.palette.divider}`, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box p={3} borderBottom={`1px solid ${theme.palette.divider}`} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={700} display="flex" alignItems="center" gap={1}>
                  <IconHistory size={20} /> Recent Loyalty Activity
                </Typography>
                <Button variant="text" size="small">View All</Button>
              </Box>
              
              <Box sx={{ flex: 1, minHeight: 400 }}>
                <DataGrid
                  rows={recentTransactions}
                  columns={columns}
                  hideFooter
                  disableRowSelectionOnClick
                  rowHeight={60}
                  sx={{
                    border: 0,
                    "& .MuiDataGrid-columnHeaders": { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                    "& .MuiDataGrid-cell:focus": { outline: "none" }
                  }}
                  localeText={{ noRowsLabel: "No loyalty activity yet" }}
                />
              </Box>
            </Card>
          </Grid>

        </Grid>
      </Box>

      {/* Add Tier Modal */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Add Customer Tier</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} py={1}>
            <TextField
              label="Tier Name (e.g. Diamond)"
              fullWidth
              value={newTier.name}
              onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
            />
            <TextField
              label="Minimum Points to Qualify"
              type="number"
              fullWidth
              value={newTier.min_points}
              onChange={(e) => setNewTier({ ...newTier, min_points: Number(e.target.value) })}
            />
            <TextField
              label="Discount Rate (%)"
              type="number"
              fullWidth
              value={newTier.discount_rate}
              onChange={(e) => setNewTier({ ...newTier, discount_rate: Number(e.target.value) })}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setAddModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddTier} disabled={!newTier.name}>Add Tier</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
