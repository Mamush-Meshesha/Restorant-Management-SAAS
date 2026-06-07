import { useState, useEffect, useCallback } from "react";
import {
  Box, Grid, Card, Typography, Stack, useTheme,
  Chip, Tooltip, alpha,
} from "@mui/material";
import { IconArmchair, IconCirclePlus } from "@tabler/icons-react";
import { motion } from "framer-motion";
import PageContainer from "../../components/container/PageContainer";
import { getTables } from "@/api/_tables";
import type { Table, TableStatus } from "@/types/__restaurant";
import { useAppSelector } from "@/hooks/auth";
import { toast } from "react-toastify";

// removed static tables

const statusCfg: Record<TableStatus, { bg: string; border: string; text: string; dot: string; label: string }> = {
  AVAILABLE: { bg: "#F0FDF4", border: "#BBF7D0", text: "#047857",  dot: "#10B981", label: "Available" },
  OCCUPIED:  { bg: "#FEF3C7", border: "#FDE68A", text: "#92400E",  dot: "#D97706", label: "Occupied" },
  RESERVED:  { bg: "#EFF6FF", border: "#BFDBFE", text: "#1E40AF",  dot: "#3B82F6", label: "Reserved" },
  CLEANING:  { bg: "#F5F3FF", border: "#DDD6FE", text: "#5B21B6",  dot: "#8B5CF6", label: "Cleaning" },
};

// removed static stats

export default function TablesFloor() {
  const theme = useTheme();
  const branchId = useAppSelector((state) => state.auth.currentUser?.branch_id);
  const [tables, setTables] = useState<Table[]>([]);
  const [, setLoading] = useState(true);
  const [filter, setFilter] = useState<TableStatus | "ALL">("ALL");
  const [selected, setSelected] = useState<string | null>(null);

  const fetchTables = useCallback(async () => {
    try {
      const { data } = await getTables(branchId ? { branchId } : {});
      setTables(data.data || []);
    } catch (error) {
      console.error("Failed to fetch tables:", error);
      toast.error("Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 15000);
    return () => clearInterval(interval);
  }, [fetchTables]);

  const stats = [
    { label: "Total Tables", value: tables.length.toString() },
    { label: "Occupied", value: `${tables.filter((t) => t.status === "OCCUPIED").length}` },
    { label: "Available", value: `${tables.filter((t) => t.status === "AVAILABLE").length}` },
    { label: "Reserved", value: `${tables.filter((t) => t.status === "RESERVED").length}` },
    { label: "Cleaning", value: `${tables.filter((t) => t.status === "CLEANING").length}` },
  ];

  const visible = filter === "ALL" ? tables : tables.filter((t) => t.status === filter);

  return (
    <PageContainer title="Table Management" description="Floor Plan & Table Status">
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: "-0.02em" }}>Floor Plan</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {tables.filter((t) => t.status === "OCCUPIED").length}/{tables.length} tables occupied · Live view
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {(["ALL", "AVAILABLE", "OCCUPIED", "RESERVED", "CLEANING"] as const).map((f) => (
            <Chip
              key={f}
              label={f === "ALL" ? "All" : statusCfg[f]?.label}
              size="small"
              onClick={() => setFilter(f)}
              sx={{
                borderRadius: "6px",
                fontWeight: 500,
                fontSize: "0.8rem",
                cursor: "pointer",
                bgcolor: filter === f
                  ? (f === "ALL" ? theme.palette.primary.main : statusCfg[f].border)
                  : theme.palette.grey[100],
                color: filter === f
                  ? (f === "ALL" ? "#fff" : statusCfg[f].text)
                  : theme.palette.text.secondary,
                border: "none",
                "&:hover": { opacity: 0.85 },
              }}
            />
          ))}
        </Stack>
      </Stack>

      {/* Summary Bar */}
      <Card sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: "10px", boxShadow: "none", mb: 2.5 }}>
        <Box sx={{ display: "flex", flexDirection: "row" }}>
          {stats.map((s, i) => (
            <Box
              key={s.label}
              sx={{
                flex: 1,
                px: 3,
                py: 1.75,
                borderRight: i < stats.length - 1 ? `1px solid ${theme.palette.divider}` : "none",
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em", color: "text.primary" }}>
                {s.value}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>
                {s.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>

      {/* Table Grid */}
      <Grid container spacing={1.5}>
        {visible.map((table, i) => {
          const cfg = statusCfg[table.status];
          const isSelected = selected === table.id;
          return (
            <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={table.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.025, duration: 0.15 }}
              >
                <Tooltip
                  title={
                    table.status === "OCCUPIED"
                      ? `Occupied`
                      : table.status === "RESERVED"
                      ? `Reserved`
                      : cfg.label
                  }
                  arrow
                >
                  <Card
                    onClick={() => setSelected(isSelected ? null : table.id)}
                    sx={{
                      border: `1.5px solid ${isSelected ? theme.palette.primary.main : cfg.border}`,
                      borderRadius: "10px",
                      boxShadow: "none",
                      bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.06) : cfg.bg,
                      cursor: "pointer",
                      transition: "all 150ms ease",
                      "&:hover": { borderColor: theme.palette.primary.main, transform: "translateY(-2px)" },
                    }}
                  >
                    <Box sx={{ p: 2 }}>
                      {/* Table ID + Status dot */}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                          {table.table_number}
                        </Typography>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: cfg.dot, mt: 0.4 }} />
                      </Stack>

                      {/* Capacity */}
                      <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
                        <IconArmchair size={12} color={theme.palette.text.secondary} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                          {table.capacity} seats
                        </Typography>
                      </Stack>

                      {/* Occupied info */}
                      {table.status === "OCCUPIED" && (
                        <Box sx={{ mt: 1, pt: 1, borderTop: `1px solid ${cfg.border}` }}>
                          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: cfg.text, mt: 0.5 }}>
                            Occupied
                          </Typography>
                        </Box>
                      )}

                      {(table.status === "RESERVED") && (
                        <Box sx={{ mt: 1, pt: 1, borderTop: `1px solid ${cfg.border}` }}>
                          <Typography sx={{ fontSize: "0.7rem", color: cfg.text, fontWeight: 600 }}>
                            Reserved
                          </Typography>
                        </Box>
                      )}

                      {table.status === "AVAILABLE" && (
                        <Box sx={{ mt: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <IconCirclePlus size={12} color={cfg.text} />
                            <Typography sx={{ fontSize: "0.7rem", color: cfg.text, fontWeight: 500 }}>
                              Seat guests
                            </Typography>
                          </Stack>
                        </Box>
                      )}

                      {table.status === "CLEANING" && (
                        <Box sx={{ mt: 1, pt: 1, borderTop: `1px solid ${cfg.border}` }}>
                          <Typography sx={{ fontSize: "0.7rem", color: cfg.text, fontWeight: 500 }}>
                            Being cleaned
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Card>
                </Tooltip>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
    </PageContainer>
  );
}
