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
import axios from 'axios';
import { toast } from 'react-toastify';

export default function QRGenerator() {
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [selectedTable, setSelectedTable] = useState('');

  // Mock tables for now. In real app, fetch from API.
  const tables = [
    { id: 't1', name: 'Table 1 - Main Floor' },
    { id: 't2', name: 'Table 2 - Main Floor' },
    { id: 't3', name: 'Table 3 - Patio' },
  ];

  const generateMenuQR = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/qr/menu`, {
        branchId: 'MOCK_BRANCH_ID', // Usually from context/auth
        tableId: selectedTable || undefined
      });
      
      setQrCodeUrl(response.data.data.qrCodeDataUrl);
      toast.success('QR Code generated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate QR Code');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif; flex-direction: column; }
              .card { border: 2px solid #333; padding: 20px; border-radius: 12px; text-align: center; }
              img { max-width: 300px; }
              h1 { margin-top: 20px; color: #8b0000; }
              p { color: #666; }
            </style>
          </head>
          <body>
            <div class="card">
              <img src="${qrCodeUrl}" />
              <h1>Scan for Menu</h1>
              <p>Point your camera at the QR code to view our digital menu and place an order.</p>
              ${selectedTable ? `<p><strong>${tables.find(t => t.id === selectedTable)?.name}</strong></p>` : ''}
            </div>
            <script>
              window.onload = () => { window.print(); window.close(); }
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
                <QrCode /> Generate Menu QR
              </Typography>
              
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
                onClick={generateMenuQR}
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
          {qrCodeUrl && (
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
                  <img src={qrCodeUrl} alt="Menu QR Code" style={{ maxWidth: '250px' }} />
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
