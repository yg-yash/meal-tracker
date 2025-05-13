import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import SearchIcon from '@mui/icons-material/Search';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const FoodSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('query') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState('');
  const [open, setOpen] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const [loadingNutrition, setLoadingNutrition] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL || ''}/api/calories/search-foods`, { query: searchQuery });
      setSearchResults(res.data.results || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error searching for foods');
      setLoading(false);
    }
  };

  const handleFoodSelect = async (food) => {
    setSelectedFood(food);
    setLoadingNutrition(true);
    
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL || ''}/api/calories/get-nutrition-by-id`, { 
        foodId: food.id,
        servings: 1
      });
      
      setNutritionData(res.data);
      setLoadingNutrition(false);
      setOpen(true);
    } catch (err) {
      setError('Error fetching nutrition information');
      setLoadingNutrition(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setServings(1);
    setMealType('');
  };

  const handleServingsChange = (e) => {
    const value = parseFloat(e.target.value);
    if (value > 0) {
      setServings(value);
    }
  };

  const handleMealTypeChange = (e) => {
    setMealType(e.target.value);
  };

  const handleAddToLog = async () => {
    if (!mealType) {
      setError('Please select a meal type');
      return;
    }

    try {
      await axios.post('/meal-log/add', {
        food_name: nutritionData.food_name,
        servings: servings,
        calories: nutritionData.calories_per_serving * servings,
        protein: nutritionData.macronutrients.protein_per_serving * servings,
        carbs: nutritionData.macronutrients.carbs_per_serving * servings,
        fat: nutritionData.macronutrients.fat_per_serving * servings,
        meal_type: mealType
      });
      
      setSuccessMessage('Meal added to log successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
        handleClose();
      }, 2000);
    } catch (err) {
      setError('Error adding meal to log');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Food Search
      </Typography>
      
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
      
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={9}>
            <TextField
              fullWidth
              label="Search for a food"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., chicken biryani, pizza, salad"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              sx={{ height: '100%' }}
              startIcon={<SearchIcon />}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Search'}
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : searchResults.length > 0 ? (
        <Grid container spacing={3}>
          {searchResults.map((food) => (
            <Grid item xs={12} sm={4} md={4} lg={4} key={food.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {food.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Brand: {food.brandOwner}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {food.ingredients && food.ingredients !== 'Not available' ? (
                      <>
                        <strong>Ingredients:</strong> {food.ingredients.length > 100 ? `${food.ingredients.substring(0, 100)}...` : food.ingredients}
                      </>
                    ) : 'No ingredients information available'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    fullWidth 
                    variant="contained" 
                    onClick={() => handleFoodSelect(food)}
                  >
                    View Nutrition
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : searchQuery && !loading ? (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No results found for "{searchQuery}"
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Try a different search term or check your spelling
          </Typography>
        </Box>
      ) : null}
      
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Nutrition Information</DialogTitle>
        <DialogContent>
          {loadingNutrition ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : nutritionData ? (
            <>
              <DialogContentText>
                <Typography variant="h6" component="div" gutterBottom>
                  {nutritionData.food_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Brand: {nutritionData.brand}
                </Typography>
                
                <Box sx={{ mt: 3, mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Servings"
                        type="number"
                        value={servings}
                        onChange={handleServingsChange}
                        inputProps={{ min: "0.25", step: "0.25" }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel id="meal-type-label">Meal Type</InputLabel>
                        <Select
                          labelId="meal-type-label"
                          value={mealType}
                          label="Meal Type"
                          onChange={handleMealTypeChange}
                        >
                          <MenuItem value="breakfast">Breakfast</MenuItem>
                          <MenuItem value="lunch">Lunch</MenuItem>
                          <MenuItem value="dinner">Dinner</MenuItem>
                          <MenuItem value="snack">Snack</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Nutrition Facts
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Calories per serving
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {nutritionData.calories_per_serving.toFixed(1)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total calories
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {(nutritionData.calories_per_serving * servings).toFixed(1)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Protein
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {nutritionData.macronutrients.protein_per_serving.toFixed(1)}g
                      {' → '}
                      {(nutritionData.macronutrients.protein_per_serving * servings).toFixed(1)}g
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Carbs
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {nutritionData.macronutrients.carbs_per_serving.toFixed(1)}g
                      {' → '}
                      {(nutritionData.macronutrients.carbs_per_serving * servings).toFixed(1)}g
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Fat
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {nutritionData.macronutrients.fat_per_serving.toFixed(1)}g
                      {' → '}
                      {(nutritionData.macronutrients.fat_per_serving * servings).toFixed(1)}g
                    </Typography>
                  </Grid>
                </Grid>
              </DialogContentText>
            </>
          ) : (
            <DialogContentText>
              No nutrition data available
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddToLog} variant="contained" disabled={!mealType}>
            Add to Meal Log
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FoodSearch;
