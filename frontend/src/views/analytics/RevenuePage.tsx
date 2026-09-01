import { useState, useEffect, useCallback } from "react";
import {
  Box, Card, CardContent, Typography, Stack, Button, useTheme,
  Grid, Avatar, alpha, ToggleButtonGroup, ToggleButton, Divider, Chip
} from "@mui/material";
import {
  IconTrendingUp, IconReceipt, IconCurrencyDollar, IconShoppingCart,
  IconArrowUpRight, IconArrowDownRight, IconRefresh
} from "@tabler/icons-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";
import PageContainer from "@/components/container/PageContainer";
import { getRevenueSummary, getDailyRevenue, getExpenses } from "@/api/_analytics";
import { toast } from "react-toastify";

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  const theme = useTheme();
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      bgcolor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2, p: 2, boxShadow: theme.shadows[8]
    }}>
      <Typography variant="caption" color="text.secondary" mb={1} display="block">{label}</Typography>
      {payload.map((entry: any, i: number) => (
        <Typography key={i} variant="body2" fontWeight={600} color={entry.color}>
          {entry.name}: ${Number(entry.value).toFixed(2)}
        </Typography>
      ))}
    </Box>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ title, value, icon: Icon, color, change, subtitle }: any) => {
  const theme = useTheme();
  const isPositive = change >= 0;
  return (
    <Card sx={{
      height: "100%", bgcolor: alpha(color, 0.05),
      border: `1px solid ${alpha(color, 0.2)}`, boxShadow: "none",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": { transform: "translateY(-2px)", boxShadow: theme.shadows[4] }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Avatar sx={{ bgcolor: color, width: 44, height: 44 }}>
            <Icon size={22} />
          </Avatar>
          {change !== undefined && (
            <Chip
              icon={isPositive ? <IconArrowUpRight size={14} /> : <IconArrowDownRight size={14} />}
              label={`${isPositive ? "+" : ""}${change?.toFixed(1)}%`}
              size="small"
              sx={{
                bgcolor: alpha(isPositive ? theme.palette.success.main : theme.palette.error.main, 0.1),
                color: isPositive ? theme.palette.success.main : theme.palette.error.main,
                fontWeight: 700, fontSize: 11,
                "& .MuiChip-icon": { color: "inherit" }
              }}
            />
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.8} mb={0.5}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={800} mb={subtitle ? 0.5 : 0}>{value}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </CardContent>
    </Card>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function RevenuePage() {
  const theme = useTheme();

  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");
  const [summary, setSummary] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [, setLoading] = useState(true);

  const getDateParams = useCallback(() => {
    const now = new Date();
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return {
      from: from.toISOString().split("T")[0],
      to: now.toISOString().split("T")[0]
    };
  }, [dateRange]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = getDateParams();
    try {
      const [summaryRes, dailyRes, expRes] = await Promise.all([
        getRevenueSummary(),
        getDailyRevenue(params),
        getExpenses()
      ]);

      setSummary(summaryRes.data.data);

      // Build daily chart data
      const daily = (dailyRes.data.data || []).map((r: any) => ({
        date: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: r.total_revenue || 0,
        expenses: 0,
        profit: r.total_revenue || 0
      }));
      setDailyData(daily);

      // Aggregate expenses by category for pie chart
      const expenses = expRes.data.data || [];
      const catMap: Record<string, number> = {};
      expenses.forEach((e: any) => {
        const cat = e.category?.name || "Other";
        catMap[cat] = (catMap[cat] || 0) + Number(e.amount);
      });
      setExpenseData(Object.entries(catMap).map(([name, value]) => ({ name, value })));
    } catch {
      toast.error("Failed to load revenue data.");
    } finally {
      setLoading(false);
    }
  }, [getDateParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const grossRevenue = summary?.gross_revenue || 0;
  const netProfit = summary?.net_profit || 0;
  const totalExpenses = summary?.total_expenses || 0;
  const orderCount = summary?.order_count || 0;
  const avgOrderValue = orderCount > 0 ? grossRevenue / orderCount : 0;

  const PIE_COLORS = [
    theme.palette.primary.main, theme.palette.warning.main,
    theme.palette.error.main, theme.palette.success.main,
    theme.palette.info.main, theme.palette.secondary.main
  ];

  return (
    <PageContainer title="Revenue Analytics" description="Enterprise Revenue Dashboard">
      {/* ── Header ── */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} mb={0.5}>Revenue Analytics</Typography>
          <Typography color="text.secondary">Financial performance overview and trends.</Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <ToggleButtonGroup
            value={dateRange}
            exclusive
            onChange={(_, val) => val && setDateRange(val)}
            size="small"
            sx={{ "& .MuiToggleButton-root": { px: 2, fontWeight: 600 } }}
          >
            <ToggleButton value="7d">7D</ToggleButton>
            <ToggleButton value="30d">30D</ToggleButton>
            <ToggleButton value="90d">90D</ToggleButton>
          </ToggleButtonGroup>
          <Button
            startIcon={<IconRefresh size={18} />}
            onClick={fetchData}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* ── KPI Cards ── */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} >
          <KpiCard
            title="Gross Revenue"
            value={`$${grossRevenue.toFixed(2)}`}
            icon={IconTrendingUp}
            color={theme.palette.success.main}
            subtitle={`${orderCount} orders`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} >
          <KpiCard
            title="Net Profit"
            value={`$${netProfit.toFixed(2)}`}
            icon={IconCurrencyDollar}
            color={netProfit >= 0 ? theme.palette.primary.main : theme.palette.error.main}
            subtitle="Revenue minus expenses"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} >
          <KpiCard
            title="Total Expenses"
            value={`$${totalExpenses.toFixed(2)}`}
            icon={IconReceipt}
            color={theme.palette.warning.main}
            subtitle="Logged expense costs"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} >
          <KpiCard
            title="Avg Order Value"
            value={`$${avgOrderValue.toFixed(2)}`}
            icon={IconShoppingCart}
            color={theme.palette.info.main}
            subtitle={`${orderCount} total orders`}
          />
        </Grid>
      </Grid>

      {/* ── Profit Overview Strip ── */}
      <Card sx={{
        mb: 4, p: 3, boxShadow: "none",
        border: `1px solid ${theme.palette.divider}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.success.main, 0.05)})`
      }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems={{ md: "center" }}>
          <Box flex={1}>
            <Typography variant="overline" color="text.secondary" letterSpacing={1}>Profit Margin</Typography>
            <Typography variant="h3" fontWeight={800} color={netProfit >= 0 ? "success.main" : "error.main"}>
              {grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : 0}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Net profit margin over selected period
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Stack direction="row" spacing={4} flex={2}>
            {[
              { label: "Revenue", value: `$${grossRevenue.toFixed(2)}`, color: theme.palette.success.main },
              { label: "Expenses", value: `$${totalExpenses.toFixed(2)}`, color: theme.palette.error.main },
              { label: "Net", value: `$${netProfit.toFixed(2)}`, color: netProfit >= 0 ? theme.palette.primary.main : theme.palette.error.main },
            ].map((item) => (
              <Box key={item.label} textAlign="center">
                <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>{item.label}</Typography>
                <Typography variant="h6" fontWeight={800} color={item.color}>{item.value}</Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Card>

      <Grid container spacing={3} mb={4}>
        {/* ── Revenue Area Chart ── */}
        <Grid size={{ xs: 12, md: 8 }} >
          <Card sx={{ height: "100%", border: `1px solid ${theme.palette.divider}`, boxShadow: "none" }}>
            <CardContent sx={{ p: 3 }}>
              <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" fontWeight={700}>Revenue Trend</Typography>
                  <Typography variant="body2" color="text.secondary">Daily revenue over the selected period</Typography>
                </Box>
              </Box>
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke={theme.palette.success.main} strokeWidth={2.5} fill="url(#revenueGradient)" dot={false} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Box height={280} display="flex" alignItems="center" justifyContent="center" flexDirection="column" gap={1}>
                  <IconTrendingUp size={48} color={theme.palette.text.disabled} />
                  <Typography color="text.disabled" variant="body2">
                    No daily revenue data available yet.
                  </Typography>
                  <Typography color="text.disabled" variant="caption">
                    Revenue reports are generated automatically as orders are completed.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Expense Breakdown Pie ── */}
        <Grid size={{ xs: 12, md: 4 }} >
          <Card sx={{ height: "100%", border: `1px solid ${theme.palette.divider}`, boxShadow: "none" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={0.5}>Expense Breakdown</Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>Costs by category</Typography>
              {expenseData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={expenseData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                        {expenseData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: any) => [`$${Number(val).toFixed(2)}`]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Stack spacing={1} mt={2}>
                    {expenseData.map((entry, index) => (
                      <Stack key={entry.name} direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: PIE_COLORS[index % PIE_COLORS.length] }} />
                          <Typography variant="body2">{entry.name}</Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight={600}>${entry.value.toFixed(2)}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </>
              ) : (
                <Box height={240} display="flex" alignItems="center" justifyContent="center" flexDirection="column" gap={1}>
                  <IconReceipt size={36} color={theme.palette.text.disabled} />
                  <Typography color="text.disabled" variant="body2" textAlign="center">
                    No expenses logged yet.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Revenue vs Expenses Bar Chart ── */}
      <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: "none" }}>
        <CardContent sx={{ p: 3 }}>
          <Box mb={3}>
            <Typography variant="h6" fontWeight={700}>Revenue vs Expenses</Typography>
            <Typography variant="body2" color="text.secondary">Comparative view of income and outgoings</Typography>
          </Box>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dailyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13 }} />
                <Bar dataKey="revenue" name="Revenue" fill={theme.palette.success.main} radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expenses" name="Expenses" fill={theme.palette.error.main} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Box height={260} display="flex" alignItems="center" justifyContent="center" flexDirection="column" gap={1}>
              <Typography color="text.disabled" variant="body2">
                Complete some orders to see revenue vs expense comparison.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
