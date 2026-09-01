import { useState, useEffect } from "react";
import {
  Box, Card, Typography, Stack, Button, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem as SelectItem, InputLabel, FormControl,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton
} from "@mui/material";
import {
  IconPlus, IconEdit, IconQrcode, IconClockPlay, IconClockStop
} from "@tabler/icons-react";
import PageContainer from "@/components/container/PageContainer";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import type { Employee } from "@/types/__restaurant";
import { getEmployees } from "@/api/_employees";
import { getAttendanceLogs, createAttendance, updateAttendance } from "@/api/_attendance";
import type { AttendanceRecord } from "@/api/_attendance";

export default function AttendancePage() {
  const theme = useTheme();
  const navigate = useNavigate();

  // Data
  const [logs, setLogs] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<AttendanceRecord>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [logRes, empRes] = await Promise.all([
        getAttendanceLogs(),
        getEmployees()
      ]);
      setLogs(logRes.data.data);
      setEmployees(empRes.data.data.filter(e => e.is_active));
    } catch (error) {
      toast.error("Failed to load attendance data");
    }
  };

  const handleSave = async () => {
    try {
      if (!form.employee_id || !form.date || !form.status) {
        return toast.error("Please fill all required fields");
      }
      
      const payload = {
        ...form,
        clock_in: form.clock_in ? new Date(form.clock_in).toISOString() : null,
        clock_out: form.clock_out ? new Date(form.clock_out).toISOString() : null,
      };

      if (editingId) {
        await updateAttendance(editingId, payload);
        toast.success("Attendance updated");
      } else {
        await createAttendance(payload);
        toast.success("Attendance logged");
      }
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save record");
    }
  };

  const openEdit = (record: AttendanceRecord) => {
    setEditingId(record.id);
    setForm({
      employee_id: record.employee_id,
      date: new Date(record.date).toISOString().split('T')[0],
      clock_in: record.clock_in ? new Date(record.clock_in).toISOString().slice(0, 16) : "",
      clock_out: record.clock_out ? new Date(record.clock_out).toISOString().slice(0, 16) : "",
      status: record.status
    });
    setModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PRESENT": return "success";
      case "LATE": return "warning";
      case "ABSENT": return "error";
      default: return "default";
    }
  };

  const calculateHours = (inTime: string | null, outTime: string | null) => {
    if (!inTime || !outTime) return "—";
    const ms = new Date(outTime).getTime() - new Date(inTime).getTime();
    const hours = ms / (1000 * 60 * 60);
    return `${hours.toFixed(2)}h`;
  };

  return (
    <PageContainer title="Staff Attendance" description="Manage timesheets and daily logs">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Timesheets & Logs</Typography>
          <Typography variant="body2" color="textSecondary">Monitor daily clock-ins and working hours.</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<IconQrcode size={20} />}
            onClick={() => navigate('/attendance/qr')}
            sx={{ borderRadius: "8px" }}
          >
            Terminal QR
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<IconPlus size={20} />}
            onClick={() => {
              setEditingId(null);
              setForm({ date: new Date().toISOString().split('T')[0], status: 'PRESENT' });
              setModalOpen(true);
            }}
            sx={{ borderRadius: "8px" }}
          >
            Manual Entry
          </Button>
        </Stack>
      </Stack>

      <Card sx={{ p: 0 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Clock In</TableCell>
                <TableCell>Clock Out</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map(log => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Typography fontWeight="bold">
                      {log.employee?.first_name} {log.employee?.last_name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      ID: {log.employee_id.split('-')[0].toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{new Date(log.date).toLocaleDateString()}</Typography>
                  </TableCell>
                  <TableCell>
                    {log.clock_in ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconClockPlay size={16} color={theme.palette.success.main} />
                        <Typography variant="body2">{new Date(log.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                      </Stack>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    {log.clock_out ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconClockStop size={16} color={theme.palette.error.main} />
                        <Typography variant="body2">{new Date(log.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                      </Stack>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {calculateHours(log.clock_in, log.clock_out)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={log.status} color={getStatusColor(log.status)} variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => openEdit(log)}>
                      <IconEdit size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography color="textSecondary">No attendance records found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ─── MANUAL LOG MODAL ─── */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Edit Attendance Log" : "Manual Attendance Entry"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} mt={1}>
            <FormControl fullWidth required>
              <InputLabel>Employee</InputLabel>
              <Select 
                label="Employee" 
                value={form.employee_id || ""} 
                onChange={e => setForm({...form, employee_id: e.target.value})}
                disabled={!!editingId}
              >
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </SelectItem>
                ))}
              </Select>
            </FormControl>

            <TextField 
              label="Date" 
              type="date" 
              fullWidth 
              required
              InputLabelProps={{ shrink: true }} 
              value={form.date || ""} 
              onChange={e => setForm({...form, date: e.target.value})} 
            />

            <Stack direction="row" spacing={2}>
              <TextField 
                label="Clock In Time" 
                type="datetime-local" 
                fullWidth 
                InputLabelProps={{ shrink: true }} 
                value={form.clock_in || ""} 
                onChange={e => setForm({...form, clock_in: e.target.value})} 
              />
              <TextField 
                label="Clock Out Time" 
                type="datetime-local" 
                fullWidth 
                InputLabelProps={{ shrink: true }} 
                value={form.clock_out || ""} 
                onChange={e => setForm({...form, clock_out: e.target.value})} 
              />
            </Stack>

            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select 
                label="Status" 
                value={form.status || ""} 
                onChange={e => setForm({...form, status: e.target.value})}
              >
                <SelectItem value="PRESENT">PRESENT</SelectItem>
                <SelectItem value="LATE">LATE</SelectItem>
                <SelectItem value="ABSENT">ABSENT</SelectItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSave}>Save Record</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
