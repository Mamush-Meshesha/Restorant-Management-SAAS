import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Card, CardContent, Typography, Stack, Button, useTheme,
  TextField, MenuItem, alpha, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Avatar, InputAdornment
} from "@mui/material";
import {
  IconReportMoney, IconReceipt, IconChartBar, IconSearch,
  IconPlus, IconWallet
} from "@tabler/icons-react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import PageContainer from "@/components/container/PageContainer";
import { getExpenses, createExpense, getExpenseCategories, createExpenseCategory } from "@/api/_analytics";
import { toast } from "react-toastify";

export default function ExpensesPage() {
  const theme = useTheme();

  // Data State
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL"); // ALL, TODAY, WEEK, MONTH

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category_id: "",
    reference: "",
    notes: ""
  });
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expRes, catRes] = await Promise.all([
        getExpenses(),
        getExpenseCategories()
      ]);
      setExpenses(expRes.data.data || []);
      setCategories(catRes.data.data || []);
    } catch (err) {
      toast.error("Failed to load expenses data.");
    } finally {
      setLoading(false);
    }
  };

  // --- Filtering Logic ---
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        o.notes?.toLowerCase().includes(lower) || 
        o.reference?.toLowerCase().includes(lower) ||
        o.category?.name?.toLowerCase().includes(lower)
      );
    }

    if (categoryFilter !== "ALL") {
      filtered = filtered.filter(o => o.category_id === categoryFilter);
    }

    if (dateFilter !== "ALL") {
      const now = new Date();
      filtered = filtered.filter(o => {
        const txDate = new Date(o.date);
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
  }, [expenses, searchTerm, categoryFilter, dateFilter]);

  // --- KPIs ---
  const totalExpenses = filteredExpenses.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const totalCount = filteredExpenses.length;
  const avgExpenseValue = totalCount > 0 ? totalExpenses / totalCount : 0;

  // --- Form Handling ---
  const handleSaveExpense = async () => {
    if (!formData.amount || !formData.date || (!formData.category_id && !isCreatingCategory)) {
      toast.error("Please fill in the required fields (Amount, Date, Category).");
      return;
    }

    try {
      let finalCategoryId = formData.category_id;
      
      if (isCreatingCategory) {
        if (!newCategoryName) {
          toast.error("Please provide a category name.");
          return;
        }
        const catRes = await createExpenseCategory({ name: newCategoryName });
        finalCategoryId = catRes.data.data.id;
      }

      await createExpense({
        amount: Number(formData.amount),
        date: formData.date,
        category_id: finalCategoryId,
        reference: formData.reference,
        notes: formData.notes
      });

      toast.success("Expense recorded successfully!");
      setDialogOpen(false);
      
      // Reset form
      setFormData({
        amount: "", date: new Date().toISOString().split("T")[0], 
        category_id: "", reference: "", notes: ""
      });
      setIsCreatingCategory(false);
      setNewCategoryName("");

      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create expense.");
    }
  };

  // --- DataGrid Columns ---
  const columns: GridColDef[] = [
    { field: "date", headerName: "Date", width: 140,
      valueFormatter: (v: any) => v ? new Date(v).toLocaleDateString() : "-"
    },
    { field: "category", headerName: "Category", width: 160,
      renderCell: (params: GridRenderCellParams) => {
        const cat = params.row.category?.name || "Unknown";
        return (
          <Box sx={{ 
            px: 1.5, py: 0.5, borderRadius: 1, fontSize: 12, fontWeight: 600,
            bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main,
            display: "inline-block"
          }}>
            {cat}
          </Box>
        );
      }
    },
    { field: "reference", headerName: "Reference", width: 180 },
    { field: "notes", headerName: "Notes", flex: 1 },
    { field: "amount", headerName: "Amount", width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Typography fontWeight={700} color="error.main">
          ${Number(params.value || 0).toFixed(2)}
        </Typography>
      )
    }
  ];

  return (
    <PageContainer title="Expenses" description="Enterprise Expenses Tracking">
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} mb={1}>Expenses Dashboard</Typography>
          <Typography color="text.secondary">Track your outgoing cash flow and overhead.</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<IconPlus size={18} />}
          onClick={() => setDialogOpen(true)}
          sx={{ borderRadius: 2, px: 3, py: 1 }}
        >
          Add Expense
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: alpha(theme.palette.error.main, 0.05), border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`, boxShadow: "none" }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.error.main, width: 48, height: 48 }}>
                  <IconWallet />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>Total Expenses</Typography>
                  <Typography variant="h4" fontWeight={800}>${totalExpenses.toFixed(2)}</Typography>
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
                  <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>Expense Count</Typography>
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
                  <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>Avg Expense Value</Typography>
                  <Typography variant="h4" fontWeight={800}>${avgExpenseValue.toFixed(2)}</Typography>
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
            placeholder="Search notes or ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <IconSearch size={18} style={{ marginRight: 8, color: theme.palette.text.secondary }} /> }}
            sx={{ minWidth: 250 }}
          />
          <TextField
            select
            size="small"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="ALL">All Categories</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
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
            rows={filteredExpenses}
            columns={columns}
            loading={loading}
            rowHeight={60}
            disableRowSelectionOnClick
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders": { bgcolor: theme.palette.grey[50] },
              "& .MuiDataGrid-cell:focus": { outline: "none" },
              "& .MuiDataGrid-row:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) }
            }}
          />
        </Box>
      </Card>

      {/* Add Expense Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Record Expense</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} mt={1}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  required
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  required
                  InputLabelProps={{ shrink: true }}
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </Grid>
            </Grid>

            <Box>
              <TextField
                select
                fullWidth
                label="Category"
                required
                value={isCreatingCategory ? "NEW" : formData.category_id}
                onChange={e => {
                  if (e.target.value === "NEW") {
                    setIsCreatingCategory(true);
                    setFormData({...formData, category_id: ""});
                  } else {
                    setIsCreatingCategory(false);
                    setFormData({...formData, category_id: e.target.value});
                  }
                }}
              >
                <MenuItem value="" disabled>Select a Category</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
                <MenuItem value="NEW" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                  + Create New Category
                </MenuItem>
              </TextField>
              {isCreatingCategory && (
                <TextField
                  fullWidth
                  size="small"
                  sx={{ mt: 2 }}
                  placeholder="e.g., Marketing, Legal, Repairs..."
                  label="New Category Name"
                  required
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                />
              )}
            </Box>

            <TextField
              fullWidth
              label="Reference #"
              placeholder="e.g., INV-1234, Receipt ID"
              value={formData.reference}
              onChange={e => setFormData({...formData, reference: e.target.value})}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleSaveExpense}>Save Expense</Button>
        </DialogActions>
      </Dialog>

    </PageContainer>
  );
}
