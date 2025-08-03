import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Autocomplete,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  Divider,
  Card,
  CardContent,
  AppBar,
  Toolbar
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { io } from 'socket.io-client';
import MapComponent from './components/MapComponent';
import DriverApp from './components/DriverApp';
import QRCodeGenerator from './components/QRCodeGenerator';
import OrderFilters from './components/OrderFilters';
import ComprehensiveAnalytics from './components/DailySalesChart';
import WeeklySalesChart from './components/WeeklySalesChart';
import LoginPage from './components/LoginPage';
import AdminLoginPage from './components/AdminLoginPage';
// AdminTest component removed - no longer needed
import DebugPanel from './components/DebugPanel';
// import SalesPrediction from './components/SalesPrediction'; // Deactivated for now
// import SalesReport from './components/SalesReport'; // Deactivated for now
// import NotificationCenter from './components/NotificationCenter'; // Deactivated for now
import { cardStyles, textStyles } from './theme';
import { validateCardVisibility, logColorWarning, logColorSuccess } from './utils/colorValidator';
import './App.css';

function App() {
  // State management
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [driverView, setDriverView] = useState('dashboard'); // 'dashboard', 'orders', 'route'
  const [showDriverRouteMap, setShowDriverRouteMap] = useState(true);

  const [socket, setSocket] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [customerPagination, setCustomerPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCustomers: 0,
    customersPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Login state management
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check localStorage for saved login state
    const savedLoginState = localStorage.getItem('magicsell_login_state');
    return savedLoginState ? JSON.parse(savedLoginState) : false;
  });

  // Debug optimized route changes
  useEffect(() => {
    console.log('🔄 Optimized route changed:', optimizedRoute.length, 'orders');
    if (optimizedRoute.length > 0) {
      console.log('🔄 Route orders:', optimizedRoute.map(o => o.basketNo));
    }
  }, [optimizedRoute]);
  const [currentUser, setCurrentUser] = useState(() => {
    // Check localStorage for saved user data
    const savedUserData = localStorage.getItem('magicsell_user_data');
    return savedUserData ? JSON.parse(savedUserData) : null;
  });

  const [orderForm, setOrderForm] = useState({
    basketNo: '1',
    shopName: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerPostcode: '',
    totalAmount: '',
    status: 'Pending',
    paymentMethod: ''
  });
  const [customerForm, setCustomerForm] = useState({
    shopName: '',
    name: '',
    phone: '',
    address: '',
    postcode: '',
    city: ''
  });
  const [paymentPopover, setPaymentPopover] = useState({ open: false, anchorEl: null, paymentMethod: null });

  // Color validation function
  const validateAnalyticsCards = () => {
    const cardStyles = [
      { background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)', color: 'white' },
      { background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)', color: 'white' },
      { background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)', color: 'white' },
      { background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)', color: 'white' }
    ];
    
    cardStyles.forEach((style, index) => {
      const validation = validateCardVisibility(style);
      if (!validation.isValid) {
        logColorWarning(`Card ${index + 1} has visibility issues`, validation);
      } else {
        logColorSuccess(`Card ${index + 1} has good contrast`, validation);
      }
    });
  };

  // Helper function to get API URL
  const getApiUrl = () => {
    // For iPhone testing, use computer's IP address
    const isIPhone = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (process.env.NODE_ENV === 'production') {
      return 'https://magicroute-backend.vercel.app'; // Backend'in ayrı proje URL'si
    } else if (isIPhone && !isLocalhost) {
      // iPhone accessing via IP address
      const currentHost = window.location.hostname;
      return `http://${currentHost}:5001`;
    } else {
      return 'http://localhost:5001';
    }
  };

  // Filter functions
  const handleFiltersChange = async (filters) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '') {
          params.append(key, value);
        }
      });

      const url = `${getApiUrl()}/api/orders?${params.toString()}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const filteredData = await response.json();
        setFilteredOrders(filteredData);
        setIsFiltered(true);
      } else {
        console.error('Filter request failed:', response.status);
      }
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  };

  const handleClearFilters = () => {
    setFilteredOrders([]);
    setIsFiltered(false);
  };

  // Helper function to get real distance from Poole Depot (BH13 7EX)
  const getRealDistance = (postcode) => {
    const distances = {
      'BH10 6LF': 5,    // Bournemouth - 5km
      'W1W 7LT': 200,   // London - 200km
      'BH23 3TQ': 15,   // Christchurch - 15km
      'SO14 7FN': 25,   // Southampton - 25km
      'BH22 9HT': 20,   // Ferndown - 20km
      'BH13 7EX': 0     // Poole Depot - 0km
    };
    return distances[postcode] || 15; // Default 15km if not found
  };

  useEffect(() => {
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://magicroute-backend.vercel.app' // Backend'in ayrı proje URL'si
      : 'http://localhost:5001';
    
    const newSocket = io(apiUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    newSocket.on('order-updated', (data) => {
      console.log('📡 Received order-updated event:', data);
      
      // Handle order deletion specifically
      if (data.deleted) {
        console.log('🗑️ Order deletion detected, updating local state...');
        setOrders(prevOrders => prevOrders.filter(order => order.id !== data.orderId));
        setFilteredOrders(prevFiltered => prevFiltered.filter(order => order.id !== data.orderId));
      } else {
        // For other updates, fetch fresh data
        fetchOrders();
      }
    });

    newSocket.on('customer-updated', () => {
      fetchCustomers();
    });

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    // Only fetch data if user is logged in
    if (isLoggedIn) {
      // Force refresh data on login
      console.log('🔄 Force refreshing data on login...');
      fetchOrders();
      fetchCustomers();
      fetchAnalytics();
      validateAnalyticsCards();
    }
  }, [isLoggedIn]);

  // Force refresh data every 30 seconds to prevent cache issues
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const interval = setInterval(() => {
      console.log('🔄 Periodic data refresh...');
      fetchOrders();
      fetchCustomers();
      fetchAnalytics();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // URL parameters kontrolü
  useEffect(() => {
    const handleUrlParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const driverParam = urlParams.get('driver');
      const tabParam = urlParams.get('tab');
      
      // Sadece URL parametrelerini kontrol et
      if (driverParam === 'true') {
        // Driver mode - otomatik tab değişimi
        setActiveTab(0); // Driver tab
      } else if (tabParam) {
        setActiveTab(parseInt(tabParam));
      }
    };

    handleUrlParams();
  }, []); // isLoggedIn dependency olarak eklendi

  // Fix aria-hidden accessibility issues
  useEffect(() => {
    const fixAriaHidden = () => {
      // Remove aria-hidden from root element
      const root = document.getElementById('root');
      if (root && root.getAttribute('aria-hidden') === 'true') {
        root.removeAttribute('aria-hidden');
      }

      // Remove aria-hidden from dialog elements when they have focus
      const dialogs = document.querySelectorAll('.MuiDialog-root');
      dialogs.forEach(dialog => {
        if (dialog.querySelector(':focus') || dialog.matches(':focus-within')) {
          dialog.removeAttribute('aria-hidden');
          dialog.querySelectorAll('[aria-hidden="true"]').forEach(el => {
            el.removeAttribute('aria-hidden');
          });
        }
      });
    };

    // Run immediately
    fixAriaHidden();

    // Set up observer to monitor DOM changes
    const observer = new MutationObserver(fixAriaHidden);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['aria-hidden'],
      subtree: true
    });

    // Set up focus event listeners
    document.addEventListener('focusin', fixAriaHidden);
    document.addEventListener('focus', fixAriaHidden);

    return () => {
      observer.disconnect();
      document.removeEventListener('focusin', fixAriaHidden);
      document.removeEventListener('focus', fixAriaHidden);
    };
  }, []);

  // Safari specific fixes
  useEffect(() => {
    // Fix for Safari black screen
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isSafari) {
      // Force reflow to fix rendering issues
      document.body.style.display = 'none';
      document.body.style.display = '';
      
      // Fix for Safari flexbox issues
      const app = document.querySelector('.App');
      if (app) {
        app.style.display = 'flex';
        app.style.flexDirection = 'column';
        app.style.minHeight = '100vh';
      }
      
      // Fix for Safari container issues
      const containers = document.querySelectorAll('.MuiContainer-root');
      containers.forEach(container => {
        container.style.maxWidth = '100%';
        container.style.paddingLeft = '16px';
        container.style.paddingRight = '16px';
      });
    }
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('🔄 Fetching orders from:', getApiUrl());
      // Cache-busting için timestamp ekle
      const timestamp = new Date().getTime();
      const response = await fetch(`${getApiUrl()}/api/orders?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      console.log('📥 Orders response status:', response.status);
      
      if (response.ok) {
      const data = await response.json();
        console.log('📋 Fetched orders:', data);
        console.log('📅 Orders with dates:', data.map(order => ({
          id: order.id,
          basketNo: order.basketNo,
          createdAt: order.createdAt,
          deliveredAt: order.deliveredAt
        })));
      setOrders(data);
      } else {
        console.error('❌ Failed to fetch orders:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
    }
  };

  const fetchCustomers = async (page = 1, limit = 1000) => {
    try {
      const response = await fetch(`${getApiUrl()}/api/customers?page=${page}&limit=${limit}&sortBy=shopName&sortOrder=asc`);
      const data = await response.json();
      
      if (data.customers && data.pagination) {
        // Backend returns paginated data
        setCustomers(data.customers);
        setCustomerPagination(data.pagination);
      } else {
        // Fallback for old format
        const sortedCustomers = data.sort((a, b) => 
          (a.shopName || '').localeCompare(b.shopName || '')
        );
        setCustomers(sortedCustomers);
        setCustomerPagination({
          currentPage: 1,
          totalPages: 1,
          totalCustomers: sortedCustomers.length,
          customersPerPage: sortedCustomers.length,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingOrder 
        ? `${getApiUrl()}/api/orders/${editingOrder.id}` 
        : `${getApiUrl()}/api/orders`;
      const method = editingOrder ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderForm)
      });

      if (response.ok) {
        setNotification({
          open: true,
          message: editingOrder ? 'Order updated successfully!' : 'Order added successfully!',
          severity: 'success'
        });
        handleOrderDialogClose();
        fetchOrders();
      } else {
        throw new Error('Failed to save order');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      setNotification({
        open: true,
        message: 'Error saving order!',
        severity: 'error'
      });
    }
  };

  const handleOrderEdit = (order) => {
    setEditingOrder(order);
    setOrderForm({
      basketNo: order.basketNo,
      shopName: order.shopName || '',
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      customerPostcode: order.customerPostcode,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod || ''
    });
    setOrderDialogOpen(true);
  };

  const handleOrderDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        const response = await fetch(`${getApiUrl()}/api/orders/${orderId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          // Immediately update local state
          setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
          setFilteredOrders(prevFiltered => prevFiltered.filter(order => order.id !== orderId));
          
          setNotification({
            open: true,
            message: 'Order deleted successfully!',
            severity: 'success'
          });
          
          // Also fetch fresh data from server
          fetchOrders();
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        setNotification({
          open: true,
          message: 'Error deleting order!',
          severity: 'error'
        });
      }
    }
  };

  const handleOrderDialogClose = () => {
    setOrderDialogOpen(false);
    setEditingOrder(null);
    setOrderForm({
      basketNo: '',
      shopName: '',
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      customerPostcode: '',
      totalAmount: '',
      status: 'Pending',
      paymentMethod: ''
    });
  };

  const handleOrderDialogOpen = async () => {
    console.log('🔴 handleOrderDialogOpen called');
    // Generate simple basket number
    const basketNo = orders.length + 1;
    setOrderForm(prev => ({ ...prev, basketNo }));
    
    // Load all customers for the dropdown
    try {
      console.log('🔄 Fetching customers for order dialog...');
      const response = await fetch(`${getApiUrl()}/api/customers?page=1&limit=1000&sortBy=shopName&sortOrder=asc`);
      const data = await response.json();
      
      console.log('📥 Raw customer data:', data);
      
      if (data.customers) {
        setCustomers(data.customers);
        console.log('✅ Set customers from paginated response:', data.customers.length);
        console.log('📋 Customer names:', data.customers.map(c => c.shopName));
      } else {
        // Fallback for old format
        const sortedCustomers = data.sort((a, b) => 
          (a.shopName || '').localeCompare(b.shopName || '')
        );
        setCustomers(sortedCustomers);
        console.log('✅ Set customers from fallback response:', sortedCustomers.length);
        console.log('📋 Customer names:', sortedCustomers.map(c => c.shopName));
      }
    } catch (error) {
      console.error('❌ Error loading customers for order dialog:', error);
    }
    
    setOrderDialogOpen(true);
    console.log('🔴 Order dialog should be open now');
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingCustomer 
        ? `${getApiUrl()}/api/customers/${editingCustomer.id}` 
        : `${getApiUrl()}/api/customers`;
      const method = editingCustomer ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerForm)
      });

      if (response.ok) {
        setNotification({
          open: true,
          message: editingCustomer ? 'Customer updated successfully!' : 'Customer added successfully!',
          severity: 'success'
        });
        handleCustomerDialogClose();
        fetchCustomers();
        // Reset to first page after adding/editing customer
        setCustomerPagination({
          currentPage: 1,
          totalPages: 1,
          totalCustomers: 0,
          customersPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false
        });
      } else {
        throw new Error('Failed to save customer');
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      setNotification({
        open: true,
        message: 'Error saving customer!',
        severity: 'error'
      });
    }
  };

  const handleCustomerEdit = (customer) => {
    setEditingCustomer(customer);
    setCustomerForm({
      shopName: customer.shopName,
      name: customer.name || '',
      phone: customer.phone,
      address: customer.address,
      postcode: customer.postcode,
      city: customer.city || ''
    });
    setCustomerDialogOpen(true);
  };

  const handleCustomerDelete = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await fetch(`${getApiUrl()}/api/customers/${customerId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setNotification({
            open: true,
            message: 'Customer deleted successfully!',
            severity: 'success'
          });
          fetchCustomers();
          setCustomerPagination({
            currentPage: 1,
            totalPages: 1,
            totalCustomers: 0,
            customersPerPage: 10,
            hasNextPage: false,
            hasPrevPage: false
          });
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
        setNotification({
          open: true,
          message: 'Error deleting customer!',
          severity: 'error'
        });
      }
    }
  };

  const handleCustomerSelect = (customer) => {
    setOrderForm(prev => ({
      ...prev,
      customerName: customer.name || customer.shopName,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      customerPostcode: customer.postcode
    }));
  };

  const handleCustomerDialogClose = () => {
    setCustomerDialogOpen(false);
    setEditingCustomer(null);
    setCustomerForm({
      shopName: '',
      name: '',
      phone: '',
      address: '',
      postcode: '',
      city: ''
    });
  };

  // Analytics calculation functions
  const [analytics, setAnalytics] = useState(null);
  
  const fetchAnalytics = async () => {
    try {
      console.log('📊 Fetching analytics from API...');
      const response = await fetch(`${getApiUrl()}/api/analytics`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Analytics received:', data);
        console.log('📊 Today\'s Orders:', data.todaysOrders);
        console.log('📊 Pending Orders:', data.pendingOrders);
        console.log('📊 In Process Orders:', data.inProcessOrders);
        setAnalytics(data);
      } else {
        console.error('❌ Failed to fetch analytics:', response.status);
        // Fallback to local calculation
        const localAnalytics = calculateOrderAnalytics();
        console.log('📊 Using local analytics:', localAnalytics);
        setAnalytics(localAnalytics);
      }
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      // Fallback to local calculation
      const localAnalytics = calculateOrderAnalytics();
      console.log('📊 Using local analytics:', localAnalytics);
      setAnalytics(localAnalytics);
    }
  };
  
  const calculateOrderAnalytics = () => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'Pending').length;
    const inProcessOrders = orders.filter(order => order.status === 'In Process').length;
    const deliveredOrders = orders.filter(order => order.status === 'Delivered').length;
    const cancelledOrders = orders.filter(order => order.status === 'Cancelled').length;
    
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Top performing shops
    const shopStats = orders.reduce((acc, order) => {
      const shopName = order.shopName;
      if (!acc[shopName]) {
        acc[shopName] = { count: 0, revenue: 0 };
      }
      acc[shopName].count++;
      acc[shopName].revenue += parseFloat(order.totalAmount || 0);
      return acc;
    }, {});
    
    const topShops = Object.entries(shopStats)
      .map(([shop, stats]) => ({ shop, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Today's orders
    const today = new Date().toISOString().split('T')[0];
    const todaysOrders = orders.filter(order => {
      const orderDate = order.createdAt ? order.createdAt.split('T')[0] : new Date().toISOString().split('T')[0];
      return orderDate === today;
    }).length;
    
    return {
      totalOrders,
      pendingOrders,
      inProcessOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      averageOrderValue,
      topShops,
      todaysOrders
    };
  };

  const handleOrderStatusUpdate = async (orderId, newStatus, notes = '', paymentMethod = null) => {
    try {
      console.log('🔄 Updating order status:', { orderId, newStatus, notes, paymentMethod });
      console.log('🌐 API URL:', getApiUrl());
      
      // Validate orderId - MongoDB uses _id, but we might receive id
      if (!orderId) {
        console.error('❌ Invalid order ID:', orderId);
        setNotification({
          open: true,
          message: 'Invalid order ID',
          severity: 'error'
        });
        return;
      }
      
      const requestBody = {
        status: newStatus,
        deliveryNotes: notes,
        deliveredAt: newStatus === 'Delivered' ? new Date().toISOString() : null
      };
      
      // Add payment method if provided
      if (paymentMethod) {
        requestBody.paymentMethod = paymentMethod;
      }
      
      console.log('📤 Request body:', requestBody);
      
      const response = await fetch(`${getApiUrl()}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status);

      if (response.ok) {
        const updatedOrder = await response.json();
        console.log('✅ Updated order:', updatedOrder);
        
        // Force refresh orders after a short delay
        setTimeout(() => {
          fetchOrders();
        }, 100);
        
        setNotification({
          open: true,
          message: `Order status updated to ${newStatus}`,
          severity: 'success'
        });
      } else {
        const errorText = await response.text();
        console.error('❌ Response not OK:', response.status, errorText);
        setNotification({
          open: true,
          message: `Error updating order status: ${response.status}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      setNotification({
        open: true,
        message: 'Error updating order status',
        severity: 'error'
      });
    }
  };

  const handleOrderPaymentUpdate = async (orderId, newPaymentMethod) => {
    try {
      console.log('💳 Updating order payment method:', { orderId, newPaymentMethod });
      
      // Validate orderId
      if (!orderId || isNaN(orderId)) {
        console.error('❌ Invalid order ID:', orderId);
        setNotification({
          open: true,
          message: 'Invalid order ID',
          severity: 'error'
        });
        return;
      }
      
      const requestBody = {
        paymentMethod: newPaymentMethod
      };
      
      console.log('📤 Request body:', requestBody);
      
      const response = await fetch(`${getApiUrl()}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status);
      
      if (response.ok) {
        const updatedOrder = await response.json();
        console.log('✅ Updated order payment:', updatedOrder);
        
        // Force refresh orders after a short delay
        setTimeout(() => {
          fetchOrders();
        }, 100);
        
        setNotification({
          open: true,
          message: `Payment method updated to ${newPaymentMethod}`,
          severity: 'success'
        });
      } else {
        const errorText = await response.text();
        console.error('❌ Response not OK:', response.status, errorText);
        setNotification({
          open: true,
          message: `Error updating payment method: ${response.status}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('❌ Error updating payment method:', error);
      setNotification({
        open: true,
        message: 'Error updating payment method',
        severity: 'error'
      });
    }
  };

  const optimizeRoute = async () => {
    try {
      console.log('Starting route optimization...');
      
      // Check if there are orders to optimize
      const activeOrders = orders.filter(order => 
        order.status === 'Pending' || order.status === 'In Process'
      );
      
      if (activeOrders.length === 0) {
        setNotification({
          open: true,
          message: 'No active orders to optimize!',
          severity: 'warning'
        });
        return;
      }
      
      console.log('Active orders for optimization:', activeOrders);
      
      const response = await fetch(`${getApiUrl()}/api/optimize-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          startPostcode: "BH13 7EX",
          orders: activeOrders
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Backend response:', result);
        
        // Safely merge distance information with existing orders
        if (result.route && result.route.length > 0) {
          const updatedOrders = orders.map(order => {
            const optimizedOrder = result.route.find(optOrder => optOrder.id === order.id);
            if (optimizedOrder && optimizedOrder.distance) {
              return { ...order, distance: optimizedOrder.distance };
            }
            return order;
          });
          
          // Sort by distance if available
          const sortedOrders = updatedOrders.sort((a, b) => {
            if (a.distance && b.distance) {
              return a.distance - b.distance;
            }
            return 0;
          });
          
          setOrders(sortedOrders);
          console.log('🔄 Setting optimized route:', result.route);
          setOptimizedRoute(result.route);
          
          console.log('🔄 Optimized route state updated, length:', result.route.length);
          
          // Switch to list view when route is optimized
          setShowDriverRouteMap(false);
          console.log('🔄 Switched to list view');
          
          setNotification({
            open: true,
            message: `Route optimized! Total distance: ${result.totalDistance || 'N/A'} km, Orders: ${result.route.length}`,
            severity: 'success'
          });
        } else {
          console.error('No route data received from backend');
          console.error('Result object:', result);
          setNotification({
            open: true,
            message: 'No route data received from backend',
            severity: 'error'
          });
        }
      } else {
        const errorText = await response.text();
        console.error('Backend error:', response.status, errorText);
        setNotification({
          open: true,
          message: `Backend error: ${response.status}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error optimizing route:', error);
      setNotification({
        open: true,
        message: `Error optimizing route: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const printRoute = async () => {
    try {
      console.log('Generating route PDF...');
      console.log('API URL:', getApiUrl());
      
      // Filter orders to only include Pending and In Process orders
      const activeOrders = orders.filter(order => 
        order.status === 'Pending' || order.status === 'In Process'
      );
      
      console.log('Orders to send:', activeOrders);
      
      // Send only active orders to the PDF generator
      const response = await fetch(`${getApiUrl()}/api/print-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: activeOrders })
      });
      
      if (response.ok) {
        // Create blob from response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = `delivery-route-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        setNotification({
          open: true,
          message: 'Route PDF downloaded successfully!',
          severity: 'success'
        });
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      setNotification({
        open: true,
        message: 'Error generating PDF!',
        severity: 'error'
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    console.log('🔴 handleTabChange called!', { newValue });
    console.log('🔴 Setting activeTab to:', newValue);
    setActiveTab(newValue);
  };

  // Login functions
  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);
    
    // Save login state to localStorage
    localStorage.setItem('magicsell_login_state', JSON.stringify(true));
    localStorage.setItem('magicsell_user_data', JSON.stringify(userData));
    
    // Admin ise Orders tab'ına yönlendir (index 0), Driver ise Driver tab'ına (index 0)
    if (userData.type === 'admin') {
      setActiveTab(0); // Orders tab index
    } else {
      setActiveTab(0); // Driver tab index (driver için tek tab)
    }
    
    // Login sonrası verileri yeniden yükle
    fetchOrders();
    fetchCustomers();
    
    setNotification({
      open: true,
      message: `${userData.type === 'admin' ? 'Admin' : 'Driver'} olarak giriş yapıldı!`,
      severity: 'success'
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveTab(0); // Orders tab'a geri dön
    
    // Clear login state from localStorage
    localStorage.removeItem('magicsell_login_state');
    localStorage.removeItem('magicsell_user_data');
    
    setNotification({
      open: true,
      message: 'Çıkış yapıldı!',
      severity: 'info'
    });
  };

  // handleAdminTest function removed - no longer needed

  return (
    <div className="App">
      {isLoggedIn ? (
        // Main Panel - Logged In (Admin or Driver)
        <Container maxWidth="xl" sx={{ position: 'relative' }}>
          {/* Header */}
          <AppBar position="static" sx={{ 
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            mb: 3
          }}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                🚀 MagicRoute - {currentUser?.type === 'driver' ? 'Driver Panel' : 'Admin Panel'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  label={currentUser?.type === 'driver' ? 'Driver' : 'Admin'} 
                  color="primary"
                  variant="filled"
                  sx={{
                    backgroundColor: currentUser?.type === 'driver' ? '#FF9800' : '#2196F3',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
                <Button 
                  color="inherit" 
                  onClick={handleLogout}
                  sx={{ color: 'white' }}
                >
                  Logout
                </Button>
              </Box>
            </Toolbar>
          </AppBar>

          <Box sx={{ my: 4 }}>
            <Box sx={{ 
              color: 'white', 
              mb: 3, 
              mt: 4,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              fontSize: '3rem',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              MagicRoute
            </Box>

            <Paper sx={{ 
              p: 3, 
              borderRadius: 3, 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              zIndex: 1,
              position: 'relative'
            }}>
              {currentUser?.type === 'driver' ? (
                // Driver Panel - Only Driver Tab
                <Box>
                  <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
                    🚗 Driver Dashboard
                  </Typography>
                  
                  {/* Driver-specific content */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: 3, 
                    mb: 4 
                  }}>
                    {/* Today's Route */}
                    <Card sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        📍 Orders to Deliver
                      </Typography>
                      <Typography variant="body1">
                        {analytics ? `${analytics.pendingOrders + analytics.inProcessOrders} orders to deliver` : `${optimizedRoute.length > 0 ? optimizedRoute.length : 0} stops`}
                        {/* Debug: {analytics ? `(Analytics: ${analytics.todaysOrders}, Pending: ${analytics.pendingOrders}, InProcess: ${analytics.inProcessOrders})` : '(No analytics)'} */}
                        {/* Route Debug: optimizedRoute.length=${optimizedRoute.length} */}
                      </Typography>
                      <Button 
                        variant="contained" 
                        sx={{ mt: 2, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                        onClick={() => {
                          // Show driver-specific route view
                          setDriverView('route');
                          // Optimize route if not already done
                          if (optimizedRoute.length === 0) {
                            optimizeRoute();
                          }
                        }}
                      >
                        View Route
                      </Button>
                    </Card>

                    {/* Orders to Deliver */}
                    <Card sx={{ p: 3, background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', color: 'white' }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        📦 Orders to Deliver
                      </Typography>
                      <Typography variant="h4" sx={{ mb: 1 }}>
                        {analytics ? (analytics.pendingOrders + analytics.inProcessOrders) : orders.filter(o => o.status === 'Pending' || o.status === 'In Process').length}
                      </Typography>
                      <Button 
                        variant="contained" 
                        sx={{ mt: 2, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                        onClick={() => {
                          // Show driver-specific orders view
                          setDriverView('orders');
                          // Force refresh orders for driver
                          fetchOrders();
                        }}
                      >
                        View Orders
                      </Button>
                    </Card>


                  </Box>



                  {/* Driver Route View */}
                  {driverView === 'route' && (
                    <Box sx={{ mb: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                          🗺️ My Delivery Route
                        </Typography>
                        <Button 
                          variant="outlined" 
                          onClick={() => setDriverView('dashboard')}
                          sx={{ color: '#667eea', borderColor: '#667eea' }}
                        >
                          ← Back to Dashboard
                        </Button>
                      </Box>
                      
                      <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
                        📍 Optimized Route: {optimizedRoute.length} stops
                        {/* Debug: optimizedRoute=${JSON.stringify(optimizedRoute.map(o => o.basketNo))} */}
                      </Typography>
                      
                      {/* Route View Tabs */}
                      <Box sx={{ mb: 3 }}>
                        <Tabs 
                          value={showDriverRouteMap ? 0 : 1} 
                          onChange={(e, newValue) => setShowDriverRouteMap(newValue === 0)}
                          centered
                          sx={{ mb: 2 }}
                        >
                          <Tab label="🗺️ Map View" />
                          <Tab label="📋 List View" />
                        </Tabs>
                      </Box>
                      
                      {/* Map View */}
                      {showDriverRouteMap && (
                        <Box sx={{ 
                          mb: 3, 
                          height: '700px', 
                          borderRadius: 2, 
                          overflow: 'hidden', 
                          border: '2px solid #e0e0e0',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                          backgroundColor: '#ffffff'
                        }}>
                          <MapComponent 
                            orders={optimizedRoute}
                            optimizedRoute={optimizedRoute}
                            onRouteOptimized={(route) => setOptimizedRoute(route)}
                          />
                        </Box>
                      )}
                      
                      {/* List View */}
                      {!showDriverRouteMap && (
                        <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Debug: optimizedRoute.length = {optimizedRoute.length}, showDriverRouteMap = {showDriverRouteMap.toString()}
                          </Typography>
                          {optimizedRoute.length === 0 && (
                            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                              ⚠️ No optimized route available. Please optimize route first.
                            </Typography>
                          )}
                        </Box>
                      )}
                      
                      {!showDriverRouteMap && optimizedRoute.length > 0 && (
                        <TableContainer component={Paper}>
                          <Table stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell>Stop #</TableCell>
                                <TableCell>Order No</TableCell>
                                <TableCell>Shop Name</TableCell>
                                <TableCell>Customer</TableCell>
                                <TableCell>Address</TableCell>
                                <TableCell>Postcode</TableCell>
                                <TableCell>Total</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {optimizedRoute.map((order, index) => (
                                <TableRow key={`route-order-${order.id}`}>
                                  {/* Debug: Order data */}
                                  <Box sx={{ display: 'none' }}>
                                    {console.log('Route order:', order)}
                                  </Box>
                                  <TableCell>
                                    <Box sx={{ fontWeight: 'bold', color: '#667eea' }}>
                                      #{index + 1}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ fontWeight: 'bold', color: '#667eea' }}>
                                      #{order.basketNo}
                                    </Box>
                                  </TableCell>
                                  <TableCell>{order.shopName}</TableCell>
                                  <TableCell>{order.customerName}</TableCell>
                                  <TableCell>{order.customerAddress}</TableCell>
                                  <TableCell>{order.customerPostcode}</TableCell>
                                  <TableCell>£{order.totalAmount}</TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={order.status} 
                                      color={
                                        order.status === 'Delivered' ? 'success' : 
                                        order.status === 'In Process' ? 'info' : 
                                        'warning'
                                      }
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                      <Button
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        onClick={() => handleOrderStatusUpdate(order.id, 'Delivered')}
                                        sx={{ minWidth: 'auto', px: 1 }}
                                      >
                                        ✅ Deliver
                                      </Button>
                                      <Button
                                        variant="outlined"
                                        color="primary"
                                        size="small"
                                        onClick={() => handleOrderStatusUpdate(order.id, 'In Process')}
                                        sx={{ minWidth: 'auto', px: 1 }}
                                      >
                                        🚚 Start
                                      </Button>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                      
                      {/* No Route Message */}
                      {optimizedRoute.length === 0 && (
                        <Card sx={{ p: 3, textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
                            🗺️ No Route Optimized Yet
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 3, color: '#888' }}>
                            Click "Optimize Route" to create your delivery route
                          </Typography>
                          <Button
                            variant="contained"
                            onClick={() => {
                              console.log('🔄 Optimize Route button clicked');
                              console.log('🔄 Current optimizedRoute:', optimizedRoute);
                              optimizeRoute();
                            }}
                            sx={{ 
                              background: 'linear-gradient(45deg, #FF9800 0%, #F57C00 100%)',
                              '&:hover': { background: 'linear-gradient(45deg, #F57C00 0%, #E65100 100%)' }
                            }}
                          >
                            🚀 Optimize Route
                          </Button>
                        </Card>
                      )}
                    </Box>
                  )}

                  {/* Driver Orders View */}
                  {driverView === 'orders' && (
                    <Box sx={{ mb: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                          🚚 My Delivery Orders
                        </Typography>
                        <Button 
                          variant="outlined" 
                          onClick={() => setDriverView('dashboard')}
                          sx={{ color: '#4CAF50', borderColor: '#4CAF50' }}
                        >
                          ← Back to Dashboard
                        </Button>
                      </Box>
                      
                      <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
                        📦 Orders to Deliver: {analytics ? (analytics.pendingOrders + analytics.inProcessOrders) : orders.filter(o => o.status === 'Pending' || o.status === 'In Process').length}
                      </Typography>
                      
                      <TableContainer component={Paper}>
                        <Table stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Order No</TableCell>
                              <TableCell>Shop Name</TableCell>
                              <TableCell>Customer</TableCell>
                              <TableCell>Phone</TableCell>
                              <TableCell>Address</TableCell>
                              <TableCell>Postcode</TableCell>
                              <TableCell>Total</TableCell>
                              <TableCell>Payment</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {orders
                              .filter(order => order.status === 'Pending' || order.status === 'In Process')
                              .sort((a, b) => {
                                const dateA = new Date(a.createdAt || a.deliveredAt || 0);
                                const dateB = new Date(b.createdAt || b.deliveredAt || 0);
                                return dateB - dateA;
                              })
                              .map((order) => (
                                <TableRow key={`driver-order-${order.id}`}>
                                  <TableCell>
                                    {(() => {
                                      const date = order.createdAt || order.deliveredAt;
                                      if (date) {
                                        try {
                                          return new Date(date).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                          });
                                        } catch (error) {
                                          return '-';
                                        }
                                      }
                                      return '-';
                                    })()}
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ fontWeight: 'bold', color: '#667eea' }}>
                                      #{order.basketNo}
                                    </Box>
                                  </TableCell>
                                  <TableCell>{order.shopName}</TableCell>
                                  <TableCell>{order.customerName}</TableCell>
                                  <TableCell>{order.customerPhone}</TableCell>
                                  <TableCell>{order.customerAddress}</TableCell>
                                  <TableCell>{order.customerPostcode}</TableCell>
                                  <TableCell>£{order.totalAmount}</TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={order.paymentMethod || 'Not Set'} 
                                      color={
                                        !order.paymentMethod ? 'default' :
                                        order.paymentMethod === 'Cash' ? 'success' : 
                                        order.paymentMethod === 'Card' ? 'primary' : 
                                        order.paymentMethod === 'Bank Transfer' ? 'info' : 
                                        'warning'
                                      }
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={order.status} 
                                      color={
                                        order.status === 'Delivered' ? 'success' : 
                                        order.status === 'In Process' ? 'info' : 
                                        'warning'
                                      }
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                      <Button
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        onClick={() => handleOrderStatusUpdate(order.id, 'Delivered')}
                                        sx={{ minWidth: 'auto', px: 1 }}
                                      >
                                        ✅ Deliver
                                      </Button>
                                      <Button
                                        variant="outlined"
                                        color="primary"
                                        size="small"
                                        onClick={() => handleOrderStatusUpdate(order.id, 'In Process')}
                                        sx={{ minWidth: 'auto', px: 1 }}
                                      >
                                        🚚 Start
                                      </Button>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}

                  {/* Driver App - Main Interface */}
                  {driverView === 'dashboard' && (
                    <Box>
                      <DriverApp 
                        orders={orders}
                        onOrderStatusUpdate={handleOrderStatusUpdate}
                        optimizedRoute={optimizedRoute}
                        onRouteOptimize={optimizeRoute}
                      />
                    </Box>
                  )}
                </Box>
              ) : (
                // Admin Panel - All Tabs
                <Tabs 
                  value={activeTab >= 0 && activeTab <= 4 ? activeTab : 0} 
                  onChange={handleTabChange} 
                  centered 
                  sx={{ 
                    mb: 3,
                    zIndex: 9999,
                    position: 'relative',
                    '& .MuiTab-root': {
                      zIndex: 10000,
                      position: 'relative'
                    }
                  }}
                >
                  <Tab label="Orders" />
                  <Tab label="Customers" />
                  <Tab label="Route" />
                  <Tab label="Analytics" />
                  <Tab label="Driver" />
                </Tabs>
              )}

          {/* Admin Panel Tab Content */}
          {currentUser?.type === 'admin' && (
            <>
              {/* Orders Tab - Admin ve Driver için farklı görünüm */}
              {activeTab === 0 && (
            <Box>
              {currentUser?.type === 'driver' ? (
                // Driver için özel sipariş görünümü
                <Box>
                  <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold', color: '#4CAF50' }}>
                    🚚 My Delivery Orders
                  </Typography>
                  
                  {/* Driver için sadece Pending ve In Process siparişler */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
                      📦 Orders to Deliver: {orders.filter(o => o.status === 'Pending' || o.status === 'In Process').length}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                // Admin için normal görünüm
                <Box>
                  {/* Günlük Satış Grafiği */}
                  <ComprehensiveAnalytics />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                      Orders {isFiltered && <Chip label={`${filteredOrders.length} filtered`} size="small" color="primary" sx={{ ml: 1 }} />}
                    </Box>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={handleOrderDialogOpen}
                      sx={{ 
                        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': { background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)' }
                      }}
                    >
                      Add New Order
                    </Button>
                  </Box>
                </Box>
              )}
              
              {/* Advanced Filters */}
              <OrderFilters 
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
              />
              
              <TableContainer component={Paper}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Order No</TableCell>
                      <TableCell>Shop Name</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>Postcode</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Payment</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(isFiltered ? filteredOrders : orders)
                      .filter(order => {
                        // Driver için sadece Pending ve In Process siparişleri göster
                        if (currentUser?.type === 'driver') {
                          return order.status === 'Pending' || order.status === 'In Process';
                        }
                        return true; // Admin için tüm siparişleri göster
                      })
                      .sort((a, b) => {
                        const dateA = new Date(a.createdAt || a.deliveredAt || 0);
                        const dateB = new Date(b.createdAt || b.deliveredAt || 0);
                        return dateB - dateA; // En yeni en üstte
                      })
                      .map((order) => (
                                        <TableRow key={`order-${order.id}`}>
                        <TableCell>
                          {(() => {
                            const date = order.createdAt || order.deliveredAt;
                            if (date) {
                              try {
                                return new Date(date).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                });
                              } catch (error) {
                                console.error('Error parsing date:', date, error);
                                return '-';
                              }
                            }
                            return '-';
                          })()}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ fontWeight: 'bold', color: '#667eea' }}>
                            #{order.basketNo}
                          </Box>
                        </TableCell>
                        <TableCell>{order.shopName}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.customerPhone}</TableCell>
                        <TableCell>{order.customerAddress}</TableCell>
                        <TableCell>{order.customerPostcode}</TableCell>
                        <TableCell>£{order.totalAmount}</TableCell>
                        <TableCell>
                          <Chip 
                            label={order.paymentMethod || 'Not Set'} 
                            color={
                              !order.paymentMethod ? 'default' :
                              order.paymentMethod === 'Cash' ? 'success' : 
                              order.paymentMethod === 'Card' ? 'primary' : 
                              order.paymentMethod === 'Bank Transfer' ? 'info' : 
                              'warning'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={order.status} 
                            color={
                              order.status === 'Delivered' ? 'success' : 
                              order.status === 'In Process' ? 'info' : 
                              'warning'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {currentUser?.type === 'driver' ? (
                            // Driver için teslim etme butonları
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => handleOrderStatusUpdate(order.id, 'Delivered')}
                                sx={{ minWidth: 'auto', px: 1 }}
                              >
                                ✅ Deliver
                              </Button>
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                onClick={() => handleOrderStatusUpdate(order.id, 'In Process')}
                                sx={{ minWidth: 'auto', px: 1 }}
                              >
                                🚚 Start
                              </Button>
                            </Box>
                          ) : (
                            // Admin için edit/delete butonları
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton 
                                onClick={() => handleOrderEdit(order)} 
                                size="small"
                                aria-label="Edit order"
                                title="Edit order"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton 
                                onClick={() => handleOrderDelete(order.id)} 
                                size="small" 
                                color="error"
                                aria-label="Delete order"
                                title="Delete order"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Customers Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Customers</Box>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    console.log('🔴 Add Customer button clicked directly');
                    alert('Add Customer button works!');
                    setCustomerDialogOpen(true);
                  }}
                  sx={{ 
                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': { background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)' },
                    zIndex: 9999,
                    position: 'relative'
                  }}
                >
                  Add Customer
                </Button>
              </Box>
              
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Shop Name</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>Postal Code</TableCell>
                      <TableCell>City</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                                    {customers.map((customer) => (
                    <TableRow key={`customer-${customer.id}-${customer.name}`} sx={{ cursor: 'pointer' }} onClick={() => handleCustomerSelect(customer)}>
                            <TableCell>{customer.name}</TableCell>
                            <TableCell>{customer.shopName}</TableCell>
                            <TableCell>{customer.phone}</TableCell>
                            <TableCell>{customer.address}</TableCell>
                            <TableCell>{customer.postcode}</TableCell>
                            <TableCell>{customer.city}</TableCell>
                            <TableCell>
                              <IconButton onClick={(e) => { e.stopPropagation(); handleCustomerEdit(customer); }} size="small">
                                <EditIcon />
                              </IconButton>
                              <IconButton onClick={(e) => { e.stopPropagation(); handleCustomerDelete(customer.id); }} size="small" color="error">
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Customer Summary */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total: {customerPagination.totalCustomers} customers
                </Typography>
              </Box>

              {/* Customer Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {customerPagination.customersPerPage * (customerPagination.currentPage - 1) + 1} to {Math.min(customerPagination.currentPage * customerPagination.customersPerPage, customerPagination.totalCustomers)} of {customerPagination.totalCustomers} customers
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    onClick={() => fetchCustomers(customerPagination.currentPage - 1, customerPagination.customersPerPage)}
                    disabled={!customerPagination.hasPrevPage}
                  >
                    Previous
                  </Button>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                    Page {customerPagination.currentPage} of {customerPagination.totalPages}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => fetchCustomers(customerPagination.currentPage + 1, customerPagination.customersPerPage)}
                    disabled={!customerPagination.hasNextPage}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          {/* Route Tab */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', mb: 2 }}>Route Optimization</Box>
                                <Box sx={{ mb: 2, fontSize: '1rem' }}>
                Interactive map showing optimized delivery route from Poole Depot (BH13 7EX)
                </Box>
              
              <MapComponent 
                orders={orders.filter(order => order.status === 'Pending' || order.status === 'In Process')}
                optimizedRoute={optimizedRoute}
                                        onRouteOptimized={(data) => {
                          console.log('🔄 Route optimized callback received:', data);
                  console.log('Route optimized:', data);
                  setOptimizedRoute(data.route || []);
                }}
              />
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={optimizeRoute}
                  sx={{ 
                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': { background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)' }
                  }}
                >
                  🗺️ Optimize Route
                </Button>
                
                <Button 
                  variant="outlined" 
                  onClick={printRoute}
                  disabled={orders.filter(order => order.status === 'Pending' || order.status === 'In Process').length === 0}
                  sx={{ 
                    borderColor: '#4CAF50',
                    color: '#4CAF50',
                    '&:hover': {
                      borderColor: '#45a049',
                      backgroundColor: '#f0f8f0'
                    }
                  }}
                >
                  🖨️ Print Route
                </Button>
              </Box>
            </Box>
          )}

          {/* Driver App Tab */}
          {activeTab === 4 && (
            <Box>
              <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', mb: 2 }}>Driver Delivery App</Box>
                                <Box sx={{ mb: 2, fontSize: '1rem' }}>
                Mobile-optimized interface for drivers to track and deliver orders
                </Box>
              
              <QRCodeGenerator />
              
              <DriverApp 
                orders={orders}
                onOrderStatusUpdate={handleOrderStatusUpdate}
              />
            </Box>
          )}

          {/* Analytics Tab */}
          {activeTab === 3 && (
            <Box>
              <Box sx={{ mb: 3, color: '#1976d2', fontWeight: 'bold', fontSize: '1.5rem' }}>
                📊 Analytics Dashboard
              </Box>
              
              {/* Key Metrics Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}>
                    <Box sx={{ fontWeight: 'bold', mb: 1, fontSize: '3rem' }}>
                      {orders.length}
                    </Box>
                    <Box sx={{ opacity: 0.9, fontSize: '1rem' }}>
                      📦 Total Orders
                    </Box>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}>
                    <Box sx={{ fontWeight: 'bold', mb: 1, fontSize: '3rem' }}>
                      {customers.length}
                    </Box>
                    <Box sx={{ opacity: 0.9, fontSize: '1rem' }}>
                      👥 Total Customers
                    </Box>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}>
                    <Box sx={{ fontWeight: 'bold', mb: 1, fontSize: '3rem' }}>
                      £{orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0).toFixed(2)}
                    </Box>
                    <Box sx={{ opacity: 0.9, fontSize: '1rem' }}>
                      💰 Total Revenue
                    </Box>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}>
                    <Box sx={{ fontWeight: 'bold', mb: 1, fontSize: '3rem' }}>
                      {orders.length > 0 ? (orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0) / orders.length).toFixed(2) : '0'}
                    </Box>
                    <Box sx={{ opacity: 0.9, fontSize: '1rem' }}>
                      📈 Avg Order Value
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Status Breakdown */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    <Box sx={{ color: '#1976d2', fontWeight: 'bold', fontSize: '1.25rem', mb: 2 }}>
                      📊 Order Status Breakdown
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ fontSize: '1rem' }}>Pending</Box>
                        <Chip 
                          label={orders.filter(order => order.status === 'Pending').length}
                          color="warning"
                          variant="filled"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ fontSize: '1rem' }}>In Progress</Box>
                        <Chip 
                          label={orders.filter(order => order.status === 'In Progress').length}
                          color="info"
                          variant="filled"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ fontSize: '1rem' }}>Completed</Box>
                        <Chip 
                          label={orders.filter(order => order.status === 'Completed').length}
                          color="success"
                          variant="filled"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ fontSize: '1rem' }}>Cancelled</Box>
                        <Chip 
                          label={orders.filter(order => order.status === 'Cancelled').length}
                          color="error"
                          variant="filled"
                        />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    <Box sx={{ color: '#1976d2', fontWeight: 'bold', fontSize: '1.25rem', mb: 2 }}>
                      💳 Payment Method Distribution
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ fontSize: '1rem' }}>Cash</Box>
                        <Chip 
                          label={orders.filter(order => order.paymentMethod === 'Cash').length}
                          color="primary"
                          variant="filled"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ fontSize: '1rem' }}>Card</Box>
                        <Chip 
                          label={orders.filter(order => order.paymentMethod === 'Card').length}
                          color="secondary"
                          variant="filled"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ fontSize: '1rem' }}>Balance</Box>
                        <Chip 
                          label={orders.filter(order => order.paymentMethod === 'Balance').length}
                          color="success"
                          variant="filled"
                        />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Driver Performance */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    <Box sx={{ color: '#1976d2', fontWeight: 'bold', fontSize: '1.25rem', mb: 2 }}>
                      🚗 Driver Performance Analytics
                    </Box>
                    
                    {/* Status Indicator */}
                    <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        📊 <strong>Status:</strong> {(() => {
                          const deliveredOrders = orders.filter(order => order.status === 'Delivered').length;
                          const pendingOrders = orders.filter(order => order.status === 'Pending').length;
                          if (deliveredOrders === 0) {
                            return `No deliveries completed yet. ${pendingOrders} orders pending.`;
                          } else if (pendingOrders === 0) {
                            return `All orders delivered! ${deliveredOrders} orders completed.`;
                          } else {
                            return `${deliveredOrders} orders delivered, ${pendingOrders} orders pending.`;
                          }
                        })()}
                    </Typography>
                    </Box>
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                          🚗 Driver Performance Metrics
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                          <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                            {(() => {
                              const deliveredOrders = orders.filter(order => order.status === 'Delivered');
                              const totalDistance = deliveredOrders.reduce((sum, order) => {
                                return sum + getRealDistance(order.customerPostcode);
                              }, 0);
                              const distanceInMiles = totalDistance * 0.621371; // Convert km to miles
                              return distanceInMiles.toFixed(1);
                            })()} miles
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📏 Total Distance
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                          <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                            {(() => {
                              const deliveredOrders = orders.filter(order => order.status === 'Delivered').length;
                              const totalTime = deliveredOrders * 25; // Average 25 minutes per delivery
                              const hours = Math.floor(totalTime / 60);
                              const minutes = totalTime % 60;
                              return deliveredOrders > 0 ? `${hours}h ${minutes}m` : '0h 0m';
                            })()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ⏱️ Actual Delivery Time
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                          <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                            {(() => {
                              const deliveredOrders = orders.filter(order => order.status === 'Delivered');
                              const actualDistanceKm = deliveredOrders.reduce((sum, order) => {
                                return sum + getRealDistance(order.customerPostcode);
                              }, 0);
                              const actualDistanceMiles = actualDistanceKm * 0.621371; // Convert km to miles
                              const fuelConsumption = actualDistanceMiles * 0.2; // 0.2L per mile (average of 0.17-0.22)
                              return fuelConsumption.toFixed(1);
                            })()} L
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ⛽ Actual Fuel Used
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                          <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                            {(() => {
                              const deliveredOrders = orders.filter(order => order.status === 'Delivered');
                              const totalTime = deliveredOrders.reduce((sum, order) => {
                                const distance = getRealDistance(order.customerPostcode);
                                const timePerKm = 2; // 2 minutes per km average
                                return sum + (distance * timePerKm);
                              }, 0);
                              const avgTime = deliveredOrders.length > 0 ? totalTime / deliveredOrders.length : 0;
                              return deliveredOrders.length > 0 ? `${Math.round(avgTime)}m` : 'N/A';
                            })()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            🎯 Avg Delivery Time
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    {/* Predictions for Pending Orders */}
                    {(() => {
                      const pendingOrders = orders.filter(order => order.status === 'Pending').length;
                      if (pendingOrders > 0) {
                        return (
                          <Box sx={{ mt: 3, p: 3, backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ color: '#856404', fontWeight: 'bold' }}>
                              🔮 Predictions for Pending Orders ({pendingOrders} orders)
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                  📏 Estimated Distance: <strong>{(() => {
                                    const pendingOrdersList = orders.filter(order => order.status === 'Pending');
                                    const totalDistanceKm = pendingOrdersList.reduce((sum, order) => {
                                      return sum + getRealDistance(order.customerPostcode);
                                    }, 0);
                                    return (totalDistanceKm * 0.621371).toFixed(1);
                                  })()} miles</strong>
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                  ⏱️ Estimated Time: <strong>{(() => {
                                    const pendingOrdersList = orders.filter(order => order.status === 'Pending');
                                    const totalTimeMinutes = pendingOrdersList.reduce((sum, order) => {
                                      const distance = getRealDistance(order.customerPostcode);
                                      const timePerKm = 2; // 2 minutes per km average
                                      return sum + (distance * timePerKm);
                                    }, 0);
                                    const hours = Math.floor(totalTimeMinutes / 60);
                                    const minutes = totalTimeMinutes % 60;
                                    return `${hours}h ${minutes}m`;
                                  })()}</strong>
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                  ⛽ Estimated Fuel: <strong>{(() => {
                                    const pendingOrdersList = orders.filter(order => order.status === 'Pending');
                                    const totalDistanceKm = pendingOrdersList.reduce((sum, order) => {
                                      return sum + getRealDistance(order.customerPostcode);
                                    }, 0);
                                    const totalDistanceMiles = totalDistanceKm * 0.621371;
                                    return (totalDistanceMiles * 0.2).toFixed(1);
                                  })()} L</strong>
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                  💰 Potential Revenue: <strong>£{orders.filter(order => order.status === 'Pending').reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0).toFixed(2)}</strong>
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        );
                      }
                      return null;
                    })()}
                  </Paper>
                </Grid>
              </Grid>

              {/* Recent Activity */}
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                      📋 Recent Orders
                    </Typography>
                    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {orders.slice(-5).reverse().map((order, index) => (
                        <Box key={order.id} sx={{ 
                          p: 2, 
                          mb: 1, 
                          border: '1px solid #e0e0e0', 
                          borderRadius: 2,
                          backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              #{order.basketNo} - {order.customerName}
                            </Typography>
                            <Chip 
                              label={order.status} 
                              size="small"
                              color={
                                order.status === 'Delivered' ? 'success' : 
                                order.status === 'In Process' ? 'info' : 
                                'warning'
                              }
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            £{order.totalAmount} • {order.customerPostcode}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                      🏆 Top Customers
                    </Typography>
                    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {(() => {
                        const customerStats = {};
                        orders.forEach(order => {
                          if (!customerStats[order.customerName]) {
                            customerStats[order.customerName] = { count: 0, total: 0 };
                          }
                          customerStats[order.customerName].count++;
                          customerStats[order.customerName].total += parseFloat(order.totalAmount || 0);
                        });
                        
                        const topCustomers = Object.entries(customerStats)
                          .sort(([,a], [,b]) => b.total - a.total)
                          .slice(0, 5);
                        
                        return topCustomers.map(([name, stats], index) => (
                          <Box key={name} sx={{ 
                            p: 2, 
                            mb: 1, 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 2,
                            backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                          }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {name}
                              </Typography>
                              <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                                £{stats.total.toFixed(2)}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {stats.count} orders
                            </Typography>
                          </Box>
                        ));
                      })()}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
            </>
          )}
        </Paper>
      </Box>

      {/* Order Dialog */}
      <Dialog open={orderDialogOpen} onClose={handleOrderDialogClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)', 
          color: 'white',
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>
          {editingOrder ? 'Edit Order' : 'Add New Order'}
        </DialogTitle>
        <DialogContent sx={{ p: 3, background: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Basic Information Card */}
            <Card sx={{ 
              background: 'white', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              borderRadius: 2
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ 
                  mb: 2, 
                  color: '#667eea', 
                  fontWeight: 'bold',
                  borderBottom: '2px solid #667eea',
                  pb: 1
                }}>
                  📋 Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Basket No"
                  value={orderForm.basketNo}
                      InputProps={{ 
                        readOnly: true,
                        sx: { backgroundColor: '#f8f9fa' }
                      }}
                      sx={{ mb: 2 }}
                />
              </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  fullWidth
                  options={customers}
                  getOptionLabel={(option) => option.shopName}
                  value={customers.find(c => c.shopName === orderForm.shopName) || null}
                  onChange={(event, newValue) => {
                    console.log('🔍 Selected customer:', newValue);
                    if (newValue) {
                      setOrderForm({
                        ...orderForm,
                        shopName: newValue.shopName,
                        customerName: newValue.name || '',
                        customerPhone: newValue.phone,
                        customerAddress: newValue.address,
                        customerPostcode: newValue.postcode
                      });
                    } else {
                      setOrderForm({
                        ...orderForm,
                        shopName: '',
                        customerName: '',
                        customerPhone: '',
                        customerAddress: '',
                        customerPostcode: ''
                      });
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={`🏪 Shop Name (${customers.length} available)`}
                      required
                      sx={{ mb: 2 }}
                    />
                  )}
                  noOptionsText="No shops found"
                  loading={customers.length === 0}
                />
              </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Customer Information Card */}
            <Card sx={{ 
              background: 'white', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              borderRadius: 2
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ 
                  mb: 2, 
                  color: '#667eea', 
                  fontWeight: 'bold',
                  borderBottom: '2px solid #667eea',
                  pb: 1
                }}>
                  👤 Customer Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                      label="👤 Customer Name"
                      value={orderForm.customerName}
                      onChange={(e) => setOrderForm({...orderForm, customerName: e.target.value})}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="📞 Customer Phone *"
                  value={orderForm.customerPhone}
                  onChange={(e) => setOrderForm({...orderForm, customerPhone: e.target.value})}
                  required
                      sx={{ mb: 2 }}
                />
              </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                      label="📍 Customer Address *"
                  value={orderForm.customerAddress}
                  onChange={(e) => setOrderForm({...orderForm, customerAddress: e.target.value})}
                  required
                      sx={{ mb: 2 }}
                />
              </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                      label="📮 Customer Postcode *"
                  value={orderForm.customerPostcode}
                  onChange={(e) => setOrderForm({...orderForm, customerPostcode: e.target.value})}
                  required
                      sx={{ mb: 2 }}
                />
              </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Order Details Card */}
            <Card sx={{ 
              background: 'white', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              borderRadius: 2
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ 
                  mb: 2, 
                  color: '#667eea', 
                  fontWeight: 'bold',
                  borderBottom: '2px solid #667eea',
                  pb: 1
                }}>
                  💰 Order Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                      label="💵 Total Amount *"
                  type="number"
                  value={orderForm.totalAmount}
                  onChange={(e) => setOrderForm({...orderForm, totalAmount: e.target.value})}
                  required
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>£</Typography>
                      }}
                      sx={{ mb: 2 }}
                />
              </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>💳 Payment Method (Optional - Driver will set)</InputLabel>
                      <Select
                        value={orderForm.paymentMethod || ''}
                        onChange={(e) => setOrderForm({...orderForm, paymentMethod: e.target.value})}
                        label="💳 Payment Method (Optional - Driver will set)"
                      >
                        <MenuItem value="">Not Set (Driver will choose)</MenuItem>
                        <MenuItem value="Cash">💵 Cash</MenuItem>
                        <MenuItem value="Card">💳 Card</MenuItem>
                        <MenuItem value="Bank Transfer">🏦 Bank Transfer</MenuItem>
                        <MenuItem value="Balance">💰 Balance</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                      <InputLabel>📊 Status</InputLabel>
                  <Select
                    value={orderForm.status}
                    onChange={(e) => setOrderForm({...orderForm, status: e.target.value})}
                        label="📊 Status"
                      >
                        <MenuItem value="Pending">⏳ Pending</MenuItem>
                        <MenuItem value="In Process">🔄 In Process</MenuItem>
                        <MenuItem value="Delivered">✅ Delivered</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
              </CardContent>
            </Card>

          </Box>
          </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          background: '#f8f9fa',
          borderTop: '1px solid #e0e0e0'
        }}>
          <Button 
            onClick={handleOrderDialogClose}
            sx={{ 
              color: '#666',
              '&:hover': { backgroundColor: '#f0f0f0' }
            }}
          >
            ❌ Cancel
          </Button>
          <Button 
            onClick={handleOrderSubmit} 
            variant="contained"
            sx={{ 
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)'
              }
            }}
          >
            {editingOrder ? '🔄 Update' : '➕ Add'} Order
            </Button>
          </DialogActions>
        </Dialog>

        {/* Customer Dialog */}
        <Dialog open={customerDialogOpen} onClose={handleCustomerDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                label="Shop Name"
                value={customerForm.shopName}
                onChange={(e) => setCustomerForm({...customerForm, shopName: e.target.value})}
                  required
                />
              </Grid>
            <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                label="Name"
                value={customerForm.name}
                onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                />
              </Grid>
            <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                  required
                />
              </Grid>
            <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Address"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})}
                  required
                />
              </Grid>
            <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Postcode"
                  value={customerForm.postcode}
                  onChange={(e) => setCustomerForm({...customerForm, postcode: e.target.value})}
                  required
                />
              </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="City"
                value={customerForm.city}
                onChange={(e) => setCustomerForm({...customerForm, city: e.target.value})}
                required
              />
            </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCustomerDialogClose}>Cancel</Button>
            <Button onClick={handleCustomerSubmit} variant="contained">
              {editingCustomer ? 'Update' : 'Add'} Customer
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({...notification, open: false})}
        >
          <Alert 
            onClose={() => setNotification({...notification, open: false})} 
            severity={notification.severity}
          >
            {notification.message}
          </Alert>
        </Snackbar>

      {/* Payment Method Details Popover */}
      <Popover
        open={paymentPopover.open}
        anchorEl={paymentPopover.anchorEl}
        onClose={() => setPaymentPopover({ open: false, anchorEl: null, paymentMethod: null })}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        disableRestoreFocus
        disableAutoFocus
        disableEnforceFocus
        sx={{
          '& .MuiPopover-paper': {
            maxWidth: 400,
            maxHeight: 500,
            overflow: 'auto'
          }
        }}
      >
        {paymentPopover.paymentMethod && paymentPopover.orders && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 2, fontWeight: 600, color: '#2c3e50', fontSize: '1.25rem' }}>
              💳 {paymentPopover.paymentMethod} - {paymentPopover.orders.length} Orders
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List dense>
              {paymentPopover.orders.map((order, index) => (
                <ListItem key={order.id} sx={{ px: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ width: '100%', mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {order.shopName}
                      </Box>
                      <Chip 
                        label={order.status} 
                        size="small"
                        color={
                          order.status === 'Delivered' ? 'success' : 
                          order.status === 'In Process' ? 'info' : 
                          'warning'
                        }
                      />
                    </Box>
                    <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: 0.5 }}>
                      {order.customerName || 'No customer name'}
                    </Box>
                    <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: 0.5 }}>
                      {order.customerPhone}
                    </Box>
                    <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: 0.5 }}>
                      {order.customerAddress}, {order.customerPostcode}
                    </Box>
                    <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'success.main' }}>
                      £{order.totalAmount}
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ mt: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Total Revenue:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                £{paymentPopover.orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0).toFixed(2)}
              </Typography>
            </Box>
          </Box>
        )}
      </Popover>
      </Container>
      ) : (
        // Login Page - Not Logged In
        <AdminLoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
