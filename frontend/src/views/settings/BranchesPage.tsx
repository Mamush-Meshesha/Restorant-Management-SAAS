import { useState, useEffect } from "react";
import {
  Box, Card, Typography, Stack, Button, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Grid
} from "@mui/material";
import { IconPlus, IconEdit, IconMapPin, IconBuildingStore } from "@tabler/icons-react";
import PageContainer from "@/components/container/PageContainer";
import { toast } from "react-toastify";
import type { Branch } from "@/types/__restaurant";
import { getBranches, createBranch, updateBranch } from "@/api/_branches";

export default function BranchesPage() {
  const theme = useTheme();

  // Data
  const [branches, setBranches] = useState<Branch[]>([]);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<Branch>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getBranches();
      setBranches(res.data.data);
    } catch (error) {
      toast.error("Failed to load branches");
    }
  };

  const handleSave = async () => {
    try {
      if (!form.name) {
        return toast.error("Branch name is required");
      }
      
      const payload = {
        ...form,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
      };

      if (editingId) {
        await updateBranch(editingId, payload);
        toast.success("Branch updated");
      } else {
        await createBranch(payload);
        toast.success("Branch created");
      }
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save branch");
    }
  };

  const openEdit = (branch: Branch) => {
    setEditingId(branch.id);
    setForm(branch);
    setModalOpen(true);
  };

  return (
    <PageContainer title="Branches" description="Manage your restaurant locations">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Branches & Locations</Typography>
          <Typography variant="body2" color="textSecondary">Manage multi-store locations and operations.</Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<IconPlus size={20} />}
          onClick={() => {
            setEditingId(null);
            setForm({});
            setModalOpen(true);
          }}
          sx={{ borderRadius: "8px" }}
        >
          Add Branch
        </Button>
      </Stack>

      <Card sx={{ p: 0 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
              <TableRow>
                <TableCell>Branch Details</TableCell>
                <TableCell>Contact Info</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {branches.map(branch => (
                <TableRow key={branch.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: theme.palette.primary.light, color: theme.palette.primary.main }}>
                        <IconBuildingStore size={24} />
                      </Box>
                      <Box>
                        <Typography fontWeight="bold">{branch.name}</Typography>
                        <Typography variant="caption" color="textSecondary">Code: {branch.code || "N/A"}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{branch.phone || "No phone"}</Typography>
                    <Typography variant="caption" color="textSecondary">{branch.email || "No email"}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <IconMapPin size={16} color={theme.palette.text.secondary} />
                      <Typography variant="body2">{branch.address || "No address provided"}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={branch.is_active ? "Active" : "Inactive"} color={branch.is_active ? "success" : "default"} variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => openEdit(branch)}>
                      <IconEdit size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {branches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Typography color="textSecondary">No branches found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ─── ADD / EDIT MODAL ─── */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Edit Branch" : "Add New Branch"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField 
                label="Branch Name" 
                fullWidth 
                required
                value={form.name || ""} 
                onChange={e => setForm({...form, name: e.target.value})} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField 
                label="Branch Code" 
                fullWidth 
                value={form.code || ""} 
                onChange={e => setForm({...form, code: e.target.value})} 
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Phone Number" 
                fullWidth 
                value={form.phone || ""} 
                onChange={e => setForm({...form, phone: e.target.value})} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Email Address" 
                type="email"
                fullWidth 
                value={form.email || ""} 
                onChange={e => setForm({...form, email: e.target.value})} 
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField 
                label="Physical Address" 
                fullWidth 
                multiline
                rows={2}
                value={form.address || ""} 
                onChange={e => setForm({...form, address: e.target.value})} 
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Latitude" 
                type="number"
                fullWidth 
                value={form.latitude || ""} 
                onChange={e => setForm({...form, latitude: Number(e.target.value)})} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Longitude" 
                type="number"
                fullWidth 
                value={form.longitude || ""} 
                onChange={e => setForm({...form, longitude: Number(e.target.value)})} 
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField 
                label="WiFi IP Address" 
                fullWidth 
                helperText="Used for restricting Clock-ins to this network"
                value={form.wifi_ip || ""} 
                onChange={e => setForm({...form, wifi_ip: e.target.value})} 
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSave}>Save Branch</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
