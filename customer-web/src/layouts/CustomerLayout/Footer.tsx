import { Box, Container, Grid, Typography, Stack, IconButton, Divider } from "@mui/material";
import { IconBrandInstagram, IconBrandFacebook, IconBrandTwitter } from "@tabler/icons-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <Box sx={{ bgcolor: "primary.main", color: "primary.contrastText", pt: 10, pb: 6, mt: "auto" }}>
      <Container maxWidth="xl">
        <Grid container spacing={8}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h4" fontWeight={700} mb={3} sx={{ letterSpacing: "-0.02em" }}>
              RÉSERVER
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, maxWidth: 300, mb: 4, lineHeight: 1.8 }}>
              Experience world-class dining, curated seasonal menus, and exceptional hospitality across our international locations.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton color="inherit" sx={{ opacity: 0.7, "&:hover": { opacity: 1, color: "secondary.main" } }}>
                <IconBrandInstagram stroke={1.5} />
              </IconButton>
              <IconButton color="inherit" sx={{ opacity: 0.7, "&:hover": { opacity: 1, color: "secondary.main" } }}>
                <IconBrandFacebook stroke={1.5} />
              </IconButton>
              <IconButton color="inherit" sx={{ opacity: 0.7, "&:hover": { opacity: 1, color: "secondary.main" } }}>
                <IconBrandTwitter stroke={1.5} />
              </IconButton>
            </Stack>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={3}>Explore</Typography>
            <Stack spacing={2}>
              {["Our Story", "Locations", "Menus", "Private Dining", "Gift Cards"].map((link) => (
                <Typography
                  key={link}
                  component={Link}
                  to="#"
                  variant="body2"
                  sx={{ color: "inherit", textDecoration: "none", opacity: 0.7, "&:hover": { opacity: 1, color: "secondary.main" } }}
                >
                  {link}
                </Typography>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={3}>Support</Typography>
            <Stack spacing={2}>
              {["Contact Us", "FAQ", "Careers", "Press", "Terms of Service"].map((link) => (
                <Typography
                  key={link}
                  component={Link}
                  to="#"
                  variant="body2"
                  sx={{ color: "inherit", textDecoration: "none", opacity: 0.7, "&:hover": { opacity: 1, color: "secondary.main" } }}
                >
                  {link}
                </Typography>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={3}>Newsletter</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, mb: 3, lineHeight: 1.8 }}>
              Subscribe to receive updates on seasonal menus, special events, and exclusive reservations.
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Box
                component="input"
                placeholder="Email Address"
                sx={{
                  flexGrow: 1,
                  px: 2,
                  py: 1.5,
                  borderRadius: 1,
                  border: "1px solid rgba(255,255,255,0.2)",
                  bgcolor: "transparent",
                  color: "white",
                  outline: "none",
                  "&:focus": { borderColor: "secondary.main" }
                }}
              />
              <Box
                component="button"
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 1,
                  border: "none",
                  bgcolor: "secondary.main",
                  color: "primary.main",
                  fontWeight: 600,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "secondary.light" }
                }}
              >
                Subscribe
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 6, borderColor: "rgba(255,255,255,0.1)" }} />
        
        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
          <Typography variant="caption" sx={{ opacity: 0.5 }}>
            © {new Date().getFullYear()} RÉSERVER Hospitality. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Typography variant="caption" sx={{ opacity: 0.5, cursor: "pointer", "&:hover": { opacity: 1 } }}>Privacy Policy</Typography>
            <Typography variant="caption" sx={{ opacity: 0.5, cursor: "pointer", "&:hover": { opacity: 1 } }}>Terms of Use</Typography>
            <Typography variant="caption" sx={{ opacity: 0.5, cursor: "pointer", "&:hover": { opacity: 1 } }}>Cookie Policy</Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
