import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Collapse,
  Grid,
  Typography,
  Slider,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

const OrderFilters = ({ onFiltersChange, onClearFilters }) => {
  
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    paymentMethod: '',
    minAmount: '',
    maxAmount: '',
    shopName: '',
    customerName: ''
  });

  const [activeFilters, setActiveFilters] = useState(0);

  // Count active filters
  useEffect(() => {
    const count = Object.values(filters).filter(value => value !== '').length;
    setActiveFilters(count);
  }, [filters]);

  // Simple search function
  const handleSearch = () => {
    console.log('🔍 Search triggered:', filters);
    if (typeof onFiltersChange === 'function') {
      onFiltersChange(filters);
    }
  };

  // Simple auto-search when search field changes
  useEffect(() => {
    if (filters.search && typeof onFiltersChange === 'function') {
      const timeoutId = setTimeout(() => {
        onFiltersChange(filters);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [filters.search, onFiltersChange]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      status: '',
      paymentMethod: '',
      minAmount: '',
      maxAmount: '',
      shopName: '',
      customerName: ''
    };
    setFilters(clearedFilters);
    onClearFilters();
  };

  const handleClearFilter = (field) => {
    handleFilterChange(field, '');
  };

  const getFilterChips = () => {
    const chips = [];
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '') {
        chips.push({
          key,
          label: `${key}: ${value}`,
          value
        });
      }
    });
    return chips;
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon color="primary" />
          <Typography variant="h6">Filters</Typography>
          {activeFilters > 0 && (
            <Chip 
              label={activeFilters} 
              color="primary" 
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {expanded ? 'Hide' : 'Show'} Filters
          </Button>
          {activeFilters > 0 && (
            <Button
              size="small"
              color="error"
              onClick={handleClearFilters}
              startIcon={<ClearIcon />}
            >
              Clear All
            </Button>
          )}
        </Box>
      </Box>

      {/* Active Filter Chips */}
      {activeFilters > 0 && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {getFilterChips().map((chip) => (
            <Chip
              key={chip.key}
              label={chip.label}
              onDelete={() => handleClearFilter(chip.key)}
              color="primary"
              variant="outlined"
              size="small"
            />
          ))}
        </Box>
      )}

      {/* Filter Form */}
      <Collapse in={expanded}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 10 }}>
                    <TextField
          fullWidth
          label="Search Orders"
          placeholder="Search by order number, shop name, customer, phone, address, postcode..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
                    <Button
          fullWidth
          variant="contained"
          onClick={handleSearch}
          sx={{ 
            height: '56px',
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            '&:hover': { background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)' }
          }}
        >
          Search
        </Button>
          </Grid>

          {/* Status and Payment Method */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Process">In Process</MenuItem>
                <MenuItem value="Delivered">Delivered</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={filters.paymentMethod}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                label="Payment Method"
              >
                <MenuItem value="">All Payment Methods</MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Card">Card</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                <MenuItem value="Balance">Balance</MenuItem>
                <MenuItem value="">Not Set</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Amount Range */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Min Amount (£)"
              type="number"
              value={filters.minAmount}
              onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">£</InputAdornment>,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Max Amount (£)"
              type="number"
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">£</InputAdornment>,
              }}
            />
          </Grid>

          {/* Shop and Customer Filters */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Shop Name"
              value={filters.shopName}
              onChange={(e) => handleFilterChange('shopName', e.target.value)}
              placeholder="Filter by shop name..."
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Customer Name"
              value={filters.customerName}
              onChange={(e) => handleFilterChange('customerName', e.target.value)}
              placeholder="Filter by customer name..."
            />
          </Grid>


        </Grid>
      </Collapse>
    </Paper>
  );
};

export default OrderFilters; 