import { useState, useEffect, useCallback } from "react";
import {
  Box, Card, CardContent, Typography, Stack, useTheme, Chip,
  Grid, alpha, IconButton, CircularProgress, Alert, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Divider, Select, MenuItem, FormControl, InputLabel, TextField,
  InputAdornment,
} from "@mui/material";
import {
  IconSearch, IconRefresh, IconX, IconReceipt,
  IconArmchair, IconShoppingCart, IconBike, IconClock,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import PageContainer from "../../components/container/PageContainer";
import { getOrders, updateOrderStatus, cancelOrder } from "@/api/_orders";
import type { Order, OrderStatus } from "@/types/__restaurant";
import { toast } from "react-toastify";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string; border: string }> = {
  OPEN:        { label: "Open",        color: "#B45309", bg: "#FEF3C7", border: "#FDE68A" },
  IN_PROGRESS: { label: "In Progress", color: "#1D4ED8", bg: "#DBEAFE", border: "#BFDBFE" },
  READY:       { label: "Ready",       color: "#047857", bg: "#D1FAE5", border: "#A7F3D0" },
  SERVED:      { label: "Served",      color: "#059669", bg: "#ECFDF5", border: "#6EE7B7" },
  CLOSED:      { label: "Closed",      color: "#4B5563", bg: "#F3F4F6", border: "#E5E7EB" },
  CANCELLED:   { label: "Cancelled",   color: "#6B7280", bg: "#F3F4F6", border: "#D1D5DB" },
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  DINE_IN:  <IconArmchair size={14} />,
  TAKEAWAY: <IconShoppingCart size={14} />,
  DELIVERY: <IconBike size={14} />,
};

const ALL_STATUSES: OrderStatus[] = ["OPEN", "IN_PROGRESS", "READY", "SERVED", "CLOSED", "CANCELLED"];
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  OPEN:        "IN_PROGRESS",
  IN_PROGRESS: "READY",
  READY:       "SERVED",
  SERVED:      "CLOSED"
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
}

// ─── Order Detail Dialog ───────────────────────────────────────────────────────

function OrderDetailDialog({ order, open, onClose, onStatusChange }: {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  const theme = useTheme();
  if (!order) return null;
  const meta = STATUS_META[order.status];
  const nextStatus = NEXT_STATUS[order.status];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Order #{order.order_number}</Typography>
          <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
            <Chip
              label={meta.label}
              size="small"
              sx={{ bgcolor: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, fontWeight: 700, fontSize: "0.7rem" }}
            />
            <Chip
              icon={TYPE_ICON[order.order_type] as any}
              label={order.order_type.replace("_", " ")}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.7rem" }}
            />
          </Stack>
        </Box>
        <IconButton onClick={onClose} size="small"><IconX size={18} /></IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={2} mb={2}>
          <Grid size={6}>
            <Typography variant="caption" color="text.secondary">Table</Typography>
            <Typography fontWeight={600}>{order.table?.table_number ?? "Takeaway"}</Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="caption" color="text.secondary">Placed</Typography>
            <Typography fontWeight={600}>{new Date(order.created_at).toLocaleString()}</Typography>
          </Grid>
        </Grid>

        <Typography variant="subtitle2" fontWeight={700} mb={1}>Items</Typography>
        <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, overflow: "hidden" }}>
          {(order.items || []).map((item, i) => (
            <Box key={item.id}
              sx={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                px: 2, py: 1.5,
                bgcolor: i % 2 === 0 ? "transparent" : alpha(theme.palette.grey[100], 0.5),
                borderBottom: i < (order.items?.length ?? 0) - 1 ? `1px solid ${theme.palette.divider}` : "none",
              }}
            >
              <Box>
                <Typography fontWeight={600} fontSize="0.875rem">
                  {item.menuItem?.name ?? "Item"}
                </Typography>
                {item.notes && <Typography variant="caption" color="text.secondary">Note: {item.notes}</Typography>}
              </Box>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" color="text.secondary">x{item.quantity}</Typography>
                <Typography fontWeight={600}>${item.total_price?.toFixed(2)}</Typography>
              </Stack>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), borderRadius: 1.5 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Subtotal</Typography>
            <Typography>${(order.subtotal || 0).toFixed(2)}</Typography>
          </Stack>
          {!!order.tax_amount && (
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Tax</Typography>
              <Typography>${order.tax_amount.toFixed(2)}</Typography>
            </Stack>
          )}
          <Divider sx={{ my: 1 }} />
          <Stack direction="row" justifyContent="space-between">
            <Typography fontWeight={700}>Total</Typography>
            <Typography fontWeight={700} color="primary.main">${(order.total_amount || 0).toFixed(2)}</Typography>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        {order.status !== "CANCELLED" && order.status !== "SERVED" && (
          <Button
            color="error" variant="outlined" size="small"
            onClick={() => { onStatusChange(order.id, "CANCELLED"); onClose(); }}
          >
            Cancel Order
          </Button>
        )}
        {nextStatus && (
          <Button
            variant="contained" size="small"
            onClick={() => { onStatusChange(order.id, nextStatus); onClose(); }}
          >
            Mark as {STATUS_META[nextStatus].label}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  const meta = STATUS_META[order.status] || STATUS_META.OPEN;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        onClick={onClick}
        sx={{
          cursor: "pointer",
          borderRadius: 2,
          border: `1px solid`,
          borderColor: meta.border,
          transition: "all 0.2s",
          "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.1)", transform: "translateY(-2px)" },
        }}
      >
        <CardContent sx={{ p: "12px !important" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography fontWeight={700} fontSize="0.9rem">#{order.order_number}</Typography>
              <Stack direction="row" spacing={0.5} alignItems="center" mt={0.25}>
                {TYPE_ICON[order.order_type]}
                <Typography variant="caption" color="text.secondary">
                  {order.table?.name ?? order.order_type.replace("_", " ")}
                </Typography>
              </Stack>
            </Box>
            <Chip
              label={meta.label}
              size="small"
              sx={{ bgcolor: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, fontWeight: 700, fontSize: "0.7rem", height: 22 }}
            />
          </Stack>
          <Divider sx={{ my: 1 }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconClock size={13} style={{ color: "#6B7280" }} />
              <Typography variant="caption" color="text.secondary">{timeAgo(order.created_at)}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" color="text.secondary">{order.items?.length ?? 0} items</Typography>
              <Typography fontWeight={700} color="primary.main" fontSize="0.875rem">
                ${(order.total_amount || 0).toFixed(2)}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const theme = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { limit: 200 };
      if (statusFilter !== "ALL") params.status = statusFilter;
      const { data } = await getOrders(params);
      setOrders(data.data ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    try {
      if (newStatus === "CANCELLED") {
        await cancelOrder(id);
      } else {
        await updateOrderStatus(id, newStatus);
      }
      toast.success(`Order marked as ${STATUS_META[newStatus].label}`);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    return (
      o.order_number?.toLowerCase().includes(q) ||
      o.table?.name?.toLowerCase().includes(q) ||
      o.order_type?.toLowerCase().includes(q)
    );
  });

  // Group by status for the kanban-style overview
  const grouped = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = filtered.filter(o => o.status === s);
    return acc;
  }, {} as Record<OrderStatus, Order[]>);

  const activeStatuses: OrderStatus[] = ["OPEN", "IN_PROGRESS", "READY"];
  const archiveStatuses: OrderStatus[] = ["SERVED", "CLOSED", "CANCELLED"];

  return (
    <PageContainer title="Orders" description="Manage restaurant orders">
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={800}>Orders</Typography>
            <Typography color="text.secondary">
              {orders.length} total · {orders.filter(o => !["SERVED","CANCELLED"].includes(o.status)).length} active
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              placeholder="Search orders..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><IconSearch size={16} /></InputAdornment> }}
              sx={{ width: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value as any)}>
                <MenuItem value="ALL">All</MenuItem>
                {ALL_STATUSES.map(s => (
                  <MenuItem key={s} value={s}>{STATUS_META[s].label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchOrders} size="small" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                <IconRefresh size={16} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Summary Pills */}
      <Stack direction="row" spacing={1.5} flexWrap="wrap" mb={3} useFlexGap>
        {ALL_STATUSES.map(s => {
          const meta = STATUS_META[s];
          const count = grouped[s].length;
          return (
            <Chip
              key={s}
              label={`${meta.label} · ${count}`}
              onClick={() => setStatusFilter(prev => prev === s ? "ALL" : s)}
              sx={{
                bgcolor: statusFilter === s ? meta.bg : undefined,
                color: statusFilter === s ? meta.color : "text.secondary",
                border: `1px solid ${statusFilter === s ? meta.border : theme.palette.divider}`,
                fontWeight: statusFilter === s ? 700 : 400,
                cursor: "pointer",
              }}
            />
          );
        })}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Box display="flex" flexDirection="column" alignItems="center" py={10}>
          <IconReceipt size={48} style={{ color: "#D1D5DB", marginBottom: 12 }} />
          <Typography color="text.secondary" fontWeight={600}>No orders found</Typography>
          <Typography variant="caption" color="text.secondary">
            {search ? "Try a different search term" : "New orders will appear here automatically"}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Active orders section */}
          {activeStatuses.some(s => grouped[s].length > 0) && (
            <Box mb={4}>
              <Typography variant="subtitle1" fontWeight={700} mb={2} color="text.primary">
                🔥 Active Orders
              </Typography>
              <Grid container spacing={2}>
                {activeStatuses.flatMap(s => grouped[s]).map(order => (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={order.id}>
                    <OrderCard order={order} onClick={() => { setSelected(order); setDetailOpen(true); }} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Completed / Cancelled */}
          {archiveStatuses.some(s => grouped[s].length > 0) && statusFilter === "ALL" && (
            <Box>
              <Divider sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>COMPLETED / CANCELLED</Typography>
              </Divider>
              <Grid container spacing={2}>
                {archiveStatuses.flatMap(s => grouped[s]).slice(0, 24).map(order => (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={order.id}>
                    <OrderCard order={order} onClick={() => { setSelected(order); setDetailOpen(true); }} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* When a specific filter is active */}
          {statusFilter !== "ALL" && (
            <Grid container spacing={2}>
              {filtered.map(order => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={order.id}>
                  <OrderCard order={order} onClick={() => { setSelected(order); setDetailOpen(true); }} />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      <OrderDetailDialog
        order={selected}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </PageContainer>
  );
}
