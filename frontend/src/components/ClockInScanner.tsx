import { useEffect, useState } from 'react';
import { Box, Typography, IconButton, Dialog, DialogContent, CircularProgress, Alert } from '@mui/material';
import { IconCamera, IconX } from '@tabler/icons-react';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Geolocation } from '@capacitor/geolocation';
import api from '@/api/index';
import { createPortal } from 'react-dom';

export default function ClockInScanner() {
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isCapacitor = !!(window as any).Capacitor?.isNative;

  useEffect(() => {
    return () => {
      if (scanning) stopScan();
    };
  }, [scanning]);

  const startScan = async () => {
    try {
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (!status.granted) {
        setError('Camera permission is required to scan the attendance QR.');
        setOpen(true);
        return;
      }

      setOpen(true);
      setScanning(true);
      setError('');
      setSuccess('');
      BarcodeScanner.hideBackground();
      document.body.style.backgroundColor = 'transparent';
      document.documentElement.style.backgroundColor = 'transparent';
      document.body.classList.add('scanner-active');
      document.documentElement.classList.add('scanner-active');

      const result = await BarcodeScanner.startScan();
      
      stopScan();

      if (result.hasContent) {
        handleClockIn(result.content);
      }
    } catch (e: any) {
      stopScan();
      setError(e.message || 'Error starting scanner');
      setOpen(true);
    }
  };

  const stopScan = () => {
    BarcodeScanner.showBackground();
    document.body.style.backgroundColor = '';
    document.documentElement.style.backgroundColor = '';
    document.body.classList.remove('scanner-active');
    document.documentElement.classList.remove('scanner-active');
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
        // Fallback: If they scanned the old URL format 
        // e.g. http://localhost:3001/attendance/clock-in/branch-1?token=xyz
        try {
          const url = new URL(qrData);
          const pathParts = url.pathname.split('/');
          // pathParts should be [ "", "attendance", "clock-in", "branch-1" ]
          const clockInIndex = pathParts.indexOf('clock-in');
          if (clockInIndex !== -1 && clockInIndex + 1 < pathParts.length) {
            branchId = pathParts[clockInIndex + 1];
          }
          token = url.searchParams.get('token') || '';
        } catch (urlError) {
          throw new Error('Invalid QR code format. Please scan a valid Attendance QR.');
        }
      }

      if (!branchId || !token) {
         throw new Error('QR Code is missing required data. Please scan a valid Attendance QR.');
      }

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
        console.warn('Geolocation failed', e);
      }

      const res = await api.post('/attendance/clock-in/qr', { branch_id: branchId, token, lat, lng });
      setSuccess(res.data?.message || 'Successfully clocked in!');
      
      setTimeout(() => {
        setOpen(false);
      }, 2500);

    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to clock in');
    } finally {
      setLoading(false);
    }
  };

  // If not running on mobile, we optionally can hide the button or just show it anyway for testing.
  if (!isCapacitor) return null;

  return (
    <>
      <IconButton size="large" aria-label="clock in" color="inherit" onClick={startScan}>
        <IconCamera size="21" stroke="1.5" />
      </IconButton>

      {scanning && createPortal(
        <Box className="scanner-ui-overlay" sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99999, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <IconButton onClick={() => { stopScan(); setOpen(false); }} sx={{ color: 'white' }}>
              <IconX />
            </IconButton>
            <Typography variant="h6" color="white">Scan Attendance QR</Typography>
            <Box width={40} />
          </Box>
          <Box sx={{ flex: 1, border: '4px solid rgba(255,255,255,0.5)', m: 4, borderRadius: 4 }} />
          <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.6)', textAlign: 'center' }}>
            <Typography color="white">Align QR code within the frame</Typography>
          </Box>
        </Box>,
        document.body
      )}

      <Dialog open={open && !scanning} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 5 }}>
          {loading ? (
            <CircularProgress size={60} />
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : success ? (
            <Alert severity="success">{success}</Alert>
          ) : (
             <Typography>Preparing Scanner...</Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
