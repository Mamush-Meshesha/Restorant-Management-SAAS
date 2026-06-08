import { Box, Container, Typography, Grid, Stack, Button, alpha, IconButton, CircularProgress, Alert } from "@mui/material";
import { IconMapPin, IconClock, IconGlassFull, IconCar, IconWifi, IconWheelchair, IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { toggleFavoriteLocation } from "../../redux/slices/userSlice";
import { getBranchByIdApi } from "../../api/branches";




const HERO_IMAGES: Record<string, [string, string, string]> = {
  loc_1: [
    "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop",
  ],
  loc_2: [
    "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=2070&auto=format&fit=crop",
  ],
};

const AMENITIES = [
  { icon: IconGlassFull, label: "Sommelier Service" },
  { icon: IconCar, label: "Valet Parking" },
  { icon: IconWifi, label: "Complimentary Wi-Fi" },
  { icon: IconWheelchair, label: "Wheelchair Accessible" },
];

export default function LocationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const favoriteLocations = useAppSelector(state => state.user.favoriteLocations);

  const locId = id ?? "loc_1";
  
  const [loc, setLoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLoc = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getBranchByIdApi(locId);
        setLoc(data);
      } catch (err) {
        console.error("Failed to fetch branch details", err);
        setError("Failed to load location details.");
      } finally {
        setLoading(false);
      }
    };
    fetchLoc();
  }, [locId]);

  const images = HERO_IMAGES[locId] ?? HERO_IMAGES["loc_1"];

  if (loading) {
    return (
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !loc) {
    return (
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Alert severity="error">{error || "Location not found"}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Hero Gallery */}
      <Box sx={{ height: { xs: "50vh", md: "70vh" }, display: "flex" }}>
        <Box sx={{ width: { xs: "100%", md: "65%" }, height: "100%", overflow: "hidden" }}>
          <img src={images[0]} alt="Interior" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </Box>
        <Box sx={{ width: "35%", height: "100%", display: { xs: "none", md: "flex" }, flexDirection: "column" }}>
          <img src={images[1]} alt="Detail 1" style={{ width: "100%", height: "50%", objectFit: "cover" }} />
          <img src={images[2]} alt="Detail 2" style={{ width: "100%", height: "50%", objectFit: "cover" }} />
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Grid container spacing={8}>
          {/* Left: Description */}
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                <Box>
                  <Typography variant="overline" color="secondary.main" sx={{ letterSpacing: "0.2em", mb: 1, display: "block" }}>
                    Fine Dining
                  </Typography>
                  <Typography variant="h1" sx={{ mb: 4, fontSize: { xs: "3rem", md: "4.5rem" } }}>
                    {loc.name}
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => dispatch(toggleFavoriteLocation(locId))}
                  sx={{
                    mt: 2,
                    color: favoriteLocations.includes(locId) ? "error.main" : "text.secondary",
                    bgcolor: favoriteLocations.includes(locId) ? alpha("#d32f2f", 0.08) : alpha("#2b2118", 0.04),
                    "&:hover": { bgcolor: alpha("#d32f2f", 0.12), color: "error.main" }
                  }}
                >
                  {favoriteLocations.includes(locId) ? <IconHeartFilled size={28} /> : <IconHeart size={28} />}
                </IconButton>
              </Stack>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.1rem", lineHeight: 1.8, mb: 6, maxWidth: 800 }}>
                {loc.description || "Join us at this spectacular location for an unforgettable dining experience featuring the finest local and international ingredients, prepared with precision and care."}
              </Typography>

              <Typography variant="h5" fontWeight={700} mb={3}>Amenities & Features</Typography>
              <Grid container spacing={3} sx={{ mb: 6 }}>
                {AMENITIES.map((amenity, i) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={i}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha("#d4af37", 0.1), color: "#997e24", display: "flex" }}>
                        <amenity.icon size={20} />
                      </Box>
                      <Typography variant="body2" fontWeight={500}>{amenity.label}</Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ p: 4, border: `1px solid ${alpha("#2b2118", 0.1)}`, borderRadius: 2, bgcolor: alpha("#2b2118", 0.02) }}>
                <Typography variant="body1" fontStyle="italic" color="text.secondary" mb={3}>
                  "A seven-course journey through our culinary philosophy, changing with the micro-seasons."
                </Typography>
                <Button component={Link} to="/menu" variant="outlined" color="primary">
                  View Full Menu
                </Button>
              </Box>
            </motion.div>
          </Grid>

          {/* Right: Sticky Booking Panel */}
          <Grid size={{ xs: 12, md: 5, lg: 4 }}>
            <Box sx={{ position: { md: "sticky" }, top: { md: 120 } }}>
              <Box sx={{ p: 5, bgcolor: "primary.main", color: "primary.contrastText", borderRadius: 3 }}>
                <Typography variant="h4" sx={{ mb: 4 }}>Reserve a Table</Typography>
                <Stack spacing={3} mb={5}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <IconMapPin opacity={0.7} />
                    <Box>
                      <Typography fontWeight={600} mb={0.5}>Address</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>{loc.address}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <IconClock opacity={0.7} />
                    <Box>
                      <Typography fontWeight={600} mb={0.5}>Hours</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>Lunch: 12:00 PM – 2:30 PM<br />Dinner: 6:00 PM – 10:30 PM</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Box sx={{ opacity: 0.7, mt: 0.5 }}>📞</Box>
                    <Box>
                      <Typography fontWeight={600} mb={0.5}>Contact</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>{loc.phone}<br />{loc.email}</Typography>
                    </Box>
                  </Stack>
                </Stack>
                <Button
                  component={Link}
                  to="/reservations"
                  variant="contained"
                  color="secondary"
                  fullWidth
                  size="large"
                  sx={{ py: 2, fontSize: "1.1rem" }}
                >
                  Book Experience
                </Button>
                <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: 2, opacity: 0.6 }}>
                  For parties of 8 or more, please contact us directly.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
