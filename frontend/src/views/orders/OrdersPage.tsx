import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Card, CardContent, Typography, Stack, useTheme, Chip,
  Grid, alpha, IconButton, CircularProgress, Alert, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Divider, Select, MenuItem, FormControl, InputLabel, TextField,
  InputAdornment, Checkbox, FormControlLabel,
} from "@mui/material";
import {
  IconSearch, IconRefresh, IconX, IconReceipt,
  IconArmchair, IconShoppingCart, IconBike, IconClock, IconPrinter, IconCash
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import PageContainer from "../../components/container/PageContainer";
import { getOrders, updateOrderStatus, cancelOrder, voidOrderItem, generateBill, checkoutBill } from "@/api/_orders";
import type { Order, OrderStatus } from "@/types/__restaurant";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useReactToPrint } from "react-to-print";

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
  READY:       "SERVED"
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
}

// ─── Order Detail Dialog ───────────────────────────────────────────────────────

function OrderDetailDialog({ order, open, onClose, onStatusChange, onVoidItem, onCheckout }: {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onVoidItem: (itemId: string, reason: string, wasted: boolean) => void;
  onCheckout: (order: Order) => void;
}) {
  const theme = useTheme();
  const [voidingItem, setVoidingItem] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [voidWasted, setVoidWasted] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt_Order_${order?.order_number}`
  });

  if (!order) return null;
  const meta = STATUS_META[order.status];
  const nextStatus = NEXT_STATUS[order.status];

  return (
    <>
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
          <Box display="flex" gap={1}>
            <IconButton onClick={() => handlePrint()} color="primary" size="small"><IconPrinter size={18} /></IconButton>
            <IconButton onClick={onClose} size="small"><IconX size={18} /></IconButton>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Table</Typography>
              <Typography fontWeight={600}>{order.table?.table_number ?? "Takeaway"}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Placed</Typography>
              <Typography fontWeight={600}>{new Date(order.created_at).toLocaleString()}</Typography>
            </Grid>
          </Grid>

          <Typography variant="subtitle2" fontWeight={700} mb={1}>Items</Typography>
          <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, overflow: "hidden" }}>
            {(order.items || []).map((item, i) => (
              <Box key={item.id} sx={{
                px: 2, py: 1.5,
                bgcolor: i % 2 === 0 ? "transparent" : alpha(theme.palette.grey[100], 0.5),
                borderBottom: i < (order.items?.length ?? 0) - 1 ? `1px solid ${theme.palette.divider}` : "none",
              }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight={600} fontSize="0.875rem" sx={{ textDecoration: item.total_price === 0 ? 'line-through' : 'none' }}>
                      {item.menuItem?.name ?? "Item"}
                    </Typography>
                    {item.notes && <Typography variant="caption" color="text.secondary">Note: {item.notes}</Typography>}
                  </Box>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2" color="text.secondary">x{item.quantity}</Typography>
                    <Typography fontWeight={600}>${item.total_price?.toFixed(2)}</Typography>
                    
                    {order.status !== "CLOSED" && order.status !== "CANCELLED" && item.total_price > 0 && (
                      <Button size="small" color="error" onClick={() => setVoidingItem(item.id)}>Void</Button>
                    )}
                  </Stack>
                </Box>
                
                {/* Void Form */}
                {voidingItem === item.id && (
                  <Box mt={2} p={2} bgcolor={alpha(theme.palette.error.main, 0.05)} borderRadius={1}>
                    <Typography variant="subtitle2" color="error" mb={1}>Void Item</Typography>
                    <TextField 
                      size="small" fullWidth label="Reason" 
                      value={voidReason} onChange={e => setVoidReason(e.target.value)} 
                      sx={{ mb: 1 }}
                    />
                    <FormControlLabel 
                      control={<Checkbox size="small" checked={voidWasted} onChange={e => setVoidWasted(e.target.checked)} />} 
                      label="Item was wasted (log cost loss)"
                    />
                    <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
                      <Button size="small" onClick={() => setVoidingItem(null)}>Cancel</Button>
                      <Button size="small" variant="contained" color="error" onClick={() => {
                        onVoidItem(item.id, voidReason || "No reason provided", voidWasted);
                        setVoidingItem(null);
                        setVoidReason("");
                      }}>Confirm Void</Button>
                    </Box>
                  </Box>
                )}
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
          {order.status !== "CANCELLED" && order.status !== "SERVED" && order.status !== "CLOSED" && (
            <Button
              color="error" variant="outlined" size="small"
              onClick={() => { onStatusChange(order.id, "CANCELLED"); onClose(); }}
            >
              Cancel Order
            </Button>
          )}
          {nextStatus && (
            <Button
              variant="outlined" size="small"
              onClick={() => { onStatusChange(order.id, nextStatus); }}
            >
              Mark as {STATUS_META[nextStatus].label}
            </Button>
          )}
          {order.status === "SERVED" && (
            <Button
              variant="contained" color="success" size="small" startIcon={<IconCash size={16} />}
              onClick={() => { onCheckout(order); onClose(); }}
            >
              Checkout / Pay
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Hidden Receipt for Printing */}
      <div style={{ display: 'none' }}>
        <div ref={receiptRef} style={{ padding: '20px', fontFamily: 'monospace', width: '300px', color: '#000' }}>
          <h2 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>Restaurant Bill</h2>
          <p style={{ margin: '0 0 5px 0', fontSize: '12px', textAlign: 'center' }}>Order: #{order.order_number}</p>
          <p style={{ margin: '0 0 15px 0', fontSize: '12px', textAlign: 'center' }}>{new Date(order.created_at).toLocaleString()}</p>
          <hr style={{ borderTop: '1px dashed #000' }} />
          <div style={{ marginBottom: '15px', marginTop: '15px' }}>
            {(order.items || []).filter(i => i.total_price > 0).map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '5px' }}>
                <span>{item.quantity}x {item.menuItem?.name}</span>
                <span>${item.total_price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <hr style={{ borderTop: '1px dashed #000' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginTop: '10px' }}>
            <span>Subtotal</span>
            <span>${(order.subtotal || 0).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' }}>
            <span>TOTAL</span>
            <span>${(order.total_amount || 0).toFixed(2)}</span>
          </div>
          <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '12px' }}>Thank you for dining with us!</p>
        </div>
      </div>
    </>
  );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────

function PaymentModal({ order, open, onClose, onComplete }: { order: Order | null; open: boolean; onClose: () => void; onComplete: () => void }) {
  const [method, setMethod] = useState("CASH");
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  const handlePay = async () => {
    try {
      setLoading(true);
      const billRes = await generateBill(order.id);
      await checkoutBill(billRes.data.data.id, method, order.total_amount || 0);
      toast.success("Payment successful!");
      onComplete();
      onClose();
    } catch (error) {
      toast.error("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Checkout</DialogTitle>
      <DialogContent dividers>
        <Typography variant="h4" textAlign="center" mb={3}>${(order.total_amount || 0).toFixed(2)}</Typography>
        <FormControl fullWidth size="small">
          <InputLabel>Payment Method</InputLabel>
          <Select value={method} label="Payment Method" onChange={(e) => setMethod(e.target.value)}>
            <MenuItem value="CASH">Cash</MenuItem>
            <MenuItem value="CARD">Credit/Debit Card</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" color="success" onClick={handlePay} disabled={loading}>
          {loading ? "Processing..." : "Process Payment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  const meta = STATUS_META[order.status] || STATUS_META.OPEN;
  return (
    <motion.div
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
                  {order.table?.table_number ?? order.order_type.replace("_", " ")}
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
  const [paymentOpen, setPaymentOpen] = useState(false);

  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  const fetchOrders = useCallback(async () => {
    try {
      const params: any = { limit: 200 };
      if (statusFilter !== "ALL") params.status = statusFilter;
      const { data } = await getOrders(params);
      setOrders(data.data ?? []);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchOrdersRef = useRef(fetchOrders);
  useEffect(() => {
    fetchOrdersRef.current = fetchOrders;
  }, [fetchOrders]);

  // Real-time Sockets
  useEffect(() => {
    fetchOrdersRef.current();

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const socket = io(API_URL, { 
      auth: { token: localStorage.getItem('token') },
      forceNew: true
    });

    if (currentUser?.branch_id) {
      socket.emit("join_branch", { branchId: currentUser.branch_id });
    }

    socket.on("order_update", () => {
      fetchOrdersRef.current(); // Smartly re-fetch to get accurate totals after item voids etc.
    });

    return () => {
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.branch_id]); // only re-run if branch_id actually changes

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    try {
      if (newStatus === "CANCELLED") {
        await cancelOrder(id);
      } else {
        await updateOrderStatus(id, newStatus);
      }
      toast.success(`Order marked as ${STATUS_META[newStatus].label}`);
      // Optimistic update
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: newStatus } : null);
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const handleVoidItem = async (itemId: string, reason: string, wasted: boolean) => {
    try {
      await voidOrderItem(itemId, reason, wasted);
      toast.success("Item voided successfully");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to void item");
    }
  };

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    return (
      o.order_number?.toLowerCase().includes(q) ||
      o.table?.table_number?.toLowerCase().includes(q) ||
      o.order_type?.toLowerCase().includes(q)
    );
  });

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
              {orders.length} total · {orders.filter(o => !["SERVED", "CLOSED", "CANCELLED"].includes(o.status)).length} active
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              placeholder="Search orders..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><IconSearch size={16} /></InputAdornment> } }}
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

      {loading && orders.length === 0 ? (
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
                  <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
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
                  <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
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
                <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
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
        onVoidItem={handleVoidItem}
        onCheckout={() => setPaymentOpen(true)}
      />

      <PaymentModal 
        order={selected}
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onComplete={fetchOrders}
      />
    </PageContainer>
  );
}
