import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  Store as StoreIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const WeeklySalesChart = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [chartType, setChartType] = useState('revenue');
  const [loading, setLoading] = useState(true);

  const getApiUrl = () => {
    const hostname = window.location.hostname;
    const port = window.location.port;
    return `http://${hostname}:${port || 3000}`.replace('3000', '5000');
  };

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      // Simulated weekly data - in real app, this would come from API
      const mockWeeklyData = [
        {
          week: '2025-W30',
          startDate: '2025-07-21',
          endDate: '2025-07-27',
          totalRevenue: 2450.50,
          totalOrders: 23,
          averageOrderValue: 106.54,
          topShop: 'Portchester Hair Salon And Barbers',
          dailyBreakdown: {
            'Monday': 320.50,
            'Tuesday': 280.75,
            'Wednesday': 350.25,
            'Thursday': 420.00,
            'Friday': 380.75,
            'Saturday': 450.25,
            'Sunday': 248.00
          },
          paymentBreakdown: {
            'Cash': 980.25,
            'Card': 420.50,
            'Bank Transfer': 350.75,
            'Balance': 699.00
          }
        },
        {
          week: '2025-W31',
          startDate: '2025-07-28',
          endDate: '2025-08-03',
          totalRevenue: 2680.75,
          totalOrders: 25,
          averageOrderValue: 107.23,
          topShop: 'Ramze The Barber',
          dailyBreakdown: {
            'Monday': 350.25,
            'Tuesday': 320.50,
            'Wednesday': 380.75,
            'Thursday': 450.00,
            'Friday': 420.25,
            'Saturday': 480.50,
            'Sunday': 279.50
          },
          paymentBreakdown: {
            'Cash': 1072.30,
            'Card': 536.15,
            'Bank Transfer': 268.08,
            'Balance': 804.22
          }
        }
      ];
      
      setWeeklyData(mockWeeklyData);
      setSelectedWeek(mockWeeklyData[0]?.week || '');
    } catch (error) {
      console.error('Error fetching weekly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    const selectedWeekData = weeklyData.find(week => week.week === selectedWeek);
    if (!selectedWeekData) return null;
    
    switch (chartType) {
      case 'revenue':
        return {
          labels: Object.keys(selectedWeekData.dailyBreakdown),
          datasets: [
            {
              label: 'Daily Revenue (£)',
              data: Object.values(selectedWeekData.dailyBreakdown),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              tension: 0.1
            }
          ]
        };
      
      case 'payment':
        return {
          labels: Object.keys(selectedWeekData.paymentBreakdown),
          datasets: [
            {
              label: 'Payment Methods',
              data: Object.values(selectedWeekData.paymentBreakdown),
              backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)'
              ],
              borderWidth: 1
            }
          ]
        };
      
      default:
        return null;
    }
  };

  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: chartType === 'revenue' ? 'Weekly Daily Revenue' : 'Weekly Payment Methods'
        }
      }
    };

    if (chartType === 'revenue') {
      return {
        ...baseOptions,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '£' + value;
              }
            }
          }
        }
      };
    }

    return baseOptions;
  };

  const getSelectedWeekData = () => {
    return weeklyData.find(week => week.week === selectedWeek);
  };

  const selectedWeekData = getSelectedWeekData();

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Loading weekly sales data...</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
            📅 Weekly Sales Analytics
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Week</InputLabel>
              <Select
                value={selectedWeek}
                label="Week"
                onChange={(e) => setSelectedWeek(e.target.value)}
              >
                {weeklyData.map((week) => (
                  <MenuItem key={week.week} value={week.week}>
                    {week.startDate} - {week.endDate}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={(e, newType) => newType && setChartType(newType)}
              size="small"
            >
              <ToggleButton value="revenue">
                <TrendingUpIcon sx={{ mr: 1 }} />
                Revenue
              </ToggleButton>
              <ToggleButton value="payment">
                <MoneyIcon sx={{ mr: 1 }} />
                Payments
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {selectedWeekData && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ 
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MoneyIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Weekly Revenue</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    £{selectedWeekData.totalRevenue?.toFixed(2)}
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
                    <CartIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Weekly Orders</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {selectedWeekData.totalOrders}
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
                    <TrendingUpIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Avg Order</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    £{selectedWeekData.averageOrderValue?.toFixed(2)}
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
                    <StoreIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Top Shop</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {selectedWeekData.topShop}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <Divider sx={{ my: 2 }} />

        {getChartData() && (
          <Box sx={{ height: 400 }}>
            {chartType === 'revenue' ? (
              <Line data={getChartData()} options={getChartOptions()} />
            ) : (
              <Doughnut data={getChartData()} options={getChartOptions()} />
            )}
          </Box>
        )}

        {selectedWeekData && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              📊 Week Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper sx={{ p: 2, background: 'rgba(103, 126, 234, 0.1)' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    📈 Best Day: {Object.entries(selectedWeekData.dailyBreakdown)
                      .reduce((a, b) => a[1] > b[1] ? a : b)[0]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    £{Math.max(...Object.values(selectedWeekData.dailyBreakdown)).toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper sx={{ p: 2, background: 'rgba(118, 75, 162, 0.1)' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    💰 Top Payment: {Object.entries(selectedWeekData.paymentBreakdown)
                      .reduce((a, b) => a[1] > b[1] ? a : b)[0]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    £{Math.max(...Object.values(selectedWeekData.paymentBreakdown)).toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default WeeklySalesChart; 