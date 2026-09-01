import { useState, useEffect } from "react";
import {
  Box, Card, Typography, Stack, Button, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem as SelectItem, InputLabel, FormControl,
  Grid, Divider, Tabs, Tab
} from "@mui/material";
import { IconPlus, IconTruck, IconMapPin, IconPhone, IconClock } from "@tabler/icons-react";
import PageContainer from "@/components/container/PageContainer";
import { toast } from "react-toastify";
import type { Driver, DeliveryZone, DeliveryOrder, Order } from "@/types/__restaurant";
import { getDrivers, createDriver, getDeliveryZones, createDeliveryZone, getActiveDeliveries, assignDriver, updateDeliveryStatus } from "@/api/_delivery";
import { createDeliveryOrder } from "@/api/_delivery";

export default function DeliveryPage() {
  const theme = useTheme();

  const [tabIndex, setTabIndex] = useState(0);


  // Data States
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [pendingRawOrders, setPendingRawOrders] = useState<Order[]>([]);

  // Modals
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  // Forms
  const [driverForm, setDriverForm] = useState<Partial<Driver>>({ name: "", phone: "", vehicle_type: "", vehicle_plate: "" });
  const [zoneForm, setZoneForm] = useState<Partial<DeliveryZone>>({ name: "", radius_km: 0, delivery_fee: 0, min_order_amount: 0 });
  
  const [assignForm, setAssignForm] = useState({ delivery_order_id: "", driver_id: "", estimated_time: "" });

  const fetchData = async () => {
    try {
      const [dRes, zRes, oRes] = await Promise.all([
        getDrivers(), getDeliveryZones(), getActiveDeliveries()
      ]);
      setDrivers(dRes.data.data);
      setZones(zRes.data.data);
      setDeliveries(oRes.data.data);
      setPendingRawOrders(oRes.data.pending);
    } catch (error) {
      toast.error("Failed to load delivery data");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveDriver = async () => {
    try {
      await createDriver(driverForm);
      toast.success("Driver added");
      setDriverModalOpen(false);
      fetchData();
    } catch (error) { toast.error("Failed to add driver"); }
  };

  const handleSaveZone = async () => {
    try {
      await createDeliveryZone(zoneForm);
      toast.success("Zone added");
      setZoneModalOpen(false);
      fetchData();
    } catch (error) { toast.error("Failed to add zone"); }
  };

  const handleAssignDriver = async () => {
    try {
      await assignDriver(assignForm.delivery_order_id, assignForm.driver_id, assignForm.estimated_time);
      toast.success("Driver assigned!");
      setAssignModalOpen(false);
      fetchData();
    } catch (error) { toast.error("Failed to assign driver"); }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateDeliveryStatus(id, status);
      toast.success(`Order marked as ${status}`);
      fetchData();
    } catch (error) { toast.error("Failed to update status"); }
  };

  // Convert a raw pending Order to a DeliveryOrder (Dispatch action)
  const handleCreateDeliveryOrder = async (orderId: string) => {
    try {
      await createDeliveryOrder({ order_id: orderId, customer_address: "Address on file", delivery_fee: 0 });
      toast.success("Order queued for dispatch");
      fetchData();
    } catch (error) { toast.error("Failed to queue order"); }
  };

  return (
    <PageContainer title="Delivery Dispatch" description="Manage active deliveries, fleet, and delivery zones">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Delivery Dispatch</Typography>
          <Typography color="text.secondary">Real-time fleet tracking and delivery management</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          {tabIndex === 1 && <Button variant="contained" startIcon={<IconPlus />} onClick={() => setDriverModalOpen(true)}>Add Driver</Button>}
          {tabIndex === 2 && <Button variant="contained" startIcon={<IconPlus />} onClick={() => setZoneModalOpen(true)}>Add Zone</Button>}
        </Stack>
      </Stack>

      <Card sx={{ p: 0, mb: 4 }}>
        <Tabs value={tabIndex} onChange={(_, val) => setTabIndex(val)} variant="fullWidth">
          <Tab icon={<IconClock size={20} />} iconPosition="start" label="Live Dispatch" />
          <Tab icon={<IconTruck size={20} />} iconPosition="start" label="Fleet (Drivers)" />
          <Tab icon={<IconMapPin size={20} />} iconPosition="start" label="Delivery Zones" />
        </Tabs>
      </Card>

      {/* TAB 0: LIVE DISPATCH */}
      {tabIndex === 0 && (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Unassigned / Queued</Typography>
            <Stack spacing={2}>
              {pendingRawOrders.map(ro => (
                <Card key={ro.id} sx={{ p: 2, borderLeft: `4px solid ${theme.palette.warning.main}` }}>
                  <Typography fontWeight="bold">Order #{ro.id.slice(-4).toUpperCase()}</Typography>
                  <Typography variant="caption" color="textSecondary">Waiting for dispatch queue...</Typography>
                  <Button size="small" variant="outlined" fullWidth sx={{ mt: 2 }} onClick={() => handleCreateDeliveryOrder(ro.id)}>
                    Queue for Dispatch
                  </Button>
                </Card>
              ))}
              {deliveries.filter(d => d.status === "PENDING").map(d => (
                <Card key={d.id} sx={{ p: 2, borderLeft: `4px solid ${theme.palette.error.main}` }}>
                  <Typography fontWeight="bold">Order #{d.order_id.slice(-4).toUpperCase()}</Typography>
                  <Typography variant="body2" color="textSecondary" mt={1}>📍 {d.customer_address}</Typography>
                  <Button size="small" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={() => {
                    setAssignForm({ delivery_order_id: d.id, driver_id: "", estimated_time: "" });
                    setAssignModalOpen(true);
                  }}>
                    Assign Driver
                  </Button>
                </Card>
              ))}
              {pendingRawOrders.length === 0 && deliveries.filter(d => d.status === "PENDING").length === 0 && (
                <Typography color="textSecondary">No unassigned orders.</Typography>
              )}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Assigned</Typography>
            <Stack spacing={2}>
              {deliveries.filter(d => d.status === "ASSIGNED").map(d => (
                <Card key={d.id} sx={{ p: 2, borderLeft: `4px solid ${theme.palette.info.main}` }}>
                  <Typography fontWeight="bold">Order #{d.order_id.slice(-4).toUpperCase()}</Typography>
                  <Typography variant="body2" color="textSecondary" mt={1}>📍 {d.customer_address}</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" fontWeight="bold">🚗 Driver: {d.driver?.name}</Typography>
                  <Button size="small" variant="outlined" color="primary" fullWidth sx={{ mt: 2 }} onClick={() => handleUpdateStatus(d.id, 'OUT_FOR_DELIVERY')}>
                    Mark Out For Delivery
                  </Button>
                </Card>
              ))}
              {deliveries.filter(d => d.status === "ASSIGNED").length === 0 && <Typography color="textSecondary">No assigned orders.</Typography>}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Out for Delivery</Typography>
            <Stack spacing={2}>
              {deliveries.filter(d => d.status === "OUT_FOR_DELIVERY").map(d => (
                <Card key={d.id} sx={{ p: 2, borderLeft: `4px solid ${theme.palette.secondary.main}` }}>
                  <Typography fontWeight="bold">Order #{d.order_id.slice(-4).toUpperCase()}</Typography>
                  <Typography variant="body2" color="textSecondary" mt={1}>📍 {d.customer_address}</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" fontWeight="bold">🚗 Driver: {d.driver?.name}</Typography>
                  <Button size="small" variant="contained" color="success" fullWidth sx={{ mt: 2 }} onClick={() => handleUpdateStatus(d.id, 'DELIVERED')}>
                    Mark Delivered
                  </Button>
                </Card>
              ))}
              {deliveries.filter(d => d.status === "OUT_FOR_DELIVERY").length === 0 && <Typography color="textSecondary">No orders out for delivery.</Typography>}
            </Stack>
          </Grid>
        </Grid>
      )}

      {/* TAB 1: FLEET */}
      {tabIndex === 1 && (
        <Grid container spacing={3}>
          {drivers.map(driver => (
            <Grid size={{ xs: 12, md: 4 }} key={driver.id}>
              <Card sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <Box p={1.5} borderRadius="50%" bgcolor={theme.palette.primary.light} color="primary.main">
                    <IconTruck size={24} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{driver.name}</Typography>
                    <Typography variant="caption" color="textSecondary"><IconPhone size={12} style={{ verticalAlign: 'middle' }}/> {driver.phone}</Typography>
                  </Box>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">Vehicle Type:</Typography>
                  <Typography variant="body2" fontWeight="bold">{driver.vehicle_type || 'N/A'}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" mt={1}>
                  <Typography variant="body2" color="textSecondary">Plate:</Typography>
                  <Typography variant="body2" fontWeight="bold">{driver.vehicle_plate || 'N/A'}</Typography>
                </Stack>
              </Card>
            </Grid>
          ))}
          {drivers.length === 0 && <Box p={4} textAlign="center" width="100%"><Typography color="textSecondary">No drivers registered yet.</Typography></Box>}
        </Grid>
      )}

      {/* TAB 2: ZONES */}
      {tabIndex === 2 && (
        <Grid container spacing={3}>
          {zones.map(zone => (
            <Grid size={{ xs: 12, md: 4 }} key={zone.id}>
              <Card sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <Box p={1.5} borderRadius="50%" bgcolor={theme.palette.secondary.light} color="secondary.main">
                    <IconMapPin size={24} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{zone.name}</Typography>
                    <Typography variant="caption" color="textSecondary">Radius: {zone.radius_km} km</Typography>
                  </Box>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">Delivery Fee:</Typography>
                  <Typography variant="body2" fontWeight="bold">${zone.delivery_fee.toFixed(2)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" mt={1}>
                  <Typography variant="body2" color="textSecondary">Min. Order:</Typography>
                  <Typography variant="body2" fontWeight="bold">${zone.min_order_amount.toFixed(2)}</Typography>
                </Stack>
              </Card>
            </Grid>
          ))}
          {zones.length === 0 && <Box p={4} textAlign="center" width="100%"><Typography color="textSecondary">No delivery zones configured.</Typography></Box>}
        </Grid>
      )}

      {/* ADD DRIVER MODAL */}
      <Dialog open={driverModalOpen} onClose={() => setDriverModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Delivery Driver</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField label="Driver Name" fullWidth required value={driverForm.name} onChange={e => setDriverForm({ ...driverForm, name: e.target.value })} />
            <TextField label="Phone Number" fullWidth required value={driverForm.phone} onChange={e => setDriverForm({ ...driverForm, phone: e.target.value })} />
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Vehicle Type</InputLabel>
                <Select value={driverForm.vehicle_type} label="Vehicle Type" onChange={e => setDriverForm({ ...driverForm, vehicle_type: e.target.value })}>
                  <SelectItem value="CAR">Car</SelectItem>
                  <SelectItem value="MOTORCYCLE">Motorcycle</SelectItem>
                  <SelectItem value="BICYCLE">Bicycle</SelectItem>
                  <SelectItem value="VAN">Van</SelectItem>
                </Select>
              </FormControl>
              <TextField label="License Plate (Optional)" fullWidth value={driverForm.vehicle_plate} onChange={e => setDriverForm({ ...driverForm, vehicle_plate: e.target.value })} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDriverModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveDriver}>Save Driver</Button>
        </DialogActions>
      </Dialog>

      {/* ADD ZONE MODAL */}
      <Dialog open={zoneModalOpen} onClose={() => setZoneModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Delivery Zone</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField label="Zone Name (e.g. Downtown)" fullWidth required value={zoneForm.name} onChange={e => setZoneForm({ ...zoneForm, name: e.target.value })} />
            <TextField label="Radius (km)" type="number" fullWidth required value={zoneForm.radius_km} onChange={e => setZoneForm({ ...zoneForm, radius_km: parseFloat(e.target.value) || 0 })} />
            <Stack direction="row" spacing={2}>
              <TextField label="Delivery Fee ($)" type="number" fullWidth value={zoneForm.delivery_fee} onChange={e => setZoneForm({ ...zoneForm, delivery_fee: parseFloat(e.target.value) || 0 })} />
              <TextField label="Min. Order Amount ($)" type="number" fullWidth value={zoneForm.min_order_amount} onChange={e => setZoneForm({ ...zoneForm, min_order_amount: parseFloat(e.target.value) || 0 })} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setZoneModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveZone}>Save Zone</Button>
        </DialogActions>
      </Dialog>

      {/* ASSIGN DRIVER MODAL */}
      <Dialog open={assignModalOpen} onClose={() => setAssignModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Assign Driver</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Select Driver</InputLabel>
              <Select value={assignForm.driver_id} label="Select Driver" onChange={e => setAssignForm({ ...assignForm, driver_id: e.target.value })}>
                {drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name} ({d.vehicle_type})</SelectItem>)}
              </Select>
            </FormControl>
            <TextField label="Estimated Delivery Time" type="datetime-local" InputLabelProps={{ shrink: true }} fullWidth value={assignForm.estimated_time} onChange={e => setAssignForm({ ...assignForm, estimated_time: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAssignModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleAssignDriver} disabled={!assignForm.driver_id}>Assign</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
