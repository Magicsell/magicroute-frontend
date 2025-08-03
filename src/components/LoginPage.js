import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Container,
  Paper
} from '@mui/material';
import { 
  AdminPanelSettings, 
  DirectionsCar,
  Login as LoginIcon
} from '@mui/icons-material';

const LoginPage = ({ onLogin }) => {
  const [userType, setUserType] = useState('driver');
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleUserTypeChange = (event, newUserType) => {
    if (newUserType !== null) {
      setUserType(newUserType);
      setError('');
    }
  };

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basit authentication (gerçek uygulamada backend'den kontrol edilir)
    if (userType === 'admin') {
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        onLogin({ type: 'admin', username: credentials.username });
      } else {
        setError('Admin bilgileri hatalı!');
      }
    } else {
      if (credentials.username === 'driver' && credentials.password === 'driver123') {
        onLogin({ type: 'driver', username: credentials.username });
      } else {
        setError('Driver bilgileri hatalı!');
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper 
        elevation={8} 
        sx={{ 
          p: 4, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              color: 'white', 
              fontWeight: 'bold',
              mb: 1
            }}
          >
            🚀 MagicRoute
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 300
            }}
          >
            Delivery Management System
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, color: '#333' }}>
                Giriş Yapın
              </Typography>
              
              <ToggleButtonGroup
                value={userType}
                exclusive
                onChange={handleUserTypeChange}
                sx={{ mb: 3 }}
              >
                <ToggleButton 
                  value="driver" 
                  sx={{ 
                    px: 3, 
                    py: 1,
                    '&.Mui-selected': {
                      backgroundColor: '#667eea',
                      color: 'white'
                    }
                  }}
                >
                  <DirectionsCar sx={{ mr: 1 }} />
                  Driver
                </ToggleButton>
                <ToggleButton 
                  value="admin" 
                  sx={{ 
                    px: 3, 
                    py: 1,
                    '&.Mui-selected': {
                      backgroundColor: '#667eea',
                      color: 'white'
                    }
                  }}
                >
                  <AdminPanelSettings sx={{ mr: 1 }} />
                  Admin
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Kullanıcı Adı"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                sx={{ mb: 3 }}
                required
              />
              
              <TextField
                fullWidth
                label="Şifre"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleInputChange}
                sx={{ mb: 4 }}
                required
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)'
                  }
                }}
              >
                Giriş Yap
              </Button>
            </Box>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Test Bilgileri:</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <strong>Admin:</strong> admin / admin123
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Driver:</strong> driver / driver123
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Paper>
    </Container>
  );
};

export default LoginPage;