import { useState } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { joinWaitlist } from "../../api/waitlist";
import { Box, Typography, Container, Button, Stack, TextField, Card, CardContent, IconButton, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import { IconArrowLeft, IconMinus, IconPlus, IconClockHour4 } from "@tabler/icons-react";

export const WaitlistJoin = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", phone: "", guests: 2 });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId) return;

    try {
      setLoading(true);
      const res = await joinWaitlist({
        branch_id: branchId,
        customer_name: formData.name,
        customer_phone: formData.phone,
        guest_count: formData.guests,
      });

      toast.success("You're on the list!");
      const waitlistId = res.data.data.id;
      localStorage.setItem("active_waitlist_id", waitlistId);
      navigate(`/waitlist/status/${waitlistId}`);
    } catch (error) {
      toast.error("Failed to join waitlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: { xs: "column", md: "row" }, bgcolor: "background.default" }}>
      
      {/* Left side Image */}
      <Box sx={{ 
        width: { xs: "100%", md: "50%" }, 
        height: { xs: "30vh", md: "100vh" },
        position: "relative"
      }}>
        <img 
          src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop"
          alt="Waitlist"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <Button 
          component={RouterLink} 
          to="/"
          startIcon={<IconArrowLeft />}
          sx={{ position: "absolute", top: 24, left: 24, bgcolor: "background.paper", "&:hover": { bgcolor: "background.default" } }}
          color="primary"
          variant="contained"
        >
          Return Home
        </Button>
      </Box>

      {/* Right side Form */}
      <Box sx={{ 
        width: { xs: "100%", md: "50%" }, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        p: { xs: 4, md: 8 }
      }}>
        <Container maxWidth="sm">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Box textAlign="center" mb={6}>
              <IconClockHour4 size={48} stroke={1.5} style={{ marginBottom: 16 }} />
              <Typography variant="h2" mb={1} color="primary.main">
                Join the Waitlist
              </Typography>
              <Typography variant="body1" color="text.secondary">
                We'll text you when your table is ready. Skip the line, savor the time.
              </Typography>
            </Box>

            <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", p: { xs: 2, sm: 4 } }}>
              <CardContent component="form" onSubmit={handleSubmit} sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                <Stack spacing={4}>
                  
                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                      Your Name
                    </Typography>
                    <TextField 
                      fullWidth
                      variant="outlined"
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </Box>

                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                      Phone Number
                    </Typography>
                    <TextField 
                      fullWidth
                      variant="outlined"
                      required
                      type="tel"
                      placeholder="(555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </Box>

                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                      Party Size
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1 }}>
                      <IconButton onClick={() => setFormData({ ...formData, guests: Math.max(1, formData.guests - 1) })}>
                        <IconMinus size={20} />
                      </IconButton>
                      <Typography variant="h5" fontWeight={600}>{formData.guests}</Typography>
                      <IconButton onClick={() => setFormData({ ...formData, guests: formData.guests + 1 })}>
                        <IconPlus size={20} />
                      </IconButton>
                    </Box>
                  </Box>

                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    size="large" 
                    disabled={loading}
                    sx={{ mt: 2, py: 2 }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Join Waitlist"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </Box>

    </Box>
  );
};

export default WaitlistJoin;
