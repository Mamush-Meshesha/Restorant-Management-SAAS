import { useState, useEffect, useCallback } from "react";
import {
  Box, Card, CardContent, Typography, Stack, useTheme,
  TextField, InputAdornment, Button, IconButton, alpha, Chip, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, CircularProgress, Alert, Drawer
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  IconSearch, IconFilter, IconPlus, IconDownload, IconDots,
  IconEdit, IconTrash, IconX, IconRefresh, IconEye
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import PageContainer from "../../components/container/PageContainer";
import { toast } from "react-toastify";
import ImageUpload from "../../components/widgets/ImageUpload";

// --- Props & Data Fetching Config ---
export interface DataTableConfig {
  title: string;
  description: string;
  noun: string;
  columns: GridColDef[];
  // For async API-backed tables
  fetchFn?: () => Promise<any>;
  createFn?: (data: any) => Promise<any>;
  updateFn?: (id: string, data: any) => Promise<any>;
  deleteFn?: (id: string) => Promise<any>;
  // Static data fallback
  data?: any[];
  // Transform raw API response to flat row objects
  transformFn?: (raw: any) => any[];
  // Extra form fields
  formSchema?: { field: string; label: string; type?: string; required?: boolean; options?: { label: string; value: string }[] }[];
}

// Common Status Pill Renderer
export const renderStatusPill = (params: GridRenderCellParams) => {
  const val = params.value as string;
  let color = "default";

  if (["Active", "Completed", "In Stock", "Gold", "true", "AVAILABLE"].includes(val)) color = "success";
  else if (["Pending", "Processing", "Low Stock", "Silver", "PREPARING", "RESERVED"].includes(val)) color = "warning";
  else if (["On Leave", "Cancelled", "Bronze", "CLEANING"].includes(val)) color = "default";
  else if (["Failed", "Out of Stock", "OCCUPIED", "false"].includes(val)) color = "error";

  return (
    <Chip
      label={val}
      size="small"
      color={color as any}
      sx={{
        height: 22,
        fontSize: "0.75rem",
        fontWeight: 600,
        borderRadius: "4px",
      }}
    />
  );
};

export const renderActionMenu = () => {
  return (
    <IconButton size="small">
      <IconDots size={16} />
    </IconButton>
  );
};

// --- Component ---
export default function DataTablePage({ config }: { config: DataTableConfig }) {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any[]>(config.data || []);
  const [loading, setLoading] = useState(!!config.fetchFn);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  // Row Action Menu State
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement | null; row: any | null }>({ el: null, row: null });

  const fetchData = useCallback(async () => {
    if (!config.fetchFn) return;
    setLoading(true);
    setError(null);
    try {
      const res = await config.fetchFn();
      const raw = res.data;
      const rows = config.transformFn
        ? config.transformFn(raw)
        : (raw.data ?? raw);
      setData(Array.isArray(rows) ? rows : []);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to load data";
      setError(msg);
      console.error("DataTablePage fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter Data
  const filteredData = data.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  // Handlers
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, row: any) => {
    setMenuAnchor({ el: event.currentTarget, row });
  };
  const handleCloseMenu = () => setMenuAnchor({ el: null, row: null });

  const handleOpenAdd = () => {
    setEditingRow(null);
    setFormValues({});
    setDialogOpen(true);
  };

  const handleOpenEdit = () => {
    const row = menuAnchor.row;
    setEditingRow(row);
    const schema = config.formSchema ?? getDefaultFormSchema();
    const vals: Record<string, string> = {};
    schema.forEach((f) => { vals[f.field] = row?.[f.field] ?? ""; });
    setFormValues(vals);
    setDialogOpen(true);
    handleCloseMenu();
  };

  const handleOpenDelete = () => {
    setDeleteOpen(true);
    handleCloseMenu();
  };

  const handleOpenDetails = () => {
    setEditingRow(menuAnchor.row);
    setDetailsOpen(true);
    handleCloseMenu();
  };

  const getDefaultFormSchema = () =>
    config.columns
      .filter((col) => !["id", "actions", "status", "created_at", "updated_at"].includes(col.field))
      .map((col) => ({ field: col.field, label: col.headerName ?? col.field, type: "text", required: false } as NonNullable<DataTableConfig["formSchema"]>[0]));

  const formSchema = config.formSchema ?? getDefaultFormSchema();

  const handleSave = async () => {
    setSaving(true);
    try {
      // Parse numerical types based on schema before sending
      const parsedValues = { ...formValues };
      formSchema.forEach((field) => {
        if (field.type === "number" && parsedValues[field.field] !== undefined) {
          parsedValues[field.field] = Number(parsedValues[field.field]) as any;
        }
      });

      if (editingRow) {
        if (config.updateFn) {
          await config.updateFn(editingRow.id, parsedValues);
          toast.success(`${config.noun} updated successfully`);
        } else {
          // Local-only update (no API)
          setData((prev) => prev.map((r) => r.id === editingRow.id ? { ...r, ...parsedValues } : r));
          toast.success(`${config.noun} updated`);
        }
      } else {
        if (config.createFn) {
          const res = await config.createFn(parsedValues);
          const newRow = res.data?.data ?? { id: Date.now().toString(), ...parsedValues };
          setData((prev) => [newRow, ...prev]);
          toast.success(`${config.noun} created successfully`);
        } else {
          setData((prev) => [{ id: Date.now().toString(), ...parsedValues }, ...prev]);
          toast.success(`${config.noun} added`);
        }
      }
      if (config.fetchFn) await fetchData();
      setDialogOpen(false);
      setEditingRow(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? `Failed to save ${config.noun.toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!menuAnchor.row) return;
    try {
      if (config.deleteFn) {
        await config.deleteFn(menuAnchor.row.id);
        toast.success(`${config.noun} deleted`);
      }
      setData((prev) => prev.filter((r) => r.id !== menuAnchor.row!.id));
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? `Failed to delete ${config.noun.toLowerCase()}`);
    }
    setDeleteOpen(false);
    handleCloseMenu();
  };

  // Inject action column with local state
  const columnsWithActions = config.columns.map((col) => {
    if (col.field === "actions") {
      return {
        ...col,
        renderCell: (params: GridRenderCellParams) => (
          <IconButton size="small" onClick={(e) => handleOpenMenu(e, params.row)}>
            <IconDots size={16} />
          </IconButton>
        ),
      };
    }
    return col;
  });

  return (
    <PageContainer title={config.title} description={config.description}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        {/* Header Section */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: "-0.02em" }}>
              {config.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {config.description}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            {config.fetchFn && (
              <Button
                variant="outlined"
                startIcon={<IconRefresh size={18} />}
                onClick={fetchData}
                disabled={loading}
                sx={{
                  borderColor: theme.palette.divider,
                  color: "text.primary",
                  bgcolor: "background.paper",
                  "&:hover": { borderColor: theme.palette.grey[400], bgcolor: theme.palette.grey[50] },
                }}
              >
                Refresh
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<IconDownload size={18} />}
              sx={{
                borderColor: theme.palette.divider,
                color: "text.primary",
                bgcolor: "background.paper",
                "&:hover": { borderColor: theme.palette.grey[400], bgcolor: theme.palette.grey[50] },
              }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<IconPlus size={18} />}
              onClick={handleOpenAdd}
              sx={{ boxShadow: "none", "&:hover": { boxShadow: "none" } }}
            >
              Add {config.noun}
            </Button>
          </Stack>
        </Stack>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Data Grid Card */}
        <Card
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "10px",
            boxShadow: "none",
          }}
        >
          <CardContent sx={{ p: 0, display: "flex", flexDirection: "column", height: "100%", "&:last-child": { pb: 0 } }}>
            {/* Toolbar */}
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Stack direction="row" spacing={2} justifyContent="space-between">
                <TextField
                  size="small"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ width: 300 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconSearch size={16} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<IconFilter size={16} />}
                  size="small"
                  sx={{ borderColor: theme.palette.divider, color: "text.secondary" }}
                >
                  Filters
                </Button>
              </Stack>
            </Box>

            {/* Grid */}
            <Box sx={{ flex: 1, width: "100%", minHeight: 400, position: "relative" }}>
              {loading && (
                <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(255,255,255,0.7)", zIndex: 2 }}>
                  <CircularProgress size={32} />
                </Box>
              )}
              <DataGrid
                rows={filteredData}
                columns={columnsWithActions}
                initialState={{
                  pagination: { paginationModel: { pageSize: 15, page: 0 } },
                }}
                pageSizeOptions={[15, 25, 50]}
                checkboxSelection
                disableRowSelectionOnClick
                sx={{
                  border: "none",
                  "&  .MuiDataGrid-columnHeaders": {
                    bgcolor: theme.palette.background.default,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    borderRadius: 0,
                  },
                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    color: theme.palette.text.secondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  },
                  "& .MuiDataGrid-cell": {
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    fontSize: "0.875rem",
                  },
                  "& .MuiDataGrid-row:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  },
                  "& .MuiDataGrid-footerContainer": {
                    borderTop: `1px solid ${theme.palette.divider}`,
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Row Action Menu */}
      <Menu
        anchorEl={menuAnchor.el}
        open={Boolean(menuAnchor.el)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 160,
            borderRadius: "8px",
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <MenuItem onClick={handleOpenDetails} sx={{ py: 1.5, px: 2, fontSize: "0.875rem" }}>
          <IconEye size={16} style={{ marginRight: 12 }} color={theme.palette.text.secondary} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleOpenEdit} sx={{ py: 1.5, px: 2, fontSize: "0.875rem" }}>
          <IconEdit size={16} style={{ marginRight: 12 }} color={theme.palette.text.secondary} />
          Edit {config.noun}
        </MenuItem>
        <MenuItem
          onClick={handleOpenDelete}
          sx={{ py: 1.5, px: 2, fontSize: "0.875rem", color: theme.palette.error.main }}
        >
          <IconTrash size={16} style={{ marginRight: 12 }} color={theme.palette.error.main} />
          Delete {config.noun}
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: theme.shadows[24], overflow: "hidden" } }}
      >
        <DialogTitle
          component="div"
          sx={{ px: 3, py: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: "-0.01em" }}>
            {editingRow ? `Edit ${config.noun}` : `Add New ${config.noun}`}
          </Typography>
          <IconButton
            onClick={() => setDialogOpen(false)}
            size="small"
            sx={{ color: "text.secondary", "&:hover": { bgcolor: theme.palette.grey[100] } }}
          >
            <IconX size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {formSchema.map((field) => (
                <Grid size={{ xs: 12, sm: formSchema.length > 3 ? 6 : 12 }} key={field.field}>
                  <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 1, display: "block" }}>
                    {field.label}{field.required && " *"}
                  </Typography>
                  {field.options ? (
                    <TextField
                      select
                      fullWidth
                      size="medium"
                      value={formValues[field.field] ?? ""}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, [field.field]: e.target.value }))}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                    >
                      {field.options.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </TextField>
                  ) : field.type === "image" ? (
                    <ImageUpload
                      label={field.label}
                      value={formValues[field.field] ?? ""}
                      onChange={(url) => setFormValues((prev) => ({ ...prev, [field.field]: url }))}
                    />
                  ) : (
                    <TextField
                      fullWidth
                      size="medium"
                      type={field.type ?? "text"}
                      value={formValues[field.field] ?? ""}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, [field.field]: e.target.value }))}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          bgcolor: theme.palette.background.paper,
                          "&:hover fieldset": { borderColor: theme.palette.grey[400] },
                          "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
                        },
                      }}
                    />
                  )}
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ px: 3, py: 2.5, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.default, gap: 1.5 }}
        >
          <Button
            onClick={() => setDialogOpen(false)}
            variant="outlined"
            sx={{ borderColor: theme.palette.divider, color: "text.primary", borderRadius: "8px", px: 3, py: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{ boxShadow: "none", borderRadius: "8px", px: 3, py: 1, fontWeight: 600 }}
          >
            {saving ? "Saving..." : `Save ${config.noun}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: theme.shadows[24] } }}
      >
        <DialogTitle sx={{ px: 3, py: 2.5 }}>
          <Typography variant="h6" fontWeight={700} color="error.main" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            Delete {config.noun}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 3, pt: 0 }}>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            Are you sure you want to delete this {config.noun.toLowerCase()}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.default, gap: 1.5 }}
        >
          <Button
            onClick={() => setDeleteOpen(false)}
            variant="outlined"
            sx={{ borderColor: theme.palette.divider, color: "text.primary", borderRadius: "8px", px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            sx={{ boxShadow: "none", borderRadius: "8px", px: 3, fontWeight: 600 }}
          >
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Drawer */}
      <Drawer
        anchor="right"
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        PaperProps={{
          sx: { width: { xs: "100%", sm: 400 }, p: 0, bgcolor: theme.palette.background.default },
        }}
      >
        {editingRow && (
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ p: 3, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper }}>
              <Typography variant="h6" fontWeight={700}>
                {config.noun} Details
              </Typography>
              <IconButton onClick={() => setDetailsOpen(false)} size="small">
                <IconX size={20} />
              </IconButton>
            </Box>
            <Box sx={{ p: 3, flex: 1, overflowY: "auto" }}>
              <Stack spacing={3}>
                {config.columns
                  .filter((col) => col.field !== "actions" && col.field !== "id")
                  .map((col) => {
                    const val = editingRow[col.field];
                    const schemaField = formSchema.find(f => f.field === col.field);
                    const isImage = schemaField?.type === "image" || col.field.includes("image") || col.field.includes("logo");
                    
                    return (
                      <Box key={col.field}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>
                          {col.headerName || col.field}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          {isImage && val ? (
                            <Box
                              component="img"
                              src={val.startsWith("http") ? val : `http://localhost:3000${val}`}
                              alt={col.field}
                              sx={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}
                            />
                          ) : col.field === "status" || col.field === "is_active" || col.field === "is_available" ? (
                            renderStatusPill({ value: val } as any)
                          ) : (
                            <Typography variant="body1" color={val ? "text.primary" : "text.disabled"}>
                              {val !== null && val !== undefined && val !== "" ? String(val) : "—"}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
              </Stack>
            </Box>
            <Box sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper }}>
              <Button fullWidth variant="outlined" onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>
    </PageContainer>
  );
}
