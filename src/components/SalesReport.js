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
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
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
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  Store as StoreIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon
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

const SalesReport = () => {
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState('comprehensive');
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('');

  const getApiUrl = () => {
    const hostname = window.location.hostname;
    const port = window.location.port;
    return `http://${hostname}:${port || 3000}`.replace('3000', '5000');
  };

  useEffect(() => {
    generateReport();
  }, [reportType, timeRange]);

  const generateReport = async () => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock report data
      const mockData = generateMockReport();
      setReportData(mockData);
      
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockReport = () => {
    const baseRevenue = 5000;
    const baseOrders = 50;
    
    return {
      summary: {
        totalRevenue: baseRevenue + Math.random() * 2000,
        totalOrders: baseOrders + Math.floor(Math.random() * 20),
        averageOrderValue: (baseRevenue / baseOrders) * (0.8 + Math.random() * 0.4),
        growthRate: (Math.random() - 0.5) * 20,
        topPerformingShop: 'Ramze The Barber',
        mostPopularPayment: 'Cash'
      },
      trends: {
        revenue: [1200, 1350, 1100, 1400, 1600, 1800, 1700, 1900, 2100, 2000, 2200, 2400],
        orders: [12, 14, 11, 15, 16, 18, 17, 19, 21, 20, 22, 24],
        average: [100, 96, 100, 93, 100, 100, 100, 100, 100, 100, 100, 100]
      },
      breakdown: {
        shops: {
          'Ramze The Barber': 2400,
          'Portchester Hair Salon And Barbers': 1800,
          'UK King Barbering': 1200,
          'London Barber Shop': 900,
          'Other Shops': 600
        },
        payments: {
          'Cash': 3500,
          'Card': 1200,
          'Bank Transfer': 800,
          'Balance': 1500
        },
        timeSlots: {
          'Morning (9-12)': 1800,
          'Afternoon (12-15)': 2200,
          'Evening (15-18)': 1600,
          'Night (18-21)': 1200
        }
      },
      insights: [
        {
          type: 'positive',
          title: 'Revenue Growth',
          description: '15% increase compared to last period',
          value: '+15%'
        },
        {
          type: 'info',
          title: 'Best Performing Shop',
          description: 'Ramze The Barber leads with £2,400',
          value: '£2,400'
        },
        {
          type: 'warning',
          title: 'Payment Distribution',
          description: 'Cash payments dominate at 58%',
          value: '58%'
        },
        {
          type: 'success',
          title: 'Order Efficiency',
          description: 'Average order value increased by 8%',
          value: '+8%'
        }
      ]
    };
  };

  const getChartData = (type) => {
    if (!reportData) return null;
    
    switch (type) {
      case 'trends':
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Revenue (£)',
              data: reportData.trends.revenue,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              tension: 0.1
            },
            {
              label: 'Orders',
              data: reportData.trends.orders,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              tension: 0.1,
              yAxisID: 'y1'
            }
          ]
        };
      
      case 'shops':
        return {
          labels: Object.keys(reportData.breakdown.shops),
          datasets: [{
            label: 'Revenue by Shop',
            data: Object.values(reportData.breakdown.shops),
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)'
            ],
            borderWidth: 1
          }]
        };
      
      case 'payments':
        return {
          labels: Object.keys(reportData.breakdown.payments),
          datasets: [{
            label: 'Payment Methods',
            data: Object.values(reportData.breakdown.payments),
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)'
            ],
            borderWidth: 1
          }]
        };
      
      default:
        return null;
    }
  };

  const getChartOptions = (type) => {
    const baseOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: type === 'trends' ? 'Revenue & Orders Trend' : 
                type === 'shops' ? 'Revenue by Shop' : 'Payment Methods'
        }
      }
    };

    if (type === 'trends') {
      return {
        ...baseOptions,
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: {
              callback: function(value) {
                return '£' + value;
              }
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
          }
        }
      };
    }

    return baseOptions;
  };

  const handleExportReport = () => {
    // Simulate report export
    const reportContent = `Sales Report - ${new Date().toLocaleDateString()}\n\n` +
      `Total Revenue: £${reportData?.summary.totalRevenue.toFixed(2)}\n` +
      `Total Orders: ${reportData?.summary.totalOrders}\n` +
      `Average Order Value: £${reportData?.summary.averageOrderValue.toFixed(2)}\n`;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <AssessmentIcon sx={{ fontSize: 40, color: '#3f51b5', mb: 1 }} />
        <Typography variant="h6">Generating Comprehensive Report...</Typography>
        <Typography variant="body2" color="text.secondary">
          Analyzing data and creating insights
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
            📊 Comprehensive Sales Report
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="quarter">This Quarter</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
              </Select>
            </FormControl>
            <ToggleButtonGroup
              value={reportType}
              exclusive
              onChange={(e, newType) => newType && setReportType(newType)}
              size="small"
            >
              <ToggleButton value="comprehensive">
                <AssessmentIcon sx={{ mr: 1 }} />
                Comprehensive
              </ToggleButton>
              <ToggleButton value="trends">
                <ShowChartIcon sx={{ mr: 1 }} />
                Trends
              </ToggleButton>
              <ToggleButton value="breakdown">
                <PieChartIcon sx={{ mr: 1 }} />
                Breakdown
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {reportData && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ 
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MoneyIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Total Revenue</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    £{reportData.summary.totalRevenue.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {reportData.summary.growthRate > 0 ? '+' : ''}{reportData.summary.growthRate.toFixed(1)}% vs last period
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
                    <Typography variant="h6">Total Orders</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {reportData.summary.totalOrders}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {reportData.summary.averageOrderValue.toFixed(0)} avg per order
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
                    <Typography variant="h6">Avg Order Value</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    £{reportData.summary.averageOrderValue.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Top shop: {reportData.summary.topPerformingShop}
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
                    <Typography variant="h6">Top Payment</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {reportData.summary.mostPopularPayment}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Most preferred method
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <Divider sx={{ my: 2 }} />

        {reportData && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 8 }}>
              {getChartData('trends') && (
                <Box sx={{ height: 400 }}>
                  <Line data={getChartData('trends')} options={getChartOptions('trends')} />
                </Box>
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {reportData.insights.map((insight, index) => (
                  <Paper key={index} sx={{ p: 2, background: 'rgba(103, 126, 234, 0.1)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {insight.title}
                      </Typography>
                      <Chip 
                        label={insight.value} 
                        color={insight.type === 'positive' ? 'success' : 
                               insight.type === 'warning' ? 'warning' : 
                               insight.type === 'success' ? 'success' : 'info'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {insight.description}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Grid>
          </Grid>
        )}

        {reportData && (
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              {getChartData('shops') && (
                <Box sx={{ height: 300 }}>
                  <Doughnut data={getChartData('shops')} options={getChartOptions('shops')} />
                </Box>
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {getChartData('payments') && (
                <Box sx={{ height: 300 }}>
                  <Doughnut data={getChartData('payments')} options={getChartOptions('payments')} />
                </Box>
              )}
            </Grid>
          </Grid>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            📈 Key Performance Indicators
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportReport}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrintReport}
            >
              Print
            </Button>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
            >
              Share
            </Button>
          </Box>
        </Box>

        {reportData && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Metric</TableCell>
                  <TableCell>Current</TableCell>
                  <TableCell>Previous</TableCell>
                  <TableCell>Change</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Total Revenue</TableCell>
                  <TableCell>£{reportData.summary.totalRevenue.toFixed(2)}</TableCell>
                  <TableCell>£{(reportData.summary.totalRevenue / (1 + reportData.summary.growthRate / 100)).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={`${reportData.summary.growthRate > 0 ? '+' : ''}${reportData.summary.growthRate.toFixed(1)}%`}
                      color={reportData.summary.growthRate > 0 ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={reportData.summary.growthRate > 0 ? 'Growing' : 'Declining'}
                      color={reportData.summary.growthRate > 0 ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total Orders</TableCell>
                  <TableCell>{reportData.summary.totalOrders}</TableCell>
                  <TableCell>{Math.floor(reportData.summary.totalOrders * 0.9)}</TableCell>
                  <TableCell>
                    <Chip 
                      label="+10%"
                      color="success"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label="Growing"
                      color="success"
                      size="small"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Average Order Value</TableCell>
                  <TableCell>£{reportData.summary.averageOrderValue.toFixed(2)}</TableCell>
                  <TableCell>£{(reportData.summary.averageOrderValue * 0.92).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label="+8%"
                      color="success"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label="Growing"
                      color="success"
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default SalesReport; 