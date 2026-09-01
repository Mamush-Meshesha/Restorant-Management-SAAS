import React, { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, Stack, Button, useTheme, alpha,
  TextField, InputAdornment, IconButton, Grid, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip
} from "@mui/material";
import {
  IconSearch, IconUserPlus, IconUsers, IconTrophy, IconStar,
  IconDotsVertical, IconMail, IconPhone, IconEye, IconEdit
} from "@tabler/icons-react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
import { getCustomers, createCustomer, updateCustomer } from "@/api/_customer";
import { toast } from "react-toastify";

export default function CustomersPage() {
  const theme = useTheme();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [editFormData, setEditFormData] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await getCustomers();
      setCustomers(res.data?.data || []);
    } catch (err) {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.phone) {
      toast.error("Name and Phone are required.");
      return;
    }
    try {
      setSubmitting(true);
      await createCustomer(formData);
      toast.success("Customer created successfully");
      setOpenDialog(false);
      setFormData({ name: "", email: "", phone: "" });
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create customer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editFormData.name || !editFormData.phone) {
      toast.error("Name and Phone are required.");
      return;
    }
    try {
      setSubmitting(true);
      await updateCustomer(selectedCustomer.id, editFormData);
      toast.success("Customer updated successfully");
      setEditDialog(false);
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update customer");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter(c => 
    (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || "").includes(searchTerm)
  );

  // KPIs
  const totalCustomers = customers.length;
  const totalPoints = customers.reduce((sum, c) => sum + (Number(c.loyalty_points) || 0), 0);
  const recentCustomers = customers.filter(c => {
    const date = new Date(c.created_at);
    const now = new Date();
    return (now.getTime() - date.getTime()) / (1000 * 3600 * 24) < 30;
  }).length;

  const kpis = [
    { title: "Total Customers", value: totalCustomers, icon: IconUsers, color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.1) },
    { title: "New This Month", value: recentCustomers, icon: IconUserPlus, color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1) },
    { title: "Total Loyalty Points", value: totalPoints, icon: IconTrophy, color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.1) },
  ];

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Customer",
      flex: 1.5,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => {
        const initials = (params.row.name || "U").substring(0, 2).toUpperCase();
        return (
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 36, height: 36, fontSize: '1rem', fontWeight: 600 }}>
              {initials}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} noWrap>{params.row.name}</Typography>
              <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                <IconMail size={12} /> {params.row.email || "No Email"}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: "phone",
      headerName: "Phone Number",
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" display="flex" alignItems="center" gap={1}>
          <IconPhone size={14} color={theme.palette.text.secondary} />
          {params.value}
        </Typography>
      )
    },
    {
      field: "loyalty_points",
      headerName: "Loyalty Points",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          icon={<IconStar size={14} />} 
          label={`${params.value || 0} pts`}
          size="small"
          sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.dark }}
        />
      )
    },
    {
      field: "tier",
      headerName: "Tier",
      width: 130,
      renderCell: (params: GridRenderCellParams) => {
        const tierName = params.row.tier?.name || "Standard";
        let color = theme.palette.grey[500];
        if (tierName.toLowerCase() === "gold") color = theme.palette.warning.main;
        if (tierName.toLowerCase() === "silver") color = "#C0C0C0";
        if (tierName.toLowerCase() === "platinum") color = theme.palette.info.main;
        
        return (
          <Typography variant="body2" fontWeight={700} sx={{ color }}>
            {tierName}
          </Typography>
        );
      }
    },
    {
      field: "created_at",
      headerName: "Joined Date",
      width: 150,
      valueFormatter: (value: any) => new Date(value).toLocaleDateString(),
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        return <CustomerActionMenu 
          customer={params.row} 
          onView={() => {
            setSelectedCustomer(params.row);
            setViewDialog(true);
          }}
          onEdit={() => {
            setSelectedCustomer(params.row);
            setEditFormData({
              name: params.row.name || "",
              email: params.row.email || "",
              phone: params.row.phone || ""
            });
            setEditDialog(true);
          }}
        />;
      },
    },
  ];

  return (
    <PageContainer title="Customers Directory" description="Manage your restaurant customers">
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        
        {/* Header Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight={800} mb={0.5}>Customer Directory</Typography>
            <Typography color="text.secondary">View and manage your customer relationships and loyalty.</Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<IconUserPlus size={18} />}
            sx={{ px: 3, py: 1, borderRadius: 2, boxShadow: theme.shadows[4] }}
            onClick={() => setOpenDialog(true)}
          >
            Add Customer
          </Button>
        </Box>

        {/* KPIs */}
        <Grid container spacing={3} mb={4}>
          {kpis.map((kpi, idx) => (
            <Grid item xs={12} sm={4} key={idx}>
              <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[1], border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: kpi.bg, color: kpi.color, width: 56, height: 56, borderRadius: 2 }}>
                    <kpi.icon size={28} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase">
                      {kpi.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={800}>
                      {kpi.value}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* DataGrid Section */}
        <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2], border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
          
          <Box p={3} borderBottom={`1px solid ${theme.palette.divider}`} display="flex" justifyContent="space-between" alignItems="center">
            <TextField
              size="small"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><IconSearch size={18} /></InputAdornment>
              }}
              sx={{ width: { xs: '100%', sm: 350 }, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>

          <Box sx={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={filteredCustomers}
              columns={columns}
              loading={loading}
              rowHeight={70}
              disableRowSelectionOnClick
              hideFooterSelectedRowCount
              sx={{
                border: 0,
                "& .MuiDataGrid-columnHeaders": { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                "& .MuiDataGrid-cell:focus": { outline: "none" },
                "& .MuiDataGrid-row:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) }
              }}
            />
          </Box>
        </Card>

      </Box>

      {/* Add Customer Dialog */}
      <Dialog open={openDialog} onClose={() => !submitting && setOpenDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Add New Customer</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Enter the customer's details to register them for loyalty and tracking.
          </Typography>
          <Stack spacing={3}>
            <TextField
              label="Full Name"
              required
              fullWidth
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
            />
            <TextField
              label="Phone Number"
              required
              fullWidth
              placeholder="+1 234 567 890"
              value={formData.phone}
              onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
            />
            <TextField
              label="Email Address"
              fullWidth
              placeholder="john@example.com"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
              helperText="Optional, but required for them to log into the app."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} disabled={submitting}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={submitting}>
            {submitting ? "Saving..." : "Create Customer"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* View Customer Details Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Customer Details
          {selectedCustomer?.tier?.name && (
            <Chip label={selectedCustomer.tier.name} color="primary" size="small" />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {selectedCustomer && (
            <Stack spacing={3}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 64, height: 64, fontSize: '1.5rem', fontWeight: 600 }}>
                  {(selectedCustomer.name || "U").substring(0, 2).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{selectedCustomer.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Joined {new Date(selectedCustomer.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>PHONE NUMBER</Typography>
                  <Typography variant="body1" display="flex" alignItems="center" gap={1}>
                    <IconPhone size={16} /> {selectedCustomer.phone || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>EMAIL ADDRESS</Typography>
                  <Typography variant="body1" display="flex" alignItems="center" gap={1}>
                    <IconMail size={16} /> {selectedCustomer.email || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>LOYALTY POINTS</Typography>
                  <Typography variant="body1" display="flex" alignItems="center" gap={1}>
                    <IconStar size={16} color={theme.palette.warning.main} /> {selectedCustomer.loyalty_points || 0} pts
                  </Typography>
                </Grid>
              </Grid>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setViewDialog(false)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={editDialog} onClose={() => !submitting && setEditDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Edit Customer Details</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} mt={1}>
            <TextField
              label="Full Name"
              required
              fullWidth
              value={editFormData.name}
              onChange={(e) => setEditFormData(p => ({ ...p, name: e.target.value }))}
            />
            <TextField
              label="Phone Number"
              required
              fullWidth
              value={editFormData.phone}
              onChange={(e) => setEditFormData(p => ({ ...p, phone: e.target.value }))}
            />
            <TextField
              label="Email Address"
              fullWidth
              type="email"
              value={editFormData.email}
              onChange={(e) => setEditFormData(p => ({ ...p, email: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditDialog(false)} disabled={submitting}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

const CustomerActionMenu = ({ customer, onView, onEdit }: { customer: any, onView: () => void, onEdit: () => void }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: string) => {
    handleClose();
    if (action === "View Details") onView();
    else if (action === "Edit Customer") onEdit();
  };

  return (
    <>
      <IconButton size="small" onClick={handleClick}>
        <IconDotsVertical size={18} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 150, borderRadius: 2, mt: 0.5 }
        }}
      >
        <MenuItem onClick={() => handleAction("View Details")}>
          <ListItemIcon><IconEye size={18} /></ListItemIcon>
          <ListItemText primary="View Details" primaryTypographyProps={{ variant: "body2" }} />
        </MenuItem>
        <MenuItem onClick={() => handleAction("Edit Customer")}>
          <ListItemIcon><IconEdit size={18} /></ListItemIcon>
          <ListItemText primary="Edit Customer" primaryTypographyProps={{ variant: "body2" }} />
        </MenuItem>
      </Menu>
    </>
  );
};
