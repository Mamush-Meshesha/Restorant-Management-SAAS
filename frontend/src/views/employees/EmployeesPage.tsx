import { useState, useEffect } from "react";
import {
  Box, Card, Typography, Stack, Button, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem as SelectItem, InputLabel, FormControl,
  Grid, Divider, Tabs, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton
} from "@mui/material";
import {
  IconPlus, IconUsers, IconBuilding, IconEdit, IconTrash, IconMail, IconPhone
} from "@tabler/icons-react";
import PageContainer from "@/components/container/PageContainer";
import { toast } from "react-toastify";
import type { Employee, Department, Position, EmploymentType } from "@/types/__restaurant";
import {
  getEmployees, createEmployee, updateEmployee, deleteEmployee,
  getDepartments, createDepartment, deleteDepartment,
  getPositions, createPosition, deletePosition,
  getEmploymentTypes, createEmploymentType, deleteEmploymentType
} from "@/api/_employees";

export default function EmployeesPage() {
  const theme = useTheme();

  const [tabIndex, setTabIndex] = useState(0);

  // Data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>([]);

  // Modals
  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [posModalOpen, setPosModalOpen] = useState(false);
  const [typeModalOpen, setTypeModalOpen] = useState(false);

  // Forms
  const [empForm, setEmpForm] = useState<Partial<Employee>>({});
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);

  const [nameForm, setNameForm] = useState("");
  const [salaryForm, setSalaryForm] = useState<number | "">("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, deptRes, posRes, typeRes] = await Promise.all([
        getEmployees(),
        getDepartments(),
        getPositions(),
        getEmploymentTypes()
      ]);
      setEmployees(empRes.data.data.filter(e => e.is_active));
      setDepartments(deptRes.data.data);
      setPositions(posRes.data.data);
      setEmploymentTypes(typeRes.data.data);
    } catch (error) {
      toast.error("Failed to load HR data");
    }
  };

  // Employee Actions
  const handleSaveEmployee = async () => {
    try {
      if (!empForm.first_name || !empForm.last_name || !empForm.department_id || !empForm.position_id || !empForm.employment_type_id) {
        return toast.error("Please fill all required fields");
      }
      
      const payload = {
        ...empForm,
        hire_date: empForm.hire_date || new Date().toISOString()
      };

      if (editingEmpId) {
        await updateEmployee(editingEmpId, payload);
        toast.success("Employee updated");
      } else {
        await createEmployee(payload);
        toast.success("Employee added");
      }
      setEmpModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save employee");
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (window.confirm("Are you sure you want to deactivate this employee?")) {
      await deleteEmployee(id);
      toast.success("Employee deactivated");
      fetchData();
    }
  };

  const openEditEmployee = (emp: Employee) => {
    setEditingEmpId(emp.id);
    setEmpForm({
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email || "",
      phone: emp.phone || "",
      department_id: emp.department_id,
      position_id: emp.position_id,
      employment_type_id: emp.employment_type_id,
      hire_date: new Date(emp.hire_date).toISOString().split('T')[0]
    });
    setEmpModalOpen(true);
  };

  // Org Structure Actions
  const handleCreateDepartment = async () => {
    if (!nameForm) return;
    await createDepartment({ name: nameForm });
    toast.success("Department created");
    setDeptModalOpen(false);
    setNameForm("");
    fetchData();
  };

  const handleCreatePosition = async () => {
    if (!nameForm) return;
    await createPosition({ name: nameForm, base_salary: Number(salaryForm) || 0 });
    toast.success("Position created");
    setPosModalOpen(false);
    setNameForm("");
    setSalaryForm("");
    fetchData();
  };

  const handleCreateType = async () => {
    if (!nameForm) return;
    await createEmploymentType({ name: nameForm });
    toast.success("Employment type created");
    setTypeModalOpen(false);
    setNameForm("");
    fetchData();
  };

  const handleDeleteStructure = async (type: "dept" | "pos" | "type", id: string) => {
    if (!window.confirm(`Are you sure you want to delete this?`)) return;
    try {
      if (type === "dept") await deleteDepartment(id);
      if (type === "pos") await deletePosition(id);
      if (type === "type") await deleteEmploymentType(id);
      toast.success("Deleted successfully");
      fetchData();
    } catch (err: any) {
      toast.error("Cannot delete if in use by an employee");
    }
  };

  return (
    <PageContainer title="HR & Staff Management" description="Manage your team and organization">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Team Dashboard</Typography>
          <Typography variant="body2" color="textSecondary">Manage active staff, departments, and payroll positions.</Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<IconPlus size={20} />}
          onClick={() => {
            setEditingEmpId(null);
            setEmpForm({ hire_date: new Date().toISOString().split('T')[0] });
            setEmpModalOpen(true);
          }}
          sx={{ borderRadius: "8px", px: 3 }}
        >
          Add Employee
        </Button>
      </Stack>

      <Card sx={{ p: 0, mb: 4 }}>
        <Tabs value={tabIndex} onChange={(_, val) => setTabIndex(val)} variant="fullWidth">
          <Tab icon={<IconUsers size={20} />} iconPosition="start" label="Staff Directory" />
          <Tab icon={<IconBuilding size={20} />} iconPosition="start" label="Organization Structure" />
        </Tabs>
      </Card>

      {/* ─── TAB 1: DIRECTORY ─── */}
      {tabIndex === 0 && (
        <Card sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Hire Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map(emp => (
                  <TableRow key={emp.id} hover>
                    <TableCell>
                      <Typography fontWeight="bold">{emp.first_name} {emp.last_name}</Typography>
                      <Typography variant="caption" color="textSecondary">ID: {emp.id.split('-')[0].toUpperCase()}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} mb={0.5}>
                        <Chip size="small" label={emp.position?.name} color="primary" variant="outlined" />
                        <Chip size="small" label={emp.department?.name} color="default" />
                      </Stack>
                      <Typography variant="caption" color="textSecondary">{emp.employmentType?.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <IconMail size={14} />
                          <Typography variant="body2">{emp.email || "N/A"}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <IconPhone size={14} />
                          <Typography variant="body2">{emp.phone || "N/A"}</Typography>
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{new Date(emp.hire_date).toLocaleDateString()}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary" onClick={() => openEditEmployee(emp)}>
                        <IconEdit size={18} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteEmployee(emp.id)}>
                        <IconTrash size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {employees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                      <Typography color="textSecondary">No active staff members found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* ─── TAB 2: ORG STRUCTURE ─── */}
      {tabIndex === 1 && (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Departments</Typography>
                <IconButton size="small" onClick={() => { setNameForm(""); setDeptModalOpen(true); }}><IconPlus size={18} /></IconButton>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                {departments.map(d => (
                  <Stack key={d.id} direction="row" justifyContent="space-between" alignItems="center" p={1.5} bgcolor={theme.palette.grey[50]} borderRadius={1}>
                    <Typography>{d.name}</Typography>
                    <IconButton size="small" color="error" onClick={() => handleDeleteStructure("dept", d.id)}><IconTrash size={16} /></IconButton>
                  </Stack>
                ))}
              </Stack>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Positions</Typography>
                <IconButton size="small" onClick={() => { setNameForm(""); setSalaryForm(""); setPosModalOpen(true); }}><IconPlus size={18} /></IconButton>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                {positions.map(p => (
                  <Stack key={p.id} direction="row" justifyContent="space-between" alignItems="center" p={1.5} bgcolor={theme.palette.grey[50]} borderRadius={1}>
                    <Box>
                      <Typography>{p.name}</Typography>
                      <Typography variant="caption" color="textSecondary">Base: ${p.base_salary}/hr</Typography>
                    </Box>
                    <IconButton size="small" color="error" onClick={() => handleDeleteStructure("pos", p.id)}><IconTrash size={16} /></IconButton>
                  </Stack>
                ))}
              </Stack>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Employment Types</Typography>
                <IconButton size="small" onClick={() => { setNameForm(""); setTypeModalOpen(true); }}><IconPlus size={18} /></IconButton>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                {employmentTypes.map(t => (
                  <Stack key={t.id} direction="row" justifyContent="space-between" alignItems="center" p={1.5} bgcolor={theme.palette.grey[50]} borderRadius={1}>
                    <Typography>{t.name}</Typography>
                    <IconButton size="small" color="error" onClick={() => handleDeleteStructure("type", t.id)}><IconTrash size={16} /></IconButton>
                  </Stack>
                ))}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ─── EMPLOYEE MODAL ─── */}
      <Dialog open={empModalOpen} onClose={() => setEmpModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingEmpId ? "Edit Employee" : "Add New Employee"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="First Name" fullWidth required value={empForm.first_name || ""} onChange={e => setEmpForm({...empForm, first_name: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Last Name" fullWidth required value={empForm.last_name || ""} onChange={e => setEmpForm({...empForm, last_name: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Email" fullWidth value={empForm.email || ""} onChange={e => setEmpForm({...empForm, email: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Phone" fullWidth value={empForm.phone || ""} onChange={e => setEmpForm({...empForm, phone: e.target.value})} />
            </Grid>
            
            <Grid size={{ xs: 12 }}><Divider /></Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select label="Department" value={empForm.department_id || ""} onChange={e => setEmpForm({...empForm, department_id: e.target.value})}>
                  {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth required>
                <InputLabel>Position</InputLabel>
                <Select label="Position" value={empForm.position_id || ""} onChange={e => setEmpForm({...empForm, position_id: e.target.value})}>
                  {positions.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth required>
                <InputLabel>Employment Type</InputLabel>
                <Select label="Employment Type" value={empForm.employment_type_id || ""} onChange={e => setEmpForm({...empForm, employment_type_id: e.target.value})}>
                  {employmentTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Hire Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={empForm.hire_date || ""} onChange={e => setEmpForm({...empForm, hire_date: e.target.value})} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEmpModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSaveEmployee}>Save Employee</Button>
        </DialogActions>
      </Dialog>

      {/* ─── STRUCTURAL MODALS ─── */}
      <Dialog open={deptModalOpen} onClose={() => setDeptModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Department</DialogTitle>
        <DialogContent dividers>
          <TextField label="Department Name (e.g. BOH, FOH)" fullWidth required value={nameForm} onChange={e => setNameForm(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeptModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateDepartment}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={posModalOpen} onClose={() => setPosModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Position</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField label="Position Name (e.g. Waiter)" fullWidth required value={nameForm} onChange={e => setNameForm(e.target.value)} />
            <TextField label="Base Salary / Hr" type="number" fullWidth value={salaryForm} onChange={e => setSalaryForm(Number(e.target.value) || "")} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPosModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreatePosition}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={typeModalOpen} onClose={() => setTypeModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Employment Type</DialogTitle>
        <DialogContent dividers>
          <TextField label="Type Name (e.g. Full-Time)" fullWidth required value={nameForm} onChange={e => setNameForm(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTypeModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateType}>Create</Button>
        </DialogActions>
      </Dialog>

    </PageContainer>
  );
}
