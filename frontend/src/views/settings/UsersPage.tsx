import { useState, useEffect } from "react";
import {
  Box, Card, Typography, Stack, Button, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Grid,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  InputAdornment
} from "@mui/material";
import { IconPlus, IconEdit, IconTrash, IconUserCircle, IconEye, IconEyeOff } from "@tabler/icons-react";
import PageContainer from "@/components/container/PageContainer";
import { toast } from "react-toastify";
import type { User } from "@/types/__auth";
import type { Role } from "@/types/__roles";
import type { Branch } from "@/types/__restaurant";
import { getUsers, createUser, updateUser, deleteUser, type CreateUserInput } from "@/api/_users";
import { getAllRoles } from "@/api/_role";
import { getBranches } from "@/api/_branches";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

export default function UsersPage() {
  const theme = useTheme();
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  // Data
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<CreateUserInput & { is_active: boolean }>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, roleRes, branchRes] = await Promise.all([
        getUsers(),
        getAllRoles(),
        getBranches()
      ]);
      setUsers(userRes.data.data);
      setRoles(roleRes.data.data);
      setBranches(branchRes.data.data);
    } catch (error) {
      toast.error("Failed to load data");
    }
  };

  const handleSave = async () => {
    try {
      if (!form.username || !form.email || !form.first_name || !form.last_name || !form.role_id) {
        return toast.error("Please fill all required fields");
      }
      
      if (!editingId && !form.password) {
        return toast.error("Password is required for new users");
      }

      if (editingId) {
        const payload: any = { ...form };
        if (!payload.password) delete payload.password; // Don't update if empty
        await updateUser(editingId, payload);
        toast.success("User updated");
      } else {
        await createUser(form as CreateUserInput);
        toast.success("User created");
      }
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save user");
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) return toast.error("You cannot delete yourself");
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      toast.success("User deleted");
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete user");
    }
  };

  const openEdit = (userObj?: User) => {
    setEditingId(userObj ? userObj.id : null);
    setForm(userObj ? { 
      username: userObj.username, 
      email: userObj.email, 
      first_name: userObj.first_name,
      last_name: userObj.last_name,
      role_id: userObj.role_id,
      branch_id: userObj.branch_id || "",
      is_active: userObj.is_active,
      password: ""
    } : { is_active: true, branch_id: currentUser?.branch_id || "" });
    setShowPassword(false);
    setModalOpen(true);
  };

  return (
    <PageContainer title="User Management" description="Manage staff and user accounts">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Users & Staff</Typography>
          <Typography variant="body2" color="textSecondary">Manage employee accounts and system access.</Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<IconPlus size={20} />}
          onClick={() => openEdit()}
          sx={{ borderRadius: "8px" }}
        >
          Add User
        </Button>
      </Stack>

      <Card sx={{ p: 0 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Role & Branch</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => {
                const role = roles.find(r => r.id === u.role_id);
                const branch = branches.find(b => b.id === u.branch_id);
                const isSystem = ["SUPERADMIN", "COMPANY_ADMIN"].includes(role?.name || "");

                return (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ p: 1, borderRadius: "50%", bgcolor: theme.palette.primary.light, color: theme.palette.primary.main }}>
                          <IconUserCircle size={28} stroke={1.5} />
                        </Box>
                        <Box>
                          <Typography fontWeight="bold">{u.first_name} {u.last_name}</Typography>
                          <Typography variant="caption" color="textSecondary">@{u.username}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{u.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium" color={isSystem ? "error.main" : "textPrimary"}>
                          {role?.name?.replace("_", " ") || "No Role"}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {branch?.name || "All Branches"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={u.is_active ? "Active" : "Inactive"} color={u.is_active ? "success" : "default"} variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary" onClick={() => openEdit(u)}>
                        <IconEdit size={18} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(u.id)} disabled={u.id === currentUser?.id}>
                        <IconTrash size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Typography color="textSecondary">No users found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ─── ADD / EDIT MODAL ─── */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? "Edit User" : "Add New User"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} mb={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="First Name" 
                fullWidth 
                required
                value={form.first_name || ""} 
                onChange={e => setForm({...form, first_name: e.target.value})} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Last Name" 
                fullWidth 
                required
                value={form.last_name || ""} 
                onChange={e => setForm({...form, last_name: e.target.value})} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Username" 
                fullWidth 
                required
                disabled={!!editingId} // Usually can't change username
                value={form.username || ""} 
                onChange={e => setForm({...form, username: e.target.value.toLowerCase()})} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Email" 
                type="email"
                fullWidth 
                required
                value={form.email || ""} 
                onChange={e => setForm({...form, email: e.target.value})} 
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select 
                  label="Role" 
                  value={form.role_id || ""} 
                  onChange={e => setForm({...form, role_id: e.target.value as string})}
                >
                  {roles.map(r => (
                    <MenuItem key={r.id} value={r.id}>{r.name.replace("_", " ")}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Branch Assignment</InputLabel>
                <Select 
                  label="Branch Assignment" 
                  value={form.branch_id || ""} 
                  onChange={e => setForm({...form, branch_id: e.target.value as string})}
                >
                  <MenuItem value=""><em>All Branches (HQ)</em></MenuItem>
                  {branches.map(b => (
                    <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField 
                label={editingId ? "New Password (leave blank to keep current)" : "Password"} 
                type={showPassword ? "text" : "password"}
                fullWidth 
                required={!editingId}
                value={form.password || ""} 
                onChange={e => setForm({...form, password: e.target.value})} 
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {editingId && (
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={form.is_active ?? true}
                      onChange={e => setForm({...form, is_active: e.target.checked})}
                    />
                  }
                  label="User is active (can log in)"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSave}>Save User</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
