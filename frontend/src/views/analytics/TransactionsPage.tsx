import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Card, CardContent, Typography, Stack, Button, useTheme,
  TextField, MenuItem, alpha, Drawer, IconButton, Divider,
  Grid, Avatar
} from "@mui/material";
import {
  IconReportMoney, IconReceipt, IconChartBar, IconSearch,
  IconDownload, IconX, IconReceipt2, IconBuildingStore,
  IconCash, IconCreditCard, IconFileTypePdf
} from "@tabler/icons-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import PageContainer from "@/components/container/PageContainer";
import { getOrders } from "@/api/_orders";
import type { Order } from "@/types/__restaurant";
import { toast } from "react-toastify";
import { renderStatusPill } from "../shared/DataTablePage"; 

export default function TransactionsPage() {
  const theme = useTheme();
  
  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL"); // ALL, TODAY, WEEK, MONTH

  // Drawer State
  const [selectedTx, setSelectedTx] = useState<Order | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Fetch all non-pending orders (typically completed transactions)
      const res = await getOrders({ limit: 1000 });
      const data = res.data.data || [];
      const validTx = data.filter(o => 
        o.status === "CLOSED" || o.status === "SERVED" || o.status === "COMPLETED" || (o.bills && o.bills.length > 0 && o.bills[0].status === "PAID")
      );
      setOrders(validTx);
    } catch (err) {
      toast.error("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  // --- Filtering Logic ---
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(o => {
        const orderNum = (o as any).bills?.[0]?.bill_number || o.id;
        const payMethod = (o as any).bills?.[0]?.transactions?.[0]?.payment_method || "UNKNOWN";
        return orderNum.toLowerCase().includes(lower) || 
          payMethod.toLowerCase().includes(lower) ||
          o.table?.name?.toLowerCase().includes(lower);
      });
    }

    if (paymentMethodFilter !== "ALL") {
      filtered = filtered.filter(o => {
        const payMethod = (o as any).bills?.[0]?.transactions?.[0]?.payment_method || "UNKNOWN";
        return payMethod === paymentMethodFilter;
      });
    }

    if (dateFilter !== "ALL") {
      const now = new Date();
      filtered = filtered.filter(o => {
        const txDate = new Date(o.created_at);
        if (dateFilter === "TODAY") {
          return txDate.toDateString() === now.toDateString();
        } else if (dateFilter === "WEEK") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return txDate >= weekAgo;
        } else if (dateFilter === "MONTH") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return txDate >= monthAgo;
        }
        return true;
      });
    }

    return filtered;
  }, [orders, searchTerm, paymentMethodFilter, dateFilter]);

  // --- KPIs ---
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalCount = filteredOrders.length;
  const avgOrderValue = totalCount > 0 ? totalRevenue / totalCount : 0;

  // --- DataGrid Columns ---
  const columns: GridColDef[] = [
    { field: "order_number", headerName: "Transaction ID", width: 140, 
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography variant="body2" fontWeight={600}>
            {(params.row as any).bills?.[0]?.bill_number || params.row.id.split('-')[0].toUpperCase()}
          </Typography>
        </Box>
      )
    },
    { field: "created_at", headerName: "Date", width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography variant="body2" color="text.secondary">
            {params.value ? new Date(params.value).toLocaleString() : "-"}
          </Typography>
        </Box>
      )
    },
    { field: "payment_method", headerName: "Payment Method", width: 150,
      renderCell: (params: GridRenderCellParams) => {
        const method = (params.row as any).bills?.[0]?.transactions?.[0]?.payment_method || "UNKNOWN";
        const isCash = method === "CASH";
        return (
          <Box display="flex" alignItems="center" height="100%">
            <Stack direction="row" alignItems="center" spacing={1}>
              {isCash ? <IconCash size={18} color={theme.palette.success.main} /> : <IconCreditCard size={18} color={theme.palette.info.main} />}
              <Typography variant="body2">{method}</Typography>
            </Stack>
          </Box>
        );
      }
    },
    { field: "status", headerName: "Order Status", width: 160,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center" height="100%">
          {renderStatusPill(params as any)}
        </Box>
      )
    },
    { field: "payment_status", headerName: "Payment Status", width: 160,
      renderCell: (params: GridRenderCellParams) => {
        const status = (params.row as any).bills?.[0]?.status || (params.row.status === "CLOSED" ? "PAID" : "PENDING");
        const isPaid = status === "PAID";
        const color = isPaid ? theme.palette.success.main : theme.palette.warning.main;
        return (
          <Box display="flex" alignItems="center" height="100%">
            <Box sx={{ 
              px: 1.5, py: 0.5, borderRadius: 1, fontSize: 12, fontWeight: 600,
              bgcolor: alpha(color, 0.1), color: color,
              display: "inline-block"
            }}>
              {status}
            </Box>
          </Box>
        );
      }
    },
    { field: "total_amount", headerName: "Amount", flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography fontWeight={700}>${Number(params.value || 0).toFixed(2)}</Typography>
        </Box>
      )
    },
    { field: "actions", headerName: "", width: 100, sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center" height="100%">
          <Button size="small" variant="contained" color="primary" sx={{ boxShadow: "none" }} onClick={() => setSelectedTx(params.row as Order)}>View</Button>
        </Box>
      )
    }
  ];

  // --- Export ---
  const handleExport = () => {
    const headers = ["Transaction #", "Date", "Payment Method", "Order Status", "Payment Status", "Amount"];
    
    const rows = filteredOrders.map(o => {
      const orderNum = (o as any).bills?.[0]?.bill_number || o.id;
      const payMethod = (o as any).bills?.[0]?.transactions?.[0]?.payment_method || "UNKNOWN";
      const payStatus = (o as any).bills?.[0]?.status || (o.status === "CLOSED" ? "PAID" : "PENDING");
      
      const rowData = [
        String(orderNum || "-"),
        o.created_at ? new Date(o.created_at).toLocaleString() : "-",
        String(payMethod || "-"),
        String(o.status || "-"),
        String(payStatus || "-"),
        `$${Number(o.total_amount || 0).toFixed(2)}`
      ];

      return rowData.map(val => `"${val.replace(/"/g, '""')}"`).join(",");
    });

    const csvContent = headers.join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CSV Export successful!");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Transactions Report", 14, 15);
    
    const tableColumn = ["Transaction #", "Date", "Payment Method", "Order Status", "Payment Status", "Amount"];
    const tableRows: any[] = [];
    
    filteredOrders.forEach(o => {
      const orderNum = (o as any).bills?.[0]?.bill_number || o.id;
      const payMethod = (o as any).bills?.[0]?.transactions?.[0]?.payment_method || "UNKNOWN";
      const payStatus = (o as any).bills?.[0]?.status || (o.status === "CLOSED" ? "PAID" : "PENDING");
      
      const rowData = [
        String(orderNum || "-"),
        o.created_at ? new Date(o.created_at).toLocaleString() : "-",
        String(payMethod || "-"),
        String(o.status || "-"),
        String(payStatus || "-"),
        `$${Number(o.total_amount || 0).toFixed(2)}`
      ];
      tableRows.push(rowData);
    });

    if (tableRows.length === 0) {
      doc.setFontSize(11);
      doc.text("No transactions found for the selected filters.", 14, 30);
    } else {
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });
    }
    
    doc.save(`transactions_export_${new Date().getTime()}.pdf`);
    toast.success("PDF Export successful!");
  };

  return (
    <PageContainer title="Transactions" description="Enterprise Financial Transactions">
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} mb={1}>Transactions Dashboard</Typography>
          <Typography color="text.secondary">Detailed payment history, analytics, and receipts.</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            startIcon={<IconDownload size={18} />}
            onClick={handleExport}
            sx={{ borderRadius: 2, px: 3, py: 1 }}
          >
            Export CSV
          </Button>
          <Button 
            variant="contained" 
            startIcon={<IconFileTypePdf size={18} />}
            onClick={handleExportPDF}
            sx={{ borderRadius: 2, px: 3, py: 1 }}
          >
            Export PDF
          </Button>
        </Stack>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.05), border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`, boxShadow: "none" }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.success.main, width: 48, height: 48 }}>
                  <IconReportMoney />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>Total Revenue</Typography>
                  <Typography variant="h4" fontWeight={800}>${totalRevenue.toFixed(2)}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, boxShadow: "none" }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 48, height: 48 }}>
                  <IconReceipt />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>Transactions</Typography>
                  <Typography variant="h4" fontWeight={800}>{totalCount}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.05), border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`, boxShadow: "none" }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.warning.main, width: 48, height: 48 }}>
                  <IconChartBar />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>Avg Transaction Value</Typography>
                  <Typography variant="h4" fontWeight={800}>${avgOrderValue.toFixed(2)}</Typography>
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
            placeholder="Search by Order # or Method..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <IconSearch size={18} style={{ marginRight: 8, color: theme.palette.text.secondary }} /> }}
            sx={{ minWidth: 250 }}
          />
          <TextField
            select
            size="small"
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="ALL">All Methods</MenuItem>
            <MenuItem value="CASH">Cash</MenuItem>
            <MenuItem value="CARD">Card</MenuItem>
            <MenuItem value="QR">QR / Mobile</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="ALL">All Time</MenuItem>
            <MenuItem value="TODAY">Today</MenuItem>
            <MenuItem value="WEEK">Last 7 Days</MenuItem>
            <MenuItem value="MONTH">Last 30 Days</MenuItem>
          </TextField>
        </Box>
        
        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={filteredOrders}
            columns={columns}
            loading={loading}
            rowHeight={60}
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
        open={Boolean(selectedTx)}
        onClose={() => setSelectedTx(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 450 }, p: 0 } }}
      >
        {selectedTx && (
          <Box height="100%" display="flex" flexDirection="column">
            <Box p={3} borderBottom={`1px solid ${theme.palette.divider}`} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={700}>Transaction Details</Typography>
              <IconButton onClick={() => setSelectedTx(null)} size="small">
                <IconX />
              </IconButton>
            </Box>
            
            <Box p={3} flex={1} overflow="auto">
              <Box mb={4} textAlign="center">
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: 64, height: 64, mx: "auto", mb: 2 }}>
                  <IconReceipt2 size={32} />
                </Avatar>
                <Typography variant="h4" fontWeight={800} color={theme.palette.success.main}>
                  ${Number(selectedTx.total_amount || 0).toFixed(2)}
                </Typography>
                <Typography color="text.secondary" variant="body2" mt={0.5}>
                  {(selectedTx as any).bills?.[0]?.status || (selectedTx.status === "CLOSED" ? "PAID" : "PENDING")} • {(selectedTx as any).bills?.[0]?.transactions?.[0]?.payment_method || "UNKNOWN"}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Stack spacing={2} mb={4}>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">Order #</Typography>
                  <Typography fontWeight={600}>
                    {(selectedTx as any).bills?.[0]?.bill_number || selectedTx.id.split('-')[0].toUpperCase()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">Date</Typography>
                  <Typography fontWeight={600}>{new Date(selectedTx.created_at).toLocaleString()}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">Order Type</Typography>
                  <Typography fontWeight={600}>{selectedTx.order_type}</Typography>
                </Box>
                {selectedTx.table && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography color="text.secondary">Table</Typography>
                    <Typography fontWeight={600}>{selectedTx.table.name}</Typography>
                  </Box>
                )}
              </Stack>

              <Typography variant="subtitle1" fontWeight={700} mb={2} display="flex" alignItems="center" gap={1}>
                <IconBuildingStore size={20} /> Order Items
              </Typography>
              
              <Box bgcolor={theme.palette.grey[50]} p={2} borderRadius={2} border={`1px solid ${theme.palette.divider}`}>
                {(selectedTx.items || []).map((item: any, idx: number) => (
                  <Box key={idx} display="flex" justifyContent="space-between" mb={1.5} sx={{ "&:last-child": { mb: 0 } }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{item.menuItem?.name || 'Unknown Item'}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.quantity}x @ ${Number(item.menuItem?.base_price || 0).toFixed(2)}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      ${Number(item.total_price || 0).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
                {(!selectedTx.items || selectedTx.items.length === 0) && (
                   <Typography variant="body2" color="text.secondary" fontStyle="italic">No items found.</Typography>
                )}
              </Box>
            </Box>
            
            <Box p={3} borderTop={`1px solid ${theme.palette.divider}`} bgcolor={theme.palette.grey[50]}>
              <Button variant="outlined" fullWidth onClick={() => setSelectedTx(null)}>Close</Button>
            </Box>
          </Box>
        )}
      </Drawer>
    </PageContainer>
  );
}
