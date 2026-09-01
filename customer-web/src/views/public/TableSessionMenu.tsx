import { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { getSocket } from "../../config/socket";
import { joinTableSession, syncCart } from "../../api/session";
import { getMenuItemsApi } from "../../api/menu";
import { createOrderApi } from "../../api/orders";
import { toast } from "react-toastify";
import { 
  Box, Typography, Container, AppBar, Toolbar, IconButton, 
  Button, Card, CardContent, CardMedia, CircularProgress, 
  Drawer, Badge, Stack, Fab, Divider, Grid
} from "@mui/material";
import { 
  IconArrowLeft, IconBell, IconReceipt, IconShoppingBag, 
  IconPlus, IconMinus, IconX
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

export const TableSessionMenu = () => {
  const { token } = useParams();
  const [sessionToken, setSessionToken] = useState("");
  const [tableId, setTableId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initializeSession = async () => {
      if (!token) return;
      try {
        const res = await joinTableSession(token);
        setSessionToken(res.data.data.session_token);
        setTableId(res.data.data.table_id);
        setBranchId(res.data.data.branch_id);
        localStorage.setItem("active_table_session", token);
        
        const items = await getMenuItemsApi();
        setMenuItems(items);

        // Connect to table socket
        const socket = getSocket();
        socket.emit("join_table_session", { token: res.data.data.session_token });

        socket.on("cart_updated", (data: { cartItems: any[] }) => {
          setCart(data.cartItems);
        });

      } catch (error) {
        toast.error("Invalid Table QR Code");
      } finally {
        setLoading(false);
      }
    };

    initializeSession();

    return () => {
      const socket = getSocket();
      socket.off("cart_updated");
    };
  }, [token]);

  const broadcastCartUpdate = async (newCart: any[]) => {
    setCart(newCart);
    try {
      await syncCart(sessionToken, newCart);
    } catch (error) {
      console.error("Failed to sync cart");
    }
  };

  const addToCart = (item: any) => {
    const existing = cart.find(c => c.id === item.id);
    let newCart;
    if (existing) {
      newCart = cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
    } else {
      newCart = [...cart, { ...item, qty: 1 }];
    }
    broadcastCartUpdate(newCart);
    toast.success(`${item.name} added to table cart!`);
  };

  const removeFromCart = (id: string) => {
    const existing = cart.find(c => c.id === id);
    if (!existing) return;
    let newCart;
    if (existing.qty > 1) {
      newCart = cart.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c);
    } else {
      newCart = cart.filter(c => c.id !== id);
    }
    broadcastCartUpdate(newCart);
  };

  const submitOrder = async () => {
    if (cart.length === 0) return;
    try {
      setSubmitting(true);
      await createOrderApi({
        branch_id: branchId,
        table_id: tableId,
        order_type: "DINE_IN",
        items: cart.map(c => ({
          menu_item_id: c.id,
          quantity: c.qty,
          unit_price: c.base_price
        }))
      });
      toast.success("Order sent to kitchen!");
      setCart([]);
      await syncCart(sessionToken, []);
      setDrawerOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit order");
    } finally {
      setSubmitting(false);
    }
  };

  const callWaiter = () => {
    const socket = getSocket();
    socket.emit("call_waiter", { branchId, tableId });
    toast.success("Waiter has been called.");
  };

  const requestBill = () => {
    const socket = getSocket();
    socket.emit("request_bill", { branchId, tableId });
    toast.success("Bill requested. Waiter will be with you shortly.");
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.base_price * item.qty), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default" }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!sessionToken) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: "background.default", p: 4, textAlign: "center" }}>
        <Typography variant="h3" color="primary.main" mb={2}>Invalid Table Session</Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>This QR code has expired or is invalid. Please scan the code on your table again.</Typography>
        <Button component={RouterLink} to="/" variant="outlined" color="primary">Return Home</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 12 }}>
      {/* Header */}
      <AppBar position="sticky" elevation={0} sx={{ top: 0, zIndex: 1100, borderBottom: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton component={RouterLink} to="/" color="inherit">
                <IconArrowLeft />
              </IconButton>
              <Box>
                <Typography variant="h6" fontWeight={700} lineHeight={1.2}>Table Menu</Typography>
                <Typography variant="caption" color="secondary.main" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ w: 6, h: 6, borderRadius: "50%", bgcolor: "secondary.main", width: 8, height: 8, animation: "pulse 2s infinite" }} />
                  Live Table Session
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton onClick={callWaiter} sx={{ bgcolor: "rgba(0,0,0,0.04)" }} title="Call Waiter">
                <IconBell stroke={1.5} />
              </IconButton>
              <IconButton onClick={requestBill} sx={{ bgcolor: "rgba(0,0,0,0.04)" }} title="Request Bill">
                <IconReceipt stroke={1.5} />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Menu Grid */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {menuItems.map(item => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card elevation={0} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  {item.image_url && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.image_url}
                      alt={item.name}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                      <Typography variant="h6" fontWeight={600} fontFamily='"Inter", sans-serif'>
                        {item.name}
                      </Typography>
                      <Typography variant="h6" color="secondary.main" fontWeight={600}>
                        ${Number(item.base_price).toFixed(2)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                      {item.description}
                    </Typography>
                    
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      fullWidth 
                      onClick={() => addToCart(item)}
                      startIcon={<IconPlus size={18} />}
                      sx={{ mt: "auto", borderRadius: 8 }}
                    >
                      Add to Table
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Floating Shared Cart */}
      <AnimatePresence>
        {cart.length > 0 && !drawerOpen && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            style={{ position: "fixed", bottom: 24, left: 0, right: 0, zIndex: 1000, display: "flex", justifyContent: "center" }}
          >
            <Fab 
              variant="extended" 
              color="primary" 
              onClick={() => setDrawerOpen(true)}
              sx={{ px: 4, py: 3, borderRadius: 8, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
            >
              <Badge badgeContent={cartItemCount} color="secondary" sx={{ mr: 2 }}>
                <IconShoppingBag />
              </Badge>
              View Table Order - ${cartTotal.toFixed(2)}
            </Fab>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "85vh", p: 0, bgcolor: "background.paper" }
        }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5" fontWeight={700}>Table's Order</Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <IconX />
          </IconButton>
        </Box>
        
        <Box sx={{ p: 3, overflowY: "auto" }}>
          <Stack spacing={3}>
            {cart.map(item => (
              <Box key={item.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>{item.name}</Typography>
                  <Typography variant="body2" color="secondary.main" fontWeight={600}>${Number(item.base_price).toFixed(2)}</Typography>
                </Box>
                
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, border: "1px solid", borderColor: "divider", borderRadius: 1, p: 0.5 }}>
                  <IconButton size="small" onClick={() => removeFromCart(item.id)}>
                    <IconMinus size={16} />
                  </IconButton>
                  <Typography variant="body1" fontWeight={600} sx={{ minWidth: 20, textAlign: "center" }}>
                    {item.qty}
                  </Typography>
                  <IconButton size="small" onClick={() => addToCart(item)}>
                    <IconPlus size={16} />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        <Box sx={{ p: 3, borderTop: "1px solid", borderColor: "divider", bgcolor: "background.default", mt: "auto" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6" color="text.secondary">Total</Typography>
            <Typography variant="h4" fontWeight={700}>${cartTotal.toFixed(2)}</Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            size="large"
            disabled={submitting || cart.length === 0}
            onClick={submitOrder}
            sx={{ py: 2, borderRadius: 8, fontSize: "1.1rem" }}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : "Send Order to Kitchen"}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default TableSessionMenu;
