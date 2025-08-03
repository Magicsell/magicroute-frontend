import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { QrCode2, Share, ContentCopy } from '@mui/icons-material';
import QRCode from 'qrcode';
import { Snackbar, Alert } from '@mui/material';

const QRCodeGenerator = () => {
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const generateQRCode = async () => {
    // iPhone için özel format - Localhost kullan
    const networkUrl = 'http://localhost:3000';
    const driverUrl = `${networkUrl}?tab=3&driver=true`; // iPhone için query parameters
    setQrCodeUrl(driverUrl);
    
    try {
      const qrDataUrl = await QRCode.toDataURL(driverUrl, {
        width: 350, // Samsung için optimal boyut
        margin: 6, // Samsung için optimal margin
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M', // Medium error correction for Samsung
        type: 'image/png',
        quality: 0.9
      });
      setQrCodeDataUrl(qrDataUrl);
      setShowQR(true);
    } catch (err) {
      console.error('QR Code generation error:', err);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrCodeUrl);
  };

  const shareUrl = () => {
    if (navigator.share) {
      navigator.share({
        title: 'MagicSell Driver App',
        text: 'Access the driver delivery app',
        url: qrCodeUrl
      });
    } else {
      copyToClipboard();
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          📱 Quick Mobile Access
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          iPhone için özel QR code - Kamera ile tara veya link paylaş
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<QrCode2 />}
            onClick={generateQRCode}
          >
            Show QR Code
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Share />}
            onClick={shareUrl}
          >
            Share Link
          </Button>
          
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              const testUrl = 'http://localhost:3000?tab=3&driver=true';
              navigator.clipboard.writeText(testUrl);
              setSnackbarMessage('iPhone URL copied!');
              setSnackbarSeverity('info');
              setShowSnackbar(true);
            }}
          >
            Copy iPhone URL
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              const baseUrl = 'http://localhost:3000';
              navigator.clipboard.writeText(baseUrl);
              setSnackbarMessage('Base URL copied to clipboard!');
              setSnackbarSeverity('info');
              setShowSnackbar(true);
            }}
          >
            Copy Base URL
          </Button>
        </Box>
      </Paper>

      <Dialog open={showQR} onClose={() => setShowQR(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          📱 Driver App QR Code
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Scan this QR code with your phone camera to open the driver app
            </Typography>
            
            {/* QR Code */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              mb: 2
            }}>
              {qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code for Driver App"
                  style={{ width: 300, height: 300 }}
                />
              ) : (
                <Box sx={{ 
                  width: 200, 
                  height: 200, 
                  border: '2px dashed #ccc', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  <Typography variant="body2" color="text.secondary">
                QR Code Placeholder
              </Typography>
                </Box>
              )}
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {qrCodeUrl}
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={<ContentCopy />}
              onClick={copyToClipboard}
              fullWidth
            >
              Copy Link
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQR(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert severity={snackbarSeverity} onClose={() => setShowSnackbar(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QRCodeGenerator; 