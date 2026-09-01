import { useState, useEffect, useMemo } from "react";
import {
  Box, Card, Typography, Stack, Button, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Grid, Divider, LinearProgress
} from "@mui/material";
import {
  IconPlus, IconPackage, IconAlertCircle, IconCurrencyDollar,
  IconCheck
} from "@tabler/icons-react";
import PageContainer from "@/components/container/PageContainer";
import { getInventory, addInventoryItem, adjustStock, logWaste } from "@/api/_inventory";
import { toast } from "react-toastify";
import type { InventoryItem } from "@/types/__restaurant";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

export default function InventoryPage() {
  const theme = useTheme();
  const roleName = useSelector((state: RootState) => state.auth.currentUser?.role?.name);
  const isAdminOrManager = ["SUPERADMIN", "COMPANY_ADMIN", "BRANCH_MANAGER"].includes(roleName || "");

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [wasteModalOpen, setWasteModalOpen] = useState(false);

  // Selected Item for Actions
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Forms
  const [createForm, setCreateForm] = useState<any>({
    name: "", category: "VEG" as any as any, unit: "kg", minimum_stock: 0, cost_per_unit: 0
  });
  const [adjustForm, setAdjustForm] = useState({ quantity: 0, type: "ADD" as "ADD" | "DEDUCT", reason: "Stock Count" });
  const [wasteForm, setWasteForm] = useState({ quantity: 0, reason: "Spoiled" });

  const fetchData = async () => {
    try {
      const res = await getInventory();
      setItems(res.data.data);
    } catch (error) {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // KPIs
  const totalValue = useMemo(() => items.reduce((acc, item) => acc + (item.current_stock * item.cost_per_unit), 0), [items]);
  const lowStockItems = useMemo(() => items.filter(i => i.current_stock <= i.minimum_stock), [items]);

  const handleCreate = async () => {
    if (!createForm.name || !createForm.unit || !(createForm as any).category) return toast.error("Missing required fields");
    try {
      await addInventoryItem(createForm);
      toast.success("Item created");
      setCreateModalOpen(false);
      fetchData();
    } catch (error) { toast.error("Failed to create item"); }
  };

  const handleAdjust = async () => {
    if (!selectedItem || adjustForm.quantity <= 0) return toast.error("Invalid adjustment");
    try {
      await adjustStock({
        item_id: selectedItem.id,
        quantity: adjustForm.quantity,
        type: adjustForm.type,
        reason: adjustForm.reason
      });
      toast.success("Stock adjusted");
      setAdjustModalOpen(false);
      fetchData();
    } catch (error) { toast.error("Failed to adjust stock"); }
  };

  const handleWaste = async () => {
    if (!selectedItem || wasteForm.quantity <= 0) return toast.error("Invalid waste quantity");
    try {
      await logWaste({
        item_id: selectedItem.id,
        item_name: selectedItem.name,
        quantity: wasteForm.quantity,
        cost_loss: wasteForm.quantity * selectedItem.cost_per_unit,
        reason: wasteForm.reason
      });
      toast.success("Waste logged");
      setWasteModalOpen(false);
      fetchData();
    } catch (error) { toast.error("Failed to log waste"); }
  };

  const openAdjust = (item: InventoryItem) => { setSelectedItem(item); setAdjustForm({ quantity: 0, type: "ADD", reason: "Stock Count" }); setAdjustModalOpen(true); };
  const openWaste = (item: InventoryItem) => { setSelectedItem(item); setWasteForm({ quantity: 0, reason: "Spoiled" }); setWasteModalOpen(true); };

  return (
    <PageContainer title="Inventory Dashboard" description="Enterprise Stock & COGS Management">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Inventory & Stock</Typography>
          <Typography color="text.secondary">Real-time tracking of ingredients and cost value</Typography>
        </Box>
        {isAdminOrManager && (
          <Button variant="contained" startIcon={<IconPlus />} onClick={() => setCreateModalOpen(true)} sx={{ borderRadius: "8px" }}>
            Add Item
          </Button>
        )}
      </Stack>

      {/* KPIs */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, md: 4 }} >
          <Card sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box p={2} borderRadius={2} bgcolor={theme.palette.primary.light} color="primary.main">
              <IconPackage size={32} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">{items.length}</Typography>
              <Typography variant="body2" color="textSecondary" textTransform="uppercase">Total Unique Items</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} >
          <Card sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box p={2} borderRadius={2} bgcolor={lowStockItems.length > 0 ? theme.palette.error.light : theme.palette.success.light} color={lowStockItems.length > 0 ? "error.main" : "success.main"}>
              {lowStockItems.length > 0 ? <IconAlertCircle size={32} /> : <IconCheck size={32} />}
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">{lowStockItems.length}</Typography>
              <Typography variant="body2" color="textSecondary" textTransform="uppercase">Low Stock Alerts</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} >
          <Card sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box p={2} borderRadius={2} bgcolor={theme.palette.secondary.light} color="secondary.main">
              <IconCurrencyDollar size={32} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">${totalValue.toFixed(2)}</Typography>
              <Typography variant="body2" color="textSecondary" textTransform="uppercase">Total Stock Value</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Main Grid Data */}
      {loading ? (
        <Typography>Loading...</Typography>
      ) : items.length === 0 ? (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">No inventory items found. Add items to track stock.</Typography>
        </Card>
      ) : (
        <Stack spacing={4}>
          <Card sx={{ p: 0, overflow: 'hidden' }}>
            <Box bgcolor={theme.palette.grey[100]} px={3} py={2} borderBottom={`1px solid ${theme.palette.divider}`}>
              <Typography variant="h6" fontWeight="bold" color="textPrimary">
                Inventory Items ({items.length})
              </Typography>
            </Box>
            <Box>
              {items.map((item, idx) => {
                const isLow = item.current_stock <= item.minimum_stock;
                const healthPercent = item.minimum_stock === 0 ? 100 : Math.min(100, Math.max(0, (item.current_stock / (item.minimum_stock * 3)) * 100));
                
                return (
                  <Box key={item.id}>
                    <Grid container alignItems="center" px={3} py={2} spacing={2}>
                      <Grid size={{ xs: 12, md: 3 }} >
                        <Typography fontWeight="bold">{item.name}</Typography>
                        <Typography variant="caption" color="textSecondary">Cost: ${item.cost_per_unit.toFixed(2)} / {item.unit}</Typography>
                      </Grid>
                      
                      {/* Health Bar */}
                      <Grid size={{ xs: 12, md: 4 }} >
                        <Stack direction="row" justifyContent="space-between" mb={0.5}>
                          <Typography variant="caption" fontWeight="bold">
                            Stock: {item.current_stock} {item.unit}
                          </Typography>
                          {isLow && <Typography variant="caption" color="error.main" fontWeight="bold">LOW STOCK (Min: {item.minimum_stock})</Typography>}
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={healthPercent} 
                          color={isLow ? "error" : healthPercent < 50 ? "warning" : "success"}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 2 }} >
                        <Typography variant="subtitle2" fontWeight="bold" textAlign="right">
                          ${(item.current_stock * item.cost_per_unit).toFixed(2)}
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 12, md: 3 }} >
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {isAdminOrManager && (
                            <>
                              <Button size="small" variant="outlined" color="primary" onClick={() => openAdjust(item)}>
                                Adjust
                              </Button>
                              <Button size="small" variant="outlined" color="error" onClick={() => openWaste(item)}>
                                Waste
                              </Button>
                            </>
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                    {idx < items.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </Box>
          </Card>
        </Stack>
      )}

      {/* CREATE MODAL */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Inventory Item</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField label="Item Name" fullWidth value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
            <Stack direction="row" spacing={2}>
              <TextField label="Category (e.g. MEAT, VEG, DAIRY)" fullWidth value={(createForm as any).category} onChange={e => setCreateForm({ ...createForm, category: e.target.value as any as any })} />
              <TextField label="Unit (e.g. kg, ml, pcs)" fullWidth value={createForm.unit} onChange={e => setCreateForm({ ...createForm, unit: e.target.value })} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="Cost per Unit ($)" type="number" fullWidth value={createForm.cost_per_unit} onChange={e => setCreateForm({ ...createForm, cost_per_unit: parseFloat(e.target.value) || 0 })} />
              <TextField label="Minimum Stock Level" type="number" fullWidth value={createForm.minimum_stock} onChange={e => setCreateForm({ ...createForm, minimum_stock: parseFloat(e.target.value) || 0 })} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Add Item</Button>
        </DialogActions>
      </Dialog>

      {/* ADJUST MODAL */}
      <Dialog open={adjustModalOpen} onClose={() => setAdjustModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Adjust Stock: {selectedItem?.name}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button 
                variant={adjustForm.type === 'ADD' ? 'contained' : 'outlined'} 
                color="success" fullWidth onClick={() => setAdjustForm({ ...adjustForm, type: 'ADD' })}
              >Add Stock</Button>
              <Button 
                variant={adjustForm.type === 'DEDUCT' ? 'contained' : 'outlined'} 
                color="error" fullWidth onClick={() => setAdjustForm({ ...adjustForm, type: 'DEDUCT' })}
              >Deduct Stock</Button>
            </Stack>
            <TextField label={`Quantity (${selectedItem?.unit})`} type="number" fullWidth value={adjustForm.quantity} onChange={e => setAdjustForm({ ...adjustForm, quantity: parseFloat(e.target.value) || 0 })} />
            <TextField label="Reason" fullWidth value={adjustForm.reason} onChange={e => setAdjustForm({ ...adjustForm, reason: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAdjustModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleAdjust}>Confirm</Button>
        </DialogActions>
      </Dialog>

      {/* WASTE MODAL */}
      <Dialog open={wasteModalOpen} onClose={() => setWasteModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Log Waste: {selectedItem?.name}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Typography variant="body2" color="error">Logging waste will instantly deduct from your stock and record the financial loss.</Typography>
            <TextField label={`Wasted Quantity (${selectedItem?.unit})`} type="number" fullWidth value={wasteForm.quantity} onChange={e => setWasteForm({ ...wasteForm, quantity: parseFloat(e.target.value) || 0 })} />
            <TextField label="Reason" fullWidth value={wasteForm.reason} onChange={e => setWasteForm({ ...wasteForm, reason: e.target.value })} />
            
            {wasteForm.quantity > 0 && selectedItem && (
              <Box p={2} bgcolor={theme.palette.error.light} color="error.main" borderRadius={1}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Cost Loss: ${(wasteForm.quantity * selectedItem.cost_per_unit).toFixed(2)}
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setWasteModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleWaste}>Log Waste</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
