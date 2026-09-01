import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { updateWaitlistStatus, getBranchWaitlist, joinWaitlist, seatWaitlistParty } from "@/api/_waitlist";
import type { WaitlistItem } from "@/api/_waitlist";
import { getTables } from "@/api/_tables";
import type { Table as AppTable } from "@/types/__restaurant";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { toast } from "react-toastify";
import { getBranches } from "@/api/_branches";
import PageContainer from "../../components/container/PageContainer";
import {
  Box, Card, Typography, Stack, useTheme, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, alpha, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Tooltip, MenuItem, Select, InputLabel, FormControl
} from "@mui/material";
import { IconUser, IconPhone, IconUsers, IconClock, IconCheck, IconX, IconBell, IconUserPlus } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Timer Hook ───────────────────────────────────────────────────────────────

function useWaitTimer(created_at: string) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(created_at).getTime()) / 60000);
      if (diff < 1) setTime("Just now");
      else if (diff < 60) setTime(`${diff}m`);
      else setTime(`${Math.floor(diff / 60)}h ${diff % 60}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [created_at]);

  return time;
}

function WaitTimeDisplay({ createdAt }: { createdAt: string }) {
  const time = useWaitTimer(createdAt);
  const isLongWait = !time.includes("Just now") && (time.includes("h") || parseInt(time) > 20);
  
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <IconClock size={16} style={{ color: isLongWait ? "#EF4444" : "#6B7280" }} />
      <Typography variant="body2" fontWeight={isLongWait ? 700 : 500} color={isLongWait ? "error.main" : "text.secondary"}>
        {time}
      </Typography>
    </Stack>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WaitlistDashboard() {
  const theme = useTheme();
  const userBranchId = useSelector((state: RootState) => state.auth.currentUser?.branch_id);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [queue, setQueue] = useState<WaitlistItem[]>([]);
  
  
  const [newWalkinOpen, setNewWalkinOpen] = useState(false);
  const [walkinData, setWalkinData] = useState({ name: "", phone: "", size: "2" });

  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [selectedWaitlist, setSelectedWaitlist] = useState<WaitlistItem | null>(null);
  const [availableTables, setAvailableTables] = useState<AppTable[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>("");

  useEffect(() => {
    const initializeAdminBranch = async () => {
      if (userBranchId) {
        setBranchId(userBranchId);
      } else {
        try {
          const branchesRes = await getBranches();
          const firstBranchId = branchesRes.data?.data?.[0]?.id;
          if (firstBranchId) setBranchId(firstBranchId);
        } catch (error) {
          console.error("Failed to load branches");
        }
      }
    };
    initializeAdminBranch();
  }, [userBranchId]);

  useEffect(() => {
    if (!branchId) return;

    getBranchWaitlist(branchId)
      .then(res => setQueue(res.data.data))
      .catch(err => console.error("Failed to load waitlist", err));
    
    const API_URL = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:3000";
    const socket = io(API_URL, { 
      auth: { token: localStorage.getItem('token') },
      forceNew: true
    });
    
    socket.emit("join_waitlist_queue", { branchId });

    socket.on("waitlist_updated", (data: { action: string, waitlistItem: WaitlistItem }) => {
      if (data.action === "JOIN") {
        setQueue(prev => [...prev, data.waitlistItem]);
        toast.info(`${data.waitlistItem.customer_name} joined the waitlist!`);
      } else if (data.action === "UPDATE") {
        setQueue(prev => {
          const exists = prev.some(item => item.id === data.waitlistItem.id);
          if (exists) return prev.map(item => item.id === data.waitlistItem.id ? data.waitlistItem : item);
          return [...prev, data.waitlistItem];
        });
      }
    });

    return () => {
      socket.off("waitlist_updated");
      socket.disconnect();
    };
  }, [branchId]);

  const handleUpdateStatus = async (id: string, status: "NOTIFIED" | "SEATED" | "LEFT" | "NO_SHOW") => {
    try {
      // NOTE: Our backend waitlist controller handles LEFT via standard status update.
      await updateWaitlistStatus(id, status as any);
      toast.success(`Marked as ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleAddWalkin = async () => {
    if (!branchId || !walkinData.name || !walkinData.phone) return toast.error("Missing fields");
    try {
      await joinWaitlist({
        branch_id: branchId,
        customer_name: walkinData.name,
        customer_phone: walkinData.phone,
        guest_count: parseInt(walkinData.size)
      });
      setNewWalkinOpen(false);
      setWalkinData({ name: "", phone: "", size: "2" });
      // Socket will handle the UI update
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add walk-in");
    }
  };

  const handleSeatClick = async (item: WaitlistItem) => {
    setSelectedWaitlist(item);
    setSeatModalOpen(true);
    if (!branchId) return;
    try {
      const res = await getTables({ branchId, status: "AVAILABLE" });
      setAvailableTables(res.data.data);
    } catch (err) {
      toast.error("Failed to load tables");
    }
  };

  const submitSeat = async () => {
    if (!selectedWaitlist || !selectedTableId) return toast.error("Please select a table");
    try {
      await seatWaitlistParty(selectedWaitlist.id, selectedTableId);
      setSeatModalOpen(false);
      setSelectedWaitlist(null);
      setSelectedTableId("");
      toast.success("Party successfully seated!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to seat party");
    }
  };

  const activeQueue = queue.filter(q => q.status === "WAITING" || q.status === "NOTIFIED");

  return (
    <PageContainer title="Waitlist Dashboard" description="Manage Walk-ins and Queue">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Waitlist Management</Typography>
          <Typography color="text.secondary">Live queue for your branch</Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip 
            label={`${activeQueue.length} Waiting`} 
            color="primary" 
            sx={{ fontWeight: 700, px: 1 }} 
          />
          <Button 
            variant="contained" 
            startIcon={<IconUserPlus size={18} />}
            onClick={() => setNewWalkinOpen(true)}
            sx={{ borderRadius: "8px" }}
          >
            New Walk-in
          </Button>
        </Stack>
      </Stack>

      <Card sx={{ borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        {activeQueue.length === 0 ? (
          <Box py={10} display="flex" flexDirection="column" alignItems="center">
            <IconUsers size={48} style={{ color: theme.palette.text.disabled, marginBottom: 16 }} />
            <Typography variant="h6" color="text.secondary">No one is waiting.</Typography>
            <Typography variant="body2" color="text.secondary">The queue is completely empty right now.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <TableRow>
                  <TableCell><Typography fontWeight={600}>Customer</Typography></TableCell>
                  <TableCell><Typography fontWeight={600}>Party Size</Typography></TableCell>
                  <TableCell><Typography fontWeight={600}>Time Waiting</Typography></TableCell>
                  <TableCell><Typography fontWeight={600}>Status</Typography></TableCell>
                  <TableCell align="right"><Typography fontWeight={600}>Actions</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {activeQueue.map((item) => (
                    <TableRow 
                      key={item.id}
                      component={motion.tr}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{ p: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: "8px" }}>
                            <IconUser size={20} color={theme.palette.primary.main} />
                          </Box>
                          <Box>
                            <Typography fontWeight={700}>{item.customer_name}</Typography>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <IconPhone size={12} style={{ color: theme.palette.text.secondary }} />
                              <Typography variant="caption" color="text.secondary">{item.customer_phone}</Typography>
                            </Stack>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={item.guest_count} 
                          size="small" 
                          sx={{ fontWeight: 800, bgcolor: theme.palette.grey[100] }} 
                        />
                      </TableCell>
                      <TableCell>
                        <WaitTimeDisplay createdAt={item.created_at} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.status}
                          size="small"
                          sx={{ 
                            fontWeight: 700, fontSize: "0.7rem",
                            bgcolor: item.status === "NOTIFIED" ? alpha(theme.palette.success.main, 0.15) : alpha(theme.palette.info.main, 0.15),
                            color: item.status === "NOTIFIED" ? "success.dark" : "info.dark",
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {item.status === "WAITING" && (
                            <Button
                              variant="contained" size="small" color="info"
                              startIcon={<IconBell size={16} />}
                              onClick={() => handleUpdateStatus(item.id, "NOTIFIED")}
                            >
                              Notify
                            </Button>
                          )}
                          {item.status === "NOTIFIED" && (
                            <Button
                              variant="contained" size="small" color="success"
                              startIcon={<IconCheck size={16} />}
                              onClick={() => handleSeatClick(item)}
                            >
                              Seat
                            </Button>
                          )}
                          <Tooltip title="Cancel / Left">
                            <IconButton 
                              size="small" color="error" 
                              onClick={() => handleUpdateStatus(item.id, "LEFT")}
                              sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                            >
                              <IconX size={16} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* New Walk-in Modal */}
      <Dialog open={newWalkinOpen} onClose={() => setNewWalkinOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Walk-in Party</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} pt={1}>
            <TextField 
              label="Customer Name" fullWidth size="small" 
              value={walkinData.name} onChange={e => setWalkinData({...walkinData, name: e.target.value})} 
            />
            <TextField 
              label="Phone Number" fullWidth size="small" 
              value={walkinData.phone} onChange={e => setWalkinData({...walkinData, phone: e.target.value})} 
            />
            <TextField 
              label="Party Size" type="number" fullWidth size="small" 
              value={walkinData.size} onChange={e => setWalkinData({...walkinData, size: e.target.value})} 
              InputProps={{ inputProps: { min: 1, max: 20 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setNewWalkinOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddWalkin}>Add to Queue</Button>
        </DialogActions>
      </Dialog>

      {/* Seat Party Modal */}
      <Dialog open={seatModalOpen} onClose={() => setSeatModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Seat Party: {selectedWaitlist?.customer_name}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Box p={2} bgcolor={alpha(theme.palette.info.main, 0.1)} borderRadius={2}>
              <Typography variant="body2" color="info.dark">
                <strong>Party Size:</strong> {selectedWaitlist?.guest_count} guests
              </Typography>
            </Box>
            <FormControl fullWidth>
              <InputLabel>Select an Available Table</InputLabel>
              <Select
                value={selectedTableId}
                label="Select an Available Table"
                onChange={(e) => setSelectedTableId(e.target.value)}
              >
                {availableTables.map(t => {
                  const tooSmall = t.capacity < (selectedWaitlist?.guest_count || 1);
                  return (
                    <MenuItem key={t.id} value={t.id} sx={{ color: tooSmall ? 'warning.main' : 'inherit' }}>
                      Table {t.table_number} (Capacity: {t.capacity}) {tooSmall && " - Warning: Too Small"}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setSeatModalOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={submitSeat} disabled={!selectedTableId}>
            Confirm Seating
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
