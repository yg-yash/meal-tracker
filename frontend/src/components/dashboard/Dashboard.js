import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Divider,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Restaurant as RestaurantIcon,
  ListAlt as ListAltIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  LocalFireDepartment as FireIcon,
  EggAlt as ProteinIcon,
  Grain as CarbsIcon,
  Opacity as FatIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { format } from 'date-fns';

// Styled components for custom UI elements
const StatsCard = styled(Paper)(({ theme, color }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: color ? `linear-gradient(135deg, ${color[0]} 0%, ${color[1]} 100%)` : theme.palette.background.paper,
  color: color ? '#fff' : theme.palette.text.primary,
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)'
  }
}));

const QuickActionCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12)'
  }
}));

const MealItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 8,
  marginBottom: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateX(5px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  }
}));

const Dashboard = () => {
  const authContext = useContext(AuthContext);
  const { loadUser, user } = authContext;
  const navigate = useNavigate();
  const theme = useTheme();

  const [quickSearch, setQuickSearch] = useState('');
  const [recentMeals, setRecentMeals] = useState([]);
  const [nutritionSummary, setNutritionSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [todayDate] = useState(format(new Date(), 'EEEE, MMMM d, yyyy'));
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Only fetch data on initial mount, not on every loading change
    fetchRecentMeals();
    fetchNutritionSummary();
    
    // Set a timeout to ensure loading state is cleared even if API calls fail
    const timer = setTimeout(() => {
      if (loading) setLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchRecentMeals = async () => {
    try {
      const res = await axios.get('/meal-log?limit=5');
      setRecentMeals(res.data.meals || []);
    } catch (err) {
      console.error('Error fetching recent meals:', err);
      // Ensure we still update state even on error
      setRecentMeals([]);
    }
  };

  const fetchNutritionSummary = async () => {
    try {
      // Get today's date
      const today = new Date();
      const startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      
      const res = await axios.get(`/meal-log/summary?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
      
      if (res.data.summary && res.data.summary.length > 0) {
        setNutritionSummary(res.data.summary[0]);
      } else {
        // Set default values if no summary data
        setNutritionSummary({
          total_calories: 0,
          total_protein: 0,
          total_carbs: 0,
          total_fat: 0
        });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching nutrition summary:', err);
      // Set default values on error
      setNutritionSummary({
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0
      });
      setLoading(false);
    }
  };
  
  // Handle delete meal
  const handleDeleteMeal = async () => {
    if (!mealToDelete) return;
    
    try {
      await axios.delete(`/meal-log/${mealToDelete._id}`);
      setSuccessMessage('Meal deleted successfully');
      setDeleteDialogOpen(false);
      
      // Refresh data
      fetchRecentMeals();
      fetchNutritionSummary();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting meal:', err);
      setDeleteDialogOpen(false);
    }
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/food-search?query=${encodeURIComponent(quickSearch)}`);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }} className="fade-in">
      <Box sx={{ mb: 4 }} className="slide-up">
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
          Welcome, {user ? user.firstName : 'User'}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {todayDate} • Your personal nutrition dashboard
        </Typography>
      </Box>
      
      {/* Nutrition Stats */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} sm={6}>
            <StatsCard color={['#FF9800', '#FF5722']} className="slide-up">
              <FireIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 0.5 }}>
                Calories
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {loading ? (
                  <CircularProgress size={30} color="inherit" sx={{ opacity: 0.7 }} />
                ) : (
                  nutritionSummary ? nutritionSummary.total_calories.toFixed(0) : '0'
                )}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                daily intake
              </Typography>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} md={4} sm={6}>
            <StatsCard color={['#2196F3', '#1565C0']} className="slide-up" style={{ animationDelay: '0.1s' }}>
              <ProteinIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 0.5 }}>
                Protein
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {loading ? (
                  <CircularProgress size={30} color="inherit" sx={{ opacity: 0.7 }} />
                ) : (
                  nutritionSummary ? `${nutritionSummary.total_protein.toFixed(1)}g` : '0g'
                )}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                daily intake
              </Typography>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} md={4} sm={6}>
            <StatsCard color={['#4CAF50', '#2E7D32']} className="slide-up" style={{ animationDelay: '0.2s' }}>
              <CarbsIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 0.5 }}>
                Carbs
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {loading ? (
                  <CircularProgress size={30} color="inherit" sx={{ opacity: 0.7 }} />
                ) : (
                  nutritionSummary ? `${nutritionSummary.total_carbs.toFixed(1)}g` : '0g'
                )}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                daily intake
              </Typography>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} md={3} sm={6}>
            <StatsCard color={['#F44336', '#C62828']} className="slide-up" style={{ animationDelay: '0.3s' }}>
              <FatIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 0.5 }}>
                Fat
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {loading ? (
                  <CircularProgress size={30} color="inherit" sx={{ opacity: 0.7 }} />
                ) : (
                  nutritionSummary ? `${nutritionSummary.total_fat.toFixed(1)}g` : '0g'
                )}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                daily intake
              </Typography>
            </StatsCard>
          </Grid>
        </Grid>
      </Box>
      
      <Grid container spacing={4}>
        {/* Quick Search */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 4,
              backgroundColor: theme.palette.background.paper,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              height: '100%'
            }}
            className="slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              Quick Food Search
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box component="form" onSubmit={handleQuickSearch} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <TextField
                fullWidth
                label="Search for a food"
                variant="outlined"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="e.g., chicken biryani, pizza, salad"
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                  sx: { borderRadius: 2 }
                }}
                sx={{ mb: 2 }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                size="large"
                startIcon={<SearchIcon />}
                sx={{ 
                  mt: 'auto', 
                  borderRadius: 2,
                  py: 1.2,
                  fontWeight: 600,
                  boxShadow: '0 4px 10px rgba(76, 175, 80, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 15px rgba(76, 175, 80, 0.3)'
                  }
                }}
                className="btn-hover-effect"
              >
                Search Now
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Meals */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 4,
              backgroundColor: theme.palette.background.paper,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              height: '100%',
              minHeight: 350
            }}
            className="slide-up"
            style={{ animationDelay: '0.5s' }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                Recent Meals
              </Typography>
              <Button 
                variant="text" 
                color="primary" 
                endIcon={<ArrowForwardIcon />}
                component={Link}
                to="/meal-log"
                sx={{ fontWeight: 500 }}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : recentMeals.length > 0 ? (
              <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                {recentMeals.map((meal, index) => (
                  <MealItem key={meal._id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {meal.food_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(meal.date), 'MMM d, yyyy • h:mm a')} • {meal.meal_type || 'Snack'}
                        </Typography>
                      </Box>
                      <Tooltip title="Delete meal">
                        <IconButton 
                          size="small" 
                          color="error" 
                          sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                          onClick={() => {
                            setMealToDelete(meal);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <Box sx={{ display: 'flex', mt: 1, gap: 1 }}>
                      <Chip 
                        size="small" 
                        icon={<FireIcon fontSize="small" />} 
                        label={`${meal.calories} cal`} 
                        className="nutrient-badge calories"
                        sx={{ fontWeight: 500 }}
                      />
                      <Chip 
                        size="small" 
                        icon={<ProteinIcon fontSize="small" />} 
                        label={`${meal.protein}g`} 
                        className="nutrient-badge protein"
                        sx={{ fontWeight: 500 }}
                      />
                      <Chip 
                        size="small" 
                        icon={<CarbsIcon fontSize="small" />} 
                        label={`${meal.carbs}g`} 
                        className="nutrient-badge carbs"
                        sx={{ fontWeight: 500 }}
                      />
                      <Chip 
                        size="small" 
                        icon={<FatIcon fontSize="small" />} 
                        label={`${meal.fat}g`} 
                        className="nutrient-badge fat"
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                  </MealItem>
                ))}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <RestaurantIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body1" color="text.secondary" align="center">
                  No meals logged yet
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/food-search')}
                  sx={{ mt: 2 }}
                >
                  Log Your First Meal
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main, mt: 2, mb: 3 }} className="slide-up" style={{ animationDelay: '0.6s' }}>
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3} className="slide-up" style={{ animationDelay: '0.7s' }}>
              <QuickActionCard>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                  <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(33, 150, 243, 0.1)', mb: 2 }}>
                    <SearchIcon fontSize="large" sx={{ color: theme.palette.info.main }} />
                  </Avatar>
                  <Typography gutterBottom variant="h6" component="h2" align="center" sx={{ fontWeight: 600 }}>
                    Search Foods
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Find nutrition information for any food or meal
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 0 }}>
                  <Button 
                    size="large" 
                    fullWidth 
                    onClick={() => navigate('/food-search')}
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 0, 
                      bgcolor: 'rgba(33, 150, 243, 0.05)',
                      color: theme.palette.info.main,
                      '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.1)' }
                    }}
                  >
                    Search Now
                  </Button>
                </CardActions>
              </QuickActionCard>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3} className="slide-up" style={{ animationDelay: '0.8s' }}>
              <QuickActionCard>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                  <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(76, 175, 80, 0.1)', mb: 2 }}>
                    <RestaurantIcon fontSize="large" sx={{ color: theme.palette.success.main }} />
                  </Avatar>
                  <Typography gutterBottom variant="h6" component="h2" align="center" sx={{ fontWeight: 600 }}>
                    Log Meal
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Add a meal to your daily nutrition log
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 0 }}>
                  <Button 
                    size="large" 
                    fullWidth 
                    onClick={() => navigate('/food-search')}
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 0, 
                      bgcolor: 'rgba(76, 175, 80, 0.05)',
                      color: theme.palette.success.main,
                      '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.1)' }
                    }}
                  >
                    Log Now
                  </Button>
                </CardActions>
              </QuickActionCard>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3} className="slide-up" style={{ animationDelay: '0.9s' }}>
              <QuickActionCard>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                  <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(255, 152, 0, 0.1)', mb: 2 }}>
                    <ListAltIcon fontSize="large" sx={{ color: theme.palette.warning.main }} />
                  </Avatar>
                  <Typography gutterBottom variant="h6" component="h2" align="center" sx={{ fontWeight: 600 }}>
                    Meal Log
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    View and manage your meal history
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 0 }}>
                  <Button 
                    size="large" 
                    fullWidth 
                    onClick={() => navigate('/meal-log')}
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 0, 
                      bgcolor: 'rgba(255, 152, 0, 0.05)',
                      color: theme.palette.warning.main,
                      '&:hover': { bgcolor: 'rgba(255, 152, 0, 0.1)' }
                    }}
                  >
                    View Log
                  </Button>
                </CardActions>
              </QuickActionCard>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3} className="slide-up" style={{ animationDelay: '1s' }}>
              <QuickActionCard>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                  <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(244, 67, 54, 0.1)', mb: 2 }}>
                    <BarChartIcon fontSize="large" sx={{ color: theme.palette.error.main }} />
                  </Avatar>
                  <Typography gutterBottom variant="h6" component="h2" align="center" sx={{ fontWeight: 600 }}>
                    Nutrition Summary
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    View detailed nutrition analytics
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 0 }}>
                  <Button 
                    size="large" 
                    fullWidth 
                    onClick={() => navigate('/meal-summary')}
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 0, 
                      bgcolor: 'rgba(244, 67, 54, 0.05)',
                      color: theme.palette.error.main,
                      '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' }
                    }}
                  >
                    View Summary
                  </Button>
                </CardActions>
              </QuickActionCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
   
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Meal
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this meal? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteMeal} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;
