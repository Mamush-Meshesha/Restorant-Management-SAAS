import { useState, useEffect } from "react";
import {
  Box, Card, Typography, Stack, Button, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, FormControlLabel, Switch,
  FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import { IconPlus, IconEdit, IconTrash, IconChefHat } from "@tabler/icons-react";
import PageContainer from "@/components/container/PageContainer";
import { toast } from "react-toastify";
import type { KitchenStation, Branch } from "@/types/__restaurant";
import { getKitchenStations, createKitchenStation, updateKitchenStation, deleteKitchenStation } from "@/api/_kitchen";
import { getBranches } from "@/api/_branches";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

export default function KitchenStationsPage() {
  const theme = useTheme();
  const user = useSelector((state: RootState) => state.auth.currentUser);

  // Data
  const [stations, setStations] = useState<KitchenStation[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<KitchenStation>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [stationRes, branchRes] = await Promise.all([
        getKitchenStations(),
        getBranches()
      ]);
      setStations(stationRes.data.data);
      setBranches(branchRes.data.data);
    } catch (error) {
      toast.error("Failed to load data");
    }
  };

  const handleSave = async () => {
    try {
      if (!form.name || !form.branch_id) {
        return toast.error("Name and Branch are required");
      }
      
      if (editingId) {
        await updateKitchenStation(editingId, form);
        toast.success("Station updated");
      } else {
        await createKitchenStation(form);
        toast.success("Station created");
      }
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save station");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this station?")) return;
    try {
      await deleteKitchenStation(id);
      toast.success("Station deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete station");
    }
  };

  const openEdit = (station: KitchenStation) => {
    setEditingId(station.id);
    setForm(station);
    setModalOpen(true);
  };

  return (
    <PageContainer title="Kitchen Stations" description="Manage kitchen prep stations">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Kitchen Stations</Typography>
          <Typography variant="body2" color="textSecondary">Organize where menu items are prepared (e.g. Grill, Salad, Fryer).</Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<IconPlus size={20} />}
          onClick={() => {
            setEditingId(null);
            setForm({ branch_id: user?.branch_id || (branches.length > 0 ? branches[0].id : ""), is_active: true });
            setModalOpen(true);
          }}
          sx={{ borderRadius: "8px" }}
        >
          Add Station
        </Button>
      </Stack>

      <Card sx={{ p: 0 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
              <TableRow>
                <TableCell>Station</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stations.map(station => {
                const branchName = branches.find(b => b.id === station.branch_id)?.name || "Unknown Branch";
                return (
                  <TableRow key={station.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: theme.palette.primary.light, color: theme.palette.primary.main }}>
                          <IconChefHat size={20} />
                        </Box>
                        <Typography fontWeight="bold">{station.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{branchName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={station.is_active ? "Active" : "Inactive"} color={station.is_active ? "success" : "default"} variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary" onClick={() => openEdit(station)}>
                        <IconEdit size={18} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(station.id)}>
                        <IconTrash size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {stations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                    <Typography color="textSecondary">No kitchen stations found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ─── ADD / EDIT MODAL ─── */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Edit Station" : "Add Kitchen Station"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} mt={1}>
            <TextField 
              label="Station Name" 
              fullWidth 
              required
              placeholder="e.g. Grill, Fryer, Salad"
              value={form.name || ""} 
              onChange={e => setForm({...form, name: e.target.value})} 
            />

            <FormControl fullWidth required>
              <InputLabel>Branch</InputLabel>
              <Select 
                label="Branch" 
                value={form.branch_id || ""} 
                onChange={e => setForm({...form, branch_id: e.target.value as string})}
              >
                {branches.map(b => (
                  <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch 
                  checked={form.is_active ?? true}
                  onChange={e => setForm({...form, is_active: e.target.checked})}
                />
              }
              label="Active Station"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSave}>Save Station</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
