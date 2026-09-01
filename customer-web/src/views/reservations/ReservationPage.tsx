import { useState, useEffect, useMemo } from "react";
import {
  Box, Container, Typography, Grid, Stack, Button, Divider,
  alpha, TextField, Stepper, Step, StepLabel, Card, CardContent, Alert,
  MenuItem, Select, FormControl, InputLabel, CircularProgress
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { IconUsers, IconMapPin, IconCheck, IconCalendar, IconClock, IconBuildingStore, IconArmchair } from "@tabler/icons-react";
import { createReservationApi, getAvailableTablesApi, getTimeSlotsApi } from "../../api/reservations";
import { getBranchesApi } from "../../api/branches";
import { useAppSelector } from "../../redux/hooks";

const STEPS = ["Choose Location & Time", "Select Table", "Confirm Details"];

export default function ReservationPage() {
  const [step, setStep] = useState(0);
  
  // Step 0 states
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [party, setParty] = useState(2);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timeSlots, setTimeSlots] = useState<{time: string, available: boolean}[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  
  // Step 1 states
  const [areaFilter, setAreaFilter] = useState("all");
  const [allAvailableTables, setAllAvailableTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [loadingTables, setLoadingTables] = useState(false);
  const [note, setNote] = useState("");
  
  // Step 2 states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  const [confirmed, setConfirmed] = useState(false);
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
    const fetchBranches = async () => {
      try {
        const data = await getBranchesApi();
        setBranches(data);
        if (data.length > 0) setSelectedBranch(data[0].id);
      } catch (err) {
        console.error("Failed to load branches", err);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch && date && party) {
      const fetchTimeSlots = async () => {
        setLoadingTimeSlots(true);
        try {
          const slots = await getTimeSlotsApi({ branch_id: selectedBranch, date, guest_count: party });
          setTimeSlots(slots);
          // If the previously selected time is no longer available, clear it
          if (time && !slots.find((s: any) => s.time === time && s.available)) {
            setTime("");
          }
        } catch (err) {
          console.error("Failed to load time slots", err);
        } finally {
          setLoadingTimeSlots(false);
        }
      };
      fetchTimeSlots();
    } else {
      setTimeSlots([]);
    }
  }, [selectedBranch, date, party]);

  useEffect(() => {
    if (step === 1 && selectedBranch && date && time) {
      const fetchTables = async () => {
        setLoadingTables(true);
        setError("");
        try {
          const [year, month, day] = date.split("-").map(Number);
          const [timeParts, modifier] = time.split(" ");
          let [hours, minutes] = timeParts.split(":").map(Number);
          if (modifier === "PM" && hours !== 12) hours += 12;
          else if (modifier === "AM" && hours === 12) hours = 0;
          const dateObj = new Date(year, month - 1, day, hours, minutes, 0);

          const tables = await getAvailableTablesApi({
            reservation_time: dateObj.toISOString(),
            guest_count: party,
            branch_id: selectedBranch
          });
          setAllAvailableTables(tables);
          
          if (selectedTable && !tables.find((t: any) => t.id === selectedTable.id)) {
            setSelectedTable(null);
          }
        } catch (err: any) {
          setError(err?.response?.data?.message || "Failed to load tables.");
        } finally {
          setLoadingTables(false);
        }
      };
      fetchTables();
    }
  }, [step, selectedBranch, date, time, party]);

  const seatingFilters = useMemo(() => {
    const areas = new Set<string>(["Window", "Outdoor", "VIP", "Private"]);
    allAvailableTables.forEach(t => {
      if (t.diningArea?.name) areas.add(t.diningArea.name);
    });
    return ["all", ...Array.from(areas)];
  }, [allAvailableTables]);

  const filteredTables = useMemo(() => {
    if (areaFilter === "all") return allAvailableTables;
    const filterLower = areaFilter.toLowerCase();
    return allAvailableTables.filter(t => {
      const areaName = t.diningArea?.name?.toLowerCase() || "";
      const tableName = t.name.toLowerCase();
      // If the filter is 'Outdoor', 'Patio' should also match, but let's keep it simple with substring match.
      // If it's a dynamic area exact match, or substring match on name/area.
      return areaName.includes(filterLower) || tableName.includes(filterLower);
    });
  }, [allAvailableTables, areaFilter]);

  const canGoNext = () => {
    if (step === 0) return selectedBranch && date && time;
    if (step === 1) return selectedTable;
    return name && email && phone;
  };

  const handleConfirm = async () => {
    if (!canGoNext()) return;
    setSubmitting(true);
    setError("");
    try {
      const [year, month, day] = date.split("-").map(Number);
      const [timeParts, modifier] = time.split(" ");
      let [hours, minutes] = timeParts.split(":").map(Number);
      
      if (modifier === "PM" && hours !== 12) hours += 12;
      else if (modifier === "AM" && hours === 12) hours = 0;

      const dateObj = new Date(year, month - 1, day, hours, minutes, 0);

      await createReservationApi({
        table_id: selectedTable.id,
        customer_name: name,
        customer_phone: phone,
        reservation_time: dateObj.toISOString(),
        guest_count: party,
        special_requests: `Area: ${selectedTable.diningArea?.name || 'Main Area'}. ${note}`
      });

      setConfirmed(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to make reservation.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBranchName = branches.find(b => b.id === selectedBranch)?.name || "";

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Box sx={{ bgcolor: "primary.main", color: "white", py: 12, textAlign: "center" }}>
        <Container maxWidth="md">
          <Typography variant="overline" sx={{ color: "secondary.main", letterSpacing: "0.2em", mb: 2, display: "block" }}>
            Dining Reservations
          </Typography>
          <Typography variant="h2" sx={{ mb: 3 }}>Reserve Your Table</Typography>
          <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 600, mx: "auto" }}>
            Experience seamless reservation management. Choose your exact table based on live availability.
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
                        { label: "Location", value: selectedBranchName },
                        { label: "Date & Time", value: `${date} at ${time}` },
                        { label: "Party Size", value: `${party} guests` },
                        { label: "Table", value: `${selectedTable?.name} (${selectedTable?.diningArea?.name || "Main Area"})` },
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
                    <IconBuildingStore size={22} /> Select Location
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 6, maxWidth: 400 }}>
                    <InputLabel>Branch</InputLabel>
                    <Select value={selectedBranch} label="Branch" onChange={(e) => setSelectedBranch(e.target.value)}>
                      {branches.map((b) => (
                        <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

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
                      {loadingTimeSlots ? (
                        <CircularProgress size={24} sx={{ ml: 2 }} />
                      ) : timeSlots.length === 0 ? (
                        <Typography color="text.secondary">No time slots available for this date.</Typography>
                      ) : (
                        <Grid container spacing={1.5}>
                          {timeSlots.map((slot) => (
                          <Grid size={{ xs: 4, sm: 3 }} key={slot.time}>
                            <Box onClick={() => slot.available && setTime(slot.time)} sx={{ py: 1.5, textAlign: "center", borderRadius: 1.5, border: "1px solid", borderColor: !slot.available ? alpha("#2b2118", 0.1) : time === slot.time ? "secondary.main" : alpha("#2b2118", 0.2), bgcolor: !slot.available ? alpha("#2b2118", 0.03) : time === slot.time ? alpha("#d4af37", 0.1) : "transparent", color: !slot.available ? alpha("#2b2118", 0.3) : time === slot.time ? "secondary.dark" : "text.primary", cursor: slot.available ? "pointer" : "not-allowed", fontWeight: time === slot.time ? 700 : 400, fontSize: "0.9rem", transition: "all 0.2s" }}>
                              {slot.time}
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                      )}
                    </Box>
                  )}
                </Box>
              )}

              {/* Step 1 */}
              {step === 1 && (
                <Box>
                  <Typography variant="h5" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1.5}>
                    <IconMapPin size={22} /> Filter by seating preference
                  </Typography>
                  
                  {loadingTables ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                      <CircularProgress color="secondary" />
                    </Box>
                  ) : allAvailableTables.length === 0 ? (
                    <Alert severity="warning" sx={{ mb: 4 }}>
                      No tables available for {party} guests at {time}. Please try a different time or party size.
                    </Alert>
                  ) : (
                    <>
                      <Stack direction="row" spacing={1} sx={{ mb: 4, overflowX: "auto", pb: 1 }}>
                        {seatingFilters.map((a) => (
                          <Box 
                            key={a}
                            onClick={() => setAreaFilter(a)}
                            sx={{
                              px: 3, py: 1, 
                              borderRadius: 8, 
                              border: "1px solid", 
                              borderColor: areaFilter === a ? "secondary.main" : alpha("#2b2118", 0.2),
                              bgcolor: areaFilter === a ? alpha("#d4af37", 0.1) : "transparent",
                              color: areaFilter === a ? "secondary.dark" : "text.primary",
                              fontWeight: areaFilter === a ? 600 : 400,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              transition: "all 0.2s"
                            }}>
                            {a === "all" ? "Any Seating" : a}
                          </Box>
                        ))}
                      </Stack>

                      <Typography variant="h5" fontWeight={600} mb={3} display="flex" alignItems="center" gap={1.5}>
                        <IconArmchair size={22} /> Select your table
                      </Typography>
                      
                      {filteredTables.length === 0 ? (
                        <Alert severity="info">
                          No {areaFilter} tables available.
                        </Alert>
                      ) : (
                        <Grid container spacing={2}>
                          {filteredTables.map((t) => (
                            <Grid size={{ xs: 6, sm: 4 }} key={t.id}>
                              <Box 
                                onClick={() => setSelectedTable(t)}
                                sx={{ 
                                  p: 2, 
                                  textAlign: "center",
                                  borderRadius: 2, 
                                  border: "2px solid", 
                                  borderColor: selectedTable?.id === t.id ? "secondary.main" : alpha("#2b2118", 0.1), 
                                  bgcolor: selectedTable?.id === t.id ? "secondary.main" : "background.paper", 
                                  color: selectedTable?.id === t.id ? "white" : "text.primary",
                                  cursor: "pointer", 
                                  transition: "all 0.2s",
                                  boxShadow: selectedTable?.id === t.id ? 4 : 1
                                }}>
                                <Typography variant="h6" fontWeight={700}>{t.name}</Typography>
                                <Typography variant="body2" sx={{ opacity: selectedTable?.id === t.id ? 1 : 0.8, mt: 0.5 }}>Capacity: {t.capacity} seats</Typography>
                                <Typography variant="caption" sx={{ display: "block", mt: 1, opacity: selectedTable?.id === t.id ? 0.9 : 0.7 }}>
                                  {t.diningArea?.name || "Main Area"}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </>
                  )}

                  <Box sx={{ mt: 5 }}>
                    <Typography variant="subtitle2" fontWeight={600} mb={1}>Special Requests (Optional)</Typography>
                    <TextField fullWidth multiline rows={2} placeholder="Dietary requirements, celebrations..." value={note} onChange={(e) => setNote(e.target.value)} />
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
                          { label: "Location", value: selectedBranchName },
                          { label: "Date", value: date },
                          { label: "Time", value: time },
                          { label: "Party Size", value: `${party} guests` },
                          { label: "Table", value: `${selectedTable?.name} (${selectedTable?.capacity} seats)` },
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
