import { useState, useEffect } from "react";
import {
  Box, Grid, Card, CardContent, Typography, Stack, useTheme,
  IconButton, TextField, InputAdornment, Chip, Divider,
  Button, alpha, Badge, CircularProgress,
} from "@mui/material";
import {
  IconSearch, IconShoppingCart, IconTrash, IconPlus, IconMinus,
  IconReceipt, IconCreditCard, IconCash, IconQrcode,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import PageContainer from "../../components/container/PageContainer";
import { getCategories, getMenuItems } from "@/api/_menu";
import { createOrder } from "@/api/_orders";
import type { MenuCategory, MenuItem } from "@/types/__restaurant";
import { toast } from "react-toastify";

type CartItem = { item: MenuItem; qty: number; notes?: string };

const TAX_RATE = 0.15;

export default function POS() {
  const theme = useTheme();
  
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNo, setTableNo] = useState("T-01");

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const [catRes, itemRes] = await Promise.all([
          getCategories(),
          getMenuItems(),
        ]);
        setCategories(catRes.data.data || []);
        setMenuItems(itemRes.data.data || []);
      } catch (error) {
        console.error("Failed to load menu:", error);
        toast.error("Failed to load menu");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const filtered = menuItems.filter(
    (i) =>
      (activeCategory === "All" || i.category?.name === activeCategory) &&
      i.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const exists = prev.find((c) => c.item.id === item.id);
      if (exists) return prev.map((c) => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((c) => c.item.id === id ? { ...c, qty: c.qty + delta } : c).filter((c) => c.qty > 0)
    );
  };

  const subtotal = cart.reduce((s, c) => s + Number(c.item.base_price) * c.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      await createOrder({
        order_type: 'DINE_IN',
        notes: `Table: ${tableNo}`,
        items: cart.map(c => ({
          menu_item_id: c.item.id,
          quantity: c.qty,
          notes: c.notes,
        })),
      });
      toast.success("Order placed successfully!");
      setCart([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer title="Point of Sale" description="POS Terminal">
      <Box sx={{ display: "flex", gap: 2.5, height: "calc(100vh - 160px)", minHeight: 600 }}>
        {/* ── LEFT: Menu ── */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, overflow: "hidden" }}>
          {/* Search + Category Bar */}
          <Card sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: "10px", boxShadow: "none" }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <TextField
                  size="small"
                  placeholder="Search menu items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconSearch size={16} color={theme.palette.text.secondary} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "7px",
                      fontSize: "0.875rem",
                      "& fieldset": { borderColor: theme.palette.divider },
                      "&:hover fieldset": { borderColor: theme.palette.grey[400] },
                    },
                  }}
                />
                <TextField
                  size="small"
                  label="Table"
                  value={tableNo}
                  onChange={(e) => setTableNo(e.target.value)}
                  sx={{
                    width: 100,
                    "& .MuiOutlinedInput-root": { borderRadius: "7px", "& fieldset": { borderColor: theme.palette.divider } },
                  }}
                />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 0.5, "&::-webkit-scrollbar": { display: "none" } }}>
                <Chip
                  label="All"
                  size="small"
                  onClick={() => setActiveCategory("All")}
                  sx={{
                    borderRadius: "6px", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer",
                    bgcolor: activeCategory === "All" ? theme.palette.primary.main : theme.palette.grey[100],
                    color: activeCategory === "All" ? "#fff" : theme.palette.text.secondary,
                    border: "none", "&:hover": { bgcolor: activeCategory === "All" ? theme.palette.primary.light : theme.palette.grey[200] },
                  }}
                />
                {categories.map((cat) => (
                  <Chip
                    key={cat.id}
                    label={cat.name}
                    size="small"
                    onClick={() => setActiveCategory(cat.name)}
                    sx={{
                      borderRadius: "6px", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer",
                      bgcolor: activeCategory === cat.name ? theme.palette.primary.main : theme.palette.grey[100],
                      color: activeCategory === cat.name ? "#fff" : theme.palette.text.secondary,
                      border: "none", "&:hover": { bgcolor: activeCategory === cat.name ? theme.palette.primary.light : theme.palette.grey[200] },
                    }}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Menu Grid */}
          <Box sx={{ flex: 1, overflowY: "auto", "&::-webkit-scrollbar": { width: 5 }, "&::-webkit-scrollbar-thumb": { bgcolor: theme.palette.divider, borderRadius: 4 } }}>
            {loading ? (
               <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
            ) : (
              <Grid container spacing={1.5}>
                <AnimatePresence mode="popLayout">
                  {filtered.map((item) => {
                    const inCart = cart.find((c) => c.item.id === item.id);
                    return (
                      <Grid size={{ xs: 6, sm: 4, md: 3 }} key={item.id}>
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Card
                            onClick={() => addToCart(item)}
                            sx={{
                              border: inCart
                                ? `1.5px solid ${theme.palette.secondary.main}`
                                : `1px solid ${theme.palette.divider}`,
                              borderRadius: "10px",
                              boxShadow: "none",
                              cursor: "pointer",
                              bgcolor: inCart ? alpha(theme.palette.secondary.main, 0.04) : "background.paper",
                              transition: "all 150ms ease",
                              "&:hover": {
                                borderColor: theme.palette.secondary.main,
                                bgcolor: alpha(theme.palette.secondary.main, 0.04),
                                transform: "translateY(-1px)",
                              },
                            }}
                          >
                            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                              <Box sx={{ fontSize: "1.8rem", mb: 1, lineHeight: 1 }}>{item.image_url ? <img src={item.image_url} alt={item.name} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }}/> : '🍽️'}</Box>
                              <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.3, mb: 0.5 }}>
                                {item.name}
                              </Typography>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" fontWeight={700} color="secondary.dark">
                                  ${Number(item.base_price).toFixed(2)}
                                </Typography>
                                {inCart && (
                                  <Chip
                                    label={`×${inCart.qty}`}
                                    size="small"
                                    sx={{ height: 18, fontSize: "0.7rem", bgcolor: theme.palette.secondary.main, color: "#fff", fontWeight: 700 }}
                                  />
                                )}
                              </Stack>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Grid>
                    );
                  })}
                </AnimatePresence>
              </Grid>
            )}
          </Box>
        </Box>

        {/* ── RIGHT: Cart ── */}
        <Box sx={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          <Card sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: "10px", boxShadow: "none", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Cart Header */}
            <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Badge badgeContent={cart.reduce((s, c) => s + c.qty, 0)} color="secondary" sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem", height: 16, minWidth: 16 } }}>
                    <IconShoppingCart size={18} color={theme.palette.text.primary} />
                  </Badge>
                  <Typography variant="h6" fontWeight={700}>Order · {tableNo}</Typography>
                </Stack>
                {cart.length > 0 && (
                  <IconButton size="small" onClick={() => setCart([])} sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}>
                    <IconTrash size={15} />
                  </IconButton>
                )}
              </Stack>
            </Box>

            {/* Cart Items */}
            <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 1.5, "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { bgcolor: theme.palette.divider, borderRadius: 4 } }}>
              {cart.length === 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.4 }}>
                  <IconReceipt size={40} color={theme.palette.text.secondary} />
                  <Typography variant="body2" color="text.secondary" mt={1.5} textAlign="center">
                    No items yet.<br />Tap a menu item to add.
                  </Typography>
                </Box>
              ) : (
                <AnimatePresence>
                  {cart.map((cartItem) => {
                    const item = cartItem.item;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Box sx={{
                          display: "flex", alignItems: "center", gap: 1.5, px: 1, py: 1.25,
                          borderRadius: "7px", mb: 0.5,
                          "&:hover": { bgcolor: theme.palette.grey[100] },
                        }}>
                          <Box sx={{ fontSize: "1.2rem", width: 28, textAlign: "center" }}>🍽️</Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>{item.name}</Typography>
                            <Typography variant="caption" color="text.secondary">${Number(item.base_price).toFixed(2)} ea.</Typography>
                          </Box>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <IconButton size="small" onClick={() => updateQty(item.id, -1)} sx={{ width: 22, height: 22, border: `1px solid ${theme.palette.divider}`, borderRadius: "5px" }}>
                              <IconMinus size={11} />
                            </IconButton>
                            <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, minWidth: 20, textAlign: "center" }}>{cartItem.qty}</Typography>
                            <IconButton size="small" onClick={() => updateQty(item.id, 1)} sx={{ width: 22, height: 22, border: `1px solid ${theme.palette.divider}`, borderRadius: "5px" }}>
                              <IconPlus size={11} />
                            </IconButton>
                          </Stack>
                          <Typography variant="body2" fontWeight={700} sx={{ minWidth: 48, textAlign: "right" }}>
                            ${(Number(item.base_price) * cartItem.qty).toFixed(2)}
                          </Typography>
                        </Box>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </Box>

            {/* Totals + Payment */}
            {cart.length > 0 && (
              <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, p: 2.5 }}>
                <Stack spacing={1} mb={2}>
                  {[
                    { label: "Subtotal", value: `$${subtotal.toFixed(2)}` },
                    { label: `Tax (${(TAX_RATE * 100).toFixed(0)}%)`, value: `$${tax.toFixed(2)}` },
                  ].map((row) => (
                    <Stack key={row.label} direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">{row.label}</Typography>
                      <Typography variant="body2" color="text.secondary">{row.value}</Typography>
                    </Stack>
                  ))}
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="subtitle2" fontWeight={700}>Total</Typography>
                    <Typography variant="subtitle2" fontWeight={700}>${total.toFixed(2)}</Typography>
                  </Stack>
                </Stack>

                <Stack spacing={1.5}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Payment Method</Typography>
                  <Grid container spacing={1}>
                    {[
                      { label: "Cash", icon: <IconCash size={16} /> },
                      { label: "Card", icon: <IconCreditCard size={16} /> },
                      { label: "QR Pay", icon: <IconQrcode size={16} /> },
                    ].map((m) => (
                      <Grid size={{ xs: 4 }} key={m.label}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={m.icon}
                          size="small"
                          sx={{
                            borderRadius: "7px",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            borderColor: theme.palette.divider,
                            color: "text.secondary",
                            py: 1,
                            "&:hover": { borderColor: theme.palette.secondary.main, color: theme.palette.secondary.main, bgcolor: alpha(theme.palette.secondary.main, 0.04) },
                          }}
                        >
                          {m.label}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={submitting}
                    onClick={handleCheckout}
                    sx={{
                      borderRadius: "8px",
                      bgcolor: theme.palette.primary.main,
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      py: 1.5,
                      boxShadow: "none",
                      "&:hover": { bgcolor: theme.palette.primary.light, boxShadow: "none" },
                    }}
                  >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : `Charge $${total.toFixed(2)}`}
                  </Button>
                </Stack>
              </Box>
            )}
          </Card>
        </Box>
      </Box>
    </PageContainer>
  );
}
