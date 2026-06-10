import { useEffect, useState } from 'react';
import { Box, Typography, Button, IconButton, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Geolocation } from '@capacitor/geolocation';
import { clockInQrApi } from '../api/attendance';
import { ArrowBack, CameraAlt } from '@mui/icons-material';

export default function ScannerScreen() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Hide background to make camera visible
    const prepare = async () => {
      await BarcodeScanner.prepare();
    };
    prepare();

    return () => {
      stopScan();
    };
  }, []);

  const startScan = async () => {
    try {
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (!status.granted) {
        setError('Camera permission is required to scan the attendance QR.');
        return;
      }

      setScanning(true);
      setError('');
      setSuccess('');
      BarcodeScanner.hideBackground();
      document.body.style.backgroundColor = 'transparent';

      const result = await BarcodeScanner.startScan();
      
      stopScan();

      if (result.hasContent) {
        handleClockIn(result.content);
      }
    } catch (e: any) {
      stopScan();
      setError(e.message || 'Error starting scanner');
    }
  };

  const stopScan = () => {
    BarcodeScanner.showBackground();
    document.body.style.backgroundColor = '';
    BarcodeScanner.stopScan();
    setScanning(false);
  };

  const handleClockIn = async (qrData: string) => {
    setLoading(true);
    try {
      let branchId = '';
      let token = '';

      try {
        const parsed = JSON.parse(qrData);
        branchId = parsed.branch_id;
        token = parsed.token;
      } catch (e) {
        throw new Error('Invalid QR code format');
      }

      // Request GPS Coordinates
      let lat = undefined;
      let lng = undefined;
      try {
        const geoStatus = await Geolocation.checkPermissions();
        if (geoStatus.location === 'granted' || geoStatus.location === 'prompt') {
          const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        }
      } catch (e) {
        console.warn('Geolocation failed or denied', e);
      }

      const res = await clockInQrApi({ branch_id: branchId, token, lat, lng });
      setSuccess(res.message || 'Successfully clocked in!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to clock in');
    } finally {
      setLoading(false);
    }
  };

  if (scanning) {
    return (
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, display: 'flex', flexDirection: 'column', backgroundColor: 'transparent' }}>
        <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'space-between' }}>
          <IconButton onClick={stopScan} sx={{ color: 'white' }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" color="white" sx={{ mt: 1 }}>Scan Attendance QR</Typography>
          <Box sx={{ width: 40 }} />
        </Box>
        <Box sx={{ flex: 1, border: '4px solid rgba(255,255,255,0.5)', m: 4, borderRadius: 4 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', p: 3, bgcolor: '#f4f6f8' }}>
      <IconButton onClick={() => navigate('/dashboard')} sx={{ mb: 2 }}>
        <ArrowBack />
      </IconButton>
      
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>
        Clock In Scanner
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
        {loading ? (
          <CircularProgress size={60} sx={{ mb: 4 }} />
        ) : (
          <Button
            variant="contained"
            size="large"
            onClick={startScan}
            startIcon={<CameraAlt />}
            sx={{ py: 2, px: 4, borderRadius: 8, fontSize: '1.2rem', boxShadow: 4 }}
          >
            Start Camera
          </Button>
        )}
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4, maxWidth: 250 }}>
          Please grant camera and location permissions when prompted to verify your geofence attendance.
        </Typography>
      </Box>
    </Box>
  );
}
