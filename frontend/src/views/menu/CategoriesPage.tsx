import { useState, useEffect } from "react";
import {
  Box, Card, Typography, Stack, Button, IconButton, alpha, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Switch, Tooltip, MenuItem, Select, InputLabel, FormControl
} from "@mui/material";
import { IconPlus, IconEdit, IconTrash, IconChevronUp, IconChevronDown, IconFolder, IconFolderOpen } from "@tabler/icons-react";
import PageContainer from "@/components/container/PageContainer";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/api/_menu";
import { toast } from "react-toastify";
import type { MenuCategory } from "@/types/__restaurant";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import ImageUpload from "@/components/widgets/ImageUpload";


export default function CategoriesPage() {
  const theme = useTheme();
  const roleName = useSelector((state: RootState) => state.auth.currentUser?.role?.name);
  const isAdminOrManager = ["SUPERADMIN", "COMPANY_ADMIN", "BRANCH_MANAGER"].includes(roleName || "");

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [flatCategories, setFlatCategories] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<MenuCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "", description: "", image_url: "", parent_id: "", display_order: 0
  });

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data.data);
      
      const flatten = (cats: any[], prefix = ""): {label: string, value: string}[] => {
        let result: {label: string, value: string}[] = [];
        cats.forEach(c => {
          result.push({ label: `${prefix}${c.name}`, value: c.id });
          if (c.subcategories && c.subcategories.length > 0) {
            result = result.concat(flatten(c.subcategories, `${prefix}-- `));
          }
        });
        return result;
      };
      setFlatCategories([{ label: "None (Top Level)", value: "" }, ...flatten(res.data.data)]);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat?: MenuCategory) => {
    if (cat) {
      setEditingCat(cat);
      setFormData({
        name: cat.name,
        description: cat.description || "",
        image_url: cat.image_url || "",
        parent_id: cat.parent_id || "",
        display_order: cat.display_order
      });
    } else {
      setEditingCat(null);
      setFormData({ name: "", description: "", image_url: "", parent_id: "", display_order: 0 });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) return toast.error("Name is required");
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, formData);
        toast.success("Category updated");
      } else {
        await createCategory(formData);
        toast.success("Category created");
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error("Failed to save category");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure? This may affect menu items in this category.")) return;
    try {
      await deleteCategory(id);
      toast.success("Category deleted");
      fetchCategories();
    } catch (err) {
      toast.error("Failed to delete category");
    }
  };

  const toggleActive = async (cat: MenuCategory) => {
    try {
      await updateCategory(cat.id, { is_active: !cat.is_active });
      toast.success(`Category ${!cat.is_active ? 'activated' : 'deactivated'}`);
      fetchCategories();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const moveOrder = async (cat: MenuCategory, direction: "up" | "down") => {
    const newOrder = direction === "up" ? cat.display_order - 1 : cat.display_order + 1;
    try {
      await updateCategory(cat.id, { display_order: newOrder });
      fetchCategories();
    } catch (err) {
      toast.error("Failed to reorder");
    }
  };

  // Recursive Category List Renderer
  const renderCategoryList = (cats: any[], level: number = 0) => {
    // Sort by display order locally just in case
    const sorted = [...cats].sort((a, b) => a.display_order - b.display_order);

    return sorted.map((cat) => (
      <Box key={cat.id}>
        <Card sx={{ 
          display: 'flex', alignItems: 'center', p: 1.5, mb: 1, 
          ml: level * 4, 
          borderRadius: 2, 
          borderLeft: `4px solid ${cat.is_active ? theme.palette.success.main : theme.palette.grey[300]}`,
          bgcolor: cat.is_active ? theme.palette.background.paper : alpha(theme.palette.grey[100], 0.5)
        }}>
          {/* Reordering Controls */}
          <Stack mr={2} alignItems="center">
            <IconButton size="small" onClick={() => moveOrder(cat, "up")} disabled={!isAdminOrManager}>
              <IconChevronUp size={16} />
            </IconButton>
            <Typography variant="caption" color="textSecondary" fontWeight="bold">
              {cat.display_order}
            </Typography>
            <IconButton size="small" onClick={() => moveOrder(cat, "down")} disabled={!isAdminOrManager}>
              <IconChevronDown size={16} />
            </IconButton>
          </Stack>

          {/* Icon/Image */}
          <Box 
            width={48} height={48} borderRadius={2} mr={2}
            display="flex" alignItems="center" justifyContent="center"
            bgcolor={alpha(theme.palette.primary.main, 0.1)}
            overflow="hidden"
          >
            {cat.image_url ? (
              <img src={cat.image_url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              level === 0 ? <IconFolder color={theme.palette.primary.main} /> : <IconFolderOpen size={20} color={theme.palette.secondary.main} />
            )}
          </Box>

          {/* Details */}
          <Box flex={1}>
            <Typography variant="h6" fontWeight={700} color={cat.is_active ? 'text.primary' : 'text.disabled'}>
              {cat.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" noWrap sx={{ maxWidth: 400 }}>
              {cat.description || "No description"}
            </Typography>
          </Box>

          {/* Subcategories Count Badge & Expand Toggle */}
          {cat.subcategories && cat.subcategories.length > 0 && (
            <Stack direction="row" spacing={1} alignItems="center" mr={3}>
              <Typography variant="caption" sx={{ 
                bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', 
                px: 1, py: 0.5, borderRadius: 1, fontWeight: 'bold' 
              }}>
                {cat.subcategories.length} Subcategories
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => setExpandedCats(prev => ({ ...prev, [cat.id]: prev[cat.id] === false ? true : false }))}
                sx={{ bgcolor: alpha(theme.palette.grey[500], 0.1) }}
              >
                {expandedCats[cat.id] === false ? <IconChevronDown size={18} /> : <IconChevronUp size={18} />}
              </IconButton>
            </Stack>
          )}

          {/* Actions */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title={cat.is_active ? "Deactivate Category" : "Activate Category"}>
              <Box mr={1}>
                <Switch 
                  size="small" 
                  checked={cat.is_active} 
                  onChange={() => toggleActive(cat)} 
                  disabled={!isAdminOrManager} 
                />
              </Box>
            </Tooltip>
            
            {isAdminOrManager && (
              <>
                <IconButton size="small" color="primary" onClick={() => handleOpenModal(cat)}>
                  <IconEdit size={18} />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => handleDelete(cat.id)}>
                  <IconTrash size={18} />
                </IconButton>
              </>
            )}
          </Stack>
        </Card>

        {/* Recursive Subcategories */}
        {cat.subcategories && cat.subcategories.length > 0 && expandedCats[cat.id] !== false && (
          <Box sx={{ position: 'relative' }}>
            {/* Optional tree line visualization */}
            <Box sx={{ 
              position: 'absolute', top: 0, bottom: 0, left: (level * 32) + 24, 
              width: 2, bgcolor: theme.palette.divider, zIndex: 0 
            }} />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              {renderCategoryList(cat.subcategories, level + 1)}
            </Box>
          </Box>
        )}
      </Box>
    ));
  };

  return (
    <PageContainer title="Menu Categories" description="Manage enterprise menu hierarchy">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Menu Hierarchy</Typography>
          <Typography color="text.secondary">Organize categories and subcategories visually</Typography>
        </Box>
        {isAdminOrManager && (
          <Button variant="contained" startIcon={<IconPlus />} onClick={() => handleOpenModal()} sx={{ borderRadius: "8px" }}>
            Add Category
          </Button>
        )}
      </Stack>

      <Box>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : categories.length === 0 ? (
          <Card sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">No categories found.</Typography>
          </Card>
        ) : (
          renderCategoryList(categories)
        )}
      </Box>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCat ? "Edit Category" : "New Category"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField 
              label="Category Name" 
              fullWidth 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
            />
            <FormControl fullWidth>
              <InputLabel>Parent Category</InputLabel>
              <Select
                value={formData.parent_id}
                label="Parent Category"
                onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
              >
                {flatCategories.map(c => (
                  <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField 
              label="Description" 
              fullWidth multiline rows={2}
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })} 
            />
            <TextField 
              label="Display Order" 
              type="number"
              fullWidth 
              value={formData.display_order} 
              onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })} 
            />
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Category Image
              </Typography>
              <ImageUpload
                value={formData.image_url}
                onChange={url => setFormData({ ...formData, image_url: url })}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
