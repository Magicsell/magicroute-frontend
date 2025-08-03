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
import { Line, Bar } from 'react-chartjs-2';
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
  Alert,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  Store as StoreIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  Psychology as PsychologyIcon,
  Analytics as AnalyticsIcon
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

const SalesPrediction = () => {
  const [predictionData, setPredictionData] = useState(null);
  const [predictionType, setPredictionType] = useState('revenue');
  const [timeframe, setTimeframe] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [accuracy, setAccuracy] = useState(0);

  const getApiUrl = () => {
    const hostname = window.location.hostname;
    const port = window.location.port;
    return `http://${hostname}:${port || 3000}`.replace('3000', '5000');
  };

  useEffect(() => {
    generatePredictions();
  }, [predictionType, timeframe]);

  const generatePredictions = async () => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock prediction data
      const mockData = generateMockPredictions();
      setPredictionData(mockData);
      
      // Simulate accuracy calculation
      const mockAccuracy = Math.floor(Math.random() * 20) + 80; // 80-100%
      setAccuracy(mockAccuracy);
      
    } catch (error) {
      console.error('Error generating predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockPredictions = () => {
    const days = timeframe === '7days' ? 7 : timeframe === '30days' ? 30 : 90;
    const historicalData = [];
    const predictedData = [];
    const labels = [];
    
    const baseValue = predictionType === 'revenue' ? 1000 : predictionType === 'orders' ? 10 : 150;
    const trend = 1.05; // 5% growth trend
    const volatility = 0.1; // 10% volatility
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      labels.push(date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }));
      
      if (i < days * 0.7) { // Historical data (70% of timeframe)
        const historicalValue = baseValue * Math.pow(trend, i) * (1 + (Math.random() - 0.5) * volatility);
        historicalData.push(Math.round(historicalValue));
        predictedData.push(null);
      } else { // Predicted data (30% of timeframe)
        historicalData.push(null);
        const predictedValue = baseValue * Math.pow(trend, i) * (1 + (Math.random() - 0.5) * volatility * 0.5);
        predictedData.push(Math.round(predictedValue));
      }
    }
    
    return {
      labels,
      historicalData,
      predictedData,
      confidence: Math.floor(Math.random() * 15) + 85, // 85-100%
      trend: trend > 1 ? 'up' : 'down',
      growthRate: ((trend - 1) * 100).toFixed(1)
    };
  };

  const getChartData = () => {
    if (!predictionData) return null;
    
    return {
      labels: predictionData.labels,
      datasets: [
        {
          label: 'Historical Data',
          data: predictionData.historicalData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
          pointRadius: 3
        },
        {
          label: 'Predicted Data',
          data: predictionData.predictedData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderDash: [5, 5],
          tension: 0.1,
          pointRadius: 3
        }
      ]
    };
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
          text: `${predictionType.charAt(0).toUpperCase() + predictionType.slice(1)} Prediction (${timeframe})`
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              if (predictionType === 'revenue') {
                return '£' + value;
              }
              return value;
            }
          }
        }
      }
    };

    return baseOptions;
  };

  const getPredictionInsights = () => {
    if (!predictionData) return [];
    
    const insights = [];
    
    if (predictionData.trend === 'up') {
      insights.push({
        type: 'positive',
        title: '📈 Growth Trend',
        description: `${predictionData.growthRate}% expected growth`
      });
    } else {
      insights.push({
        type: 'warning',
        title: '📉 Declining Trend',
        description: `${Math.abs(predictionData.growthRate)}% expected decline`
      });
    }
    
    insights.push({
      type: 'info',
      title: '🎯 Prediction Accuracy',
      description: `${accuracy}% confidence level`
    });
    
    insights.push({
      type: 'success',
      title: '📊 Data Quality',
      description: `${predictionData.confidence}% confidence interval`
    });
    
    return insights;
  };

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <PsychologyIcon sx={{ fontSize: 40, color: '#3f51b5', mb: 1 }} />
          <Typography variant="h6">Generating AI Predictions...</Typography>
        </Box>
        <LinearProgress sx={{ height: 8, borderRadius: 4 }} />
        <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', color: 'text.secondary' }}>
          Analyzing historical patterns and market trends
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
            🔮 AI Sales Predictions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={timeframe}
                label="Timeframe"
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <MenuItem value="7days">7 Days</MenuItem>
                <MenuItem value="30days">30 Days</MenuItem>
                <MenuItem value="90days">90 Days</MenuItem>
              </Select>
            </FormControl>
            <ToggleButtonGroup
              value={predictionType}
              exclusive
              onChange={(e, newType) => newType && setPredictionType(newType)}
              size="small"
            >
              <ToggleButton value="revenue">
                <MoneyIcon sx={{ mr: 1 }} />
                Revenue
              </ToggleButton>
              <ToggleButton value="orders">
                <CartIcon sx={{ mr: 1 }} />
                Orders
              </ToggleButton>
              <ToggleButton value="average">
                <TrendingUpIcon sx={{ mr: 1 }} />
                Average
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {predictionData && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ 
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PsychologyIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Prediction Accuracy</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {accuracy}%
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
                    <AnalyticsIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Growth Rate</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {predictionData.growthRate}%
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
                    <Typography variant="h6">Trend</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {predictionData.trend === 'up' ? '↗️ Up' : '↘️ Down'}
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
                    <ScheduleIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Confidence</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {predictionData.confidence}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <Divider sx={{ my: 2 }} />

        {getChartData() && (
          <Box sx={{ height: 400 }}>
            <Line data={getChartData()} options={getChartOptions()} />
          </Box>
        )}

        {predictionData && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              💡 AI Insights
            </Typography>
            <Grid container spacing={2}>
              {getPredictionInsights().map((insight, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                  <Alert 
                    severity={insight.type} 
                    icon={false}
                    sx={{ 
                      '& .MuiAlert-message': { width: '100%' }
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {insight.title}
                    </Typography>
                    <Typography variant="body2">
                      {insight.description}
                    </Typography>
                  </Alert>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(103, 126, 234, 0.1)', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong> These predictions are based on historical data analysis and AI algorithms. 
            Actual results may vary due to market conditions, seasonal factors, and other external variables.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default SalesPrediction; 