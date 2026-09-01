import { useState, useEffect } from "react";
import {
  Box, Card, Typography, Stack, Button, IconButton, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem as SelectItem, Select, InputLabel, FormControl,
  Chip, Divider
} from "@mui/material";
import { IconPlus, IconEdit, IconTrash, IconChefHat } from "@tabler/icons-react";
import PageContainer from "@/components/container/PageContainer";
import { getRecipes, createRecipe, updateRecipe, deleteRecipe } from "@/api/_recipes";
import { getMenuItems } from "@/api/_menu";
import { getInventory } from "@/api/_inventory";
import { toast } from "react-toastify";
import type { Recipe, MenuItem, InventoryItem, RecipeIngredient } from "@/types/__restaurant";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

export default function RecipesPage() {
  const theme = useTheme();
  const roleName = useSelector((state: RootState) => state.auth.currentUser?.role?.name);
  const isAdminOrManager = ["SUPERADMIN", "COMPANY_ADMIN", "BRANCH_MANAGER"].includes(roleName || "");

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Recipe>>({
    menu_item_id: "", instructions: "", prep_time: 0, cook_time: 0
  });
  const [ingredients, setIngredients] = useState<Partial<RecipeIngredient>[]>([]);

  const fetchData = async () => {
    try {
      const [recipesRes, menuRes, invRes] = await Promise.all([
        getRecipes(), getMenuItems(), getInventory()
      ]);
      setRecipes(recipesRes.data.data);
      setMenuItems(menuRes.data.data);
      setInventoryItems(invRes.data.data);
    } catch (error) {
      toast.error("Failed to load recipe data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (recipe?: Recipe) => {
    if (recipe) {
      setEditingRecipe(recipe);
      setFormData({
        menu_item_id: recipe.menu_item_id,
        instructions: recipe.instructions || "",
        prep_time: recipe.prep_time || 0,
        cook_time: recipe.cook_time || 0
      });
      setIngredients(recipe.ingredients?.map(i => ({
        inventory_item_id: i.inventory_item_id,
        quantity: i.quantity,
        unit: i.unit
      })) || []);
    } else {
      setEditingRecipe(null);
      setFormData({ menu_item_id: "", instructions: "", prep_time: 0, cook_time: 0 });
      setIngredients([]);
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.menu_item_id) return toast.error("Menu Item is required");
    try {
      const payload = { ...formData, ingredients: ingredients as any };
      if (editingRecipe) {
        await updateRecipe(editingRecipe.id, payload);
        toast.success("Recipe updated");
      } else {
        await createRecipe(payload);
        toast.success("Recipe created");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to save recipe");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;
    try {
      await deleteRecipe(id);
      toast.success("Recipe deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete recipe");
    }
  };


  return (
    <PageContainer title="Recipes" description="Manage kitchen recipes and inventory ingredients">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Recipes</Typography>
          <Typography color="text.secondary">Tie menu items to inventory ingredients for cost tracking</Typography>
        </Box>
        {isAdminOrManager && (
          <Button variant="contained" startIcon={<IconPlus />} onClick={() => handleOpenModal()} sx={{ borderRadius: "8px" }}>
            Create Recipe
          </Button>
        )}
      </Stack>

      <Box>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : recipes.length === 0 ? (
          <Card sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">No recipes found.</Typography>
          </Card>
        ) : (
          <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={3}>
            {recipes.map(recipe => (
              <Card key={recipe.id} sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  <Box p={1.5} borderRadius={2} bgcolor={theme.palette.primary.light} color="primary.main">
                    <IconChefHat size={28} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {recipe.menuItem?.name || "Unknown Item"}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {recipe.prep_time}m prep • {recipe.cook_time}m cook
                    </Typography>
                  </Box>
                </Stack>
                
                <Typography variant="subtitle2" color="textSecondary" mb={1} textTransform="uppercase">Ingredients</Typography>
                <Box mb={2} flex={1}>
                  {(recipe.ingredients || []).length > 0 ? (
                    <Stack spacing={1}>
                      {recipe.ingredients!.map((ing, i) => (
                        <Stack direction="row" justifyContent="space-between" key={i}>
                          <Typography variant="body2">• {ing.inventoryItem?.name || "Unknown"}</Typography>
                          <Typography variant="body2" fontWeight="bold">{ing.quantity} {ing.unit}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" fontStyle="italic" color="textSecondary">No ingredients specified.</Typography>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Chip size="small" label={`${(recipe.ingredients || []).length} items`} />
                  {isAdminOrManager && (
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" color="primary" onClick={() => handleOpenModal(recipe)}><IconEdit size={16} /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(recipe.id)}><IconTrash size={16} /></IconButton>
                    </Stack>
                  )}
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingRecipe ? "Edit Recipe" : "New Recipe"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Menu Item</InputLabel>
              <Select value={formData.menu_item_id} label="Menu Item" onChange={e => setFormData({ ...formData, menu_item_id: e.target.value })}>
                {menuItems.map(item => (
                  <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <TextField label="Prep Time (minutes)" type="number" fullWidth value={formData.prep_time} onChange={e => setFormData({ ...formData, prep_time: parseInt(e.target.value) || 0 })} />
              <TextField label="Cook Time (minutes)" type="number" fullWidth value={formData.cook_time} onChange={e => setFormData({ ...formData, cook_time: parseInt(e.target.value) || 0 })} />
            </Stack>

            <TextField label="Instructions" fullWidth multiline rows={3} value={formData.instructions} onChange={e => setFormData({ ...formData, instructions: e.target.value })} />

            {/* Ingredients Builder */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Ingredients</Typography>
                <Button size="small" variant="outlined" startIcon={<IconPlus />} onClick={() => setIngredients([...ingredients, { inventory_item_id: "", quantity: 0, unit: "g" }])}>
                  Add Ingredient
                </Button>
              </Stack>
              {ingredients.length === 0 ? (
                <Typography variant="body2" color="textSecondary">No ingredients added. This recipe will not deduct from inventory.</Typography>
              ) : (
                <Stack spacing={2}>
                  {ingredients.map((ing, i) => (
                    <Stack direction="row" spacing={2} key={i}>
                      <FormControl sx={{ flex: 1, minWidth: 200 }}>
                        <InputLabel size="small">Inventory Item</InputLabel>
                        <Select size="small" value={ing.inventory_item_id} label="Inventory Item" onChange={e => {
                          const newIng = [...ingredients]; newIng[i].inventory_item_id = e.target.value; setIngredients(newIng);
                        }}>
                          {inventoryItems.map(item => (
                            <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField size="small" label="Quantity" type="number" sx={{ width: 100 }} value={ing.quantity} onChange={e => {
                        const newIng = [...ingredients]; newIng[i].quantity = parseFloat(e.target.value) || 0; setIngredients(newIng);
                      }} />
                      <TextField size="small" label="Unit (e.g. g, ml, pcs)" sx={{ width: 150 }} value={ing.unit} onChange={e => {
                        const newIng = [...ingredients]; newIng[i].unit = e.target.value; setIngredients(newIng);
                      }} />
                      <IconButton color="error" onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))}><IconTrash size={20} /></IconButton>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save Recipe</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
