import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { Login as LoginIcon, AdminPanelSettings, DirectionsCar } from '@mui/icons-material';

const AdminLoginPage = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('admin'); // 'admin' or 'driver'

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Authentication logic
    if (userType === 'admin') {
      // Admin authentication
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        onLogin({ type: 'admin', username: 'admin' });
      } else {
        setError('Invalid admin credentials. Use: admin / admin123');
      }
    } else {
      // Driver authentication
      if (credentials.username === 'driver' && credentials.password === 'driver123') {
        onLogin({ type: 'driver', username: 'driver' });
      } else {
        setError('Invalid driver credentials. Use: driver / driver123');
      }
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleUserTypeChange = (event, newUserType) => {
    if (newUserType !== null) {
      setUserType(newUserType);
      setCredentials({ username: '', password: '' }); // Clear credentials when switching
      setError(''); // Clear any previous errors
    }
  };

  const getDemoCredentials = () => {
    return userType === 'admin' ? 'admin / admin123' : 'driver / driver123';
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        borderRadius: 3
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              MagicRoute
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              Login to MagicRoute
            </Typography>

            {/* User Type Toggle */}
            <ToggleButtonGroup
              value={userType}
              exclusive
              onChange={handleUserTypeChange}
              sx={{ mb: 3 }}
            >
              <ToggleButton value="admin" sx={{ px: 3 }}>
                <AdminPanelSettings sx={{ mr: 1 }} />
                Admin
              </ToggleButton>
              <ToggleButton value="driver" sx={{ px: 3 }}>
                <DirectionsCar sx={{ mr: 1 }} />
                Driver
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              margin="normal"
              required
              autoFocus
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              margin="normal"
              required
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              sx={{
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)'
                },
                py: 1.5,
                fontSize: '1.1rem'
              }}
            >
              Login as {userType === 'admin' ? 'Admin' : 'Driver'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Demo Credentials: {getDemoCredentials()}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminLoginPage; 