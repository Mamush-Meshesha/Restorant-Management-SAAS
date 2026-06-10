import { Box, Typography, Button, IconButton, AppBar, Toolbar, Avatar, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { logout } from '../redux/slices/authSlice';
import { QrCodeScanner, Logout } from '@mui/icons-material';

export default function DashboardScreen() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Staff Portal
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ width: 60, height: 60, bgcolor: 'secondary.main', mr: 2 }}>
            {profile?.first_name?.[0] || 'S'}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {profile?.first_name} {profile?.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Role: {profile?.role?.name || 'Employee'}
            </Typography>
          </Box>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Quick Actions
        </Typography>

        <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Ready to start your shift?
            </Typography>
            <Button
              variant="contained"
              size="large"
              color="secondary"
              startIcon={<QrCodeScanner />}
              onClick={() => navigate('/scan')}
              sx={{ py: 2, px: 4, borderRadius: 8, fontWeight: 'bold', fontSize: '1.1rem', color: 'primary.main' }}
            >
              Clock In (Scan QR)
            </Button>
          </CardContent>
        </Card>

      </Box>
    </Box>
  );
}
