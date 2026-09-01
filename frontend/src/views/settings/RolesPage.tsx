import { useState, useEffect } from "react";
import {
  Box, Card, Typography, Stack, Button, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Grid, Switch
} from "@mui/material";
import { IconPlus, IconEdit, IconTrash, IconShieldLock } from "@tabler/icons-react";
import PageContainer from "@/components/container/PageContainer";
import { toast } from "react-toastify";
import type { Role, Permission } from "@/types/__roles";
import { getAllRoles, createRole, updateRole, deleteRole } from "@/api/_role";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

const PERMISSION_FEATURES = [
  { key: "POS", label: "Point of Sale" },
  { key: "ORDERS", label: "Order Management" },
  { key: "MENU", label: "Menu & Recipes" },
  { key: "INVENTORY", label: "Inventory & Suppliers" },
  { key: "EMPLOYEES", label: "Staff & Attendance" },
  { key: "SETTINGS", label: "System Settings" },
];

const SYSTEM_ROLES = ["SUPERADMIN", "COMPANY_ADMIN", "BRANCH_MANAGER"];

export default function RolesPage() {
  const theme = useTheme();
  const user = useSelector((state: RootState) => state.auth.currentUser);

  // Data
  const [roles, setRoles] = useState<Role[]>([]);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<Role>>({});
  const [permissions, setPermissions] = useState<Record<string, Partial<Permission>>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getAllRoles();
      setRoles(res.data.data);
    } catch (error) {
      toast.error("Failed to load roles");
    }
  };

  const handleSave = async () => {
    try {
      if (!form.name) return toast.error("Role name is required");

      const permsArray = Object.values(permissions).filter(
        p => p.can_read || p.can_create || p.can_update || p.can_delete
      );

      const payload = {
        name: form.name,
        description: form.description,
        permissions: permsArray,
      };

      if (editingId) {
        await updateRole(editingId, payload);
        toast.success("Role updated");
      } else {
        await createRole(payload);
        toast.success("Role created");
      }
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save role");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (SYSTEM_ROLES.includes(name)) return toast.error("Cannot delete system roles");
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      await deleteRole(id);
      toast.success("Role deleted");
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete role");
    }
  };

  const openEdit = (role?: Role) => {
    if (role && SYSTEM_ROLES.includes(role.name) && user?.role?.name !== "SUPERADMIN") {
      return toast.error("You cannot edit this system role.");
    }
    
    setEditingId(role ? role.id : null);
    setForm(role ? { name: role.name, description: role.description } : {});
    
    // Initialize permissions
    const initialPerms: Record<string, Partial<Permission>> = {};
    PERMISSION_FEATURES.forEach(f => {
      const existing = role?.permissions?.find(p => p.feature_key === f.key);
      initialPerms[f.key] = {
        feature_key: f.key,
        can_read: existing?.can_read || false,
        can_create: existing?.can_create || false,
        can_update: existing?.can_update || false,
        can_delete: existing?.can_delete || false,
      };
    });
    setPermissions(initialPerms);
    setModalOpen(true);
  };

  const togglePerm = (feature: string, action: "can_read" | "can_create" | "can_update" | "can_delete") => {
    setPermissions(prev => ({
      ...prev,
      [feature]: { ...prev[feature], [action]: !prev[feature][action] }
    }));
  };

  return (
    <PageContainer title="Roles & Permissions" description="Manage access control">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Roles & Permissions</Typography>
          <Typography variant="body2" color="textSecondary">Configure what users can see and do.</Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<IconPlus size={20} />}
          onClick={() => openEdit()}
          sx={{ borderRadius: "8px" }}
        >
          Add Role
        </Button>
      </Stack>

      <Card sx={{ p: 0 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
              <TableRow>
                <TableCell>Role Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map(role => {
                const isSystem = SYSTEM_ROLES.includes(role.name);
                return (
                  <TableRow key={role.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: isSystem ? theme.palette.error.light : theme.palette.primary.light, color: isSystem ? theme.palette.error.main : theme.palette.primary.main }}>
                          <IconShieldLock size={20} />
                        </Box>
                        <Typography fontWeight="bold">{role.name.replace("_", " ")}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">{role.description || "No description provided."}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={isSystem ? "System" : "Custom"} color={isSystem ? "error" : "primary"} variant={isSystem ? "filled" : "outlined"} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary" onClick={() => openEdit(role)}>
                        <IconEdit size={18} />
                      </IconButton>
                      {!isSystem && (
                        <IconButton size="small" color="error" onClick={() => handleDelete(role.id, role.name)}>
                          <IconTrash size={18} />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                    <Typography color="textSecondary">No roles found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ─── ADD / EDIT MODAL ─── */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? "Edit Role" : "Add New Role"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} mb={4}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Role Name" 
                fullWidth 
                required
                disabled={editingId ? SYSTEM_ROLES.includes(form.name || "") : false}
                value={form.name || ""} 
                onChange={e => setForm({...form, name: e.target.value.toUpperCase()})} 
                helperText="e.g. WAITER, CHEF, CASHIER"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Description" 
                fullWidth 
                value={form.description || ""} 
                onChange={e => setForm({...form, description: e.target.value})} 
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" fontWeight="bold" mb={2}>Permissions</Typography>
          <TableContainer component={Box} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
                <TableRow>
                  <TableCell>Feature</TableCell>
                  <TableCell align="center">Read</TableCell>
                  <TableCell align="center">Create</TableCell>
                  <TableCell align="center">Update</TableCell>
                  <TableCell align="center">Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {PERMISSION_FEATURES.map(f => (
                  <TableRow key={f.key}>
                    <TableCell>{f.label}</TableCell>
                    <TableCell align="center">
                      <Switch size="small" checked={permissions[f.key]?.can_read || false} onChange={() => togglePerm(f.key, "can_read")} />
                    </TableCell>
                    <TableCell align="center">
                      <Switch size="small" checked={permissions[f.key]?.can_create || false} onChange={() => togglePerm(f.key, "can_create")} />
                    </TableCell>
                    <TableCell align="center">
                      <Switch size="small" checked={permissions[f.key]?.can_update || false} onChange={() => togglePerm(f.key, "can_update")} />
                    </TableCell>
                    <TableCell align="center">
                      <Switch size="small" checked={permissions[f.key]?.can_delete || false} onChange={() => togglePerm(f.key, "can_delete")} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSave}>Save Role</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
