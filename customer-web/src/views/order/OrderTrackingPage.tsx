import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Box, Container, Typography, Card, CardContent, Divider, Stack, 
  Stepper, Step, StepLabel, StepContent, alpha, useTheme, Button,
  LinearProgress
} from "@mui/material";
import { motion } from "framer-motion";
import { IconChevronLeft, IconReceipt, IconMotorbike, IconCheck, IconChefHat, IconClock } from "@tabler/icons-react";
import { getSocket } from "../../config/socket";
import { getOrdersApi } from "../../api/orders";

const STATUS_STAGES = [
  { status: "OPEN", label: "Order Received", icon: <IconReceipt size={24} />, description: "We have received your order." },
  { status: "IN_PROGRESS", label: "Preparing", icon: <IconChefHat size={24} />, description: "The kitchen is preparing your food." },
  { status: "READY", label: "Ready / Out for Delivery", icon: <IconMotorbike size={24} />, description: "Your order is ready." },
  { status: "SERVED", label: "Delivered", icon: <IconCheck size={24} />, description: "Order has been delivered." },
];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const theme = useTheme();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orders = await getOrdersApi();
        const found = orders.find((o: any) => o.id === id);
        if (found) setOrder(found);
        else setError("Order not found");
      } catch (err) {
        setError("Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();

    const socket = getSocket();
    socket.on("order_update", () => {
      fetchOrder();
    });

    return () => {
      socket.off("order_update");
    };
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <LinearProgress sx={{ width: "100%", maxWidth: 300 }} />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h5" color="error" mb={2}>{error || "Order not found"}</Typography>
        <Button component={Link} to="/account" variant="contained">Go to My Orders</Button>
      </Container>
    );
  }

  const currentStageIndex = STATUS_STAGES.findIndex(s => s.status === order.status);
  const activeStep = currentStageIndex === -1 ? (order.status === "CLOSED" ? 4 : 0) : currentStageIndex;

  const estimatedTime = new Date(order.created_at);
  estimatedTime.setMinutes(estimatedTime.getMinutes() + 45); // Fake 45 min ETA

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 10 }}>
      {/* Header */}
      <Box sx={{ bgcolor: "primary.main", color: "white", py: 4, px: 2, mb: -6 }}>
        <Container maxWidth="md">
          <Button 
            component={Link} to="/account" 
            startIcon={<IconChevronLeft />} 
            sx={{ color: "white", mb: 2, opacity: 0.8, "&:hover": { opacity: 1 } }}
          >
            Back to Orders
          </Button>
          <Typography variant="h3" fontWeight={800} mb={1}>Track Order</Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Order #{order.order_number} · {order.order_type.replace("_", " ")}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ position: "relative", zIndex: 2 }}>
        <Card sx={{ borderRadius: 4, boxShadow: "0 12px 40px rgba(0,0,0,0.08)", mb: 4 }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" mb={5} spacing={2}>
              <Box>
                <Typography variant="overline" color="secondary.main" fontWeight={700}>Estimated Arrival</Typography>
                <Typography variant="h4" fontWeight={800}>{estimatedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
              </Box>
              <Box sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.dark, px: 2, py: 1, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconClock size={20} />
                <Typography fontWeight={700}>On Time</Typography>
              </Box>
            </Stack>

            <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 4 }}>
              {STATUS_STAGES.map((stage, index) => {
                const isActive = index === activeStep;
                const isCompleted = index < activeStep;
                
                return (
                  <Step key={stage.status}>
                    <StepLabel 
                      StepIconComponent={() => (
                        <Box
                          sx={{
                            width: 48, height: 48, borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            bgcolor: isActive ? "primary.main" : isCompleted ? "success.main" : alpha(theme.palette.text.disabled, 0.2),
                            color: isActive || isCompleted ? "white" : theme.palette.text.disabled,
                            boxShadow: isActive ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.2)}` : "none",
                            transition: "all 0.3s"
                          }}
                        >
                          {stage.icon}
                        </Box>
                      )}
                    >
                      <Typography variant="h6" fontWeight={isActive ? 800 : 500} color={isActive ? "text.primary" : "text.secondary"}>
                        {stage.label}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }}>
                        <Typography color="text.secondary" sx={{ mt: 1, mb: 2, pl: 1 }}>
                          {stage.description}
                        </Typography>
                      </motion.div>
                    </StepContent>
                  </Step>
                );
              })}
            </Stepper>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Typography variant="h6" fontWeight={700} mb={3}>Order Details</Typography>
            <Stack spacing={2} mb={3}>
              {order.items?.map((item: any) => (
                <Stack key={item.id} direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      {item.quantity}x
                    </Box>
                    <Typography fontWeight={500}>{item.menuItem?.name || 'Item'}</Typography>
                  </Stack>
                  <Typography fontWeight={600}>${(item.unit_price * item.quantity).toFixed(2)}</Typography>
                </Stack>
              ))}
            </Stack>
            <Divider sx={{ my: 3 }} />
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography>${(order.subtotal || 0).toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Tax & Fees</Typography>
                <Typography>${((order.tax_amount || 0) + (order.total_amount - order.subtotal - (order.tax_amount || 0))).toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" mt={1}>
                <Typography variant="h6" fontWeight={800}>Total</Typography>
                <Typography variant="h6" fontWeight={800} color="primary.main">${(order.total_amount || 0).toFixed(2)}</Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
