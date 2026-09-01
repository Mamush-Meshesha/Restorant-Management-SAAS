import { Box, Typography, Container, Button, Stack, Grid } from "@mui/material";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
};

export default function HomePage() {
  return (
    <Box sx={{ bgcolor: "background.default", overflow: "hidden" }}>
      
      {/* Hero Section */}
      <Box sx={{ pt: { xs: 8, md: 15 }, pb: { xs: 10, md: 20 } }}>
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            
            {/* Left Content */}
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "3.5rem", md: "5.5rem" },
                    lineHeight: 1.1,
                    mb: 3,
                    color: "primary.main",
                  }}
                >
                  Dining, <br />
                  <Box component="span" sx={{ color: "text.secondary" }}>
                    Elevated.
                  </Box>
                </Typography>
                
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "1.1rem",
                    maxWidth: "480px",
                    mb: 5,
                    color: "text.secondary",
                  }}
                >
                  Experience a world-class culinary journey where every detail is meticulously crafted. Book your table instantly and skip the wait.
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    component={Link}
                    to="/reservations"
                    sx={{ px: 4, py: 1.5, fontSize: "1rem" }}
                  >
                    Find a Table
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    component={Link}
                    to="/menu"
                    sx={{ px: 4, py: 1.5, fontSize: "1rem" }}
                  >
                    View Menu
                  </Button>
                </Stack>
              </motion.div>
            </Grid>

            {/* Right Image Grid */}
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ height: "450px", borderRadius: 4, overflow: "hidden" }}>
                      <img 
                        src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=2070&auto=format&fit=crop" 
                        alt="Fine Dining"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack spacing={2} sx={{ height: "450px" }}>
                      <Box sx={{ flex: 1, borderRadius: 4, overflow: "hidden" }}>
                        <img 
                          src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop" 
                          alt="Cocktail"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </Box>
                      <Box sx={{ flex: 1, borderRadius: 4, overflow: "hidden" }}>
                        <img 
                          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop" 
                          alt="Restaurant Interior"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats / Proof Section */}
      <Box sx={{ py: 8, borderTop: "1px solid #EAEAEA", borderBottom: "1px solid #EAEAEA", bgcolor: "#FAFAFA" }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} textAlign="center" justifyContent="space-around">
            {[
              { label: "Michelin Stars", value: "3" },
              { label: "Global Locations", value: "12" },
              { label: "Signature Dishes", value: "50+" },
              { label: "Happy Guests", value: "10k+" },
            ].map((stat) => (
              <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
                <Typography variant="h3" color="primary.main" fontWeight={700} mb={1}>
                  {stat.value}
                </Typography>
                <Typography variant="overline" color="text.secondary">
                  {stat.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
