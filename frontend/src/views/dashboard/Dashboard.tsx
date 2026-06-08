import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  useTheme,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  alpha,
} from "@mui/material";
import {
  IconShoppingCart,
  IconReceipt,
  IconUsers,
  IconCurrencyDollar,
  IconArrowUpRight,
  IconArrowDownRight,
  IconToolsKitchen2,
  IconTable,
  IconTrendingUp,
  IconRefresh,
  IconDots,
  IconClock,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import PageContainer from "../../components/container/PageContainer";
import { getOrders } from "@/api/_orders";
import { getRevenueSummary } from "@/api/_analytics";
import { getKitchenOrders } from "@/api/_kitchen";
import { getTables } from "@/api/_tables";
import { useAppSelector } from "@/hooks/auth";
import type { Order } from "@/types/__restaurant";

// ─── Motion helpers ───────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.22, ease: "easeOut" } as any,
  }),
};

// ─── Types ────────────────────────────────────────────────────────────────────
// Backend returns uppercase statuses; we normalise to title-case for the UI.
type OrderStatus = "Preparing" | "Ready" | "Served" | "Pending" | "Cancelled" | "Completed";

const normaliseStatus = (raw: string): OrderStatus => {
  const map: Record<string, OrderStatus> = {
    PENDING: "Pending", PREPARING: "Preparing", READY: "Ready",
    SERVED: "Served", COMPLETED: "Completed", CANCELLED: "Cancelled",
    // already title-case fallback
    Pending: "Pending", Preparing: "Preparing", Ready: "Ready",
    Served: "Served", Completed: "Completed", Cancelled: "Cancelled",
  };
  return map[raw] ?? "Pending";
};

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
  accent: string;
  sub?: string;
  index: number;
}

// ─── Animated counter ─────────────────────────────────────────────────────────
const useCounter = (target: number, duration = 1200) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

// ─── KPI Stat Card ────────────────────────────────────────────────────────────
const StatCard = ({ title, value, change, positive, icon, accent, sub, index }: StatCardProps) => {
  const theme = useTheme();
  const isNumeric = !isNaN(Number(value.replace(/[$,/]/g, "")));
  const numericVal = isNumeric ? Number(value.replace(/[$,/]/g, "")) : 0;
  const animated = useCounter(numericVal);
  const displayValue = isNumeric
    ? value.startsWith("$")
      ? `$${animated.toLocaleString()}`
      : value.includes("/")
      ? value
      : animated.toString()
    : value;

  return (
    <motion.div custom={index} variants={fadeUp} initial="hidden" animate="visible">
      <Card
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: "10px",
          boxShadow: "none",
          backgroundColor: theme.palette.background.paper,
          transition: "border-color 150ms ease, box-shadow 150ms ease",
          "&:hover": {
            borderColor: accent,
            boxShadow: `0 0 0 1px ${alpha(accent, 0.2)}`,
          },
        }}
      >
        <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500, mb: 1.5, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.7rem" }}
              >
                {title}
              </Typography>
              <Typography
                sx={{ fontSize: "1.875rem", fontWeight: 700, lineHeight: 1, color: "text.primary", letterSpacing: "-0.02em", mb: 1.5 }}
              >
                {displayValue}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    px: 0.75,
                    py: 0.25,
                    borderRadius: "4px",
                    bgcolor: positive ? alpha("#10B981", 0.1) : alpha("#EF4444", 0.1),
                  }}
                >
                  {positive ? (
                    <IconArrowUpRight size={13} color="#10B981" />
                  ) : (
                    <IconArrowDownRight size={13} color="#EF4444" />
                  )}
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, fontSize: "0.7rem", color: positive ? "#10B981" : "#EF4444" }}
                  >
                    {change}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                  vs last 7 days
                </Typography>
              </Stack>
            </Box>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(accent, 0.1),
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          </Stack>
          {sub && (
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary">
                {sub}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusConfig: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  Pending:   { bg: alpha("#F59E0B", 0.1), text: "#B45309", label: "Pending" },
  Preparing: { bg: alpha("#3B82F6", 0.1), text: "#1D4ED8", label: "Preparing" },
  Ready:     { bg: alpha("#10B981", 0.1), text: "#047857", label: "Ready" },
  Served:    { bg: alpha("#6B7280", 0.1), text: "#374151", label: "Served" },
  Completed: { bg: alpha("#10B981", 0.1), text: "#047857", label: "Completed" },
  Cancelled: { bg: alpha("#EF4444", 0.1), text: "#B91C1C", label: "Cancelled" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const normalised = normaliseStatus(status);
  const cfg = statusConfig[normalised] ?? statusConfig["Pending"];
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: "5px", px: 1.25, py: 0.4, borderRadius: "5px", bgcolor: cfg.bg }}>
      <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: cfg.text, flexShrink: 0 }} />
      <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: cfg.text, lineHeight: 1 }}>{cfg.label}</Typography>
    </Box>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const theme = useTheme();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const branchId = useAppSelector((s) => s.auth.currentUser?.branch_id);
  const firstName = useAppSelector((s) => s.auth.currentUser?.first_name) ?? "Admin";

  // Live KPI state
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<number>(0);
  const [activeOrders, setActiveOrders] = useState<number>(0);
  const [tables, setTables] = useState<{ total: number; occupied: number }>({ total: 0, occupied: 0 });
  const [kitchenStations, setKitchenStations] = useState<any[]>([]);
  const [topItems, setTopItems] = useState<{ name: string; orders: number; revenue: string }[]>([]);

  const fetchDashboard = useCallback(async () => {
    try {
      // Fetch recent orders
      const ordersRes = await getOrders({ limit: 6 });
      const orders: Order[] = ordersRes.data.data || [];
      setRecentOrders(
        orders.map((o, idx) => ({
          id: o.order_number || o.id || `order-${idx}`,  // always a unique key
          table: o.table?.table_number ? `T-${o.table.table_number}` : "Takeaway",
          items: o.items?.reduce((s, i) => s + i.quantity, 0) || 0,
          total: `$${Number(o.total_amount).toFixed(2)}`,
          status: normaliseStatus(o.status ?? "PENDING"),
          elapsed: Math.floor((Date.now() - new Date(o.created_at).getTime()) / 60000) + "m",
        }))
      );

      // Count active orders (PENDING / CONFIRMED / PREPARING)
      const activeRes = await getOrders({ status: "PENDING,CONFIRMED,PREPARING", limit: 200 });
      setActiveOrders((activeRes.data.data || []).length);

      // Revenue summary
      try {
        const revRes = await getRevenueSummary();
        setRevenue(revRes.data?.data?.todayRevenue ?? revRes.data?.data?.today_revenue ?? 0);
      } catch { /* analytics may not be seeded */ }

      // Tables
      if (branchId) {
        const tablesRes = await getTables({ branchId });
        const allTables = tablesRes.data.data || [];
        setTables({
          total: allTables.length,
          occupied: allTables.filter((t: any) => t.status === "OCCUPIED").length,
        });
      }

      // Kitchen load from active kitchen orders
      const kitchenRes = await getKitchenOrders({ status: "PENDING,PREPARING" });
      const kitchenOrders: any[] = kitchenRes.data.data || [];
      setKitchenStations([
        { station: "All Pending", queue: kitchenOrders.filter((o) => o.status === "PENDING").length, capacity: 10, color: "#EF4444", urgent: kitchenOrders.filter((o) => o.status === "PENDING").length > 6 },
        { station: "Preparing", queue: kitchenOrders.filter((o) => o.status === "PREPARING").length, capacity: 10, color: "#3B82F6", urgent: false },
      ]);

      // Derive top items from recent orders
      const itemMap: Record<string, { name: string; count: number; revenue: number }> = {};
      orders.forEach((o) => {
        (o.items || []).forEach((i) => {
          const key = i.menu_item_id;
          const name = (i as any).menuItem?.name ?? key;
          if (!itemMap[key]) itemMap[key] = { name, count: 0, revenue: 0 };
          itemMap[key].count += i.quantity;
          itemMap[key].revenue += i.unit_price * i.quantity;
        });
      });
      const sorted = Object.values(itemMap).sort((a, b) => b.count - a.count).slice(0, 4);
      setTopItems(sorted.map((it) => ({ name: it.name, orders: it.count, revenue: `$${it.revenue.toFixed(2)}` })));
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  }, [branchId]);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 15000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const stats: Omit<StatCardProps, "index">[] = [
    {
      title: "Revenue Today",
      value: `$${revenue.toLocaleString()}`,
      change: "live",
      positive: true,
      icon: <IconCurrencyDollar size={20} color="#D4A017" />,
      accent: "#D4A017",
    },
    {
      title: "Active Orders",
      value: activeOrders.toString(),
      change: "live",
      positive: true,
      icon: <IconShoppingCart size={20} color="#3B82F6" />,
      accent: "#3B82F6",
    },
    {
      title: "Tables Occupied",
      value: tables.total > 0 ? `${tables.occupied}/${tables.total}` : "—",
      change: tables.total > 0 ? `${Math.round((tables.occupied / tables.total) * 100)}%` : "—",
      positive: tables.occupied < tables.total,
      icon: <IconTable size={20} color="#10B981" />,
      accent: "#10B981",
      sub: `${tables.total - tables.occupied} available`,
    },
    {
      title: "Kitchen Queue",
      value: kitchenStations.reduce((s, st) => s + st.queue, 0).toString(),
      change: "live",
      positive: kitchenStations.reduce((s, st) => s + st.queue, 0) < 10,
      icon: <IconUsers size={20} color="#8B5CF6" />,
      accent: "#8B5CF6",
      sub: "Active kitchen tickets",
    },
  ];

  return (
    <PageContainer title="Dashboard" description="Restaurant Operations Overview">
      {/* ── Page Header ── */}
      <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible">
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ letterSpacing: "-0.02em" }}>
              {greeting}, {firstName}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              {" · "}Operations Dashboard
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh data">
              <IconButton
                size="small"
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: "6px",
                  color: "text.secondary",
                  "&:hover": { bgcolor: theme.palette.grey[100] },
                }}
              >
                <IconRefresh size={16} />
              </IconButton>
            </Tooltip>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                px: 1.5,
                py: 0.75,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "6px",
                bgcolor: "background.paper",
              }}
            >
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#10B981" }} />
              <Typography variant="caption" fontWeight={500} color="text.secondary">
                Live · Updated now
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </motion.div>

      {/* ── KPI Stats Row ── */}
      <Grid container spacing={2} mb={3}>
        {stats.map((stat, i) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={i}>
            <StatCard {...stat} index={i + 1} />
          </Grid>
        ))}
      </Grid>

      {/* ── Main Content Row ── */}
      <Grid container spacing={2}>
        {/* Recent Orders Table */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
            <Card
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "10px",
                boxShadow: "none",
                bgcolor: "background.paper",
              }}
            >
              <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                {/* Card Header */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={600} color="text.primary">
                      Recent Orders
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Live feed · {recentOrders.length} orders shown
                    </Typography>
                  </Box>
                  <IconButton size="small" sx={{ color: "text.secondary" }}>
                    <IconDots size={16} />
                  </IconButton>
                </Stack>

                {/* Column Headers */}
                <Box sx={{ px: 3, py: 1.25, bgcolor: theme.palette.grey[100], borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Grid container alignItems="center">
                    <Grid size={{ xs: 3 }}><Typography sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.secondary" }}>Order</Typography></Grid>
                    <Grid size={{ xs: 2 }}><Typography sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.secondary" }}>Table</Typography></Grid>
                    <Grid size={{ xs: 2 }}><Typography sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.secondary" }}>Items</Typography></Grid>
                    <Grid size={{ xs: 2 }}><Typography sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.secondary" }}>Total</Typography></Grid>
                    <Grid size={{ xs: 3 }}><Typography sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.secondary" }}>Status</Typography></Grid>
                  </Grid>
                </Box>

                {/* Rows */}
                <AnimatePresence>
                  {recentOrders.map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: i * 0.05 } }}
                    >
                      <Box
                        sx={{
                          px: 3,
                          py: 1.75,
                          borderBottom: i < recentOrders.length - 1 ? `1px solid ${theme.palette.divider}` : "none",
                          transition: "background 150ms ease",
                          "&:hover": { bgcolor: theme.palette.grey[100] },
                          cursor: "default",
                        }}
                      >
                        <Grid container alignItems="center">
                          <Grid size={{ xs: 3 }}>
                            <Stack direction="row" alignItems="center" spacing={1.25}>
                              <Box
                                sx={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: "6px",
                                  bgcolor: alpha("#D4A017", 0.1),
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <IconReceipt size={15} color="#D4A017" />
                              </Box>
                              <Typography variant="body2" fontWeight={600} color="text.primary">
                                {order.id}
                              </Typography>
                            </Stack>
                          </Grid>
                          <Grid size={{ xs: 2 }}>
                            <Typography variant="body2" color="text.secondary">{order.table}</Typography>
                          </Grid>
                          <Grid size={{ xs: 2 }}>
                            <Typography variant="body2" color="text.secondary">{order.items} items</Typography>
                          </Grid>
                          <Grid size={{ xs: 2 }}>
                            <Typography variant="body2" fontWeight={600} color="text.primary">{order.total}</Typography>
                          </Grid>
                          <Grid size={{ xs: 3 }}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <StatusBadge status={order.status} />
                              <Stack direction="row" alignItems="center" spacing={0.4}>
                                <IconClock size={11} color={theme.palette.text.secondary} />
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                                  {order.elapsed}
                                </Typography>
                              </Stack>
                            </Stack>
                          </Grid>
                        </Grid>
                      </Box>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Right Column */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={2} sx={{ height: "100%" }}>
            {/* Kitchen Load */}
            <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" style={{ flex: 1 }}>
              <Card
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: "10px",
                  boxShadow: "none",
                  bgcolor: "background.paper",
                }}
              >
                <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight={600} color="text.primary">
                        Kitchen Load
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Live station queue
                      </Typography>
                    </Box>
                    <IconToolsKitchen2 size={18} color={theme.palette.text.secondary} />
                  </Stack>
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={2.5}>
                      {kitchenStations.map((s) => (
                        <Box key={s.station}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              {s.urgent && (
                                <Tooltip title="High load — may cause delays">
                                  <IconAlertTriangle size={13} color="#EF4444" />
                                </Tooltip>
                              )}
                              <Typography variant="body2" fontWeight={500} color={s.urgent ? "error.main" : "text.primary"}>
                                {s.station}
                              </Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              {s.queue}/{s.capacity}
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={(s.queue / s.capacity) * 100}
                            sx={{
                              height: 5,
                              borderRadius: 3,
                              bgcolor: alpha(s.color, 0.12),
                              "& .MuiLinearProgress-bar": {
                                bgcolor: s.color,
                                borderRadius: 3,
                              },
                            }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Selling Items */}
            <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
              <Card
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: "10px",
                  boxShadow: "none",
                  bgcolor: "background.paper",
                }}
              >
                <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight={600} color="text.primary">
                        Top Sellers
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Today's performance
                      </Typography>
                    </Box>
                    <IconTrendingUp size={18} color={theme.palette.text.secondary} />
                  </Stack>
                  <Box>
                    {topItems.map((item, i) => (
                      <Box
                        key={item.name}
                        sx={{
                          px: 3,
                          py: 1.75,
                          borderBottom: i < topItems.length - 1 ? `1px solid ${theme.palette.divider}` : "none",
                          "&:hover": { bgcolor: theme.palette.grey[100] },
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                bgcolor: i === 0 ? alpha("#D4A017", 0.15) : theme.palette.grey[200],
                                color: i === 0 ? "#A67B10" : "text.secondary",
                              }}
                            >
                              {i + 1}
                            </Avatar>
                            <Typography variant="body2" fontWeight={500} color="text.primary">
                              {item.name}
                            </Typography>
                          </Stack>
                          <Stack alignItems="flex-end">
                            <Typography variant="body2" fontWeight={600} color="text.primary">
                              {item.revenue}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.orders} orders
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Stack>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Dashboard;
