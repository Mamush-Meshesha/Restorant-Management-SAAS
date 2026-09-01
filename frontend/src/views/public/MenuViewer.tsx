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
        const qrRes = await axios.get(`${import.meta.env.VITE_API_URL}/qr/scan/MENU/${token}`);
        const qrData = qrRes.data.data;
        
        if (!qrData || !qrData.branch || !qrData.branch.organization_id) {
          throw new Error("Invalid QR code or branch data missing");
        }

        // Fetch real menu data for the branch from the backend
        const menuRes = await axios.get(`${import.meta.env.VITE_API_URL}/menu/categories?organizationId=${qrData.branch.organization_id}`);

        setMenuData({
          branchName: qrData.branch.name || "Main Branch",
          categories: menuRes.data.data || []
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

          {menuData.categories.map((category: any) => (
            <Box key={category.id} mb={6}>
              <Typography variant="h5" fontWeight={700} mb={3} color="primary.main">
                {category.name}
              </Typography>
              
              <Grid container spacing={3}>
                {category.items?.map((item: any) => (
                  <Grid size={{ xs: 12, md: 6 }} key={item.id}>
                    <Card sx={{ 
                      borderRadius: 3, 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      {item.image_url && (
                        <Box 
                          sx={{ 
                            width: '100%', 
                            height: 180, 
                            backgroundImage: `url(${item.image_url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }} 
                        />
                      )}
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                          <Typography variant="h6" fontWeight={700}>{item.name}</Typography>
                          <Typography variant="h6" fontWeight={800} color="primary.main">
                            ${Number(item.base_price).toFixed(2)}
                          </Typography>
                        </Box>
                        {item.description && (
                          <Typography variant="body2" color="text.secondary" mb={2}>
                            {item.description}
                          </Typography>
                        )}
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
