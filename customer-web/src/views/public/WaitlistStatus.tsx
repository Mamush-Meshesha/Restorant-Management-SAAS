import { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { getWaitlistStatus } from "../../api/waitlist";
import type { WaitlistItem } from "../../api/waitlist";
import { getSocket } from "../../config/socket";
import { motion } from "framer-motion";
import { Box, Typography, Container, Button, Card, CardContent, CircularProgress, Stack, Divider } from "@mui/material";
import { IconArrowLeft, IconCheck, IconClockHour4, IconGlassFull } from "@tabler/icons-react";

export const WaitlistStatus = () => {
  const { id } = useParams();
  const waitlistId = id;
  const [status, setStatus] = useState<WaitlistItem | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    if (!waitlistId) return;
    try {
      const res = await getWaitlistStatus(waitlistId);
      setStatus(res.data.data);
      setPosition(res.data.position);
      
      if (res.data.data.status === "SEATED" || res.data.data.status === "CANCELLED" || res.data.data.status === "COMPLETED") {
        localStorage.removeItem("active_waitlist_id");
      }
    } catch (error) {
      console.error("Failed to fetch status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Connect to WebSockets for live updates
    const socket = getSocket();
    
    socket.on("waitlist_updated", () => {
      fetchStatus();
    });

    return () => {
      socket.off("waitlist_updated");
    };
  }, [waitlistId]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default" }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!status) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default" }}>
        <Typography color="text.secondary">Entry not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", position: "relative", py: 8 }}>
      <Container maxWidth="sm">
        <Button 
          component={RouterLink} 
          to="/"
          startIcon={<IconArrowLeft />}
          sx={{ mb: 4 }}
          color="inherit"
        >
          Return Home
        </Button>

        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", textAlign: "center", p: 4, borderRadius: 2 }}>
            <CardContent>
              {status.status === "WAITING" && (
                <Stack spacing={4} alignItems="center">
                  <Box sx={{ 
                    width: 100, height: 100, borderRadius: "50%", 
                    border: "2px solid", borderColor: "primary.main", 
                    display: "flex", alignItems: "center", justifyContent: "center",
                    bgcolor: "background.paper" 
                  }}>
                    <Typography variant="h2" color="primary.main" sx={{ mb: 0 }}>
                      {position}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="h3" color="primary.main" mb={1}>
                      You're in line.
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      There are {position ? position - 1 : 0} parties ahead of you.
                    </Typography>
                  </Box>

                  <Divider flexItem sx={{ my: 2 }} />

                  <Box>
                    <IconClockHour4 size={28} style={{ opacity: 0.5, marginBottom: 8 }} />
                    <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 0 }}>
                      Estimated Wait
                    </Typography>
                    <Typography variant="h4" color="primary.main">
                      ~{status.quoted_time || "--"} mins
                    </Typography>
                  </Box>
                </Stack>
              )}

              {status.status === "NOTIFIED" && (
                <Stack spacing={4} alignItems="center">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <Box sx={{ 
                      width: 100, height: 100, borderRadius: "50%", 
                      bgcolor: "secondary.main", color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <IconCheck size={48} />
                    </Box>
                  </motion.div>
                  
                  <Box>
                    <Typography variant="h3" color="primary.main" mb={1}>
                      Table Ready!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Please head to the host stand. We are seating you now.
                    </Typography>
                  </Box>
                </Stack>
              )}

              {status.status === "SEATED" && (
                <Stack spacing={4} alignItems="center">
                  <Box sx={{ color: "primary.main" }}>
                    <IconGlassFull size={64} stroke={1} />
                  </Box>
                  <Typography variant="h3" color="primary.main">
                    Enjoy your meal!
                  </Typography>
                </Stack>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default WaitlistStatus;
