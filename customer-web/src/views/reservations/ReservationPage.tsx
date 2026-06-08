import { useState, useEffect } from "react";
import {
  Box, Container, Typography, Grid, Stack, Button, Divider,
  alpha, TextField, Stepper, Step, StepLabel, Card, CardContent, Alert
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { IconUsers, IconMapPin, IconCheck, IconCalendar, IconClock } from "@tabler/icons-react";
import { createReservationApi, getTablesApi } from "../../api/reservations";
import { useAppSelector } from "../../redux/hooks";

const STEPS = ["Choose Date & Time", "Select Preferences", "Confirm Details"];

const TIME_SLOTS = [
  { time: "12:00 PM", available: true },
  { time: "12:30 PM", available: true },
  { time: "1:00 PM", available: false },
  { time: "1:30 PM", available: true },
  { time: "6:00 PM", available: true },
  { time: "6:30 PM", available: true },
  { time: "7:00 PM", available: false },
  { time: "7:30 PM", available: true },
  { time: "8:00 PM", available: true },
  { time: "8:30 PM", available: false },
  { time: "9:00 PM", available: true },
  { time: "9:30 PM", available: true },
];

const SEATING_AREAS = [
  { id: "window", label: "Window Seating", desc: "Panoramic city views" },
  { id: "outdoor", label: "Outdoor Terrace", desc: "Al fresco dining" },
  { id: "vip", label: "VIP Booth", desc: "Maximum privacy" },
  { id: "private", label: "Private Dining Room", desc: "Exclusive event space" },
];

export default function ReservationPage() {
  const [step, setStep] = useState(0);
  const [party, setParty] = useState(2);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [area, setArea] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [tables, setTables] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { profile: userProfile } = useAppSelector(state => state.user);

  useEffect(() => {
    if (userProfile) {
      setName(`${userProfile.first_name} ${userProfile.last_name}`);
      setEmail(userProfile.email || "");
      setPhone(userProfile.phone || "");
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const data = await getTablesApi();
        setTables(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTables();
  }, []);

  const canGoNext = () => {
    if (step === 0) return date && time;
    if (step === 1) return area;
    return name && email && phone;
  };

  const handleConfirm = async () => {
    if (!canGoNext()) return;
    setSubmitting(true);
    setError("");
    try {
      // Find a table that roughly matches capacity
      const suitableTable = tables.find(t => t.capacity >= party) || tables[0];
      if (!suitableTable) {
        throw new Error("No tables available for your party size.");
      }

      // Format ISO time
      const dateObj = new Date(`${date}T${time.replace(" PM", ":00").replace(" AM", ":00")}`);
      if (time.includes("PM") && !time.startsWith("12")) {
        dateObj.setHours(dateObj.getHours() + 12);
      } else if (time.startsWith("12") && time.includes("AM")) {
        dateObj.setHours(0);
      }

      await createReservationApi({
        table_id: suitableTable.id,
        customer_name: name,
        customer_phone: phone,
        reservation_time: dateObj.toISOString(),
        guest_count: party,
        special_requests: `Area: ${area}. ${note}`
      });

      setConfirmed(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to make reservation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Box sx={{ bgcolor: "primary.main", color: "white", py: 12, textAlign: "center" }}>
        <Container maxWidth="md">
          <Typography variant="overline" sx={{ color: "secondary.main", letterSpacing: "0.2em", mb: 2, display: "block" }}>
            Dining Reservations
          </Typography>
          <Typography variant="h2" sx={{ mb: 3 }}>Reserve Your Table</Typography>
          <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 600, mx: "auto" }}>
            Experience seamless reservation management. Your perfect evening begins here.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 8 }}>
        <AnimatePresence mode="wait">
          {confirmed ? (
            <motion.div key="confirmed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Box sx={{ width: 80, height: 80, borderRadius: "50%", bgcolor: alpha("#4caf50", 0.1), display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 4 }}>
                  <IconCheck size={40} color="#4caf50" />
                </Box>
                <Typography variant="h2" sx={{ mb: 2 }}>Reservation Confirmed</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>Thank you, {name}. We look forward to welcoming you.</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 6 }}>
                  A confirmation has been sent to <strong>{email}</strong>
                </Typography>
                <Card sx={{ maxWidth: 500, mx: "auto", p: 2 }}>
                  <CardContent>
                    <Stack spacing={2}>
                      {[
                        { label: "Date", value: date },
                        { label: "Time", value: time },
                        { label: "Party Size", value: `${party} guests` },
                        { label: "Seating", value: SEATING_AREAS.find((a) => a.id === area)?.label ?? "" },
                      ].map((row) => (
                        <Box key={row.label}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">{row.label}</Typography>
                            <Typography fontWeight={600}>{row.value}</Typography>
                          </Stack>
                          <Divider sx={{ mt: 2 }} />
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Stepper activeStep={step} alternativeLabel sx={{ mb: 8 }}>
                {STEPS.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
              </Stepper>

              {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

              {/* Step 0 */}
              {step === 0 && (
                <Box>
                  <Typography variant="h5" fontWeight={600} mb={3} display="flex" alignItems="center" gap={1.5}>
                    <IconUsers size={22} /> How many guests?
                  </Typography>
                  <Stack direction="row" spacing={1} mb={6} flexWrap="wrap" useFlexGap>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <Box key={n} onClick={() => setParty(n)} sx={{ width: 52, height: 52, borderRadius: 2, border: "2px solid", borderColor: party === n ? "secondary.main" : alpha("#2b2118", 0.2), bgcolor: party === n ? alpha("#d4af37", 0.1) : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: party === n ? 700 : 400, color: party === n ? "secondary.dark" : "text.secondary", transition: "all 0.2s" }}>
                        {n}
                      </Box>
                    ))}
                    <Box onClick={() => setParty(9)} sx={{ px: 2, height: 52, borderRadius: 2, border: "2px solid", borderColor: party >= 9 ? "secondary.main" : alpha("#2b2118", 0.2), bgcolor: party >= 9 ? alpha("#d4af37", 0.1) : "transparent", display: "flex", alignItems: "center", cursor: "pointer", fontWeight: party >= 9 ? 700 : 400, color: party >= 9 ? "secondary.dark" : "text.secondary", transition: "all 0.2s" }}>9+</Box>
                  </Stack>

                  <Typography variant="h5" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1.5}>
                    <IconCalendar size={22} /> Select a date
                  </Typography>
                  <TextField type="date" value={date} onChange={(e) => setDate(e.target.value)} inputProps={{ min: new Date().toISOString().split("T")[0] }} sx={{ mb: 6, width: { xs: "100%", sm: 300 } }} />

                  {date && (
                    <Box>
                      <Typography variant="h5" fontWeight={600} mb={3} display="flex" alignItems="center" gap={1.5}>
                        <IconClock size={22} /> Choose a time
                      </Typography>
                      <Grid container spacing={1.5}>
                        {TIME_SLOTS.map((slot) => (
                          <Grid size={{ xs: 4, sm: 3 }} key={slot.time}>
                            <Box onClick={() => slot.available && setTime(slot.time)} sx={{ py: 1.5, textAlign: "center", borderRadius: 1.5, border: "1px solid", borderColor: !slot.available ? alpha("#2b2118", 0.1) : time === slot.time ? "secondary.main" : alpha("#2b2118", 0.2), bgcolor: !slot.available ? alpha("#2b2118", 0.03) : time === slot.time ? alpha("#d4af37", 0.1) : "transparent", color: !slot.available ? alpha("#2b2118", 0.3) : time === slot.time ? "secondary.dark" : "text.primary", cursor: slot.available ? "pointer" : "not-allowed", fontWeight: time === slot.time ? 700 : 400, fontSize: "0.9rem", transition: "all 0.2s" }}>
                              {slot.time}
                              {!slot.available && <Typography variant="caption" display="block" sx={{ opacity: 0.6 }}>Full</Typography>}
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Box>
              )}

              {/* Step 1 */}
              {step === 1 && (
                <Box>
                  <Typography variant="h5" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1.5}>
                    <IconMapPin size={22} /> Choose your seating preference
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={4}>Subject to availability at the time of confirmation.</Typography>
                  <Grid container spacing={3}>
                    {SEATING_AREAS.map((a) => (
                      <Grid size={{ xs: 12, sm: 6 }} key={a.id}>
                        <Box onClick={() => setArea(a.id)} sx={{ p: 4, borderRadius: 2, border: "2px solid", borderColor: area === a.id ? "secondary.main" : alpha("#2b2118", 0.12), bgcolor: area === a.id ? alpha("#d4af37", 0.08) : "background.paper", cursor: "pointer", transition: "all 0.2s", "&:hover": { borderColor: area === a.id ? "secondary.main" : alpha("#2b2118", 0.3) } }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Typography variant="h6" fontWeight={600} mb={0.5}>{a.label}</Typography>
                              <Typography variant="body2" color="text.secondary">{a.desc}</Typography>
                            </Box>
                            {area === a.id && (
                              <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "secondary.main", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <IconCheck size={16} color="#2b2118" />
                              </Box>
                            )}
                          </Stack>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" fontWeight={600} mb={2}>Special Requests</Typography>
                    <TextField fullWidth multiline rows={3} placeholder="Dietary requirements, celebrations, special arrangements..." value={note} onChange={(e) => setNote(e.target.value)} />
                  </Box>
                </Box>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <Box>
                  <Typography variant="h5" fontWeight={600} mb={4}>Your Details</Typography>
                  <Grid container spacing={3}>
                    <Grid size={12}><TextField fullWidth label="Full Name" value={name} onChange={(e) => setName(e.target.value)} /></Grid>
                    <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Grid>
                    <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></Grid>
                  </Grid>
                  <Divider sx={{ my: 5 }} />
                  <Typography variant="h6" fontWeight={700} mb={3}>Booking Summary</Typography>
                  <Card>
                    <CardContent>
                      <Stack spacing={2}>
                        {[
                          { label: "Date", value: date },
                          { label: "Time", value: time },
                          { label: "Party Size", value: `${party} guests` },
                          { label: "Seating", value: SEATING_AREAS.find((a) => a.id === area)?.label ?? "" },
                          ...(note ? [{ label: "Note", value: note }] : []),
                        ].map((row) => (
                          <Box key={row.label}>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2" color="text.secondary">{row.label}</Typography>
                              <Typography variant="body2" fontWeight={600}>{row.value}</Typography>
                            </Stack>
                            <Divider sx={{ mt: 2 }} />
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              )}

              <Stack direction="row" justifyContent="space-between" mt={8}>
                {step > 0 ? (
                  <Button variant="outlined" onClick={() => setStep((s) => s - 1)} sx={{ px: 5 }}>Back</Button>
                ) : <Box />}
                {step < STEPS.length - 1 ? (
                  <Button variant="contained" onClick={() => setStep((s) => s + 1)} disabled={!canGoNext()} sx={{ px: 6, py: 1.5 }}>
                    Continue
                  </Button>
                ) : (
                  <Button variant="contained" color="secondary" onClick={handleConfirm} disabled={!canGoNext() || submitting} sx={{ px: 6, py: 1.5, color: "primary.main", fontWeight: 700 }}>
                    {submitting ? "Confirming..." : "Confirm Reservation"}
                  </Button>
                )}
              </Stack>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
}
