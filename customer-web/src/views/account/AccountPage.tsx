import { useState, useEffect } from "react";
import {
  Box, Container, Typography, Grid, Stack, Button, alpha, Card, CardContent,
  Avatar, Tabs, Tab, Chip, LinearProgress, CardMedia, IconButton, CircularProgress
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { IconUser, IconReceipt, IconStar, IconMedal, IconHeart, IconBell, IconMapPin, IconHeartFilled, } from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { toggleFavoriteItem, toggleFavoriteLocation } from "../../redux/slices/userSlice";
import { getOrdersApi } from "../../api/orders";
import { getReservationsApi } from "../../api/reservations";
import { getMenuItemsApi } from "../../api/menu";
import { getBranchesApi } from "../../api/branches";
import { getNotificationsApi, markNotificationReadApi, Notification } from "../../api/notifications";

const TIER_DATA = {
  Bronze: { next: "Silver", color: "#cd7f32", progress: 60, points: 1200, required: 2000 },
  Silver: { next: "Gold", color: "#aaa9ad", progress: 30, points: 3200, required: 10000 },
  Gold: { next: "Platinum", color: "#d4af37", progress: 75, points: 7500, required: 10000 },
};



export default function AccountPage() {
  const dispatch = useAppDispatch();
  const { favoriteItems, favoriteLocations, profile: userProfile } = useAppSelector(state => state.user);

  const location = useLocation();
  const [tab, setTab] = useState(location.state?.tab || 0);
  const [orders, setOrders] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [oData, rData, mData, lData] = await Promise.all([
          getOrdersApi().catch(() => []),
          getReservationsApi().catch(() => []),
          getMenuItemsApi().catch(() => []),
          getBranchesApi().catch(() => []),
        ]);
        setOrders(oData);
        setReservations(rData);
        setMenuItems(mData);
        setLocations(lData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (tab === 3) {
      getNotificationsApi().then(setNotifications).catch(console.error);
    }
  }, [tab]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationReadApi(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const tier = "Gold";
  const tierInfo = TIER_DATA[tier as keyof typeof TIER_DATA];

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Box sx={{ bgcolor: "primary.main", color: "white", py: 10 }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: "column", sm: "row" }} spacing={4} alignItems={{ xs: "center", sm: "flex-end" }}>
            <Avatar sx={{ width: 100, height: 100, fontSize: "2.5rem", fontWeight: 700, bgcolor: alpha("#d4af37", 0.2), color: "secondary.main", border: `3px solid ${alpha("#d4af37", 0.4)}` }}>
              {userProfile?.first_name?.[0] || ""}{userProfile?.last_name?.[0] || ""}
            </Avatar>
            <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
              <Typography variant="overline" sx={{ color: "secondary.main", letterSpacing: "0.15em" }}>Member since {new Date().getFullYear()}</Typography>
              <Typography variant="h3" fontWeight={700}>{userProfile?.first_name} {userProfile?.last_name}</Typography>
              <Typography sx={{ opacity: 0.8 }}>{userProfile?.email} · Profile Active</Typography>
            </Box>
            <Box sx={{ ml: { sm: "auto" }, textAlign: "center" }}>
              <Chip
                icon={<IconMedal size={18} />}
                label={`${tier} Member`}
                sx={{ bgcolor: alpha(tierInfo.color, 0.15), color: tierInfo.color, fontWeight: 700, fontSize: "1rem", py: 2.5, px: 1, mb: 1, borderRadius: 2 }}
              />
              <Typography variant="caption" sx={{ display: "block", opacity: 0.7 }}>{tierInfo.points.toLocaleString()} Points</Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card sx={{ mb: 6, p: 1, background: `linear-gradient(135deg, #2b2118 0%, #4a3c31 100%)`, color: "white" }}>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={4} alignItems="center">
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.15em" }}>Loyalty Progress</Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>{tier} → {tierInfo.next}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7, mb: 3 }}>
                    {(tierInfo.required - tierInfo.points).toLocaleString()} more points to reach {tierInfo.next}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(tierInfo.points / tierInfo.required) * 100}
                    sx={{ height: 10, borderRadius: 5, bgcolor: alpha("#fff", 0.1), "& .MuiLinearProgress-bar": { bgcolor: tierInfo.color, borderRadius: 5 } }}
                  />
                  <Stack direction="row" justifyContent="space-between" mt={1}>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>0</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>{tierInfo.required.toLocaleString()}</Typography>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Grid container spacing={2}>
                    {[
                      { label: "Available Points", value: tierInfo.points.toLocaleString() },
                      { label: "Lifetime Visits", value: "23" },
                      { label: "Rewards Used", value: "5" },
                      { label: "Money Saved", value: "$140" },
                    ].map((stat) => (
                      <Grid size={6} key={stat.label}>
                        <Box sx={{ p: 2, bgcolor: alpha("#fff", 0.05), borderRadius: 2 }}>
                          <Typography variant="h5" fontWeight={700} sx={{ color: tierInfo.color }}>{stat.value}</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>{stat.label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 5, borderBottom: `1px solid ${alpha("#2b2118", 0.1)}` }}>
          <Tab icon={<IconReceipt size={18} />} iconPosition="start" label="Order History" />
          <Tab icon={<IconUser size={18} />} iconPosition="start" label="Reservations" />
          <Tab icon={<IconHeart size={18} />} iconPosition="start" label="Favourites" />
          <Tab icon={<IconBell size={18} />} iconPosition="start" label="Notifications" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {tab === 0 && (
              <Stack spacing={3}>
                {orders.length === 0 ? (
                  <Typography color="text.secondary" textAlign="center" py={4}>No order history available.</Typography>
                ) : (
                  orders.map((order) => (
                    <Card key={order.id}>
                      <CardContent sx={{ p: 4 }}>
                        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={2}>
                          <Box>
                            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                              <Typography fontWeight={700}>#{order.id.slice(0,8).toUpperCase()}</Typography>
                              <Chip label={order.status} size="small" color={order.status === "COMPLETED" ? "success" : "default"} />
                            </Stack>
                            <Typography variant="body2" color="text.secondary">{new Date(order.created_at).toLocaleDateString()}</Typography>
                            <Typography variant="body2" color="text.secondary" mt={0.5}>
                              {order.items?.map((i: any) => i.menu_item?.name).join(" · ") || "Items"}
                            </Typography>
                          </Box>
                          <Stack alignItems={{ xs: "flex-start", sm: "flex-end" }} spacing={1}>
                            <Typography variant="h5" fontWeight={700}>${order.total_amount}</Typography>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined">Reorder</Button>
                        <Button size="small" variant="text" startIcon={<IconStar size={16} />}>Leave Review</Button>
                      </Stack>
                    </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Stack>
            )}

            {tab === 1 && (
              <Stack spacing={3}>
                {reservations.length === 0 ? (
                  <Typography color="text.secondary" textAlign="center" py={4}>No reservations found.</Typography>
                ) : (
                  reservations.map((res) => (
                    <Card key={res.id}>
                      <CardContent sx={{ p: 4 }}>
                        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={2}>
                          <Box>
                            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                              <Typography fontWeight={700}>#{res.id.slice(0,8).toUpperCase()}</Typography>
                              <Chip label={res.status} size="small" color={res.status === "PENDING" ? "primary" : "default"} />
                            </Stack>
                            <Typography variant="body2" color="text.secondary">{new Date(res.reservation_time).toLocaleString()}</Typography>
                            <Typography variant="body2" color="text.secondary" mt={0.5}>{res.guest_count} guests · Table {res.table?.table_number}</Typography>
                          </Box>
                          {res.status === "PENDING" && (
                            <Stack direction="row" spacing={1}>
                              <Button size="small" variant="text" color="error">Cancel</Button>
                            </Stack>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Stack>
            )}

        {tab === 2 && (
          <AnimatePresence mode="wait">
            {favoriteItems.length === 0 && favoriteLocations.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <IconHeart size={48} color={alpha("#2b2118", 0.2)} />
                <Typography variant="h5" mt={2} color="text.secondary">No saved favourites yet</Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>Heart your favourite dishes to see them here</Typography>
              </Box>
            ) : (
              <Stack spacing={5}>
                {favoriteLocations.length > 0 && (
                  <Box>
                    <Typography variant="h6" fontWeight={700} mb={3}>Favorite Locations</Typography>
                    <Grid container spacing={3}>
                      {favoriteLocations.map(id => {
                        const loc = locations.find(l => l.id === id);
                        if (!loc) return null;
                        return (
                          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={id}>
                            <Card sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
                              <Box sx={{ position: "relative" }}>
                                <CardMedia component="img" height="160" image={loc.image_url || "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=400&auto=format&fit=crop"} alt={loc.name} />
                                <IconButton
                                  size="small"
                                  onClick={() => dispatch(toggleFavoriteLocation(id))}
                                  sx={{ position: "absolute", top: 8, right: 8, bgcolor: alpha("#fff", 0.8), color: "error.main", "&:hover": { bgcolor: "#fff" } }}
                                >
                                  <IconHeartFilled size={18} />
                                </IconButton>
                              </Box>
                              <CardContent sx={{ p: 2, flexGrow: 1 }}>
                                <Typography variant="h6" fontWeight={600} mb={0.5}>{loc.name}</Typography>
                                <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5} mb={2}>
                                  <IconMapPin size={16} /> {loc.address || "Address"}
                                </Typography>
                                <Button component={Link} to={`/locations/${loc.id}`} size="small" variant="outlined" fullWidth>
                                  View Location
                                </Button>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                )}

                {favoriteItems.length > 0 && (
                  <Box>
                    <Typography variant="h6" fontWeight={700} mb={3}>Favorite Dishes</Typography>
                    <Grid container spacing={3}>
                      {favoriteItems.map(id => {
                        const item = menuItems.find(m => m.id === id);
                        if (!item) return null;
                        return (
                          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={id}>
                            <Card sx={{ display: "flex", alignItems: "center", p: 1.5 }}>
                              <Box sx={{ position: "relative" }}>
                                <CardMedia component="img" sx={{ width: 80, height: 80, borderRadius: 1 }} image={item.image_url || "https://images.unsplash.com/photo-1541529086526-db283c563270?q=80&w=400&auto=format&fit=crop"} alt={item.name} />
                                <IconButton
                                  size="small"
                                  onClick={() => dispatch(toggleFavoriteItem(id))}
                                  sx={{ position: "absolute", top: -8, right: -8, bgcolor: "background.paper", color: "error.main", boxShadow: 1, "&:hover": { bgcolor: "background.paper" } }}
                                >
                                  <IconHeartFilled size={14} />
                                </IconButton>
                              </Box>
                              <Box sx={{ ml: 2, flexGrow: 1 }}>
                                <Typography variant="body1" fontWeight={600} lineHeight={1.2} mb={0.5}>{item.name}</Typography>
                                <Typography variant="body2" color="secondary.dark" fontWeight={600}>${item.base_price.toFixed(2)}</Typography>
                              </Box>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                )}
              </Stack>
            )}
          </AnimatePresence>
        )}
        
        {tab === 3 && (
              <Box sx={{ py: 2 }}>
                {notifications.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: "center" }}>
                    <IconBell size={48} color={alpha("#2b2118", 0.2)} />
                    <Typography variant="h5" mt={2} color="text.secondary">All caught up!</Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>No new notifications at this time</Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {notifications.map(notif => (
                      <Card key={notif.id} sx={{ bgcolor: notif.is_read ? 'background.paper' : alpha('#2b2118', 0.03) }}>
                        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                          <Box sx={{ mt: 0.5 }}>
                            <IconBell size={24} color={notif.is_read ? "gray" : "#2b2118"} />
                          </Box>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" fontWeight={notif.is_read ? 500 : 700}>{notif.title}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{notif.message}</Typography>
                            <Typography variant="caption" color="text.secondary">{new Date(notif.created_at).toLocaleString()}</Typography>
                          </Box>
                          {!notif.is_read && (
                            <Button size="small" variant="text" onClick={() => handleMarkRead(notif.id)}>
                              Mark Read
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
