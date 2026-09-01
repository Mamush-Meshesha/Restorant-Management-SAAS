import { useState, useEffect } from "react";
import {
  Box, Card, Typography, Stack, Button, IconButton, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Switch, MenuItem as SelectItem, Select, InputLabel, FormControl,
  Chip, Grid, Tabs, Tab
} from "@mui/material";
import { IconPlus, IconEdit, IconTrash, IconLeaf, IconGrain, IconCheese } from "@tabler/icons-react";
import PageContainer from "@/components/container/PageContainer";
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, getCategories } from "@/api/_menu";
import { toast } from "react-toastify";
import type { MenuItem, MenuCategory, MenuVariant, MenuAddon } from "@/types/__restaurant";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import ImageUpload from "@/components/widgets/ImageUpload";


export default function MenuItemsPage() {
  const theme = useTheme();
  const roleName = useSelector((state: RootState) => state.auth.currentUser?.role?.name);
  const isAdminOrManager = ["SUPERADMIN", "COMPANY_ADMIN", "BRANCH_MANAGER"].includes(roleName || "");

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  
  // Form State
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: "", description: "", base_price: 0, category_id: "", image_url: "",
    is_available: true, is_vegetarian: false, is_vegan: false, is_gluten_free: false,
    allergens: []
  });
  const [variants, setVariants] = useState<Partial<MenuVariant>[]>([]);
  const [addons, setAddons] = useState<Partial<MenuAddon>[]>([]);

  const fetchData = async () => {
    try {
      const [itemsRes, catsRes] = await Promise.all([getMenuItems(), getCategories()]);
      setItems(itemsRes.data.data);
      // Flatten categories for the dropdown
      const flatten = (cats: any[], prefix = ""): any[] => {
        let result: any[] = [];
        cats.forEach(c => {
          result.push({ ...c, label: `${prefix}${c.name}` });
          if (c.subcategories && c.subcategories.length > 0) {
            result = result.concat(flatten(c.subcategories, `${prefix}-- `));
          }
        });
        return result;
      };
      setCategories(flatten(catsRes.data.data));
    } catch (error) {
      toast.error("Failed to load menu data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name, description: item.description || "", base_price: item.base_price,
        category_id: item.category_id, image_url: item.image_url || "",
        is_available: item.is_available, is_vegetarian: item.is_vegetarian,
        is_vegan: item.is_vegan, is_gluten_free: item.is_gluten_free, allergens: item.allergens || []
      });
      // Strip IDs for new relations to recreate them (simplest way to handle nested updates for this demo)
      setVariants(item.variants?.map(v => ({ name: v.name, price_adjustment: v.price_adjustment })) || []);
      setAddons(item.addons?.map(a => ({ name: a.name, price: a.price })) || []);
    } else {
      setEditingItem(null);
      setFormData({
        name: "", description: "", base_price: 0, category_id: "", image_url: "",
        is_available: true, is_vegetarian: false, is_vegan: false, is_gluten_free: false, allergens: []
      });
      setVariants([]);
      setAddons([]);
    }
    setTabIndex(0);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category_id) return toast.error("Name and Category are required");
    try {
      const payload: Partial<MenuItem> = { 
        ...formData, 
        variants: variants as any, 
        addons: addons as any 
      };
      if (editingItem) {
        await updateMenuItem(editingItem.id, payload);
        toast.success("Menu item updated");
      } else {
        await createMenuItem(payload);
        toast.success("Menu item created");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to save menu item");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteMenuItem(id);
      toast.success("Item deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete item");
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      await updateMenuItem(item.id, { is_available: !item.is_available });
      toast.success(`${item.name} is now ${!item.is_available ? 'Available' : 'Sold Out'}`);
      fetchData();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };


  return (
    <PageContainer title="Menu Items" description="Manage enterprise menu items, variants, and add-ons">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Menu Items</Typography>
          <Typography color="text.secondary">Create and manage your products</Typography>
        </Box>
        {isAdminOrManager && (
          <Button variant="contained" startIcon={<IconPlus />} onClick={() => handleOpenModal()} sx={{ borderRadius: "8px" }}>
            Add Item
          </Button>
        )}
      </Stack>

      <Box>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : items.length === 0 ? (
          <Card sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">No items found.</Typography>
          </Card>
        ) : (
          <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(320px, 1fr))" gap={3}>
            {items.map(item => {
              const catName = categories.find(c => c.id === item.category_id)?.name || "Uncategorized";
              return (
                <Card key={item.id} sx={{ 
                  p: 2, height: '100%', display: 'flex', flexDirection: 'column',
                  opacity: item.is_available ? 1 : 0.6,
                  borderLeft: `4px solid ${item.is_available ? theme.palette.success.main : theme.palette.error.main}`
                }}>
                  <Stack direction="row" spacing={2} mb={2}>
                    {item.image_url ? (
                      <Box width={80} height={80} borderRadius={2} overflow="hidden" flexShrink={0}>
                        <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                    ) : (
                      <Box width={80} height={80} borderRadius={2} bgcolor="grey.200" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                        <Typography variant="caption" color="textSecondary">No Image</Typography>
                      </Box>
                    )}
                    <Box flex={1} minWidth={0}>
                      <Stack direction="row" justifyContent="space-between" spacing={1} mb={0.5}>
                        <Typography variant="h6" fontWeight="bold" noWrap title={item.name}>{item.name}</Typography>
                        <Typography variant="h6" color="primary.main" flexShrink={0}>${item.base_price.toFixed(2)}</Typography>
                      </Stack>
                      <Typography variant="body2" color="textSecondary" sx={{
                         display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                      }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Badges */}
                  <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
                    <Chip size="small" label={catName} color="primary" variant="outlined" />
                    {item.is_vegan && <Chip size="small" icon={<IconLeaf size={14} />} label="Vegan" color="success" variant="outlined" />}
                    {item.is_vegetarian && !item.is_vegan && <Chip size="small" icon={<IconCheese size={14} />} label="Veg" color="warning" variant="outlined" />}
                    {item.is_gluten_free && <Chip size="small" icon={<IconGrain size={14} />} label="GF" color="info" variant="outlined" />}
                    {(item.variants?.length || 0) > 0 && <Chip size="small" label={`${item.variants?.length} Variants`} />}
                    {(item.addons?.length || 0) > 0 && <Chip size="small" label={`${item.addons?.length} Add-ons`} />}
                  </Stack>

                  <Box mt="auto" pt={2} display="flex" justifyContent="space-between" alignItems="center" borderTop={`1px solid ${theme.palette.divider}`}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Switch size="small" checked={item.is_available} onChange={() => toggleAvailability(item)} disabled={!isAdminOrManager} />
                      <Typography variant="caption" color={item.is_available ? 'success.main' : 'error.main'} fontWeight="bold">
                        {item.is_available ? 'Available' : 'Sold Out'}
                      </Typography>
                    </Stack>
                    {isAdminOrManager && (
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenModal(item)}><IconEdit size={16} /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}><IconTrash size={16} /></IconButton>
                      </Stack>
                    )}
                  </Box>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingItem ? "Edit Menu Item" : "New Menu Item"}</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
            <Tab label="Basic Info" />
            <Tab label="Dietary & Details" />
            <Tab label="Variants & Add-ons" />
          </Tabs>
          
          <Box p={3}>
            {tabIndex === 0 && (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 8 }} >
                  <TextField label="Name" fullWidth value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }} >
                  <TextField label="Base Price ($)" type="number" fullWidth value={formData.base_price} onChange={e => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })} />
                </Grid>
                <Grid size={{ xs: 12 }} >
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select value={formData.category_id} label="Category" onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                      {categories.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }} >
                  <TextField label="Description" fullWidth multiline rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }} >
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Item Image
                  </Typography>
                  <ImageUpload
                    value={formData.image_url}
                    onChange={url => setFormData({ ...formData, image_url: url })}
                  />
                </Grid>
              </Grid>
            )}

            {tabIndex === 1 && (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }} >
                  <Typography variant="subtitle1" fontWeight="bold" mb={2}>Dietary Tags</Typography>
                  <Stack direction="row" spacing={4}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Switch checked={formData.is_vegan} onChange={e => setFormData({ ...formData, is_vegan: e.target.checked })} />
                      <Typography>Vegan</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Switch checked={formData.is_vegetarian} onChange={e => setFormData({ ...formData, is_vegetarian: e.target.checked })} />
                      <Typography>Vegetarian</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Switch checked={formData.is_gluten_free} onChange={e => setFormData({ ...formData, is_gluten_free: e.target.checked })} />
                      <Typography>Gluten Free</Typography>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12 }} >
                  <TextField label="Allergens (comma separated)" fullWidth value={formData.allergens?.join(", ") || ""} onChange={e => setFormData({ ...formData, allergens: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} placeholder="e.g. Peanuts, Dairy" />
                </Grid>
              </Grid>
            )}

            {tabIndex === 2 && (
              <Grid container spacing={4}>
                {/* Variants */}
                <Grid size={{ xs: 12, md: 6 }} >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">Variants (Sizes/Types)</Typography>
                    <Button size="small" onClick={() => setVariants([...variants, { name: "", price_adjustment: 0 }])}>+ Add Variant</Button>
                  </Stack>
                  {variants.map((v, i) => (
                    <Stack direction="row" spacing={1} mb={2} key={i}>
                      <TextField size="small" label="Name (e.g. Large)" value={v.name} onChange={e => {
                        const newV = [...variants]; newV[i].name = e.target.value; setVariants(newV);
                      }} />
                      <TextField size="small" label="Price Diff ($)" type="number" sx={{ width: 100 }} value={v.price_adjustment} onChange={e => {
                        const newV = [...variants]; newV[i].price_adjustment = parseFloat(e.target.value) || 0; setVariants(newV);
                      }} />
                      <IconButton color="error" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}><IconTrash size={18} /></IconButton>
                    </Stack>
                  ))}
                  {variants.length === 0 && <Typography variant="body2" color="textSecondary">No variants added. Base price will be used.</Typography>}
                </Grid>

                {/* Add-ons */}
                <Grid size={{ xs: 12, md: 6 }} >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">Add-ons (Extras)</Typography>
                    <Button size="small" onClick={() => setAddons([...addons, { name: "", price: 0 }])}>+ Add Add-on</Button>
                  </Stack>
                  {addons.map((a, i) => (
                    <Stack direction="row" spacing={1} mb={2} key={i}>
                      <TextField size="small" label="Name (e.g. Extra Cheese)" value={a.name} onChange={e => {
                        const newA = [...addons]; newA[i].name = e.target.value; setAddons(newA);
                      }} />
                      <TextField size="small" label="Price ($)" type="number" sx={{ width: 100 }} value={a.price} onChange={e => {
                        const newA = [...addons]; newA[i].price = parseFloat(e.target.value) || 0; setAddons(newA);
                      }} />
                      <IconButton color="error" onClick={() => setAddons(addons.filter((_, idx) => idx !== i))}><IconTrash size={18} /></IconButton>
                    </Stack>
                  ))}
                  {addons.length === 0 && <Typography variant="body2" color="textSecondary">No add-ons available for this item.</Typography>}
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save Menu Item</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
