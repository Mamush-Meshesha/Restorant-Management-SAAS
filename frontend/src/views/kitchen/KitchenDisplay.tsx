import { useState, useEffect, useCallback } from "react";
import {
  Box, Grid, Card, CardContent, Typography, Stack, useTheme,
  Button, Chip, alpha, Tooltip, CircularProgress,
} from "@mui/material";
import {
  IconClock, IconAlertTriangle, IconCheck, IconChefHat, IconFlame, IconRefresh,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import PageContainer from "../../components/container/PageContainer";
import { getKitchenOrders, updateKitchenOrderStatus } from "@/api/_kitchen";
import type { KitchenOrder } from "@/types/__restaurant";
import { toast } from "react-toastify";

type TicketStatus = "PENDING" | "PREPARING" | "READY";

const statusCfg = {
  PENDING:   { label: "Pending",   bg: "#FEF3C7", text: "#B45309", border: "#FDE68A", next: "PREPARING" as TicketStatus, nextLabel: "Start Preparing" },
  PREPARING: { label: "Preparing", bg: "#DBEAFE", text: "#1D4ED8", border: "#BFDBFE", next: "READY" as TicketStatus,     nextLabel: "Mark Ready" },
  READY:     { label: "Ready",     bg: "#D1FAE5", text: "#047857", border: "#A7F3D0", next: null,                         nextLabel: "Served" },
};

const elapsed = (d: string | Date) => {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`;
};

const columns: { key: TicketStatus; label: string; icon: React.ReactNode }[] = [
  { key: "PENDING",   label: "Pending",   icon: <IconClock size={15} /> },
  { key: "PREPARING", label: "Preparing", icon: <IconFlame size={15} /> },
  { key: "READY",     label: "Ready",     icon: <IconCheck size={15} /> },
];

export default function KitchenDisplay() {
  const theme = useTheme();
  const [tickets, setTickets] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await getKitchenOrders({ status: "PENDING,PREPARING,READY" });
      setTickets(data.data || []);
    } catch (err) {
      console.error("Failed to load kitchen orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Poll every 15 seconds for live updates
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const advance = async (id: string, currentStatus: string) => {
    const nextStatus = statusCfg[currentStatus as TicketStatus]?.next;
    if (!nextStatus) return;
    setUpdating(id);
    try {
      await updateKitchenOrderStatus(id, nextStatus);
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
      );
      toast.success(`Order ${nextStatus === "READY" ? "marked ready" : "started"}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update order");
    } finally {
      setUpdating(null);
    }
  };

  const isUrgent = (t: KitchenOrder) => {
    const startTime = t.started_at ?? t.order?.created_at;
    if (!startTime) return false;
    return (Date.now() - new Date(startTime).getTime()) > 12 * 60000 && t.status !== "READY";
  };

  const getOrderLabel = (t: KitchenOrder) => {
    const orderNum = t.order?.order_number ?? t.id.slice(0, 8).toUpperCase();
    const tableNum = t.order?.table?.table_number;
    return { id: `#${orderNum}`, table: tableNum ? `T-${tableNum}` : "Takeaway" };
  };

  return (
    <PageContainer title="Kitchen Display" description="Live Kitchen Order Tickets">
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: "-0.02em" }}>Kitchen Display</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {tickets.filter((t) => t.status !== "READY").length} active tickets ·{" "}
            {tickets.filter((t) => t.status === "READY").length} ready to serve
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          {columns.map((col) => {
            const count = tickets.filter((t) => t.status === col.key).length;
            const cfg = statusCfg[col.key];
            return (
              <Box key={col.key} sx={{ px: 2, py: 1, borderRadius: "7px", bgcolor: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <Box sx={{ color: cfg.text }}>{col.icon}</Box>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: cfg.text }}>{count} {col.label}</Typography>
                </Stack>
              </Box>
            );
          })}
          <Button variant="outlined" size="small" onClick={fetchOrders} startIcon={<IconRefresh size={14} />} sx={{ borderRadius: "7px", fontSize: "0.75rem" }}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
          {columns.map((col) => {
            const cfg = statusCfg[col.key];
            const colTickets = tickets.filter((t) => t.status === col.key);
            return (
              <Grid size={{ xs: 12, md: 4 }} key={col.key}>
                {/* Column header */}
                <Box sx={{
                  display: "flex", alignItems: "center", gap: 1, px: 2, py: 1.25, mb: 1.5,
                  borderRadius: "7px", bgcolor: cfg.bg, border: `1px solid ${cfg.border}`,
                }}>
                  <Box sx={{ color: cfg.text }}>{col.icon}</Box>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: cfg.text }}>{col.label}</Typography>
                  <Box sx={{ ml: "auto", width: 20, height: 20, borderRadius: "50%", bgcolor: cfg.border, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: cfg.text }}>{colTickets.length}</Typography>
                  </Box>
                </Box>

                {/* Tickets */}
                <Stack spacing={1.5}>
                  <AnimatePresence>
                    {colTickets.map((ticket) => {
                      const urgent = isUrgent(ticket);
                      const { id: ticketId, table } = getOrderLabel(ticket);
                      const startTime = ticket.started_at ?? ticket.order?.created_at;
                      const elapsedStr = startTime ? elapsed(startTime) : "–";
                      const items = ticket.order?.items ?? [];

                      return (
                        <motion.div
                          key={ticket.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.18 }}
                        >
                          <Card sx={{
                            border: `1.5px solid ${urgent ? theme.palette.error.main : theme.palette.divider}`,
                            borderRadius: "10px", boxShadow: "none", bgcolor: "background.paper",
                          }}>
                            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                              {/* Ticket Header */}
                              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="subtitle2" fontWeight={700}>{ticketId}</Typography>
                                    <Chip label={table} size="small" sx={{ height: 18, fontSize: "0.7rem", fontWeight: 600, bgcolor: theme.palette.grey[100], color: "text.secondary" }} />
                                  </Stack>
                                  <Stack direction="row" alignItems="center" spacing={0.75}>
                                    {urgent && (
                                      <Tooltip title="Waiting too long">
                                        <IconAlertTriangle size={14} color={theme.palette.error.main} />
                                      </Tooltip>
                                    )}
                                    <Box sx={{
                                      display: "flex", alignItems: "center", gap: "3px", px: 1, py: 0.3, borderRadius: "5px",
                                      bgcolor: urgent ? alpha(theme.palette.error.main, 0.1) : theme.palette.grey[100],
                                    }}>
                                      <IconClock size={11} color={urgent ? theme.palette.error.main : theme.palette.text.secondary} />
                                      <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: urgent ? theme.palette.error.main : "text.secondary" }}>
                                        {elapsedStr}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </Stack>
                              </Box>

                              {/* Items */}
                              <Box sx={{ px: 2, py: 1.5 }}>
                                {items.length > 0 ? (
                                  <Stack spacing={0.75}>
                                    {items.map((item, i) => (
                                      <Box key={i}>
                                        <Stack direction="row" alignItems="baseline" spacing={1}>
                                          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: cfg.text, minWidth: 18 }}>×{item.quantity}</Typography>
                                          <Typography variant="body2" fontWeight={500}>{item.menuItem?.name ?? item.menu_item_id}</Typography>
                                        </Stack>
                                        {item.notes && (
                                          <Typography variant="caption" color="warning.dark" sx={{ pl: "26px", display: "block", fontSize: "0.7rem" }}>
                                            ⚑ {item.notes}
                                          </Typography>
                                        )}
                                      </Box>
                                    ))}
                                  </Stack>
                                ) : (
                                  <Typography variant="caption" color="text.secondary">No item details</Typography>
                                )}
                              </Box>

                              {/* Action Button */}
                              {statusCfg[ticket.status as TicketStatus]?.next && (
                                <Box sx={{ px: 2, pb: 1.5 }}>
                                  <Button
                                    fullWidth size="small" variant="contained"
                                    onClick={() => advance(ticket.id, ticket.status)}
                                    disabled={updating === ticket.id}
                                    startIcon={updating === ticket.id ? <CircularProgress size={12} color="inherit" /> : (ticket.status === "PREPARING" ? <IconChefHat size={14} /> : <IconFlame size={14} />)}
                                    sx={{
                                      borderRadius: "7px", boxShadow: "none", fontWeight: 600, fontSize: "0.8rem", py: 0.75,
                                      bgcolor: ticket.status === "PENDING" ? theme.palette.info.main : theme.palette.success.main,
                                      "&:hover": { boxShadow: "none", bgcolor: ticket.status === "PENDING" ? theme.palette.info.dark : theme.palette.success.dark },
                                    }}
                                  >
                                    {statusCfg[ticket.status as TicketStatus]?.nextLabel}
                                  </Button>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {colTickets.length === 0 && (
                    <Box sx={{ py: 4, textAlign: "center", opacity: 0.35, border: `1px dashed ${theme.palette.divider}`, borderRadius: "10px" }}>
                      <Typography variant="body2" color="text.secondary">No tickets</Typography>
                    </Box>
                  )}
                </Stack>
              </Grid>
            );
          })}
        </Grid>
      )}
    </PageContainer>
  );
}
