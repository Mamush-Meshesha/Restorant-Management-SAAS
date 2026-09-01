import { useState, useEffect } from "react";
import {
  Box, Card, Typography, Stack, Button, IconButton, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem as SelectItem, InputLabel, FormControl,
  Grid, Divider, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import { IconPlus, IconTruck, IconReceipt, IconTrash, IconMail, IconPhone } from "@tabler/icons-react";
import PageContainer from "@/components/container/PageContainer";
import { toast } from "react-toastify";
import type { Supplier, PurchaseOrder, InventoryItem } from "@/types/__restaurant";
import { getSuppliers, createSupplier, getPurchaseOrders, createPurchaseOrder } from "@/api/_suppliers";
import { getInventory } from "@/api/_inventory";

export default function SuppliersPage() {
  const theme = useTheme();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);


  // Modals
  const [createSupplierModalOpen, setCreateSupplierModalOpen] = useState(false);
  const [poModalOpen, setPoModalOpen] = useState(false);

  // Forms
  const [supplierForm, setSupplierForm] = useState<Partial<Supplier>>({
    name: "", contact_person: "", phone: "", email: "", address: ""
  });
  
  const [poForm, setPoForm] = useState<{
    supplier_id: string;
    expected_date: string;
    items: { inventory_item_id: string; quantity: number; unit_price: number }[];
  }>({
    supplier_id: "",
    expected_date: "",
    items: []
  });

  const fetchData = async () => {
    try {
      const [supRes, poRes, invRes] = await Promise.all([
        getSuppliers(), getPurchaseOrders(), getInventory()
      ]);
      setSuppliers(supRes.data.data);
      setPurchaseOrders(poRes.data.data);
      setInventoryItems(invRes.data.data);
    } catch (error) {
      toast.error("Failed to load data");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateSupplier = async () => {
    if (!supplierForm.name) return toast.error("Supplier Name is required");
    try {
      await createSupplier(supplierForm);
      toast.success("Supplier added successfully!");
      setCreateSupplierModalOpen(false);
      setSupplierForm({ name: "", contact_person: "", phone: "", email: "", address: "" });
      fetchData();
    } catch (error) { toast.error("Failed to add supplier"); }
  };

  const handleCreatePO = async () => {
    if (!poForm.supplier_id || poForm.items.length === 0) return toast.error("Supplier and at least one item required");
    try {
      await createPurchaseOrder(poForm);
      toast.success("Purchase Order created!");
      setPoModalOpen(false);
      setPoForm({ supplier_id: "", expected_date: "", items: [] });
      fetchData();
    } catch (error) { toast.error("Failed to create PO"); }
  };

  const addPoItemRow = () => setPoForm({ ...poForm, items: [...poForm.items, { inventory_item_id: "", quantity: 1, unit_price: 0 }] });
  
  const updatePoItem = (index: number, field: string, value: any) => {
    const updated = [...poForm.items];
    (updated[index] as any)[field] = value;
    
    // Auto-fill unit_price if selecting an item
    if (field === "inventory_item_id") {
      const selectedInv = inventoryItems.find(i => i.id === value);
      if (selectedInv) updated[index].unit_price = selectedInv.cost_per_unit;
    }
    setPoForm({ ...poForm, items: updated });
  };

  const removePoItem = (index: number) => {
    const updated = [...poForm.items];
    updated.splice(index, 1);
    setPoForm({ ...poForm, items: updated });
  };

  // KPIs
  const totalPos = purchaseOrders.length;
  const activeSuppliers = suppliers.filter(s => s.is_active).length;

  return (
    <PageContainer title="Suppliers & Procurement" description="Manage vendors and purchase orders">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Suppliers & Orders</Typography>
          <Typography color="text.secondary">Automate procurement and track vendor history</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<IconReceipt />} onClick={() => setPoModalOpen(true)}>
            New Purchase Order
          </Button>
          <Button variant="contained" startIcon={<IconPlus />} onClick={() => setCreateSupplierModalOpen(true)}>
            Add Supplier
          </Button>
        </Stack>
      </Stack>

      {/* KPIs */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, md: 6 }} >
          <Card sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box p={2} borderRadius={2} bgcolor={theme.palette.primary.light} color="primary.main">
              <IconTruck size={32} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">{activeSuppliers}</Typography>
              <Typography variant="body2" color="textSecondary" textTransform="uppercase">Active Suppliers</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} >
          <Card sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box p={2} borderRadius={2} bgcolor={theme.palette.secondary.light} color="secondary.main">
              <IconReceipt size={32} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">{totalPos}</Typography>
              <Typography variant="body2" color="textSecondary" textTransform="uppercase">Purchase Orders Sent</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Suppliers List */}
        <Grid size={{ xs: 12, md: 7 }} >
          <Card sx={{ p: 0 }}>
            <Box bgcolor={theme.palette.grey[100]} px={3} py={2} borderBottom={`1px solid ${theme.palette.divider}`}>
              <Typography variant="h6" fontWeight="bold">Supplier Directory</Typography>
            </Box>
            {suppliers.length === 0 ? (
              <Box p={4} textAlign="center"><Typography color="textSecondary">No suppliers added yet.</Typography></Box>
            ) : (
              <Stack divider={<Divider />}>
                {suppliers.filter(s => s.is_active).map(supplier => (
                  <Box key={supplier.id} p={3}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h6" fontWeight="bold">{supplier.name}</Typography>
                        <Stack direction="row" spacing={3} mt={1}>
                          {supplier.contact_person && (
                            <Typography variant="body2" color="textSecondary">👤 {supplier.contact_person}</Typography>
                          )}
                          {supplier.phone && (
                            <Typography variant="body2" color="textSecondary">
                              <IconPhone size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> 
                              {supplier.phone}
                            </Typography>
                          )}
                          {supplier.email && (
                            <Typography variant="body2" color="textSecondary">
                              <IconMail size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> 
                              {supplier.email}
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => { setPoForm({ ...poForm, supplier_id: supplier.id }); setPoModalOpen(true); }}
                      >
                        Create PO
                      </Button>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Card>
        </Grid>

        {/* Recent POs List */}
        <Grid size={{ xs: 12, md: 5 }} >
          <Card sx={{ p: 0 }}>
            <Box bgcolor={theme.palette.grey[100]} px={3} py={2} borderBottom={`1px solid ${theme.palette.divider}`}>
              <Typography variant="h6" fontWeight="bold">Recent Purchase Orders</Typography>
            </Box>
            {purchaseOrders.length === 0 ? (
              <Box p={4} textAlign="center"><Typography color="textSecondary">No purchase orders found.</Typography></Box>
            ) : (
              <Stack divider={<Divider />}>
                {purchaseOrders.slice(0, 10).map(po => (
                  <Box key={po.id} p={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography fontWeight="bold">#{po.id.slice(-4).toUpperCase()}</Typography>
                        <Typography variant="caption" color="textSecondary">{po.supplier?.name}</Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography fontWeight="bold" color="primary.main">${po.total_amount.toFixed(2)}</Typography>
                        <Chip size="small" label={po.status} color={po.status === 'DRAFT' ? 'default' : 'success'} />
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* CREATE SUPPLIER MODAL */}
      <Dialog open={createSupplierModalOpen} onClose={() => setCreateSupplierModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Supplier</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField label="Company Name" fullWidth required value={supplierForm.name} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} />
            <TextField label="Contact Person" fullWidth value={supplierForm.contact_person} onChange={e => setSupplierForm({ ...supplierForm, contact_person: e.target.value })} />
            <Stack direction="row" spacing={2}>
              <TextField label="Phone" fullWidth value={supplierForm.phone} onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })} />
              <TextField label="Email" fullWidth value={supplierForm.email} onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })} />
            </Stack>
            <TextField label="Address" fullWidth multiline rows={2} value={supplierForm.address} onChange={e => setSupplierForm({ ...supplierForm, address: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCreateSupplierModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateSupplier}>Save Supplier</Button>
        </DialogActions>
      </Dialog>

      {/* CREATE PO MODAL */}
      <Dialog open={poModalOpen} onClose={() => setPoModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Purchase Order</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }} >
                <FormControl fullWidth>
                  <InputLabel>Supplier</InputLabel>
                  <Select value={poForm.supplier_id} label="Supplier" onChange={e => setPoForm({ ...poForm, supplier_id: e.target.value })}>
                    {suppliers.filter(s => s.is_active).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }} >
                <TextField label="Expected Delivery Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={poForm.expected_date} onChange={e => setPoForm({ ...poForm, expected_date: e.target.value })} />
              </Grid>
            </Grid>

            <Divider />
            
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Order Items</Typography>
              <Button size="small" variant="outlined" startIcon={<IconPlus />} onClick={addPoItemRow}>Add Item</Button>
            </Stack>

            {poForm.items.length === 0 ? (
              <Box p={3} bgcolor={theme.palette.grey[50]} textAlign="center" borderRadius={1}>
                <Typography color="textSecondary">No items added to this PO yet.</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
                    <TableRow>
                      <TableCell>Inventory Item</TableCell>
                      <TableCell width={100}>Qty</TableCell>
                      <TableCell width={120}>Unit Cost ($)</TableCell>
                      <TableCell width={120}>Line Total</TableCell>
                      <TableCell width={50}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {poForm.items.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <Select value={row.inventory_item_id} onChange={e => updatePoItem(idx, 'inventory_item_id', e.target.value)}>
                              {inventoryItems.map(inv => <SelectItem key={inv.id} value={inv.id}>{inv.name} ({inv.unit})</SelectItem>)}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField size="small" type="number" value={row.quantity} onChange={e => updatePoItem(idx, 'quantity', parseFloat(e.target.value) || 0)} />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" type="number" value={row.unit_price} onChange={e => updatePoItem(idx, 'unit_price', parseFloat(e.target.value) || 0)} />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="bold">${(row.quantity * row.unit_price).toFixed(2)}</Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="error" onClick={() => removePoItem(idx)}><IconTrash size={18}/></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            <Box textAlign="right" pt={2}>
              <Typography variant="h6">
                Total Order Value: ${poForm.items.reduce((sum, row) => sum + (row.quantity * row.unit_price), 0).toFixed(2)}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setPoModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleCreatePO} disabled={!poForm.supplier_id || poForm.items.length === 0}>
            Submit Purchase Order
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
