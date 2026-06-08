import { Box, Typography, Container, Button, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.4,
          }}
        />
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Typography
              variant="overline"
              sx={{ color: "secondary.main", display: "block", mb: 2 }}
            >
              A Culinary Journey
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "3.5rem", md: "6rem" },
                lineHeight: 1.1,
                maxWidth: "800px",
                mb: 4,
              }}
            >
              The Art of <br />
              Fine Dining
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                component={Link}
                to="/reservations"
                sx={{ px: 6, py: 2, fontSize: "1.1rem" }}
              >
                Reserve a Table
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                component={Link}
                to="/menu"
                sx={{ px: 6, py: 2, fontSize: "1.1rem", borderColor: "rgba(255,255,255,0.3)" }}
              >
                Explore Menu
              </Button>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      {/* Philosophy Section */}
      <Box sx={{ py: 15, bgcolor: "background.default" }}>
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="overline" color="secondary.main" sx={{ mb: 2, display: "block" }}>
              Our Philosophy
            </Typography>
            <Typography variant="h3" sx={{ mb: 4, lineHeight: 1.4 }}>
              "We believe that dining is not just about eating, but an experience that engages all senses and creates lasting memories."
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto", lineHeight: 1.8 }}>
              From locally sourced ingredients to our meticulously curated wine list, every detail is designed to elevate your evening. Discover our award-winning locations worldwide.
            </Typography>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}
