import { useState, useEffect, useMemo } from "react";
import {
  Box, Container, Typography, Grid, Stack, Button, alpha, Card, CardContent,
  Avatar, Tabs, Tab, Chip, LinearProgress, CardMedia, IconButton, CircularProgress,
  Stepper, Step, StepLabel
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconUser, IconReceipt, IconStar, IconMedal, IconHeart, IconBell, 
  IconMapPin, IconHeartFilled, IconCoffee, IconDiamond
} from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { toggleFavoriteItem, toggleFavoriteLocation } from "../../redux/slices/userSlice";
import { getOrdersApi } from "../../api/orders";
import { getReservationsApi } from "../../api/reservations";
import { getMenuItemsApi } from "../../api/menu";
import { getBranchesApi } from "../../api/branches";
import { getNotificationsApi, markNotificationReadApi, Notification } from "../../api/notifications";
import { getMyProfileApi, CustomerProfile } from "../../api/customers";
import { getSubscriptionPlansApi, getMySubscriptionsApi, subscribeApi } from "../../api/subscriptions";
import { toast } from "react-toastify";

const ORDER_STEPS = ["PENDING", "PREPARING", "READY", "DELIVERING", "COMPLETED"];

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
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [mySubscriptions, setMySubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBaseData = async () => {
      setLoading(true);
      try {
        const [mData, lData, pData] = await Promise.all([
          getMenuItemsApi().catch(() => []),
          getBranchesApi().catch(() => []),
          getMyProfileApi().catch(() => null),
        ]);
        setMenuItems(mData);
        setLocations(lData);
        setProfile(pData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBaseData();
  }, []);

  useEffect(() => {
    if (tab === 0) getOrdersApi().then(setOrders).catch(console.error);
    if (tab === 1) getReservationsApi().then(setReservations).catch(console.error);
    if (tab === 3) getNotificationsApi().then(setNotifications).catch(console.error);
    if (tab === 4) {
      getSubscriptionPlansApi().then(setPlans).catch(console.error);
      getMySubscriptionsApi().then(setMySubscriptions).catch(console.error);
    }
  }, [tab]);

  const handleSubscribe = async (planId: string) => {
    try {
      await subscribeApi(planId);
      toast.success("Successfully subscribed!");
      const subs = await getMySubscriptionsApi();
      setMySubscriptions(subs);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Subscription failed");
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationReadApi(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const tier = profile?.tier?.name || "Bronze";
  const points = profile?.loyalty_points || 0;
  
  const tierProgress = useMemo(() => {
    if (tier === "Platinum") return { next: "Max Level", progress: 100, required: points, color: "#e5e4e2" };
    if (tier === "Gold") return { next: "Platinum", progress: (points / 10000) * 100, required: 10000, color: "#d4af37" };
    if (tier === "Silver") return { next: "Gold", progress: (points / 5000) * 100, required: 5000, color: "#aaa9ad" };
    return { next: "Silver", progress: (points / 2000) * 100, required: 2000, color: "#cd7f32" };
  }, [tier, points]);

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Box sx={{ bgcolor: "primary.main", color: "white", py: 10 }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: "column", sm: "row" }} spacing={4} alignItems={{ xs: "center", sm: "flex-end" }}>
            <Avatar sx={{ width: 100, height: 100, fontSize: "2.5rem", fontWeight: 700, bgcolor: alpha(tierProgress.color, 0.2), color: "secondary.main", border: `3px solid ${alpha(tierProgress.color, 0.4)}` }}>
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
                sx={{ bgcolor: alpha(tierProgress.color, 0.15), color: tierProgress.color, fontWeight: 700, fontSize: "1rem", py: 2.5, px: 1, mb: 1, borderRadius: 2 }}
              />
              <Typography variant="caption" sx={{ display: "block", opacity: 0.7 }}>{points.toLocaleString()} Points</Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 5, borderBottom: `1px solid ${alpha("#2b2118", 0.1)}` }}>
          <Tab icon={<IconReceipt size={18} />} iconPosition="start" label="Order Tracking" />
          <Tab icon={<IconUser size={18} />} iconPosition="start" label="Reservations" />
          <Tab icon={<IconHeart size={18} />} iconPosition="start" label="Favourites" />
          <Tab icon={<IconBell size={18} />} iconPosition="start" label="Notifications" />
          <Tab icon={<IconDiamond size={18} />} iconPosition="start" label="Subscriptions" />
          <Tab icon={<IconMedal size={18} />} iconPosition="start" label="Loyalty Hub" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* ORDERS TAB */}
            {tab === 0 && (
              <Stack spacing={4}>
                {orders.length === 0 ? (
                  <Typography color="text.secondary" textAlign="center" py={4}>No order history available.</Typography>
                ) : (
                  orders.map((order) => {
                    let activeStep = ORDER_STEPS.indexOf(order.status);
                    if (order.status === "CANCELLED") activeStep = -1;

                    return (
                    <Card key={order.id} sx={{ overflow: "visible" }}>
                      <CardContent sx={{ p: 4 }}>
                        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} gap={4}>
                          <Box sx={{ flex: 1, minWidth: 250 }}>
                            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                              <Typography fontWeight={700}>#{order.id.slice(0,8).toUpperCase()}</Typography>
                              {order.status === "CANCELLED" ? (
                                <Chip label="CANCELLED" size="small" color="error" />
                              ) : (
                                <Chip label={order.status} size="small" color={order.status === "COMPLETED" ? "success" : "secondary"} />
                              )}
                            </Stack>
                            <Typography variant="body2" color="text.secondary">{new Date(order.created_at).toLocaleString()}</Typography>
                            <Typography variant="body2" color="text.secondary" mt={0.5}>
                              {order.items?.map((i: any) => i.menu_item?.name).join(" · ") || "Items"}
                            </Typography>
                          </Box>
                          
                          {/* Live Order Tracking Stepper */}
                          {order.status !== "CANCELLED" && (
                            <Box sx={{ flex: 2, w: "100%", display: { xs: "none", sm: "block" } }}>
                              <Stepper activeStep={activeStep} alternativeLabel>
                                {ORDER_STEPS.map((label) => (
                                  <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                  </Step>
                                ))}
                              </Stepper>
                            </Box>
                          )}

                          <Stack alignItems={{ xs: "flex-start", sm: "flex-end" }} spacing={1}>
                            <Typography variant="h5" fontWeight={700}>${order.total_amount}</Typography>
                            <Stack direction="row" spacing={1}>
                              <Button size="small" variant="outlined">Reorder</Button>
                              <Button size="small" variant="text" startIcon={<IconStar size={16} />}>Review</Button>
                            </Stack>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                    );
                  })
                )}
              </Stack>
            )}

            {/* RESERVATIONS TAB */}
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

            {/* FAVOURITES TAB */}
            {tab === 2 && (
              <AnimatePresence mode="wait">
                {favoriteItems.length === 0 && favoriteLocations.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: "center" }}>
                    <IconHeart size={48} color={alpha("#2b2118", 0.2)} />
                    <Typography variant="h5" mt={2} color="text.secondary">No saved favourites yet</Typography>
                  </Box>
                ) : (
                  <Stack spacing={5}>
                    {/* ... Existing Favorite Locations & Dishes code ... */}
                    <Typography>Your favorite dishes and locations appear here.</Typography>
                  </Stack>
                )}
              </AnimatePresence>
            )}
            
            {/* NOTIFICATIONS TAB */}
            {tab === 3 && (
              <Box sx={{ py: 2 }}>
                {notifications.length === 0 ? (
                  <Typography textAlign="center">No notifications</Typography>
                ) : (
                  <Stack spacing={2}>
                    {notifications.map(notif => (
                      <Card key={notif.id} sx={{ bgcolor: notif.is_read ? 'background.paper' : alpha('#2b2118', 0.03) }}>
                        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                          <IconBell size={24} color={notif.is_read ? "gray" : "#2b2118"} />
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" fontWeight={notif.is_read ? 500 : 700}>{notif.title}</Typography>
                            <Typography variant="body2" color="text.secondary">{notif.message}</Typography>
                            <Typography variant="caption" color="text.secondary">{new Date(notif.created_at).toLocaleString()}</Typography>
                          </Box>
                          {!notif.is_read && (
                            <Button size="small" onClick={() => handleMarkRead(notif.id)}>Mark Read</Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>
            )}

            {/* SUBSCRIPTIONS TAB */}
            {tab === 4 && (
              <Stack spacing={6}>
                <Box>
                  <Typography variant="h4" fontWeight={700} mb={1}>Your Memberships</Typography>
                  <Typography variant="body1" color="text.secondary" mb={3}>Manage your active coffee and meal club subscriptions.</Typography>
                  
                  {mySubscriptions.length === 0 ? (
                    <Card sx={{ bgcolor: alpha("#2b2118", 0.03), p: 4, textAlign: "center", borderStyle: "dashed" }}>
                      <IconCoffee size={48} color={alpha("#2b2118", 0.3)} />
                      <Typography variant="h6" mt={2}>No active subscriptions</Typography>
                      <Typography variant="body2" color="text.secondary">Browse our plans below and become a VIP member!</Typography>
                    </Card>
                  ) : (
                    <Grid container spacing={3}>
                      {mySubscriptions.map(sub => (
                        <Grid size={{ xs: 12, md: 6 }} key={sub.id}>
                          <Card sx={{ border: "2px solid", borderColor: "secondary.main" }}>
                            <CardContent sx={{ p: 4 }}>
                              <Stack direction="row" justifyContent="space-between" mb={2}>
                                <Typography variant="h5" fontWeight={700}>{sub.plan?.name}</Typography>
                                <Chip label={sub.status} color={sub.status === "ACTIVE" ? "success" : "error"} />
                              </Stack>
                              <Typography variant="body1" mb={1}>{sub.plan?.description}</Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Next Billing: {new Date(sub.next_billing).toLocaleDateString()}
                              </Typography>
                              <Button variant="outlined" color="error" fullWidth sx={{ mt: 3 }}>Cancel Subscription</Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>

                <Box>
                  <Typography variant="h4" fontWeight={700} mb={3}>Available Plans</Typography>
                  <Grid container spacing={4}>
                    {plans.map(plan => (
                      <Grid size={{ xs: 12, md: 4 }} key={plan.id}>
                        <Card sx={{ height: "100%", display: "flex", flexDirection: "column", p: 1 }}>
                          <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                            <Typography variant="h5" fontWeight={700} mb={1}>{plan.name}</Typography>
                            <Typography variant="body2" color="text.secondary" mb={3}>{plan.description}</Typography>
                            <Typography variant="h3" fontWeight={800} mb={3}>
                              ${plan.price}<Typography component="span" variant="body1" color="text.secondary">/{plan.billing_cycle.toLowerCase()}</Typography>
                            </Typography>
                            
                            <Stack spacing={1} mb={4}>
                              {(plan.features || []).map((feature: string, idx: number) => (
                                <Typography key={idx} variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <IconStar size={16} color="#d4af37" /> {feature}
                                </Typography>
                              ))}
                            </Stack>

                            <Button 
                              variant="contained" 
                              color="primary" 
                              fullWidth 
                              sx={{ mt: "auto", py: 1.5, borderRadius: 8 }}
                              onClick={() => handleSubscribe(plan.id)}
                            >
                              Subscribe Now
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Stack>
            )}

            {/* LOYALTY HUB TAB */}
            {tab === 5 && (
              <Box>
                <Card sx={{ mb: 6, p: 1, background: `linear-gradient(135deg, #1a1a1a 0%, #333 100%)`, color: "white" }}>
                  <CardContent sx={{ p: { xs: 4, md: 6 } }}>
                    <Grid container spacing={6} alignItems="center">
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.15em" }}>Loyalty Progress</Typography>
                        <Typography variant="h3" fontWeight={700} sx={{ mb: 1, fontFamily: '"Cormorant Garamond", serif' }}>
                          {tier} → {tierProgress.next}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.8, mb: 4 }}>
                          {tier === "Platinum" ? "You have reached the maximum tier! Enjoy your VIP perks." : `${(tierProgress.required - points).toLocaleString()} more points to reach ${tierProgress.next}`}
                        </Typography>
                        
                        <Box sx={{ position: "relative", pt: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(tierProgress.progress, 100)}
                            sx={{ 
                              height: 12, borderRadius: 6, bgcolor: alpha("#fff", 0.1), 
                              "& .MuiLinearProgress-bar": { bgcolor: tierProgress.color, borderRadius: 6 } 
                            }}
                          />
                          <Stack direction="row" justifyContent="space-between" mt={1}>
                            <Typography variant="caption" sx={{ opacity: 0.6 }}>0</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.6, color: tierProgress.color, fontWeight: 700 }}>{tierProgress.required.toLocaleString()}</Typography>
                          </Stack>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Grid container spacing={3}>
                          {[
                            { label: "Available Points", value: points.toLocaleString() },
                            { label: "Lifetime Visits", value: profile?.total_visits || 0 },
                            { label: "Rewards Redeemed", value: "0" },
                            { label: "Money Spent", value: `$${profile?.total_spent?.toFixed(2) || "0.00"}` },
                          ].map((stat) => (
                            <Grid size={6} key={stat.label}>
                              <Box sx={{ p: 3, bgcolor: alpha("#fff", 0.05), borderRadius: 3, backdropFilter: "blur(10px)" }}>
                                <Typography variant="h4" fontWeight={700} sx={{ color: tierProgress.color, mb: 0.5 }}>{stat.value}</Typography>
                                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: "0.85rem" }}>{stat.label}</Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Typography variant="h5" fontWeight={700} mb={3}>Recent Points Activity</Typography>
                <Card>
                  <CardContent sx={{ p: 0 }}>
                    {(!profile?.loyaltyHistory || profile.loyaltyHistory.length === 0) ? (
                      <Typography color="text.secondary" p={4} textAlign="center">No point activity yet.</Typography>
                    ) : (
                      <Stack divider={<Box sx={{ borderBottom: "1px solid", borderColor: "divider" }} />}>
                        {profile.loyaltyHistory.map((tx: any) => (
                          <Box key={tx.id} sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                              <Typography fontWeight={600}>{tx.transaction_type}</Typography>
                              <Typography variant="caption" color="text.secondary">{new Date(tx.created_at).toLocaleString()}</Typography>
                            </Box>
                            <Typography fontWeight={700} color={tx.points > 0 ? "success.main" : "error.main"}>
                              {tx.points > 0 ? "+" : ""}{tx.points} pts
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
