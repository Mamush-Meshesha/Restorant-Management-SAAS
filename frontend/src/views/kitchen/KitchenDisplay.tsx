import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Grid, Card, CardContent, Typography, Stack, useTheme,
  Button, Chip, alpha, Tooltip, CircularProgress, IconButton,
} from "@mui/material";
import {
  IconClock, IconAlertTriangle, IconCheck, IconChefHat, IconFlame, IconPrinter, IconVolume, IconVolumeOff
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import PageContainer from "../../components/container/PageContainer";
import { getKitchenOrders, updateKitchenOrderStatus } from "@/api/_kitchen";
import { getKitchenStations } from "@/api/_kitchenStations";
import type { KitchenOrder, KitchenStation } from "@/types/__restaurant";
import { toast } from "react-toastify";
import { Select, MenuItem, FormControl } from "@mui/material";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useReactToPrint } from "react-to-print";

// ─── Helpers & Config ────────────────────────────────────────────────────────

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

// Base64 short notification beep
// Web Audio API used directly in playBeep()

const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch(e) {
    console.log("Audio not allowed yet");
  }
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KitchenDisplay() {
  const theme = useTheme();
  const [rawTickets, setRawTickets] = useState<KitchenOrder[]>([]);
  const [stations, setStations] = useState<KitchenStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevTicketCount = useRef(0);
  const printRef = useRef<HTMLDivElement>(null);

  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Kitchen_Prep_Tickets`
  });

  const fetchStations = useCallback(async () => {
    try {
      const { data } = await getKitchenStations();
      setStations(data.data || []);
    } catch (err) {
      console.error("Failed to load stations:", err);
    }
  }, []);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  const fetchOrders = useCallback(async () => {
    try {
      const params: any = { status: "PENDING,PREPARING,READY" };
      if (selectedStation && selectedStation !== "all") {
        params.stationId = selectedStation;
      }
      const { data } = await getKitchenOrders(params);
      const newTickets = data.data || [];
      
      // Check for new tickets to play sound
      const pendingCount = newTickets.filter((t: KitchenOrder) => t.status === 'PENDING').length;
      if (soundEnabled && pendingCount > prevTicketCount.current) {
        playBeep();
      }
      prevTicketCount.current = pendingCount;
      
      setRawTickets(newTickets);
    } catch (err) {
      console.error("Failed to load kitchen orders:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedStation, soundEnabled]);

  // Real-time Sockets
  useEffect(() => {
    fetchOrders();

    const API_URL = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:3000";
    const socket = io(API_URL, { auth: { token: localStorage.getItem('token') } });

    if (currentUser?.branch_id) {
      socket.emit("join_branch", { branchId: currentUser.branch_id });
    }

    socket.on("kitchen_update", () => {
      fetchOrders();
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchOrders, currentUser]);

  const advance = async (id: string, currentStatus: string) => {
    const nextStatus = statusCfg[currentStatus as TicketStatus]?.next;
    if (!nextStatus) return;
    setUpdating(id);
    try {
      await updateKitchenOrderStatus(id, nextStatus);
      toast.success(`Order ${nextStatus === "READY" ? "marked ready" : "started"}`);
      // Optimistic update
      setRawTickets(prev => prev.map(t => t.id === id ? { ...t, status: nextStatus } : t));
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update order");
    } finally {
      setUpdating(null);
    }
  };

  const advanceGroup = async (orderId: string, currentStatus: string) => {
    const items = rawTickets.filter(t => t.orderItem?.order?.id === orderId && t.status === currentStatus);
    const nextStatus = statusCfg[currentStatus as TicketStatus]?.next;
    if (!nextStatus) return;
    
    setUpdating(orderId);
    try {
      // Advance all in parallel
      await Promise.all(items.map(t => updateKitchenOrderStatus(t.id, nextStatus)));
      toast.success(`Group ${nextStatus === "READY" ? "marked ready" : "started"}`);
      setRawTickets(prev => prev.map(t => (t.orderItem?.order?.id === orderId && t.status === currentStatus) ? { ...t, status: nextStatus } : t));
    } catch (err: any) {
      toast.error("Failed to update some items in group");
    } finally {
      setUpdating(null);
    }
  };

  // Group tickets by Order ID for rendering
  type GroupedTicket = {
    orderId: string;
    orderNum: string;
    table: string;
    startTime: string | null;
    status: TicketStatus;
    items: KitchenOrder[];
  };

  const getGroupedTickets = (status: TicketStatus): GroupedTicket[] => {
    const colTickets = rawTickets.filter(t => t.status === status);
    const groups: Record<string, GroupedTicket> = {};

    colTickets.forEach(t => {
      const order = t.orderItem?.order;
      const orderId = order?.id || t.id;
      if (!groups[orderId]) {
        groups[orderId] = {
          orderId,
          orderNum: order?.order_number || t.id.slice(0,8).toUpperCase(),
          table: order?.table?.table_number ? `T-${order.table.table_number}` : "Takeaway",
          startTime: t.started_at ?? order?.created_at ?? null,
          status,
          items: []
        };
      }
      groups[orderId].items.push(t);
    });

    // Sort by startTime
    return Object.values(groups).sort((a, b) => {
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  };

  const isUrgent = (startTime: string | null, status: string) => {
    if (!startTime || status === "READY") return false;
    return (Date.now() - new Date(startTime).getTime()) > 12 * 60000;
  };

  return (
    <PageContainer title="Kitchen Display" description="Live Kitchen Order Tickets">
      {/* Header */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: "center" }} mb={3} spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: "-0.02em" }}>Kitchen Display</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {rawTickets.filter((t) => t.status !== "READY").length} active items ·{" "}
            {rawTickets.filter((t) => t.status === "READY").length} ready to serve
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Tooltip title={soundEnabled ? "Mute Alerts" : "Enable Sound Alerts"}>
            <IconButton onClick={() => setSoundEnabled(!soundEnabled)} size="small" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              {soundEnabled ? <IconVolume size={18} /> : <IconVolumeOff size={18} />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Print Active Tickets">
            <IconButton onClick={() => handlePrint()} size="small" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <IconPrinter size={18} />
            </IconButton>
          </Tooltip>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              sx={{ borderRadius: "7px", fontSize: "0.875rem", height: 36, bgcolor: "background.paper" }}
            >
              <MenuItem value="all">All Stations</MenuItem>
              {stations.map(st => (
                <MenuItem key={st.id} value={st.id}>{st.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Stack direction="row" spacing={1} alignItems="center">
            {columns.map((col) => {
              const count = rawTickets.filter((t) => t.status === col.key).length;
              const cfg = statusCfg[col.key];
              return (
                <Box key={col.key} sx={{ px: 2, py: 1, borderRadius: "7px", bgcolor: cfg.bg, border: `1px solid ${cfg.border}`, display: { xs: 'none', sm: 'block' } }}>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Box sx={{ color: cfg.text }}>{col.icon}</Box>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: cfg.text }}>{count} {col.label}</Typography>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Stack>
      </Stack>

      <style>{`
        @keyframes pulse-border {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .urgent-ticket {
          animation: pulse-border 2s infinite;
          border: 1.5px solid #ef4444 !important;
        }
      `}</style>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
          {columns.map((col) => {
            const cfg = statusCfg[col.key];
            const groupedTickets = getGroupedTickets(col.key);
            
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
                    <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: cfg.text }}>{groupedTickets.length}</Typography>
                  </Box>
                </Box>

                {/* Tickets */}
                <Stack spacing={1.5}>
                  <AnimatePresence>
                    {groupedTickets.map((group) => {
                      const urgent = isUrgent(group.startTime, group.status);
                      const elapsedStr = group.startTime ? elapsed(group.startTime) : "–";

                      return (
                        <motion.div
                          key={`${group.orderId}-${group.status}`}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.18 }}
                        >
                          <Card className={urgent ? "urgent-ticket" : ""} sx={{
                            border: `1.5px solid ${theme.palette.divider}`,
                            borderRadius: "10px", boxShadow: "none", bgcolor: "background.paper",
                          }}>
                            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                              {/* Ticket Header */}
                              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: urgent ? alpha(theme.palette.error.main, 0.05) : 'transparent' }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="subtitle2" fontWeight={700}>#{group.orderNum}</Typography>
                                    <Chip label={group.table} size="small" sx={{ height: 18, fontSize: "0.7rem", fontWeight: 600, bgcolor: theme.palette.grey[100], color: "text.secondary" }} />
                                  </Stack>
                                  <Stack direction="row" alignItems="center" spacing={0.75}>
                                    {urgent && (
                                      <Tooltip title="Waiting over 12 mins">
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
                                <Stack spacing={1.5}>
                                  {group.items.map(t => {
                                    const item = t.orderItem;
                                    return (
                                      <Box key={t.id} display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                          <Stack direction="row" alignItems="baseline" spacing={1}>
                                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: cfg.text, minWidth: 18 }}>×{item?.quantity ?? 1}</Typography>
                                            <Typography variant="body2" fontWeight={500}>{item?.menuItem?.name ?? item?.menu_item_id ?? "Unknown"}</Typography>
                                          </Stack>
                                          {item?.notes && (
                                            <Typography variant="caption" color="warning.dark" sx={{ pl: "26px", display: "block", fontSize: "0.7rem", mt: 0.5 }}>
                                              ⚑ {item.notes}
                                            </Typography>
                                          )}
                                        </Box>
                                        
                                        {/* Individual Item Action (if they want to advance one at a time) */}
                                        {cfg.next && (
                                          <Button
                                            size="small" variant="outlined"
                                            onClick={() => advance(t.id, t.status)}
                                            disabled={updating === t.id || updating === group.orderId}
                                            sx={{ minWidth: 0, p: 0.5, borderRadius: 1.5 }}
                                          >
                                            <IconCheck size={14} />
                                          </Button>
                                        )}
                                      </Box>
                                    );
                                  })}
                                </Stack>
                              </Box>

                              {/* Group Action Button */}
                              {cfg.next && (
                                <Box sx={{ px: 2, pb: 1.5 }}>
                                  <Button
                                    fullWidth size="small" variant="contained"
                                    onClick={() => advanceGroup(group.orderId, group.status)}
                                    disabled={updating === group.orderId}
                                    startIcon={updating === group.orderId ? <CircularProgress size={12} color="inherit" /> : (group.status === "PREPARING" ? <IconChefHat size={14} /> : <IconFlame size={14} />)}
                                    sx={{
                                      borderRadius: "7px", boxShadow: "none", fontWeight: 600, fontSize: "0.8rem", py: 0.75,
                                      bgcolor: group.status === "PENDING" ? theme.palette.info.main : theme.palette.success.main,
                                      "&:hover": { boxShadow: "none", bgcolor: group.status === "PENDING" ? theme.palette.info.dark : theme.palette.success.dark },
                                    }}
                                  >
                                    {cfg.nextLabel} All
                                  </Button>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {groupedTickets.length === 0 && (
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

      {/* Hidden layout for react-to-print */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} style={{ padding: '20px', fontFamily: 'monospace', width: '300px', color: '#000' }}>
          <h2 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>PREP TICKETS</h2>
          {["PENDING", "PREPARING"].map(status => {
            const groups = getGroupedTickets(status as TicketStatus);
            if (groups.length === 0) return null;
            return (
              <div key={status}>
                <h3 style={{ borderBottom: '1px solid #000', paddingBottom: '5px' }}>{status}</h3>
                {groups.map(g => (
                  <div key={g.orderId} style={{ marginBottom: '15px', borderBottom: '1px dashed #ccc', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <span>#{g.orderNum}</span>
                      <span>{g.table}</span>
                    </div>
                    <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                      {new Date(g.startTime || Date.now()).toLocaleTimeString()}
                    </div>
                    {g.items.map(t => (
                      <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '3px' }}>
                        <span>{t.orderItem?.quantity}x {t.orderItem?.menuItem?.name}</span>
                        {t.orderItem?.notes && <div style={{ fontSize: '11px', fontStyle: 'italic', marginLeft: '10px' }}>- {t.orderItem.notes}</div>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

    </PageContainer>
  );
}
