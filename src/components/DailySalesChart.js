import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  AttachMoney,
  Store,
  Schedule,
  Payment,
  Assessment,
  Analytics,
  Today,
  Home
} from '@mui/icons-material';

const ComprehensiveAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      console.log('📊 Fetching comprehensive analytics...');
      
      // Use the new comprehensive analytics API
      const getApiUrl = () => {
              // For local development
      const isIPhone = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isIPhone && !isLocalhost) {
        // iPhone accessing via IP address
        const currentHost = window.location.hostname;
        return `http://${currentHost}:5000`;
      } else {
              return process.env.NODE_ENV === 'production' 
        ? 'https://api.magicroute.co.uk' // Yeni API subdomain
        : 'http://localhost:5001';
      }
      };
      
      const response = await fetch(`${getApiUrl()}/api/analytics`);
      const data = await response.json();

      console.log('📊 Comprehensive analytics received:', data);
      setAnalyticsData(data);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching analytics data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!analyticsData) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Analytics data not available
        </Typography>
      </Paper>
    );
  }

  // Extract data from new API structure
  const {
    totalOrders = 0,
    totalRevenue = 0,
    averageOrderValue = 0,
    deliveredOrders = 0,
    pendingOrders = 0,
    todaysOrders = 0,
    topShops = [],
    dailySales = [],
    weeklySales = []
  } = analyticsData;

  // Get today's data
  const today = new Date().toISOString().split('T')[0];
  const todayData = dailySales.find(sale => sale.date === today) || {};
  const todaysRevenue = todayData.totalRevenue || 0;

  // Get latest weekly data
  const latestWeekly = weeklySales[weeklySales.length - 1] || {};

  // Calculate payment percentages from weekly data
  const paymentBreakdown = latestWeekly.paymentBreakdown || {};
  const balanceAmount = paymentBreakdown.Balance || 0;
  const cashAmount = paymentBreakdown.Cash || 0;
  const balancePercentage = totalRevenue > 0 ? ((balanceAmount / totalRevenue) * 100).toFixed(1) : 0;
  const cashPercentage = totalRevenue > 0 ? ((cashAmount / totalRevenue) * 100).toFixed(1) : 0;

  // Get top shop info
  const topShop = topShops.length > 0 ? topShops[0].shop : 'N/A';
  const topShopRevenue = topShops.length > 0 ? topShops[0].revenue : 0;
  const topShopOrders = topShops.length > 0 ? topShops[0].count : 0;

  return (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Analytics sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" component="h2">
            Comprehensive Analytics Dashboard
          </Typography>
        </Box>

        {/* Key Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Card sx={{ 
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              height: '140px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ 
                    mr: 1,
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}>
                    £
                  </Box>
                  <Typography variant="h6">Total Revenue</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  £{totalRevenue.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 'auto' }}>
                  {totalOrders} orders delivered
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Card sx={{ 
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              height: '140px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ 
                    mr: 1,
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}>
                    £
                  </Box>
                  <Typography variant="h6">💰 Today's Revenue</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  £{todaysRevenue.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 'auto' }}>
                  Revenue for {today}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Card sx={{ 
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              height: '140px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ShoppingCart sx={{ mr: 1 }} />
                  <Typography variant="h6">🛒 Total Orders</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {totalOrders}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 'auto' }}>
                  {deliveredOrders} delivered, {pendingOrders} pending
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Card sx={{ 
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              height: '140px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Today sx={{ mr: 1 }} />
                  <Typography variant="h6">📅 Today's Orders</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {todaysOrders}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 'auto' }}>
                  Orders for {today}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Card sx={{ 
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              height: '140px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp sx={{ mr: 1 }} />
                  <Typography variant="h6">📈 Avg Order Value</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  £{averageOrderValue.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 'auto' }}>
                  Per order average
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Card sx={{ 
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              height: '140px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Home sx={{ mr: 1 }} />
                  <Typography variant="h6">🏠 Top Shop</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {topShop}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 'auto' }}>
                  £{topShopRevenue.toFixed(2)} revenue ({topShopOrders} orders)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Comprehensive Analytics Table */}
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Metric</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Daily</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Weekly</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Prediction (Tomorrow)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Revenue Row */}
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      mr: 1, 
                      color: 'primary.main',
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                    }}>
                      £
                    </Box>
                    Revenue
                  </Box>
                </TableCell>
                <TableCell>£{todaysRevenue.toFixed(2)}</TableCell>
                <TableCell>£{totalRevenue.toFixed(2)}</TableCell>
                <TableCell>£{(latestWeekly.totalRevenue || 0).toFixed(2)}</TableCell>
                <TableCell>
                  <Chip 
                    label="Excellent" 
                    color="success" 
                    size="small"
                  />
                </TableCell>
              </TableRow>

              {/* Orders Row */}
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ShoppingCart sx={{ mr: 1, color: 'primary.main' }} />
                    🛒 Orders
                  </Box>
                </TableCell>
                <TableCell>{todaysOrders}</TableCell>
                <TableCell>{totalOrders}</TableCell>
                <TableCell>{latestWeekly.totalOrders || 0}</TableCell>
                <TableCell>
                  <Chip 
                    label="On Track" 
                    color="primary" 
                    size="small"
                  />
                </TableCell>
              </TableRow>

              {/* Average Order Value Row */}
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                    📈 Avg Order Value
                  </Box>
                </TableCell>
                <TableCell>£{(todaysRevenue / todaysOrders || 0).toFixed(2)}</TableCell>
                <TableCell>£{averageOrderValue.toFixed(2)}</TableCell>
                <TableCell>£{(latestWeekly.averageOrderValue || 0).toFixed(2)}</TableCell>
                <TableCell>
                  <Chip 
                    label="Good" 
                    color="warning" 
                    size="small"
                  />
                </TableCell>
              </TableRow>

              {/* Payment Methods Row */}
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Payment sx={{ mr: 1, color: 'primary.main' }} />
                    💳 Payment Methods
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">Balance: £{balanceAmount.toFixed(2)} ({balancePercentage}%)</Typography>
                    <Typography variant="body2">Cash: £{cashAmount.toFixed(2)} ({cashPercentage}%)</Typography>
                    <Typography variant="body2">Card: £{(paymentBreakdown.Card || 0).toFixed(2)}</Typography>
                    <Typography variant="body2">Bank Transfer: £{(paymentBreakdown.Bank || 0).toFixed(2)}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">Balance: £{balanceAmount.toFixed(2)}</Typography>
                    <Typography variant="body2">Cash: £{cashAmount.toFixed(2)}</Typography>
                    <Typography variant="body2">Card: £{(paymentBreakdown.Card || 0).toFixed(2)}</Typography>
                    <Typography variant="body2">Bank Transfer: £{(paymentBreakdown.Bank || 0).toFixed(2)}</Typography>
                  </Box>
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  <Chip 
                    label="Balanced" 
                    color="info" 
                    size="small"
                  />
                </TableCell>
              </TableRow>

              {/* Confidence Level Row */}
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Assessment sx={{ mr: 1, color: 'primary.main' }} />
                    📊 Prediction Confidence
                  </Box>
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>85%</TableCell>
                <TableCell>
                  <Chip 
                    label="High" 
                    color="success" 
                    size="small"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Payment Methods Breakdown - Moved to main analytics cards */}
        {/* <Box sx={{ mt: 3 }}>
          <Paper sx={{ 
            p: 2, 
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 1.5
          }}>
            <Box sx={{ mb: 2, fontWeight: 600, fontSize: '1.1rem' }}>
              💳 Payment Methods Breakdown
            </Box>
            <Grid container spacing={1}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper sx={{ 
                  p: 1.5, 
                  background: 'rgba(255,255,255,0.9)', 
                  borderRadius: 1,
                  textAlign: 'center'
                }}>
                  <Box sx={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '1rem' }}>
                    Balance
                  </Box>
                  <Box sx={{ color: '#7f8c8d', fontSize: '0.8rem' }}>
                    £{balanceAmount.toFixed(2)}
                  </Box>
                  <Box sx={{ color: '#7f8c8d', fontSize: '0.7rem' }}>
                    {balancePercentage}%
                  </Box>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper sx={{ 
                  p: 1.5, 
                  background: 'rgba(255,255,255,0.9)', 
                  borderRadius: 1,
                  textAlign: 'center'
                }}>
                  <Box sx={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '1rem' }}>
                    Cash
                  </Box>
                  <Box sx={{ color: '#7f8c8d', fontSize: '0.8rem' }}>
                    £{cashAmount.toFixed(2)}
                  </Box>
                  <Box sx={{ color: '#7f8c8d', fontSize: '0.7rem' }}>
                    {cashPercentage}%
                  </Box>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper sx={{ 
                  p: 1.5, 
                  background: 'rgba(255,255,255,0.9)', 
                  borderRadius: 1,
                  textAlign: 'center'
                }}>
                  <Box sx={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '1rem' }}>
                    Card
                  </Box>
                  <Box sx={{ color: '#7f8c8d', fontSize: '0.8rem' }}>
                    £0.00
                  </Box>
                  <Box sx={{ color: '#7f8c8d', fontSize: '0.7rem' }}>
                    0%
                  </Box>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper sx={{ 
                  p: 1.5, 
                  background: 'rgba(255,255,255,0.9)', 
                  borderRadius: 1,
                  textAlign: 'center'
                }}>
                  <Box sx={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '1rem' }}>
                    Bank Transfer
                  </Box>
                  <Box sx={{ color: '#7f8c8d', fontSize: '0.8rem' }}>
                    £0.00
                  </Box>
                  <Box sx={{ color: '#7f8c8d', fontSize: '0.7rem' }}>
                    0%
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Box> */}

        {/* Summary Section - Deactivated for now */}
        {/* <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            📊 Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Today's Performance:</strong> Excellent day with {daily.totalOrders || 0} orders delivered, 
                generating £{totalRevenue.toFixed(2)} in revenue. 
                {daily.topShop && ` ${daily.topShop} was the top performer with £${daily.topShopRevenue || 0}.`}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Payment Distribution:</strong> Balance payments dominate at {balancePercentage}% 
                (£{balanceAmount.toFixed(2)}) while Cash represents {cashPercentage}% (£{cashAmount.toFixed(2)}).
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2">
                <strong>Tomorrow's Prediction:</strong> Expected {predictions.predictedOrders || 0} orders 
                with £{(predictions.predictedRevenue || 0).toFixed(2)} revenue 
                ({(predictions.confidence || 0) * 100}% confidence).
              </Typography>
            </Grid>
          </Grid>
        </Box> */}
      </Paper>
    </Box>
  );
};

export default ComprehensiveAnalytics; 