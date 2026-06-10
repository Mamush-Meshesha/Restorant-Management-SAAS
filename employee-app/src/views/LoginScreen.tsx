import { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Alert, Card, CardContent } from '@mui/material';
import { useAppDispatch } from '../redux/hooks';
import { setAuth } from '../redux/slices/authSlice';
import { loginApi } from '../api/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useAppDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginApi({ email, password });
      dispatch(setAuth({ token: res.token, profile: res.data }));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: '#f4f6f8' }}>
      <Container maxWidth="xs">
        <Card sx={{ p: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', mb: 1 }}>
              Staff Portal
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
              Sign in to access your shift tools
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 3 }}
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 4 }}
                required
              />
              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={loading}
                sx={{ py: 1.5, fontWeight: 'bold' }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
