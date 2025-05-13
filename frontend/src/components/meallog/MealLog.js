import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API from '../../config/api';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import DateRangeIcon from '@mui/icons-material/DateRange';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

const MealLog = () => {
  const navigate = useNavigate();
  
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [mealTypeFilter, setMealTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState(null);
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  useEffect(() => {
    fetchMeals();
  }, [startDate, endDate, mealTypeFilter]);

  const fetchMeals = async () => {
    setLoading(true);
    try {
      let url = API.mealLog.getAll;
      const params = new URLSearchParams();
      
      if (startDate) {
        params.append('startDate', startDate.toISOString());
      }
      
      if (endDate) {
        params.append('endDate', endDate.toISOString());
      }
      
      if (mealTypeFilter) {
        params.append('meal_type', mealTypeFilter);
      }
      
      // Create the full URL with query parameters
      if (params.toString()) {
        // If the URL already has a query string, append with &, otherwise with ?
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}${params.toString()}`;
      }
      
      const res = await axios.get(url);
      setMeals(res.data.meals || []);
      setTotals(res.data.totals || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      });
      setLoading(false);
    } catch (err) {
      setError('Error fetching meal log');
      setLoading(false);
    }
  };

  const handleDeleteClick = (meal) => {
    setMealToDelete(meal);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!mealToDelete) return;
    
    try {
      await axios.delete(API.mealLog.delete(mealToDelete._id));
      setSuccessMessage('Meal deleted successfully');
      setDeleteDialogOpen(false);
      fetchMeals();
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError('Error deleting meal');
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setMealToDelete(null);
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setMealTypeFilter('');
  };

  const getMealTypeColor = (mealType) => {
    switch (mealType) {
      case 'breakfast':
        return '#bbdefb'; // Light blue
      case 'lunch':
        return '#c8e6c9'; // Light green
      case 'dinner':
        return '#ffccbc'; // Light orange
      case 'snack':
        return '#e1bee7'; // Light purple
      default:
        return '#e0e0e0'; // Light grey
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const groupMealsByDate = () => {
    const grouped = {};
    
    meals.forEach(meal => {
      const dateStr = new Date(meal.date).toISOString().split('T')[0];
      
      if (!grouped[dateStr]) {
        grouped[dateStr] = {
          date: dateStr,
          meals: [],
          totals: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          }
        };
      }
      
      grouped[dateStr].meals.push(meal);
      grouped[dateStr].totals.calories += meal.calories;
      grouped[dateStr].totals.protein += meal.protein;
      grouped[dateStr].totals.carbs += meal.carbs;
      grouped[dateStr].totals.fat += meal.fat;
    });
    
    return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const groupedMeals = groupMealsByDate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Meal Log
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ mr: 1 }}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/search')}
          >
            Add Meal
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="meal-type-filter-label">Meal Type</InputLabel>
                <Select
                  labelId="meal-type-filter-label"
                  value={mealTypeFilter}
                  label="Meal Type"
                  onChange={(e) => setMealTypeFilter(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      sx: { width: '200px' }
                    }
                  }}
                >
                  <MenuItem value="" sx={{ minWidth: '120px' }}>All</MenuItem>
                  <MenuItem value="breakfast" sx={{ minWidth: '120px' }}>Breakfast</MenuItem>
                  <MenuItem value="lunch" sx={{ minWidth: '120px' }}>Lunch</MenuItem>
                  <MenuItem value="dinner" sx={{ minWidth: '120px' }}>Dinner</MenuItem>
                  <MenuItem value="snack" sx={{ minWidth: '120px' }}>Snack</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={clearFilters} sx={{ mr: 1 }}>
              Clear Filters
            </Button>
            <Button variant="contained" onClick={fetchMeals}>
              Apply Filters
            </Button>
          </Box>
        </Paper>
      )}
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Total Calories
              </Typography>
              <Typography variant="h5">
                {totals.calories.toFixed(0)}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Total Protein
              </Typography>
              <Typography variant="h5">
                {totals.protein.toFixed(1)}g
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Total Carbs
              </Typography>
              <Typography variant="h5">
                {totals.carbs.toFixed(1)}g
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Total Fat
              </Typography>
              <Typography variant="h5">
                {totals.fat.toFixed(1)}g
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : groupedMeals.length > 0 ? (
        groupedMeals.map((dayGroup) => (
          <Paper key={dayGroup.date} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DateRangeIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  {formatDate(dayGroup.date)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {dayGroup.totals.calories.toFixed(0)} calories • {dayGroup.totals.protein.toFixed(1)}g protein • {dayGroup.totals.carbs.toFixed(1)}g carbs • {dayGroup.totals.fat.toFixed(1)}g fat
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {dayGroup.meals.map((meal) => (
              <Box key={meal._id} sx={{ mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label={meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)} 
                        size="small" 
                        sx={{ 
                          mr: 1, 
                          bgcolor: getMealTypeColor(meal.meal_type),
                          textTransform: 'capitalize'
                        }} 
                      />
                      <Typography variant="subtitle1">
                        {meal.food_name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(meal.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' • '}
                      {meal.servings} {meal.servings === 1 ? 'serving' : 'servings'}
                    </Typography>
                  </Grid>
                  <Grid item xs={10} sm={5}>
                    <Grid container spacing={1}>
                      <Grid item xs={3}>
                        <Typography variant="body2" color="text.secondary">
                          Calories
                        </Typography>
                        <Typography variant="body1">
                          {meal.calories.toFixed(0)}
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2" color="text.secondary">
                          Protein
                        </Typography>
                        <Typography variant="body1">
                          {meal.protein.toFixed(1)}g
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2" color="text.secondary">
                          Carbs
                        </Typography>
                        <Typography variant="body1">
                          {meal.carbs.toFixed(1)}g
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2" color="text.secondary">
                          Fat
                        </Typography>
                        <Typography variant="body1">
                          {meal.fat.toFixed(1)}g
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={2} sm={1} sx={{ textAlign: 'right' }}>
                    <IconButton 
                      color="error" 
                      size="small"
                      onClick={() => handleDeleteClick(meal)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
                {dayGroup.meals.indexOf(meal) < dayGroup.meals.length - 1 && (
                  <Divider sx={{ my: 2 }} />
                )}
              </Box>
            ))}
          </Paper>
        ))
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No meals found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {startDate || endDate || mealTypeFilter ? 
              'No meals match your current filters. Try adjusting your filters or clearing them.' : 
              'You haven\'t logged any meals yet. Start by adding your first meal!'}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/search')}
            sx={{ mt: 2 }}
          >
            Add Your First Meal
          </Button>
        </Paper>
      )}
      
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this meal from your log?
            {mealToDelete && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">
                  {mealToDelete.food_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(mealToDelete.date)} • {mealToDelete.meal_type} • {mealToDelete.calories.toFixed(0)} calories
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MealLog;
