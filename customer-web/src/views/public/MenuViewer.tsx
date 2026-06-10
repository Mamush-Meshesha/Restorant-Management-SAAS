import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  CircularProgress,
  Box
} from '@mui/material';
import { Utensils } from 'lucide-react';

// This is the public facing menu that customers see when they scan the QR code on their table
export default function MenuViewer() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [menuData, setMenuData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // 1. Log the scan
    // 2. Fetch the menu for the specific branch
    const fetchMenu = async () => {
      try {
        // First log the scan (this validates the token and gets the branch_id)
        await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/qr/scan/MENU/${token}`);


        // In a real app, we would now fetch the menu categories and items for this branch
        // Mocking for now based on the architecture
        setMenuData({
          branchName: "Main Branch",
          categories: [
            {
              id: 1, name: "Starters", items: [
                { id: 101, name: "Bruschetta", price: 8.99, description: "Grilled bread with garlic, tomatoes, olive oil." },
                { id: 102, name: "Calamari", price: 12.50, description: "Fried squid rings with marinara sauce." }
              ]
            },
            {
              id: 2, name: "Mains", items: [
                { id: 201, name: "Grilled Salmon", price: 24.99, description: "Fresh Atlantic salmon with seasonal vegetables." },
                { id: 202, name: "Ribeye Steak", price: 34.00, description: "12oz USDA Prime ribeye, garlic mashed potatoes." }
              ]
            }
          ]
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Invalid or expired QR code.");
        setLoading(false);
      }
    };

    fetchMenu();
  }, [token]);

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (error) return <Box display="flex" justifyContent="center" mt={10}><Typography color="error" variant="h5">{error}</Typography></Box>;

  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', p: 3, bgcolor: '#fdf8f5', minHeight: '100vh' }}>
      <Box textAlign="center" mb={4}>
        <Utensils size={48} color="#8b0000" />
        <Typography variant="h3" sx={{ mt: 2, fontFamily: 'serif', color: '#333' }}>
          {menuData.branchName}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Digital Menu
        </Typography>
      </Box>

      {menuData.categories.map((cat: any) => (
        <Box key={cat.id} mb={5}>
          <Typography variant="h4" sx={{ mb: 3, borderBottom: '2px solid #e0e0e0', pb: 1, fontFamily: 'serif' }}>
            {cat.name}
          </Typography>
          <Grid container spacing={3}>
            {cat.items.map((item: any) => (
              <Grid size={{ xs: 12, sm: 6 }} key={item.id}>
                <Card elevation={0} sx={{ border: '1px solid #eaeaea', borderRadius: '12px', height: '100%' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h6" fontWeight="bold">{item.name}</Typography>
                      <Typography variant="h6" color="primary" fontWeight="bold">${item.price.toFixed(2)}</Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
}
