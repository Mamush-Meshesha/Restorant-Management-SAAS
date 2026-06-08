import { useState, useEffect } from "react";
import {
  Box, Container, Typography, Grid, Stack, Button, Divider, alpha, Card, CardContent,
  CardMedia, Chip, TextField, InputBase, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, CircularProgress, Alert
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { IconSearch, IconPlus, IconMinus, IconTrash, IconShoppingBag, IconChevronRight, IconCheck, IconMapPin, IconClock, IconUser } from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { addToCart, updateQuantity, setOrderType, clearCart } from "../../redux/slices/cartSlice";
import { getMenuItemsApi } from "../../api/menu";
import { getBranchesApi } from "../../api/branches";
import { createOrderApi } from "../../api/orders";

const ORDER_TYPES: Array<"DINE_IN" | "TAKEAWAY" | "DELIVERY"> = ["DINE_IN", "TAKEAWAY", "DELIVERY"];
const ORDER_TYPE_LABELS: Record<string, string> = { DINE_IN: "Dine In", TAKEAWAY: "Pickup", DELIVERY: "Delivery" };
const TRACKING_STAGES = ["Order Received", "Preparing", "Ready", "Served"];
const DELIVERY_TRACKING_STAGES = ["Order Received", "Preparing", "Out for Delivery", "Delivered"];

export default function OrderPage() {
  const dispatch = useAppDispatch();
  const { items: cart, orderType } = useAppSelector(state => state.cart);
  
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [mItems, bData] = await Promise.all([
          getMenuItemsApi().catch(() => []),
          getBranchesApi().catch(() => [])
        ]);
        setMenuItems(mItems);
        setBranches(bData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [search, setSearch] = useState("");
  const [placed, setPlaced] = useState(false);
  const [trackingStage, setTrackingStage] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");

  const handleAddToCart = (item: any) => {
    dispatch(addToCart({ id: item.id, name: item.name, price: item.base_price, category: item.category?.name || "Dish", image: item.image_url || "https://images.unsplash.com/photo-1541529086526-db283c563270?q=80&w=400&auto=format&fit=crop" }));
  };

  const handleUpdateQty = (id: string, delta: number) => {
    dispatch(updateQuantity({ id, delta }));
  };

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const service = Math.round(subtotal * (orderType === "DINE_IN" ? 0.12 : 0.05)); // 12% for Dine in, 5% for pickup/delivery packaging
  const deliveryFee = orderType === "DELIVERY" ? 15 : 0;
  const total = subtotal + service + deliveryFee;

  const handleCheckout = () => {
    if (branches.length > 0) setSelectedBranch(branches[0].id);
    setCheckoutOpen(true);
  };

  const isCheckoutValid = () => {
    if (!selectedBranch) return false;
    if (orderType === "DINE_IN") return tableNumber.length > 0;
    if (orderType === "TAKEAWAY") return pickupTime.length > 0 && contactName.length > 0 && contactPhone.length > 0;
    if (orderType === "DELIVERY") return deliveryAddress.length > 0 && contactName.length > 0 && contactPhone.length > 0;
    return false;
  };

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    setOrderError("");
    try {
      const response = await createOrderApi({
        branch_id: selectedBranch,
        order_type: orderType,
        notes: `Contact: ${contactName} ${contactPhone} ${deliveryAddress} ${pickupTime}`,
        items: cart.map(c => ({
          menu_item_id: c.id,
          quantity: c.qty,
          unit_price: c.price
        }))
      });

      dispatch(clearCart());
      setCheckoutOpen(false);
      setPlaced(true);
      
      const orderId = response.data?.id;
      if (orderId) {
        const interval = setInterval(async () => {
          try {
            const { getOrdersApi } = await import("../../api/orders");
            const orders = await getOrdersApi();
            const order = orders.find((o: any) => o.id === orderId);
            if (order) {
              const status = order.status;
              let newStage = 0;
              if (status === "OPEN") newStage = 0;
              else if (status === "IN_PROGRESS") newStage = 1;
              else if (status === "READY") newStage = 2;
              else if (status === "SERVED" || status === "CLOSED") newStage = 3;
              else if (status === "CANCELLED") newStage = -1;
              
              setTrackingStage(newStage);
              if (newStage >= 3 || newStage === -1) clearInterval(interval);
            }
          } catch (e) {
            console.error("Tracking poll failed:", e);
          }
        }, 5000);
      }
    } catch (err: any) {
      setOrderError(err?.response?.data?.message || "Failed to place order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const filteredMenu = menuItems.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  const activeTrackingStages = orderType === "DELIVERY" ? DELIVERY_TRACKING_STAGES : TRACKING_STAGES;

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ bgcolor: "primary.main", color: "white", py: 10, textAlign: "center" }}>
        <Container maxWidth="md">
          <Typography variant="overline" sx={{ color: "secondary.main", letterSpacing: "0.2em", mb: 2, display: "block" }}>
            Online Ordering
          </Typography>
          <Typography variant="h2" sx={{ mb: 2 }}>Order & Collect</Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            Restaurant-quality dining, on your terms.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 6 }}>
        <AnimatePresence mode="wait">
          {placed ? (
            <motion.div key="tracking" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Box sx={{ maxWidth: 640, mx: "auto", textAlign: "center", py: 4 }}>
                <Box sx={{ mb: 4, width: 72, height: 72, borderRadius: "50%", bgcolor: alpha("#d4af37", 0.1), display: "flex", alignItems: "center", justifyContent: "center", mx: "auto" }}>
                  <IconShoppingBag size={36} color="#d4af37" />
                </Box>
                <Typography variant="h3" mb={2}>Your Order is Live</Typography>
                <Typography variant="body1" color="text.secondary" mb={4}>
                  {orderType === "DINE_IN" && `Being prepared for Table ${tableNumber}`}
                  {orderType === "TAKEAWAY" && `Estimated pickup at ${pickupTime}`}
                  {orderType === "DELIVERY" && `Estimated delivery: 45–60 minutes`}
                </Typography>

                <Card sx={{ mb: 6, textAlign: "left", p: 1 }}>
                  <CardContent>
                    <Typography variant="h6" mb={2} fontWeight={600}>Order Details ({orderType})</Typography>
                    {orderType === "DELIVERY" && (
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        Delivering to: <strong>{deliveryAddress}</strong>
                      </Typography>
                    )}
                    {cart.map(item => (
                      <Stack key={item.id} direction="row" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">{item.qty}x {item.name}</Typography>
                        <Typography variant="body2">${item.price * item.qty}</Typography>
                      </Stack>
                    ))}
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={600}>Total Paid</Typography>
                      <Typography fontWeight={600} color="primary.main">${total}</Typography>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Tracking Stages */}
                <Stack spacing={0} sx={{ textAlign: "left" }}>
                  {activeTrackingStages.map((stage, i) => {
                    const done = i <= trackingStage;
                    const active = i === trackingStage;
                    return (
                      <Box key={stage} sx={{ display: "flex", alignItems: "flex-start", gap: 3 }}>
                        <Stack alignItems="center" sx={{ minWidth: 40 }}>
                          <Box sx={{
                            width: 40, height: 40, borderRadius: "50%",
                            bgcolor: done ? (active ? "secondary.main" : "primary.main") : alpha("#2b2118", 0.08),
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.5s",
                          }}>
                            {done && !active ? <IconCheck size={18} color="white" /> : (
                              <Typography variant="caption" fontWeight={700} color={done ? "white" : "text.secondary"}>
                                {i + 1}
                              </Typography>
                            )}
                          </Box>
                          {i < activeTrackingStages.length - 1 && (
                            <Box sx={{ width: 2, height: 40, bgcolor: done ? "primary.main" : alpha("#2b2118", 0.1), transition: "all 0.5s" }} />
                          )}
                        </Stack>
                        <Box sx={{ pt: 1, pb: 4 }}>
                          <Typography fontWeight={active ? 700 : 500} color={done ? "text.primary" : "text.secondary"}>
                            {stage}
                          </Typography>
                          {active && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                              <Typography variant="caption" color="secondary.dark" fontWeight={600}>
                                In progress...
                              </Typography>
                            </motion.div>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            </motion.div>
          ) : (
            <motion.div key="order" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Grid container spacing={5}>
                {/* Menu Panel */}
                <Grid size={{ xs: 12, md: 7 }}>
                  {/* Order Type */}
                  <Stack direction="row" spacing={1} mb={4}>
                    {ORDER_TYPES.map(t => (
                      <Button
                        key={t}
                        variant={orderType === t ? "contained" : "outlined"}
                        onClick={() => dispatch(setOrderType(t as any))}
                        sx={{ px: 3, borderRadius: 8 }}
                      >
                      {t === orderType ? ORDER_TYPE_LABELS[t] : ORDER_TYPE_LABELS[t]}
                      </Button>
                    ))}
                  </Stack>

                  {/* Search */}
                  <Box sx={{ display: "flex", alignItems: "center", border: `1px solid ${alpha("#2b2118", 0.2)}`, borderRadius: 1, px: 2, py: 1.5, mb: 5 }}>
                    <IconSearch size={20} color="#6e6259" />
                    <InputBase placeholder="Search menu..." value={search} onChange={e => setSearch(e.target.value)} sx={{ ml: 1, flex: 1 }} />
                  </Box>

                  {/* Menu Items */}
                  {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Stack spacing={3}>
                      {filteredMenu.map(item => {
                        const cartItem = cart.find(c => c.id === item.id);
                        return (
                          <Card key={item.id} sx={{ display: "flex", flexDirection: "row", alignItems: "stretch", overflow: "hidden" }}>
                            <CardMedia
                              component="img"
                              image={item.image_url || "https://images.unsplash.com/photo-1541529086526-db283c563270?q=80&w=400&auto=format&fit=crop"}
                              alt={item.name}
                              sx={{ width: 120, height: 120, objectFit: "cover", flexShrink: 0 }}
                            />
                            <CardContent sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", p: 3 }}>
                              <Box>
                                <Chip label={item.category?.name || "Dish"} size="small" sx={{ mb: 1, bgcolor: alpha("#d4af37", 0.1), color: "#997e24" }} />
                                <Typography variant="h6" fontWeight={600}>{item.name}</Typography>
                                <Typography variant="body2" fontWeight={600} color="secondary.dark" mt={0.5}>${item.base_price.toFixed(2)}</Typography>
                              </Box>
                            {cartItem ? (
                              <Stack direction="row" alignItems="center" spacing={1.5}>
                                <IconButton size="small" onClick={() => handleUpdateQty(item.id, -1)} sx={{ bgcolor: alpha("#2b2118", 0.06) }}>
                                  {cartItem.qty === 1 ? <IconTrash size={18} /> : <IconMinus size={18} />}
                                </IconButton>
                                <Typography fontWeight={700} sx={{ minWidth: 20, textAlign: "center" }}>{cartItem.qty}</Typography>
                                <IconButton size="small" onClick={() => handleUpdateQty(item.id, 1)} sx={{ bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" } }}>
                                  <IconPlus size={18} />
                                </IconButton>
                              </Stack>
                            ) : (
                              <Button variant="outlined" size="small" startIcon={<IconPlus size={16} />} onClick={() => handleAddToCart(item)} sx={{ borderRadius: 8 }}>
                                Add
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Stack>
                  )}
                </Grid>

                {/* Order Summary Panel */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Box sx={{ position: { md: "sticky" }, top: { md: 100 } }}>
                    <Typography variant="h5" fontWeight={700} mb={3} display="flex" alignItems="center" gap={1.5}>
                      <IconShoppingBag size={22} /> Your Order ({orderType})
                    </Typography>

                    {cart.length === 0 ? (
                      <Box sx={{ py: 8, textAlign: "center", border: `1px dashed ${alpha("#2b2118", 0.15)}`, borderRadius: 2 }}>
                        <Typography color="text.secondary">Your cart is empty</Typography>
                        <Typography variant="caption" color="text.secondary">Add dishes from the menu to begin</Typography>
                      </Box>
                    ) : (
                      <Stack spacing={2} mb={4}>
                        {cart.map(item => (
                          <Stack key={item.id} direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: "primary.main", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.8rem", fontWeight: 700 }}>
                                {item.qty}
                              </Box>
                              <Typography variant="body2">{item.name}</Typography>
                            </Stack>
                            <Typography variant="body2" fontWeight={600}>${item.price * item.qty}</Typography>
                          </Stack>
                        ))}

                        <Divider sx={{ my: 2 }} />
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                          <Typography variant="body2">${subtotal}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">{orderType === "DINE_IN" ? "Service Charge (12%)" : "Packaging/Service (5%)"}</Typography>
                          <Typography variant="body2">${service}</Typography>
                        </Stack>
                        {orderType === "DELIVERY" && (
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">Delivery Fee</Typography>
                            <Typography variant="body2">${deliveryFee}</Typography>
                          </Stack>
                        )}
                        <Divider />
                        <Stack direction="row" justifyContent="space-between">
                          <Typography fontWeight={700}>Total</Typography>
                          <Typography fontWeight={700} color="primary.main">${total}</Typography>
                        </Stack>
                      </Stack>
                    )}

                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      size="large"
                      disabled={cart.length === 0}
                      onClick={handleCheckout}
                      endIcon={<IconChevronRight />}
                      sx={{ py: 2, color: "primary.main", fontWeight: 700, mt: 2 }}
                    >
                      Checkout · ${total}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onClose={() => setCheckoutOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Checkout Details ({orderType})</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} py={1}>
            {orderError && <Alert severity="error">{orderError}</Alert>}

            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>Select Branch</Typography>
              <FormControl fullWidth>
                <Select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value as string)}>
                  {branches.map(b => (
                    <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {orderType === "DINE_IN" && (
              <Box>
                <Typography variant="body2" color="text.secondary" mb={1} display="flex" alignItems="center" gap={1}>
                  <IconMapPin size={18} /> Table Number
                </Typography>
                <TextField 
                  fullWidth 
                  placeholder="e.g. 12" 
                  value={tableNumber} 
                  onChange={(e) => setTableNumber(e.target.value)} 
                />
              </Box>
            )}

            {(orderType === "TAKEAWAY" || orderType === "DELIVERY") && (
              <>
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={1} display="flex" alignItems="center" gap={1}>
                    <IconUser size={18} /> Contact Information
                  </Typography>
                  <Stack spacing={2}>
                    <TextField fullWidth placeholder="Full Name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
                    <TextField fullWidth placeholder="Phone Number" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                  </Stack>
                </Box>
              </>
            )}

            {orderType === "TAKEAWAY" && (
              <Box>
                <Typography variant="body2" color="text.secondary" mb={1} display="flex" alignItems="center" gap={1}>
                  <IconClock size={18} /> Estimated Pickup Time
                </Typography>
                <TextField 
                  fullWidth 
                  type="time" 
                  value={pickupTime} 
                  onChange={(e) => setPickupTime(e.target.value)} 
                />
              </Box>
            )}

            {orderType === "DELIVERY" && (
              <Box>
                <Typography variant="body2" color="text.secondary" mb={1} display="flex" alignItems="center" gap={1}>
                  <IconMapPin size={18} /> Delivery Address
                </Typography>
                <TextField 
                  fullWidth 
                  multiline 
                  rows={2} 
                  placeholder="Street address, apartment, city, zip" 
                  value={deliveryAddress} 
                  onChange={(e) => setDeliveryAddress(e.target.value)} 
                />
              </Box>
            )}
            
            <Box mt={2} p={2} bgcolor={alpha("#d4af37", 0.1)} borderRadius={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={600}>Total Amount Due</Typography>
                <Typography fontWeight={700} variant="h6">${total}</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                {orderType === "DINE_IN" ? "Will be added to your table bill." : "Payment collected upon completion."}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCheckoutOpen(false)} color="inherit">Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handlePlaceOrder}
            disabled={!isCheckoutValid() || placingOrder}
          >
            {placingOrder ? "Placing Order..." : "Confirm & Place Order"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
