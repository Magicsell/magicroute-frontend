import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Badge
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  Store as StoreIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    revenueAlerts: true,
    orderAlerts: true,
    performanceAlerts: true,
    systemAlerts: true,
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: false
  });
  const [showSettings, setShowSettings] = useState(false);
  const [newNotification, setNewNotification] = useState({
    type: 'info',
    title: '',
    message: '',
    priority: 'medium'
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadNotifications();
    requestNotificationPermission();
  }, []);

  const loadNotifications = () => {
    // Mock notifications data
    const mockNotifications = [
      {
        id: 1,
        type: 'success',
        title: 'Revenue Milestone Reached',
        message: 'Congratulations! You\'ve reached £5,000 in monthly revenue.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        priority: 'high'
      },
      {
        id: 2,
        type: 'info',
        title: 'New Order Received',
        message: 'Order #1234 from Ramze The Barber for £150.00',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: false,
        priority: 'medium'
      },
      {
        id: 3,
        type: 'warning',
        title: 'Low Stock Alert',
        message: 'Some products are running low on inventory.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        read: true,
        priority: 'medium'
      },
      {
        id: 4,
        type: 'error',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight at 2 AM.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        read: true,
        priority: 'low'
      },
      {
        id: 5,
        type: 'success',
        title: 'Performance Improvement',
        message: 'Your delivery efficiency has improved by 15% this week.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        priority: 'medium'
      }
    ];
    
    setNotifications(mockNotifications);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      // Check if permission is already granted
      if (Notification.permission === 'granted') {
        setSnackbar({
          open: true,
          message: 'Push notifications are already enabled!',
          severity: 'success'
        });
        return;
      }
      
      // Check if permission is denied
      if (Notification.permission === 'denied') {
        setSnackbar({
          open: true,
          message: 'Please enable notifications in your browser settings',
          severity: 'warning'
        });
        return;
      }
      
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setSnackbar({
          open: true,
          message: 'Push notifications enabled!',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Notification permission denied',
          severity: 'warning'
        });
      }
    }
  };

  const handleNotificationToggle = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: !notif.read }
          : notif
      )
    );
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    setSnackbar({
      open: true,
      message: 'Notification deleted',
      severity: 'info'
    });
  };

  const handleSettingChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleAddNotification = () => {
    if (newNotification.title && newNotification.message) {
      const notification = {
        id: Date.now(),
        ...newNotification,
        timestamp: new Date(),
        read: false
      };
      
      setNotifications(prev => [notification, ...prev]);
      setNewNotification({ type: 'info', title: '', message: '', priority: 'medium' });
      setShowAddDialog(false);
      
      setSnackbar({
        open: true,
        message: 'Notification added successfully',
        severity: 'success'
      });
    }
  };

  const sendTestNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from MagicSell',
        icon: '/logo192.png'
      });
      
      setSnackbar({
        open: true,
        message: 'Test notification sent!',
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: 'Please enable notifications in your browser',
        severity: 'warning'
      });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'info':
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      return `${days} days ago`;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Box sx={{ mb: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon sx={{ fontSize: 30, color: '#3f51b5', mr: 2 }} />
            </Badge>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
              🔔 Notification Center
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowAddDialog(true)}
            >
              Add Notification
            </Button>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => setShowSettings(true)}
            >
              Settings
            </Button>
            <Button
              variant="contained"
              startIcon={<NotificationsActiveIcon />}
              onClick={sendTestNotification}
            >
              Test
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ 
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <NotificationsIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Notifications</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {notifications.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ 
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <NotificationsActiveIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Unread</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {unreadCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ 
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircleIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Success</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {notifications.filter(n => n.type === 'success').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ 
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WarningIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Warnings</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {notifications.filter(n => n.type === 'warning').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <List>
          {notifications.map((notification) => (
            <ListItem
              key={notification.id}
              sx={{
                bgcolor: notification.read ? 'transparent' : 'rgba(103, 126, 234, 0.1)',
                borderRadius: 1,
                mb: 1,
                border: notification.read ? 'none' : '1px solid rgba(103, 126, 234, 0.3)'
              }}
            >
              <ListItemIcon>
                {getNotificationIcon(notification.type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 'bold' }}>{notification.title}</span>
                    <Chip 
                      label={notification.priority} 
                      color={getPriorityColor(notification.priority)}
                      size="small"
                    />
                  </span>
                }
                secondary={
                  <span>
                    <span style={{ color: 'rgba(0,0,0,0.6)' }}>{notification.message}</span>
                    <span style={{ color: 'rgba(0,0,0,0.6)', fontSize: '0.75rem', marginLeft: 8 }}>{formatTimestamp(notification.timestamp)}</span>
                  </span>
                }
              />
              <ListItemSecondaryAction>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleNotificationToggle(notification.id)}
                  >
                    {notification.read ? <NotificationsOffIcon /> : <NotificationsActiveIcon />}
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteNotification(notification.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {notifications.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <NotificationsOffIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No notifications yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You'll see important updates here
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SettingsIcon sx={{ mr: 1 }} />
            Notification Settings
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Alert Types
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.revenueAlerts}
                    onChange={() => handleSettingChange('revenueAlerts')}
                  />
                }
                label="Revenue Alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.orderAlerts}
                    onChange={() => handleSettingChange('orderAlerts')}
                  />
                }
                label="Order Alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.performanceAlerts}
                    onChange={() => handleSettingChange('performanceAlerts')}
                  />
                }
                label="Performance Alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.systemAlerts}
                    onChange={() => handleSettingChange('systemAlerts')}
                  />
                }
                label="System Alerts"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Notification Methods
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.pushNotifications}
                    onChange={() => handleSettingChange('pushNotifications')}
                  />
                }
                label="Push Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={() => handleSettingChange('emailNotifications')}
                  />
                }
                label="Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.smsNotifications}
                    onChange={() => handleSettingChange('smsNotifications')}
                  />
                }
                label="SMS Notifications"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Notification Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Notification</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newNotification.type}
                  label="Type"
                  onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value }))}
                >
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Title"
                value={newNotification.title}
                onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={3}
                value={newNotification.message}
                onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newNotification.priority}
                  label="Priority"
                  onChange={(e) => setNewNotification(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddNotification} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationCenter; 