import { useState, useEffect, useMemo } from "react";
import {
  Box, Card, CardContent, Typography, Stack, Button, useTheme,
  TextField, MenuItem, alpha, Drawer, IconButton, Divider,
  Grid, Avatar, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import {
  IconCalendarEvent, IconUsers, IconCheck, IconX,
  IconSearch, IconPhone, IconArmchair, IconTrash
} from "@tabler/icons-react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import PageContainer from "@/components/container/PageContainer";
import { getReservations, createReservation, updateReservationStatus, deleteReservation } from "@/api/_reservations";
import { getTables } from "@/api/_tables";
import { toast } from "react-toastify";
import dayjs from "dayjs";

export default function ReservationsPage() {
  const theme = useTheme();

  // Data State
  const [reservations, setReservations] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Drawer / Modal State
  const [selectedRes, setSelectedRes] = useState<any | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    guest_count: 2,
    reservation_time: dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
    table_id: "",
    special_requests: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getReservations({ date: dateFilter });
      setReservations(res.data.data || []);
      const tablesRes = await getTables();
      setTables(tablesRes.data.data || []);
    } catch (error) {
      toast.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateFilter]);

  const handleCreate = async () => {
    try {
      if (!formData.customer_name || !formData.table_id) return toast.error("Name and Table are required");
      await createReservation({
        ...formData,
        reservation_time: new Date(formData.reservation_time).toISOString(),
      });
      toast.success("Reservation created!");
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create reservation");
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateReservationStatus(id, status);
      toast.success(`Reservation marked as ${status}`);
      if (selectedRes && selectedRes.id === id) {
        setSelectedRes({ ...selectedRes, status });
      }
      fetchData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to completely delete this reservation?")) return;
    try {
      await deleteReservation(id);
      toast.success("Reservation deleted");
      setSelectedRes(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  // --- Filtering Logic ---
  const filteredReservations = useMemo(() => {
    let filtered = [...reservations];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        (r.customer_name || "").toLowerCase().includes(lower) || 
        (r.customer_phone || "").toLowerCase().includes(lower)
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    return filtered;
  }, [reservations, searchTerm, statusFilter]);

  // --- KPIs ---
  const totalCount = filteredReservations.length;
  const seatedCount = filteredReservations.filter(r => r.status === 'SEATED').length;
  const pendingCount = filteredReservations.filter(r => r.status === 'PENDING').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED": return theme.palette.success.main;
      case "PENDING": return theme.palette.warning.main;
      case "PENDING_PAYMENT": return theme.palette.warning.main;
      case "SEATED": return theme.palette.info.main;
      case "CANCELLED": return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const availableTables = tables.filter(t => t.capacity >= formData.guest_count);

  const columns: GridColDef[] = [
    { field: "customer_name", headerName: "Customer", width: 220,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center" height="100%">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: 36, height: 36, fontWeight: 700 }}>
              {(params.value as string)?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>{params.value}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>{params.row.customer_phone || "No phone"}</Typography>
            </Box>
          </Stack>
        </Box>
      )
    },
    { field: "reservation_time", headerName: "Time", width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography variant="body2" fontWeight={600}>
            {dayjs(params.value).format('h:mm A')}
          </Typography>
        </Box>
      )
    },
    { field: "guest_count", headerName: "Guests", width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center" height="100%">
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconUsers size={16} color={theme.palette.text.secondary} />
            <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
          </Stack>
        </Box>
      )
    },
    { field: "table", headerName: "Table", width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography variant="body2" fontWeight={600}>
            {params.row.table?.name || params.row.table?.table_number || "Unassigned"}
          </Typography>
        </Box>
      )
    },
    { field: "status", headerName: "Status", width: 140,
      renderCell: (params: GridRenderCellParams) => {
        const color = getStatusColor(params.value);
        return (
          <Box display="flex" alignItems="center" height="100%">
            <Box sx={{ 
              px: 1.5, py: 0.5, borderRadius: 1, fontSize: 12, fontWeight: 700,
              bgcolor: alpha(color, 0.1), color: color,
              display: "inline-block"
            }}>
              {params.value}
            </Box>
          </Box>
        );
      }
    },
    { field: "actions", headerName: "Action", flex: 1, sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center" height="100%">
          <Button size="small" variant="contained" color="primary" sx={{ boxShadow: "none" }} onClick={() => setSelectedRes(params.row)}>
            Manage
          </Button>
        </Box>
      )
    }
  ];

  return (
    <PageContainer title="Reservations" description="Enterprise Bookings & Tables">
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} mb={1}>Reservations</Typography>
          <Typography color="text.secondary">Manage customer bookings and seating operations.</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <TextField
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            size="small"
            sx={{ width: 180, bgcolor: 'background.paper' }}
          />
          <Button 
            variant="contained" 
            startIcon={<IconCalendarEvent size={18} />}
            onClick={() => setModalOpen(true)}
            sx={{ borderRadius: 2, px: 3, py: 1 }}
          >
            New Reservation
          </Button>
        </Stack>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, md: 4 }} >
          <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, boxShadow: "none" }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 48, height: 48 }}>
                  <IconCalendarEvent />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>Total Bookings</Typography>
                  <Typography variant="h4" fontWeight={800}>{totalCount}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} >
          <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.05), border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`, boxShadow: "none" }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.info.main, width: 48, height: 48 }}>
                  <IconArmchair />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>Seated Guests</Typography>
                  <Typography variant="h4" fontWeight={800}>{seatedCount}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} >
          <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.05), border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`, boxShadow: "none" }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.warning.main, width: 48, height: 48 }}>
                  <IconUsers />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>Pending Arrivals</Typography>
                  <Typography variant="h4" fontWeight={800}>{pendingCount}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters & Table Card */}
      <Card sx={{ p: 0, overflow: "hidden", border: `1px solid ${theme.palette.divider}`, boxShadow: theme.shadows[2] }}>
        <Box p={3} borderBottom={`1px solid ${theme.palette.divider}`} display="flex" gap={2} flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <IconSearch size={18} style={{ marginRight: 8, color: theme.palette.text.secondary }} /> }}
            sx={{ minWidth: 250 }}
          />
          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="CONFIRMED">Confirmed</MenuItem>
            <MenuItem value="SEATED">Seated</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </TextField>
        </Box>
        
        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={filteredReservations}
            columns={columns}
            loading={loading}
            rowHeight={64}
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders": { bgcolor: theme.palette.grey[50] },
              "& .MuiDataGrid-cell:focus": { outline: "none" },
              "& .MuiDataGrid-row:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) }
            }}
          />
        </Box>
      </Card>

      {/* Details Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedRes)}
        onClose={() => setSelectedRes(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 450 }, p: 0 } }}
      >
        {selectedRes && (
          <Box height="100%" display="flex" flexDirection="column">
            <Box p={3} borderBottom={`1px solid ${theme.palette.divider}`} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={700}>Reservation Details</Typography>
              <IconButton onClick={() => setSelectedRes(null)} size="small">
                <IconX />
              </IconButton>
            </Box>
            
            <Box p={3} flex={1} overflow="auto">
              <Box mb={4} textAlign="center">
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: 80, height: 80, mx: "auto", mb: 2, fontSize: 32, fontWeight: 800 }}>
                  {selectedRes.customer_name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Typography variant="h4" fontWeight={800}>{selectedRes.customer_name}</Typography>
                <Box mt={1} display="inline-block" px={2} py={0.5} borderRadius={1} sx={{ bgcolor: alpha(getStatusColor(selectedRes.status), 0.1), color: getStatusColor(selectedRes.status), fontWeight: 700, fontSize: 13 }}>
                  {selectedRes.status}
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Stack spacing={2.5} mb={4}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: theme.palette.grey[100], color: theme.palette.text.primary }}>
                    <IconPhone size={20} />
                  </Avatar>
                  <Box>
                    <Typography color="text.secondary" variant="caption">Phone Number</Typography>
                    <Typography fontWeight={600}>{selectedRes.customer_phone || "Not provided"}</Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: theme.palette.grey[100], color: theme.palette.text.primary }}>
                    <IconCalendarEvent size={20} />
                  </Avatar>
                  <Box>
                    <Typography color="text.secondary" variant="caption">Date & Time</Typography>
                    <Typography fontWeight={600}>{dayjs(selectedRes.reservation_time).format('MMMM D, YYYY [at] h:mm A')}</Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: theme.palette.grey[100], color: theme.palette.text.primary }}>
                    <IconUsers size={20} />
                  </Avatar>
                  <Box>
                    <Typography color="text.secondary" variant="caption">Guest Count</Typography>
                    <Typography fontWeight={600}>{selectedRes.guest_count} People</Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: theme.palette.grey[100], color: theme.palette.text.primary }}>
                    <IconArmchair size={20} />
                  </Avatar>
                  <Box>
                    <Typography color="text.secondary" variant="caption">Assigned Table</Typography>
                    <Typography fontWeight={600}>{selectedRes.table?.name || selectedRes.table?.table_number || "Unassigned"}</Typography>
                  </Box>
                </Box>
              </Stack>

              {selectedRes.special_requests && (
                <Box bgcolor={theme.palette.grey[50]} p={2} borderRadius={2} border={`1px solid ${theme.palette.divider}`} mb={4}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">Special Requests</Typography>
                  <Typography variant="body2" mt={1}>{selectedRes.special_requests}</Typography>
                </Box>
              )}

              <Typography variant="h6" fontWeight={700} mb={2}>Actions</Typography>
              <Grid container spacing={2}>
                {selectedRes.status === 'PENDING' && (
                  <Grid size={{ xs: 12 }} >
                    <Button variant="contained" color="success" fullWidth startIcon={<IconCheck size={18} />} onClick={() => handleStatusChange(selectedRes.id, 'CONFIRMED')} sx={{ py: 1.5 }}>
                      Confirm Booking
                    </Button>
                  </Grid>
                )}
                {selectedRes.status === 'CONFIRMED' && (
                  <Grid size={{ xs: 12 }} >
                    <Button variant="contained" color="info" fullWidth startIcon={<IconArmchair size={18} />} onClick={() => handleStatusChange(selectedRes.id, 'SEATED')} sx={{ py: 1.5 }}>
                      Seat Guests
                    </Button>
                  </Grid>
                )}
                {selectedRes.status !== 'CANCELLED' && selectedRes.status !== 'SEATED' && (
                  <Grid size={{ xs: 6 }} >
                    <Button variant="outlined" color="error" fullWidth onClick={() => handleStatusChange(selectedRes.id, 'CANCELLED')} sx={{ py: 1.5 }}>
                      Cancel
                    </Button>
                  </Grid>
                )}
                <Grid size={{ xs: selectedRes.status === 'CANCELLED' || selectedRes.status === 'SEATED' ? 12 : 6 }}>
                  <Button variant="outlined" color="error" fullWidth onClick={() => handleDelete(selectedRes.id)} startIcon={<IconTrash size={18} />} sx={{ py: 1.5 }}>
                    Delete
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
      </Drawer>

      <Dialog open={isModalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>New Reservation</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3} pt={1}>
            <TextField label="Customer Name" fullWidth value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} />
            <TextField label="Phone Number" fullWidth value={formData.customer_phone} onChange={e => setFormData({...formData, customer_phone: e.target.value})} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }} >
                <TextField label="Date & Time" type="datetime-local" fullWidth value={formData.reservation_time} onChange={e => setFormData({...formData, reservation_time: e.target.value})} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid size={{ xs: 6 }} >
                <TextField label="Guest Count" type="number" fullWidth value={formData.guest_count} onChange={e => setFormData({...formData, guest_count: parseInt(e.target.value)})} />
              </Grid>
            </Grid>
            <TextField select label="Assign Table" fullWidth value={formData.table_id} onChange={e => setFormData({...formData, table_id: e.target.value})} helperText="Only shows tables with enough capacity">
              {availableTables.map(t => (
                <MenuItem key={t.id} value={t.id}>Table {t.name || t.table_number} (Cap: {t.capacity}) - {t.status}</MenuItem>
              ))}
            </TextField>
            <TextField label="Special Requests" multiline rows={3} fullWidth value={formData.special_requests} onChange={e => setFormData({...formData, special_requests: e.target.value})} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create Booking</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
