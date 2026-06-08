import { useState, useEffect } from "react";
import {
  Box, Container, Typography, Grid, Card, CardContent, CardMedia, Stack, Chip,
  Divider, InputBase, IconButton, alpha, Tooltip, Button, Tabs, Tab, CircularProgress, Alert
} from "@mui/material";
import { IconSearch, IconLeaf, IconInfoCircle, IconChefHat, IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { toggleFavoriteItem } from "../../redux/slices/userSlice";
import { getMenuCategoriesApi, getMenuItemsApi } from "../../api/menu";

const DIETARY = ["Vegan", "Vegetarian", "Gluten-Free", "Nut-Free"];


export default function MenuPage() {
  const dispatch = useAppDispatch();
  const favoriteItems = useAppSelector(state => state.user.favoriteItems);

  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [activeDietary, setActiveDietary] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [cats, items] = await Promise.all([
          getMenuCategoriesApi(),
          getMenuItemsApi()
        ]);
        setCategories(cats);
        setMenuItems(items);
        if (cats.length > 0) {
          setActiveCategory(cats[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch menu:", err);
        setError("Failed to load menu. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleDietary = (pref: string) => {
    setActiveDietary((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const filteredMenu = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || item.category_id === activeCategory;
    
    const matchesDietary = activeDietary.every((d) => {
      if (d === "Vegan") return item.is_vegan;
      if (d === "Vegetarian") return item.is_vegetarian;
      if (d === "Gluten-Free") return item.is_gluten_free;
      return true; // Simple mapping for now
    });

    return matchesSearch && matchesCategory && matchesDietary;
  });

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ bgcolor: "primary.main", color: "white", py: 12, textAlign: "center" }}>
        <Container maxWidth="md">
          <Typography
            variant="overline"
            sx={{ color: "secondary.main", letterSpacing: "0.2em", mb: 2, display: "block" }}
          >
            Seasonal Tasting
          </Typography>
          <Typography variant="h2" sx={{ mb: 3 }}>
            Culinary Excellence
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 600, mx: "auto" }}>
            Our menu is a celebration of seasonal ingredients, meticulously sourced and prepared with
            unparalleled precision.
          </Typography>
        </Container>
      </Box>

      {/* Sticky Filter Bar */}
      <Box
        sx={{
          position: "sticky",
          top: 80,
          zIndex: 10,
          bgcolor: "background.paper",
          borderBottom: `1px solid ${alpha("#2b2118", 0.08)}`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "stretch", md: "center" }}
            gap={2}
            py={2}
          >
            {/* Category Tabs */}
            <Tabs
              value={activeCategory}
              onChange={(_, v) => setActiveCategory(v)}
              variant="scrollable"
              scrollButtons="auto"
              TabIndicatorProps={{ style: { backgroundColor: "#d4af37", height: 3 } }}
              sx={{
                minHeight: 42,
                flexGrow: 1,
                "& .MuiTab-root": {
                  minHeight: 42,
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  color: "text.secondary",
                  px: 2.5,
                },
                "& .Mui-selected": {
                  color: "primary.main",
                  fontWeight: 700,
                },
              }}
            >
              <Tab key="All" label="All" value="All" />
              {categories.map((cat) => (
                <Tab key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Tabs>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />

            {/* Search */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                border: `1px solid ${alpha("#2b2118", 0.15)}`,
                borderRadius: 1,
                px: 2,
                py: 0.75,
                minWidth: { md: 260 },
              }}
            >
              <IconSearch size={18} color="#6e6259" />
              <InputBase
                placeholder="Search dishes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ ml: 1, flex: 1, fontSize: "0.9rem" }}
              />
            </Box>

            {/* Dietary Chips */}
            <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: { xs: 0.5, md: 0 }, flexShrink: 0 }}>
              {DIETARY.map((diet) => (
                <Chip
                  key={diet}
                  label={diet}
                  onClick={() => toggleDietary(diet)}
                  size="small"
                  icon={diet === "Vegan" || diet === "Vegetarian" ? <IconLeaf size={13} /> : undefined}
                  sx={{
                    bgcolor: activeDietary.includes(diet) ? "secondary.main" : "transparent",
                    color: activeDietary.includes(diet) ? "primary.main" : "text.secondary",
                    border: `1px solid ${
                      activeDietary.includes(diet) ? "transparent" : alpha("#2b2118", 0.15)
                    }`,
                    fontWeight: activeDietary.includes(diet) ? 700 : 400,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                />
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Menu Grid */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
        ) : filteredMenu.length === 0 ? (
          <Box sx={{ py: 12, textAlign: "center" }}>
            <Typography variant="h5" color="text.secondary" mb={2}>
              No dishes match your current filters.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setActiveCategory("All");
                setActiveDietary([]);
                setSearch("");
              }}
            >
              Clear All Filters
            </Button>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {filteredMenu.map((item, index) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={item.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  style={{ height: "100%" }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      border: "none",
                      bgcolor: "transparent",
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        overflow: "hidden",
                        borderRadius: 2,
                        aspectRatio: "4/3",
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                        alt={item.name}
                        sx={{
                          height: "100%",
                          transition: "transform 0.5s",
                          "&:hover": { transform: "scale(1.05)" },
                        }}
                      />
                      {item.isChefRecommended && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 12,
                            left: 12,
                            bgcolor: "white",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                          }}
                        >
                          <IconChefHat size={16} color="#d4af37" />
                          <Typography variant="caption" fontWeight={700}>
                            Chef's Pick
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <CardContent
                      sx={{ px: 0, py: 2, flexGrow: 1, display: "flex", flexDirection: "column" }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        mb={1}
                      >
                        <Typography variant="h5" fontWeight={600}>
                          {item.name}
                        </Typography>
                        <Typography variant="h6" color="secondary.dark" sx={{ flexShrink: 0, ml: 1 }}>
                          ${item.base_price.toFixed(2)}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2, flexGrow: 1, lineHeight: 1.7 }}
                      >
                        {item.description}
                      </Typography>

                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {item.is_vegetarian && (
                            <Typography variant="caption" sx={{ color: "success.main", fontWeight: 600, bgcolor: alpha("#4caf50", 0.1), px: 1, py: 0.3, borderRadius: 1 }}>
                              Vegetarian
                            </Typography>
                          )}
                          {item.is_vegan && (
                            <Typography variant="caption" sx={{ color: "success.main", fontWeight: 600, bgcolor: alpha("#4caf50", 0.1), px: 1, py: 0.3, borderRadius: 1 }}>
                              Vegan
                            </Typography>
                          )}
                          {item.is_gluten_free && (
                            <Typography variant="caption" sx={{ color: "success.main", fontWeight: 600, bgcolor: alpha("#4caf50", 0.1), px: 1, py: 0.3, borderRadius: 1 }}>
                              Gluten-Free
                            </Typography>
                          )}
                        </Stack>
                        {item.allergens && item.allergens.length > 0 && (
                          <Tooltip title={`Allergens: ${item.allergens.join(", ")}`}>
                            <IconButton
                              size="small"
                              sx={{ color: "warning.main", bgcolor: alpha("#ed6c02", 0.08) }}
                            >
                              <IconInfoCircle size={18} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => dispatch(toggleFavoriteItem(item.id))}
                          sx={{
                            color: favoriteItems.includes(item.id) ? "error.main" : "text.secondary",
                            bgcolor: favoriteItems.includes(item.id) ? alpha("#d32f2f", 0.08) : alpha("#2b2118", 0.04),
                            "&:hover": { bgcolor: alpha("#d32f2f", 0.12), color: "error.main" }
                          }}
                        >
                          {favoriteItems.includes(item.id) ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
                        </IconButton>
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
