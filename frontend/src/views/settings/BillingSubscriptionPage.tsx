import { useState, useEffect } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Stack, alpha, useTheme,
  Button, LinearProgress, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import {
  IconChartPie, IconDownload, IconReceipt, IconCheck, IconEdit, IconTrash, IconPlus
} from "@tabler/icons-react";
import PageContainer from "../../components/container/PageContainer";
import { getBillingSubscription, getBillingPlans, getBillingInvoices, upgradeSubscription, cancelSubscription, downloadInvoice, createBillingPlan, updateBillingPlan, deleteBillingPlan } from "../../api/_billing";
import { toast } from "react-toastify";
import { TextField, MenuItem } from "@mui/material";
import type { RootState } from "../../redux/store";

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_cycle: string;
  features: string[];
  max_branches: number;
  max_users: number;
  max_storage_mb: number;
}

interface SubscriptionUsage {
  branches_used: number;
  users_used: number;
  storage_used_mb: number;
}

interface Subscription {
  id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  is_auto_renew: boolean;
  plan: SubscriptionPlan;
  usage: SubscriptionUsage;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  created_at: string;
  pdf_url?: string;
}

import { useDispatch, useSelector } from "react-redux";
import { setSubscription as setGlobalSubscription } from "../../redux/slices/authSlice";

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function BillingSubscriptionPage() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const isSuperAdmin = currentUser?.role?.name === "SUPERADMIN";
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const [managePlanDialogOpen, setManagePlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<SubscriptionPlan> | null>(null);

  const [errorStr, setErrorStr] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setErrorStr(null);
    try {
      const [subRes, plansRes, invRes] = await Promise.all([
        getBillingSubscription(),
        getBillingPlans(),
        getBillingInvoices()
      ]);

      setSubscription(subRes.data.data);
      dispatch(setGlobalSubscription(subRes.data.data));
      setPlans(plansRes.data.data);
      setInvoices(invRes.data.data);
    } catch (err: any) {
      console.error(err);
      setErrorStr(err.message || JSON.stringify(err));
      toast.error("Failed to load billing details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    try {
      await upgradeSubscription(selectedPlan.id, selectedPlan.billing_cycle);
      setUpgradeDialogOpen(false);
      toast.success("Subscription upgraded successfully!");
      fetchData();
    } catch (err: any) {
      toast.error("Upgrade failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = async () => {
    if (window.confirm("Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing cycle.")) {
      try {
        await cancelSubscription();
        toast.success("Subscription canceled");
        fetchData();
      } catch (err: any) {
        toast.error("Failed to cancel subscription: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleSavePlan = async () => {
    try {
      if (editingPlan?.id) {
        await updateBillingPlan(editingPlan.id, editingPlan);
        toast.success("Plan updated!");
      } else {
        await createBillingPlan(editingPlan);
        toast.success("Plan created!");
      }
      setManagePlanDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save plan");
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        await deleteBillingPlan(id);
        toast.success("Plan deleted!");
        fetchData();
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to delete plan");
      }
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    if (invoice.pdf_url) {
      window.open(`http://localhost:3000${invoice.pdf_url}`, "_blank");
    } else {
      try {
        const res = await downloadInvoice(invoice.id);
        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${invoice.invoice_number}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        alert("Could not download invoice.");
      }
    }
  };

  if (loading) return <Typography p={4}>Loading billing details...</Typography>;
  if (errorStr) return <Typography p={4} color="error">Error loading details: {errorStr}</Typography>;
  const plan = subscription?.plan || { name: "No Active Plan", description: "You currently do not have an active subscription.", max_branches: 0, max_users: 0, max_storage_mb: 0 };
  const usage = subscription?.usage || { branches_used: 0, users_used: 0, storage_used_mb: 0 };
  const status = subscription?.status || 'NONE';
  const end_date = subscription?.end_date;
  
  const daysRemaining = end_date ? Math.ceil((new Date(end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
  const totalDays = 365;
  const progressPercent = subscription ? Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100)) : 0;

  return (
    <PageContainer title="Billing & Subscription" description="Manage your enterprise subscription">
      <Box mb={4}>
        <Typography variant="h4" fontWeight={800} mb={1}>Billing & Subscription</Typography>
        <Typography color="text.secondary">Manage your plan, billing methods, and usage limits.</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* ─── CURRENT SUBSCRIPTION & COUNTDOWN ─── */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: "100%", bgcolor: alpha(theme.palette.primary.main, 0.02), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4}>
                <Box>
                  <Typography variant="overline" color="primary.main" fontWeight={700} letterSpacing={1}>CURRENT PLAN</Typography>
                  <Typography variant="h3" fontWeight={800} mt={1}>{plan.name}</Typography>
                  <Typography color="text.secondary" mt={1}>{plan.description}</Typography>
                </Box>
                <Chip 
                  label={status} 
                  color={status === 'ACTIVE' ? 'success' : 'error'} 
                  sx={{ fontWeight: 700, borderRadius: 1 }} 
                />
              </Stack>

              <Box sx={{ p: 3, bgcolor: "background.paper", borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={1}>
                  <Box>
                    <Typography variant="h2" fontWeight={800} color="primary.main">{daysRemaining}</Typography>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={600} textTransform="uppercase">Days Remaining</Typography>
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Renews on {end_date ? new Date(end_date).toLocaleDateString() : "Never (Lifetime)"}
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={progressPercent} 
                  sx={{ height: 12, borderRadius: 6, mt: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }} 
                />
              </Box>

              <Stack direction="row" spacing={2} mt={4}>
                <Button variant="contained" size="large" onClick={() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  {subscription ? 'Change Plan' : 'View Plans'}
                </Button>
                {subscription && status !== 'CANCELED' && (
                  <Button variant="outlined" size="large" color="error" onClick={handleCancel}>
                    Cancel Subscription
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ─── USAGE ANALYTICS ─── */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={700} mb={3} display="flex" alignItems="center" gap={1}>
                <IconChartPie size={20} /> Usage Analytics
              </Typography>
              
              <Stack spacing={4}>
                <UsageBar label="Branches" used={usage.branches_used} max={plan.max_branches} />
                <UsageBar label="Users" used={usage.users_used} max={plan.max_users} />
                <UsageBar label="Storage (MB)" used={usage.storage_used_mb} max={plan.max_storage_mb} />
              </Stack>

              <Box mt={4} p={2} bgcolor={alpha(theme.palette.warning.main, 0.1)} borderRadius={2}>
                <Typography variant="caption" color="warning.dark" fontWeight={600}>
                  To increase these limits, you must upgrade to a higher tier plan.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ─── PLAN COMPARISON ─── */}
        <Grid size={12} id="plans-section" mt={4}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight={800}>Available Plans</Typography>
            {isSuperAdmin && (
              <Button variant="contained" startIcon={<IconPlus size={20} />} onClick={() => { setEditingPlan({ billing_cycle: "MONTHLY", max_branches: 1, max_users: 5, max_storage_mb: 1024, features: [] }); setManagePlanDialogOpen(true); }}>
                Create New Plan
              </Button>
            )}
          </Stack>
          <Grid container spacing={3}>
            {plans.map((p) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={(p as any).id}>
                <Card 
                  sx={{ 
                    height: "100%", 
                    border: (p as any).id === (plan as any).id ? `2px solid ${theme.palette.primary.main}` : undefined,
                    position: "relative"
                  }}
                >
                  {(p as any).id === (plan as any).id && (
                    <Box sx={{ position: "absolute", top: 12, right: 12 }}>
                      <Chip label="CURRENT" size="small" color="primary" />
                    </Box>
                  )}
                  <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
                    <Typography variant="h6" fontWeight={800}>{p.name}</Typography>
                    <Typography variant="h4" fontWeight={800} mt={2}>
                      ${p.price} <Typography component="span" variant="body2" color="text.secondary">/ {p.billing_cycle}</Typography>
                    </Typography>

                    {isSuperAdmin && (
                      <Stack direction="row" spacing={1} mt={2}>
                        <IconButton size="small" color="primary" onClick={() => { setEditingPlan(p); setManagePlanDialogOpen(true); }}>
                          <IconEdit size={18} />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeletePlan(p.id)}>
                          <IconTrash size={18} />
                        </IconButton>
                      </Stack>
                    )}
                    
                    <Box mt={3} mb={3} flex={1}>
                      {(p.features as unknown as string[] || []).map((feat, i) => (
                        <Typography key={i} variant="body2" display="flex" alignItems="center" gap={1} mb={1}>
                          <IconCheck size={16} color={theme.palette.success.main} /> {feat}
                        </Typography>
                      ))}
                    </Box>

                    <Button 
                      variant={(p as any).id === (plan as any).id ? "outlined" : "contained"} 
                      fullWidth 
                      disabled={(p as any).id === (plan as any).id}
                      onClick={() => { setSelectedPlan(p); setUpgradeDialogOpen(true); }}
                    >
                      {(p as any).id === (plan as any).id ? "Current Plan" : "Upgrade"}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* ─── BILLING HISTORY ─── */}
        <Grid size={12} mt={4}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box p={3} borderBottom={`1px solid ${theme.palette.divider}`}>
                <Typography variant="h6" fontWeight={700} display="flex" alignItems="center" gap={1}>
                  <IconReceipt size={20} /> Billing History & Invoices
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.grey[100], 0.5) }}>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Download</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{inv.invoice_number}</TableCell>
                        <TableCell>{new Date(inv.created_at).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>${inv.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip label={inv.status} size="small" color={inv.status === 'PAID' ? 'success' : 'default'} />
                        </TableCell>
                        <TableCell align="right">
                        <Tooltip title="Download Invoice PDF">
                            <IconButton size="small" color="primary" onClick={() => handleDownloadInvoice(inv)}>
                              <IconDownload size={18} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onClose={() => setUpgradeDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={800}>Confirm Upgrade</DialogTitle>
        <DialogContent>
          <Typography>
            You are about to switch to the <strong>{selectedPlan?.name}</strong> plan for <strong>${selectedPlan?.price} / {selectedPlan?.billing_cycle}</strong>.
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={2}>
            Your payment method on file will be charged immediately.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setUpgradeDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleUpgrade} variant="contained" color="primary">Confirm Upgrade</Button>
        </DialogActions>
      </Dialog>

      {/* Manage Plan Dialog for Superadmin */}
      <Dialog open={managePlanDialogOpen} onClose={() => setManagePlanDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={800}>{editingPlan?.id ? "Edit Plan" : "Create Plan"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} mt={1}>
            <TextField label="Name" fullWidth value={editingPlan?.name || ""} onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })} />
            <TextField label="Description" fullWidth value={editingPlan?.description || ""} onChange={e => setEditingPlan({ ...editingPlan, description: e.target.value })} />
            <Stack direction="row" spacing={2}>
              <TextField label="Price" type="number" fullWidth value={editingPlan?.price ?? ""} onChange={e => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })} />
              <TextField select label="Billing Cycle" fullWidth value={editingPlan?.billing_cycle || "MONTHLY"} onChange={e => setEditingPlan({ ...editingPlan, billing_cycle: e.target.value })}>
                <MenuItem value="MONTHLY">Monthly</MenuItem>
                <MenuItem value="YEARLY">Yearly</MenuItem>
                <MenuItem value="LIFETIME">Lifetime</MenuItem>
              </TextField>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="Max Branches" type="number" fullWidth value={editingPlan?.max_branches ?? ""} onChange={e => setEditingPlan({ ...editingPlan, max_branches: Number(e.target.value) })} />
              <TextField label="Max Users" type="number" fullWidth value={editingPlan?.max_users ?? ""} onChange={e => setEditingPlan({ ...editingPlan, max_users: Number(e.target.value) })} />
              <TextField label="Max Storage (MB)" type="number" fullWidth value={editingPlan?.max_storage_mb ?? ""} onChange={e => setEditingPlan({ ...editingPlan, max_storage_mb: Number(e.target.value) })} />
            </Stack>
            <TextField 
              label="Features (comma separated)" 
              fullWidth 
              multiline 
              rows={3} 
              value={editingPlan?.features?.join(", ") || ""} 
              onChange={e => setEditingPlan({ ...editingPlan, features: e.target.value.split(",").map(f => f.trim()).filter(Boolean) })} 
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setManagePlanDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSavePlan} variant="contained" color="primary">Save Plan</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function UsageBar({ label, used, max }: { label: string; used: number; max: number }) {
  const theme = useTheme();
  const percent = max > 0 ? Math.min(100, (used / max) * 100) : 100;
  const isDanger = percent > 85;
  
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" mb={1}>
        <Typography variant="subtitle2" fontWeight={600}>{label}</Typography>
        <Typography variant="body2" fontWeight={700}>
          {used} / {max}
        </Typography>
      </Stack>
      <LinearProgress 
        variant="determinate" 
        value={percent} 
        sx={{ 
          height: 8, 
          borderRadius: 4,
          bgcolor: alpha(theme.palette.grey[200], 0.8),
          "& .MuiLinearProgress-bar": {
            bgcolor: isDanger ? theme.palette.error.main : theme.palette.primary.main,
            borderRadius: 4
          }
        }} 
      />
    </Box>
  );
}
