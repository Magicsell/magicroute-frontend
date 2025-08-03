import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Fab,
  Snackbar,
  Alert,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Grid
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Directions,
  CheckCircle,
  Cancel,
  NavigateNext,
  NavigateBefore,
  Print,
  Share,
  Notifications,
  Timer,
  LocalShipping,
  Payment,
  Receipt,
  GetApp,
  Home,
  Menu,
  Map,
  List as ListIcon,
  Dashboard
} from '@mui/icons-material';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const DriverApp = ({ orders, onOrderStatusUpdate, optimizedRoute, onRouteOptimize }) => {
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: Orders, 1: Route

  // Filter pending orders for delivery
  const pendingOrders = orders.filter(order => order.status === 'Pending' || order.status === 'In Process');

  // Log orders changes for debugging
  useEffect(() => {
    console.log('🚚 DriverApp: Orders updated:', orders.length, 'total orders');
    console.log('🚚 DriverApp: Pending orders:', pendingOrders.length);
    console.log('🚚 DriverApp: Current order index:', currentOrderIndex);
    
    // Reset currentOrderIndex if it's out of bounds
    if (currentOrderIndex >= pendingOrders.length && pendingOrders.length > 0) {
      console.log('🔄 Resetting currentOrderIndex to 0');
      setCurrentOrderIndex(0);
    }
    
    // If no pending orders, reset to 0
    if (pendingOrders.length === 0) {
      console.log('🔄 No pending orders, resetting currentOrderIndex to 0');
      setCurrentOrderIndex(0);
    }
  }, [orders, pendingOrders, currentOrderIndex]);

  useEffect(() => {
    // Check if user is on mobile
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    });

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setSnackbarMessage('Driver app installed successfully!');
        setSnackbarSeverity('success');
        setShowSnackbar(true);
      }
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleOrderStatusUpdate = (orderId, newStatus, notes = '', paymentMethod = null) => {
    console.log('🚚 DriverApp: handleOrderStatusUpdate called with:', { orderId, newStatus, notes, paymentMethod });
    
    if (onOrderStatusUpdate) {
      onOrderStatusUpdate(orderId, newStatus, notes, paymentMethod);
    }
    
    // If order is delivered, move to next order after a short delay
    if (newStatus === 'Delivered') {
      setTimeout(() => {
        const currentPendingOrders = orders.filter(order => order.status === 'Pending' || order.status === 'In Process');
        if (currentPendingOrders.length > 0) {
          // Find the next order that's not the current one
          const nextOrderIndex = currentPendingOrders.findIndex(order => order.id !== orderId);
          if (nextOrderIndex >= 0) {
            setCurrentOrderIndex(nextOrderIndex);
            console.log('🔄 Moving to next order after delivery');
          } else {
            setCurrentOrderIndex(0);
            console.log('🔄 Moving to first order after delivery');
          }
        }
      }, 1000); // 1 second delay to show success message
    }
    
    setSnackbarMessage(`Order ${newStatus.toLowerCase()} successfully!`);
    setSnackbarSeverity('success');
    setShowSnackbar(true);
  };

  const handleCallCustomer = (phone) => {
    console.log('📞 Calling customer:', phone);
    if (phone) {
      window.open(`tel:${phone}`, '_blank');
    } else {
      setSnackbarMessage('No phone number available');
      setSnackbarSeverity('warning');
      setShowSnackbar(true);
    }
  };

  const handleGetDirections = (address, postcode) => {
    console.log('🗺️ Getting directions to:', address, postcode);
    if (address && postcode) {
      const fullAddress = `${address}, ${postcode}`;
      const encodedAddress = encodeURIComponent(fullAddress);
      window.open(`https://maps.google.com/maps?q=${encodedAddress}`, '_blank');
    } else {
      setSnackbarMessage('Address information incomplete');
      setSnackbarSeverity('warning');
      setShowSnackbar(true);
    }
  };

  const handleShareOrder = (order) => {
    console.log('📤 Sharing order:', order);
    const orderInfo = `
Order #${order.basketNo}
Shop: ${order.shopName || 'N/A'}
Customer: ${order.customerName || 'N/A'}
Address: ${order.customerAddress || 'N/A'}
Postcode: ${order.customerPostcode || 'N/A'}
Amount: £${order.totalAmount || 'N/A'}
    `.trim();
    
    if (navigator.share) {
      navigator.share({
        title: `Order #${order.basketNo}`,
        text: orderInfo
      }).catch(error => {
        console.log('Share failed, falling back to clipboard');
        navigator.clipboard.writeText(orderInfo);
        setSnackbarMessage('Order details copied to clipboard!');
        setSnackbarSeverity('info');
        setShowSnackbar(true);
      });
    } else {
      navigator.clipboard.writeText(orderInfo);
      setSnackbarMessage('Order details copied to clipboard!');
      setSnackbarSeverity('info');
      setShowSnackbar(true);
    }
  };

  const handlePrintReceipt = (order) => {
    const receiptContent = `
=== MAGICSELL DELIVERY RECEIPT ===
Order #: ${order.basketNo}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Customer Details:
Name: ${order.customerName}
Phone: ${order.customerPhone}
Address: ${order.customerAddress}
Postcode: ${order.customerPostcode}
Shop: ${order.shopName}

Order Details:
Amount: £${order.totalAmount}
Status: Delivered
Delivery #: ${order.deliveryNo}

Driver Notes: ${deliveryNotes}

Signature: _________________
Date: _____________________

Thank you for choosing MagicSell!
    `.trim();
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Delivery Receipt - Order #${order.basketNo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .receipt { border: 2px solid #000; padding: 20px; }
            .header { text-align: center; font-weight: bold; margin-bottom: 20px; }
            .section { margin: 15px 0; }
            .signature { margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <pre>${receiptContent}</pre>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePrintRoute = () => {
    const route = optimizedRoute || [];
    if (route.length === 0) {
      setSnackbarMessage('No route to print');
      setSnackbarSeverity('warning');
      setShowSnackbar(true);
      return;
    }

    const printWindow = window.open('', '_blank');
    const today = new Date().toLocaleDateString('en-GB');
    
    const routeContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MagicSell Delivery Route</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 20px;
            background: #f5f5f5;
            color: #333;
          }
          
          .route-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            border-radius: 12px;
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="1.5" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="80" r="1" fill="rgba(255,255,255,0.1)"/></svg>');
            opacity: 0.3;
          }
          
          .company-name {
            font-size: 2.5em;
            font-weight: bold;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
          }
          
          .route-title {
            font-size: 1.2em;
            margin: 10px 0 0 0;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          
          .route-info {
            background: #f8f9fa;
            padding: 25px;
            border-bottom: 3px solid #667eea;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .info-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          .info-label {
            font-size: 0.9em;
            color: #666;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          
          .info-value {
            font-size: 1.1em;
            font-weight: bold;
            color: #333;
          }
          
          .orders-section {
            padding: 30px;
          }
          
          .section-title {
            font-size: 1.5em;
            color: #333;
            margin-bottom: 25px;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
            display: flex;
            align-items: center;
          }
          
          .section-title::before {
            content: '🚚';
            margin-right: 10px;
            font-size: 1.2em;
          }
          
          .order-item {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            margin-bottom: 20px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            border: 1px solid #dee2e6;
            transition: transform 0.2s;
          }
          
          .order-item:hover {
            transform: translateY(-2px);
          }
          
          .order-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .order-number {
            font-size: 1.3em;
            font-weight: bold;
            display: flex;
            align-items: center;
          }
          
          .order-number::before {
            content: '📍';
            margin-right: 8px;
            font-size: 1.1em;
          }
          
          .order-status {
            background: rgba(255,255,255,0.2);
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
          }
          
          .order-content {
            padding: 20px;
          }
          
          .customer-info {
            margin-bottom: 15px;
          }
          
          .shop-name {
            font-size: 1.2em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
          }
          
          .shop-name::before {
            content: '🏪';
            margin-right: 8px;
          }
          
          .customer-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin-bottom: 15px;
          }
          
          .detail-item {
            display: flex;
            align-items: center;
            font-size: 0.95em;
          }
          
          .detail-icon {
            margin-right: 8px;
            color: #667eea;
            font-size: 1.1em;
          }
          
          .order-amount {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            text-align: center;
            font-size: 1.2em;
            font-weight: bold;
            margin-top: 15px;
          }
          
          .footer {
            background: #343a40;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 0.9em;
          }
          
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.3s;
          }
          
          .print-button:hover {
            background: #5a6fd8;
            transform: translateY(-2px);
          }
          
          @media print {
            .print-button { display: none; }
            body { background: white; }
            .route-container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <button class="print-button no-print" onclick="window.print()">🖨️ Print Route</button>
        
        <div class="route-container">
          <div class="header">
            <h1 class="company-name">MAGICSELL</h1>
            <p class="route-title">DELIVERY ROUTE</p>
          </div>
          
          <div class="route-info">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Date</div>
                <div class="info-value">${today}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Total Orders</div>
                <div class="info-value">${optimizedRoute.length}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Start Point</div>
                <div class="info-value">BH13 7EX (Poole Depot)</div>
              </div>
              <div class="info-item">
                <div class="info-label">Driver</div>
                <div class="info-value">_________________</div>
              </div>
            </div>
          </div>
          
          <div class="orders-section">
            <h2 class="section-title">Delivery Orders</h2>
            
                         ${route.map((order, index) => `
              <div class="order-item">
                <div class="order-header">
                  <div class="order-number">Stop ${index + 1} - Order #${order.basketNo}</div>
                  <div class="order-status">${order.status}</div>
                </div>
                <div class="order-content">
                  <div class="customer-info">
                    <div class="shop-name">${order.shopName || 'N/A'}</div>
                    <div class="customer-details">
                      <div class="detail-item">
                        <span class="detail-icon">👤</span>
                        <span>${order.customerName || 'N/A'}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-icon">📞</span>
                        <span>${order.customerPhone || 'N/A'}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-icon">📍</span>
                        <span>${order.customerAddress || 'N/A'}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-icon">📮</span>
                        <span>${order.customerPostcode || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div class="order-amount">
                    💰 £${order.totalAmount || '0.00'}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <p>🚚 MagicSell Delivery Route • Generated on ${today}</p>
            <p>📱 Driver App • Professional Delivery Management</p>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(routeContent);
    printWindow.document.close();
    printWindow.focus();
  };

  const currentOrder = pendingOrders[currentOrderIndex];

  const renderOrdersView = () => (
    <Box>
      {/* Current Order Card */}
      {currentOrder && (
        <Card elevation={3} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="primary">
                📦 Order #{currentOrder.basketNo}
              </Typography>
              <Chip 
                label={currentOrder.status} 
                color={currentOrder.status === 'Pending' ? 'warning' : 'info'}
                size="small"
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                👤 {currentOrder.customerName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📞 {currentOrder.customerPhone}
              </Typography>
              <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', mt: 1 }}>
                🏪 {currentOrder.shopName}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">
                📍 {currentOrder.customerAddress}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📮 {currentOrder.customerPostcode}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="success.main">
                💰 £{currentOrder.totalAmount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                🚚 {currentOrder.deliveryNo || 'D' + currentOrder.basketNo.toString().padStart(3, '0')}
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<Phone />}
                onClick={() => handleCallCustomer(currentOrder.customerPhone)}
                sx={{ flex: 1, minWidth: 120 }}
              >
                Call
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Directions />}
                onClick={() => handleGetDirections(currentOrder.customerAddress, currentOrder.customerPostcode)}
                sx={{ flex: 1, minWidth: 120 }}
              >
                Directions
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={() => handleShareOrder(currentOrder)}
                sx={{ flex: 1, minWidth: 120 }}
              >
                Share
              </Button>
            </Box>

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<NavigateBefore />}
                disabled={currentOrderIndex === 0 || pendingOrders.length === 0}
                onClick={() => {
                  const newIndex = Math.max(0, currentOrderIndex - 1);
                  setCurrentOrderIndex(newIndex);
                  console.log('🔄 Navigated to previous order, new index:', newIndex);
                }}
                fullWidth
              >
                Previous ({currentOrderIndex + 1} of {pendingOrders.length})
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<NavigateNext />}
                disabled={currentOrderIndex >= pendingOrders.length - 1 || pendingOrders.length === 0}
                onClick={() => {
                  const newIndex = Math.min(pendingOrders.length - 1, currentOrderIndex + 1);
                  setCurrentOrderIndex(newIndex);
                  console.log('🔄 Navigated to next order, new index:', newIndex);
                }}
                fullWidth
              >
                Next ({currentOrderIndex + 1} of {pendingOrders.length})
              </Button>
            </Box>

            {/* Delivery Actions */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => {
                  console.log('✅ Marking order as delivered:', currentOrder);
                  setSelectedOrder(currentOrder);
                  setSelectedPaymentMethod(currentOrder.paymentMethod || '');
                  setShowOrderDetails(true);
                }}
                fullWidth
              >
                Mark Delivered
              </Button>
              
              <Button
                variant="contained"
                color="error"
                startIcon={<Cancel />}
                onClick={() => {
                  console.log('❌ Cancelling order:', currentOrder);
                  handleOrderStatusUpdate(currentOrder.id, 'Cancelled');
                }}
                fullWidth
              >
                Cancel
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* No Orders Message */}
      {pendingOrders.length === 0 && (
        <Card elevation={3}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              🎉 No Pending Orders!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All orders have been delivered or are in progress.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );

  const renderRouteView = () => {
    // Güvenli kontrol - optimizedRoute undefined olabilir
    const route = optimizedRoute || [];
    
    return (
      <Box>
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                🗺️ Route Overview
              </Typography>
              {route.length > 0 && (
                <Button
                  variant="contained"
                  startIcon={<Print />}
                  onClick={handlePrintRoute}
                  sx={{
                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                    }
                  }}
                >
                  🖨️ Print Route
                </Button>
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {route.length > 0 ? `${route.length} stops optimized` : 'No route optimized yet'}
            </Typography>
            
            {route.length > 0 ? (
              <Box>
                {route.map((order, index) => (
                  <Card key={order.id} elevation={2} sx={{ 
                    mb: 2,
                    background: index === currentOrderIndex 
                      ? 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)' 
                      : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    border: index === currentOrderIndex ? '2px solid #667eea' : '1px solid #dee2e6',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ 
                              width: 32, 
                              height: 32, 
                              borderRadius: '50%', 
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.9em',
                              fontWeight: 'bold',
                              mr: 2
                            }}>
                              {index + 1}
                            </Box>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              Order #{order.basketNo}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ ml: 4 }}>
                            <Typography variant="body1" fontWeight="bold" color="primary" sx={{ mb: 0.5 }}>
                              🏪 {order.shopName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              👤 {order.customerName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              📍 {order.customerAddress}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              📮 {order.customerPostcode}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip 
                                label={order.status} 
                                color={order.status === 'Pending' ? 'warning' : 'info'}
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                              />
                              <Typography variant="body2" fontWeight="bold" color="success.main">
                                💰 £{order.totalAmount}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No optimized route available. Contact admin to optimize your route.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar position="fixed" top="auto" bottom={0} sx={{ top: 'auto', bottom: 0 }}>
          <Toolbar sx={{ justifyContent: 'space-around' }}>
            <IconButton color="inherit" onClick={() => window.location.href = '/'}>
              <Home />
            </IconButton>
            <Typography variant="body2" sx={{ flexGrow: 1, textAlign: 'center' }}>
              Driver App
            </Typography>
            {showInstallPrompt && (
              <IconButton color="inherit" onClick={handleInstallApp}>
                <GetApp />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>
      )}

      {/* Install Prompt */}
      {showInstallPrompt && (
        <Paper elevation={3} sx={{ p: 2, mb: 2, background: 'linear-gradient(45deg, #4CAF50 0%, #45a049 100%)', color: 'white' }}>
          <Typography variant="h6" gutterBottom>
            📱 Install Driver App
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Install this app on your phone for quick access and offline functionality!
          </Typography>
          <Button
            variant="contained"
            color="inherit"
            startIcon={<GetApp />}
            onClick={handleInstallApp}
            fullWidth
          >
            Install App
          </Button>
        </Paper>
      )}

      {/* Header */}
      <Paper elevation={3} sx={{ p: 2, mb: 2, background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h5" gutterBottom>
          🚚 Driver Delivery App
        </Typography>
        <Typography variant="body2">
          {pendingOrders.length} orders pending • Order {currentOrderIndex + 1} of {pendingOrders.length}
        </Typography>
        {isMobile && (
          <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
            📱 Mobile Optimized • Swipe to navigate
          </Typography>
        )}
      </Paper>

      {/* Tab Navigation */}
      <Box sx={{ mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          centered
          sx={{ 
            '& .MuiTab-root': {
              minWidth: 120,
              fontSize: '0.9rem'
            }
          }}
        >
          <Tab 
            icon={<ListIcon />} 
            label="Orders" 
            iconPosition="start"
          />
          <Tab 
            icon={<Map />} 
            label="Route" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && renderOrdersView()}
      {activeTab === 1 && renderRouteView()}

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onClose={() => setShowOrderDetails(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Complete Delivery - Order #{selectedOrder?.basketNo}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              💳 Payment Method {!selectedPaymentMethod && <span style={{color: 'red'}}>*</span>}
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Select Payment Method</InputLabel>
              <Select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                label="Select Payment Method"
                required
              >
                <MenuItem value="">Select payment method...</MenuItem>
                <MenuItem value="Cash">💵 Cash</MenuItem>
                <MenuItem value="Card">💳 Card</MenuItem>
                <MenuItem value="Bank Transfer">🏦 Bank Transfer</MenuItem>
                <MenuItem value="Balance">💰 Balance</MenuItem>
              </Select>
            </FormControl>
            {!selectedPaymentMethod && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                ⚠️ Payment method is required to complete delivery
              </Typography>
            )}
          </Box>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Delivery Notes"
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
            placeholder="Add any delivery notes..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowOrderDetails(false);
            setDeliveryNotes('');
            setSelectedPaymentMethod('');
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            disabled={!selectedPaymentMethod}
            onClick={() => {
              console.log('🚚 Driver completing delivery:', {
                orderId: selectedOrder.id,
                paymentMethod: selectedPaymentMethod,
                notes: deliveryNotes
              });
              
              // Update order with payment method and delivery notes
              handleOrderStatusUpdate(selectedOrder.id, 'Delivered', deliveryNotes, selectedPaymentMethod);
              setShowOrderDetails(false);
              setDeliveryNotes('');
              setSelectedPaymentMethod('');
              if (currentOrderIndex < pendingOrders.length - 1) {
                setCurrentOrderIndex(prev => prev + 1);
              }
            }}
          >
            Complete Delivery
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Quick Actions */}
      <Fab
        color="primary"
        aria-label="quick actions"
        sx={{ position: 'fixed', bottom: isMobile ? 80 : 16, right: 16 }}
        onClick={() => {
          if (currentOrder) {
            handlePrintReceipt(currentOrder);
          }
        }}
      >
        <Receipt />
      </Fab>

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

export default DriverApp; 