import React, { useState, useEffect } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Stack, alpha, useTheme,
  Button, Divider, LinearProgress, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Tooltip
} from "@mui/material";
import {
  IconCrown, IconCheck, IconX, IconCreditCard, IconReceipt,
  IconChartPie, IconDownload, IconArrowRight
} from "@tabler/icons-react";
import PageContainer from "../../components/container/PageContainer";
import { motion } from "framer-motion";
import { getBillingSubscription, getBillingPlans, getBillingInvoices, upgradeSubscription, downloadInvoice } from "../../api/_billing";

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_cycle: string;
  features: string[];
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

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function BillingSubscriptionPage() {
  const theme = useTheme();
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, plansRes, invRes] = await Promise.all([
        getBillingSubscription().catch(() => ({ data: { data: null } })),
        getBillingPlans().catch(() => ({ data: { data: [] } })),
        getBillingInvoices().catch(() => ({ data: { data: [] } }))
      ]);

      setSubscription(subRes.data.data || MOCK_SUB);
      setPlans(plansRes.data.data?.length ? plansRes.data.data : MOCK_PLANS);
      setInvoices(invRes.data.data?.length ? invRes.data.data : MOCK_INVOICES);
    } catch (err) {
      console.error(err);
      setSubscription(MOCK_SUB);
      setPlans(MOCK_PLANS);
      setInvoices(MOCK_INVOICES);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    try {
      await upgradeSubscription(selectedPlan.id, selectedPlan.billing_cycle);
      setUpgradeDialogOpen(false);
      fetchData();
    } catch (err) {
      alert("Upgrade failed. Please try again.");
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    if (invoice.pdf_url) {
      // Direct URL download
      window.open(`http://localhost:3000${invoice.pdf_url}`, "_blank");
    } else {
      // Generate on the fly
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

  if (loading || !subscription) return <Typography p={4}>Loading billing details...</Typography>;

  const { plan, usage, status, end_date } = subscription;
  const daysRemaining = end_date ? Math.ceil((new Date(end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 365;
  const totalDays = 365;
  const progressPercent = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100));

  return (
    <PageContainer title="Billing & Subscription" description="Manage your enterprise subscription">
      <Box mb={4}>
        <Typography variant="h4" fontWeight={800} mb={1}>Billing & Subscription</Typography>
        <Typography color="text.secondary">Manage your plan, billing methods, and usage limits.</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* ─── CURRENT SUBSCRIPTION & COUNTDOWN ─── */}
        <Grid item xs={12} md={7}>
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
                  Change Plan
                </Button>
                <Button variant="outlined" size="large" color="error">
                  Cancel Subscription
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ─── USAGE ANALYTICS ─── */}
        <Grid item xs={12} md={5}>
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
        <Grid item xs={12} id="plans-section" mt={4}>
          <Typography variant="h5" fontWeight={800} mb={3}>Available Plans</Typography>
          <Grid container spacing={3}>
            {plans.map((p) => (
              <Grid item xs={12} sm={6} md={3} key={p.id}>
                <Card 
                  sx={{ 
                    height: "100%", 
                    border: p.id === plan.id ? `2px solid ${theme.palette.primary.main}` : undefined,
                    position: "relative"
                  }}
                >
                  {p.id === plan.id && (
                    <Box sx={{ position: "absolute", top: 12, right: 12 }}>
                      <Chip label="CURRENT" size="small" color="primary" />
                    </Box>
                  )}
                  <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
                    <Typography variant="h6" fontWeight={800}>{p.name}</Typography>
                    <Typography variant="h4" fontWeight={800} mt={2}>
                      ${p.price} <Typography component="span" variant="body2" color="text.secondary">/ {p.billing_cycle}</Typography>
                    </Typography>
                    
                    <Box mt={3} mb={3} flex={1}>
                      {(p.features as unknown as string[] || []).map((feat, i) => (
                        <Typography key={i} variant="body2" display="flex" alignItems="center" gap={1} mb={1}>
                          <IconCheck size={16} color={theme.palette.success.main} /> {feat}
                        </Typography>
                      ))}
                    </Box>

                    <Button 
                      variant={p.id === plan.id ? "outlined" : "contained"} 
                      fullWidth 
                      disabled={p.id === plan.id}
                      onClick={() => { setSelectedPlan(p); setUpgradeDialogOpen(true); }}
                    >
                      {p.id === plan.id ? "Current Plan" : "Upgrade"}
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

// ─── MOCK DATA FALLBACKS ─────────────────────────────────────────────────────
const MOCK_SUB: any = {
  id: "sub_1",
  status: "ACTIVE",
  end_date: "2026-12-31T00:00:00Z",
  plan: { id: "p1", name: "Professional Plan", description: "Comprehensive tools for multi-branch operations.", max_branches: 5, max_users: 50, max_storage_mb: 20000 },
  usage: { branches_used: 2, users_used: 15, storage_used_mb: 4500 }
};

const MOCK_PLANS: any[] = [
  { id: "p1", name: "Starter", price: 49.99, billing_cycle: "MONTHLY", features: ["1 Branch", "5 Users"] },
  { id: "p2", name: "Professional", price: 99.99, billing_cycle: "MONTHLY", features: ["5 Branches", "50 Users", "API Access"] },
  { id: "p3", name: "Enterprise", price: 999.99, billing_cycle: "YEARLY", features: ["Unlimited", "Custom Features"] }
];

const MOCK_INVOICES: any[] = [
  { id: "inv_1", invoice_number: "INV-2025-001", amount: 99.99, status: "PAID", created_at: "2025-11-01T10:00:00Z" }
];
