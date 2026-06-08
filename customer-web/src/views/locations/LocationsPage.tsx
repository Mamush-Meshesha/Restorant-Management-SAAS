import { useState, useEffect } from "react";
import { Box, Container, Typography, Grid, Card, CardMedia, CardContent, Button, Stack, Chip, Divider, InputBase, alpha, IconButton, CircularProgress, Alert } from "@mui/material";
import { IconMapPin, IconStarFilled, IconSearch, IconAdjustmentsHorizontal, IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { toggleFavoriteLocation } from "../../redux/slices/userSlice";
import { getBranchesApi } from "../../api/branches";

export default function LocationsPage() {
  const dispatch = useAppDispatch();
  const favoriteLocations = useAppSelector(state => state.user.favoriteLocations);

  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("All");

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getBranchesApi();
        setLocations(data);
      } catch (err) {
        console.error("Failed to fetch locations:", err);
        setError("Failed to load locations.");
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const cities = ["All", ...Array.from(new Set(locations.map((l) => l.name.split(" ")[0] || "Unknown")))];

  const filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      loc.name.toLowerCase().includes(search.toLowerCase()) ||
      (loc.address || "").toLowerCase().includes(search.toLowerCase());
    const locCity = loc.name.split(" ")[0] || "Unknown";
    const matchesCity = cityFilter === "All" || locCity === cityFilter;
    return matchesSearch && matchesCity;
  });

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Box sx={{ bgcolor: "primary.main", color: "white", py: 12, textAlign: "center" }}>
        <Container maxWidth="md">
          <Typography variant="overline" sx={{ color: "secondary.main", letterSpacing: "0.2em", mb: 2, display: "block" }}>
            Our Restaurants
          </Typography>
          <Typography variant="h2" sx={{ mb: 3 }}>Discover Our Locations</Typography>
          <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 600, mx: "auto" }}>
            Explore our curated portfolio of dining destinations around the globe. Each location offers a unique interpretation of the RÉSERVER experience.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 6, alignItems: "center", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={2} sx={{ overflowX: "auto", pb: { xs: 1, md: 0 } }}>
            {cities.map((city) => (
              <Chip
                key={city}
                label={city}
                onClick={() => setCityFilter(city)}
                sx={{
                  bgcolor: cityFilter === city ? "primary.main" : "transparent",
                  color: cityFilter === city ? "white" : "text.primary",
                  border: `1px solid ${cityFilter === city ? "transparent" : alpha("#2b2118", 0.2)}`,
                  fontWeight: cityFilter === city ? 600 : 400,
                  px: 1,
                  "&:hover": { bgcolor: cityFilter === city ? "primary.dark" : alpha("#2b2118", 0.05) },
                }}
              />
            ))}
          </Stack>
          <Box sx={{ display: "flex", gap: 2, flexGrow: { xs: 1, md: 0 } }}>
            <Box sx={{ display: "flex", alignItems: "center", border: `1px solid ${alpha("#2b2118", 0.2)}`, borderRadius: 1, px: 2, py: 1, width: { xs: "100%", md: 300 } }}>
              <IconSearch size={20} color="#6e6259" />
              <InputBase
                placeholder="Search location or cuisine..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ ml: 1, flex: 1, color: "text.primary" }}
              />
            </Box>
            <Button variant="outlined" sx={{ minWidth: 48, p: 0, borderColor: alpha("#2b2118", 0.2) }}>
              <IconAdjustmentsHorizontal size={20} />
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : filteredLocations.length === 0 ? (
          <Box sx={{ py: 12, textAlign: "center" }}>
            <Typography variant="h5" color="text.secondary" mb={2}>
              No locations match your search.
            </Typography>
            <Button variant="outlined" onClick={() => { setCityFilter("All"); setSearch(""); }}>
              Clear Filters
            </Button>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {filteredLocations.map((loc, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={loc.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, overflow: "hidden", "&:hover": { boxShadow: "0 12px 40px rgba(0,0,0,0.08)" } }}>
                    <CardMedia
                      component="img"
                      image={loc.image || "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=2070&auto=format&fit=crop"}
                      alt={loc.name}
                      sx={{ width: { xs: "100%", sm: 280 }, height: { xs: 240, sm: "auto" } }}
                    />
                    <CardContent sx={{ flex: 1, p: 4, display: "flex", flexDirection: "column" }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography variant="h4" sx={{ fontWeight: 600, letterSpacing: "-0.01em" }}>{loc.name}</Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ bgcolor: "background.default", px: 1, py: 0.5, borderRadius: 1 }}>
                          <IconStarFilled size={14} color="#d4af37" />
                          <Typography variant="body2" fontWeight={600}>{loc.rating || "4.8"}</Typography>
                        </Stack>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 3 }}>
                        <IconMapPin size={16} /> {loc.address || "Address not specified"}
                      </Typography>
                      <Stack direction="row" spacing={1} mb={3} flexWrap="wrap" useFlexGap>
                        <Chip label={loc.cuisine || "Fine Dining"} size="small" sx={{ bgcolor: alpha("#d4af37", 0.1), color: "#997e24", fontWeight: 500 }} />
                        {(loc.tags || []).map((tag: string) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ borderColor: alpha("#2b2118", 0.1) }} />
                        ))}
                      </Stack>
                      <Divider sx={{ mt: "auto", mb: 2 }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          sx={{
                            color: loc.is_active ? "success.main" : "error.main",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          ● {loc.is_active ? "Available" : "Closed"}
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <IconButton
                            size="small"
                            onClick={() => dispatch(toggleFavoriteLocation(loc.id))}
                            sx={{
                              color: favoriteLocations.includes(loc.id) ? "error.main" : "text.secondary",
                              bgcolor: favoriteLocations.includes(loc.id) ? alpha("#d32f2f", 0.08) : alpha("#2b2118", 0.04),
                              "&:hover": { bgcolor: alpha("#d32f2f", 0.12), color: "error.main" }
                            }}
                          >
                            {favoriteLocations.includes(loc.id) ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
                          </IconButton>
                          <Button component={Link} to={`/locations/${loc.id}`} variant="text" color="primary" sx={{ fontWeight: 600 }}>
                            Explore →
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
