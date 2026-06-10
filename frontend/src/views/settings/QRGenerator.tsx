import { useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Grid
} from '@mui/material';
import { QrCode, Printer } from 'lucide-react';
// Removed unused api import
import { toast } from 'react-toastify';

import { QRCodeSVG } from 'qrcode.react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

export default function QRGenerator() {
  const branchId = useSelector((state: RootState) => state.auth.currentUser?.branch_id) || "branch-1";
  const [qrType, setQrType] = useState('menu');
  const [loading, setLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [selectedTable, setSelectedTable] = useState('');

  // Mock tables for now. In real app, fetch from API.
  const tables = [
    { id: 't1', name: 'Table 1 - Main Floor' },
    { id: 't2', name: 'Table 2 - Main Floor' },
    { id: 't3', name: 'Table 3 - Patio' },
  ];

  const generateQR = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_CUSTOMER_URL || "http://localhost:3001";
      let targetUrl = '';

      if (qrType === 'waitlist') {
        targetUrl = `${baseUrl}/waitlist/join/${branchId}`;
      } else if (qrType === 'session') {
        // Mock session token for demo. In real app, this is fetched from backend.
        const mockSessionToken = `tbl-${selectedTable || 'general'}-${Math.random().toString(36).substring(7)}`;
        targetUrl = `${baseUrl}/session/${mockSessionToken}`;
      } else {
        // Menu QR
        const token = `menu-${selectedTable || 'general'}`;
        targetUrl = `${baseUrl}/menu/scan/${token}`;
      }
      
      setQrCodeData(targetUrl);
      toast.success('QR Code generated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate QR Code');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const svgElement = document.getElementById("qr-svg");
    if (!svgElement) {
      toast.error("QR Code not found");
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif; flex-direction: column; }
              .card { border: 2px solid #333; padding: 20px; border-radius: 12px; text-align: center; }
              svg { max-width: 300px; max-height: 300px; }
              h1 { margin-top: 20px; color: #8b0000; }
              p { color: #666; }
            </style>
          </head>
          <body>
            <div class="card">
              ${svgData}
              <h1>Scan for Access</h1>
              <p>Point your camera at the QR code.</p>
              ${selectedTable ? `<p><strong>${tables.find(t => t.id === selectedTable)?.name}</strong></p>` : ''}
            </div>
            <script>
              // Wait a brief moment to ensure SVG is fully rendered before triggering print
              setTimeout(() => {
                window.print();
              }, 500);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={4} fontWeight="bold" color="text.primary">
        QR Code Management
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography variant="h6" mb={3} display="flex" alignItems="center" gap={1}>
                <QrCode /> Generate Enterprise QR
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>QR Type</InputLabel>
                <Select
                  value={qrType}
                  label="QR Type"
                  onChange={(e) => setQrType(e.target.value)}
                >
                  <MenuItem value="menu">Digital Menu</MenuItem>
                  <MenuItem value="waitlist">Waitlist Sign-Up</MenuItem>
                  <MenuItem value="session">Live Table Session (Ordering)</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Table (Optional)</InputLabel>
                <Select
                  value={selectedTable}
                  label="Table (Optional)"
                  onChange={(e) => setSelectedTable(e.target.value)}
                >
                  <MenuItem value=""><em>General Branch Menu</em></MenuItem>
                  {tables.map(t => (
                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button 
                variant="contained" 
                fullWidth 
                size="large"
                onClick={generateQR}
                disabled={loading}
                sx={{ 
                  bgcolor: '#1e293b', 
                  '&:hover': { bgcolor: '#0f172a' },
                  py: 1.5
                }}
              >
                {loading ? 'Generating...' : 'Generate QR Code'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {qrCodeData && (
            <Card sx={{ p: 2, borderRadius: 3, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Typography variant="h6" mb={2}>Generated QR Code</Typography>
                <Box 
                  sx={{ 
                    p: 2, 
                    border: '1px dashed #ccc', 
                    borderRadius: 2, 
                    display: 'inline-block',
                    bgcolor: '#fff'
                  }}
                >
                  <QRCodeSVG 
                    id="qr-svg"
                    value={qrCodeData} 
                    size={256} 
                    level={"H"} 
                    includeMargin={true}
                  />
                </Box>
                <Box mt={3}>
                  <Button 
                    variant="outlined" 
                    startIcon={<Printer />}
                    onClick={handlePrint}
                    sx={{ borderRadius: 2 }}
                  >
                    Print QR Code
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
