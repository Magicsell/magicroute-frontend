import React from 'react';
import { Box, Typography, Paper, Button, Alert } from '@mui/material';

const DebugPanel = ({ currentUser, isLoggedIn, activeTab, onTestAction }) => {
  const handleTestAction = (action) => {
    console.log(`Debug action: ${action}`);
    if (onTestAction) {
      onTestAction(action);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2, backgroundColor: '#fff3cd', border: '1px solid #ffeaa7' }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#856404' }}>
        🐛 Debug Panel
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Login Status:</strong> {isLoggedIn ? '✅ Logged In' : '❌ Not Logged In'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>User Type:</strong> {currentUser?.type || 'None'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Username:</strong> {currentUser?.username || 'None'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Active Tab:</strong> {activeTab}
        </Typography>
      </Box>
      
      {currentUser?.type === 'admin' && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={() => handleTestAction('test-add-order')}
          >
            Test Add Order
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={() => handleTestAction('test-add-customer')}
          >
            Test Add Customer
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={() => handleTestAction('test-fetch-orders')}
          >
            Test Fetch Orders
          </Button>
        </Box>
      )}
      
      {currentUser?.type !== 'admin' && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          Admin buttons only work for admin users. Current user: {currentUser?.type || 'None'}
        </Alert>
      )}
    </Paper>
  );
};

export default DebugPanel;