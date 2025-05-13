import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchFoodDetails = async () => {
      try {
        const res = await axios.post('/calories/get-nutrition-by-id', { 
          foodId: id,
          servings: 1
        });
        
        setFood(res.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching food details');
        setLoading(false);
      }
    };

    fetchFoodDetails();
  }, [id]);

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
        food_name: food.food_name,
        servings: servings,
        calories: food.calories_per_serving * servings,
        protein: food.macronutrients.protein_per_serving * servings,
        carbs: food.macronutrients.carbs_per_serving * servings,
        fat: food.macronutrients.fat_per_serving * servings,
        meal_type: mealType
      });
      
      setSuccessMessage('Meal added to log successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
        navigate('/meal-log');
      }, 2000);
    } catch (err) {
      setError('Error adding meal to log');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/search')}
        >
          Back to Search
        </Button>
      </Container>
    );
  }

  if (!food) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Food not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/search')}
        >
          Back to Search
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/search')}
        sx={{ mb: 3 }}
      >
        Back to Search
      </Button>
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      <Typography variant="h4" gutterBottom component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        {food.food_name}
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {food.brand}
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Nutrition Facts
              </Typography>
              
              <Box sx={{ mb: 3 }}>
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
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                    <Grid container>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          Calories per serving
                        </Typography>
                        <Typography variant="h5">
                          {food.calories_per_serving.toFixed(0)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          Total calories
                        </Typography>
                        <Typography variant="h5">
                          {(food.calories_per_serving * servings).toFixed(0)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                
                <Grid item xs={4}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                    <Typography variant="body2" color="text.secondary">
                      Protein
                    </Typography>
                    <Typography variant="h6">
                      {food.macronutrients.protein_per_serving.toFixed(1)}g
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total: {(food.macronutrients.protein_per_serving * servings).toFixed(1)}g
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={4}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff8e1' }}>
                    <Typography variant="body2" color="text.secondary">
                      Carbs
                    </Typography>
                    <Typography variant="h6">
                      {food.macronutrients.carbs_per_serving.toFixed(1)}g
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total: {(food.macronutrients.carbs_per_serving * servings).toFixed(1)}g
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={4}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#fce4ec' }}>
                    <Typography variant="body2" color="text.secondary">
                      Fat
                    </Typography>
                    <Typography variant="h6">
                      {food.macronutrients.fat_per_serving.toFixed(1)}g
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total: {(food.macronutrients.fat_per_serving * servings).toFixed(1)}g
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Source: {food.source}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add to Meal Log
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Track this food in your meal log to monitor your daily nutrition intake.
              </Typography>
              
              <Button
                variant="contained"
                fullWidth
                onClick={handleAddToLog}
                disabled={!mealType}
                sx={{ mt: 2 }}
              >
                Add to Meal Log
              </Button>
              
              {!mealType && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  Please select a meal type
                </Typography>
              )}
            </CardContent>
          </Card>
          
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Macronutrient Breakdown
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Protein: {Math.round((food.macronutrients.protein_per_serving * 4 / food.calories_per_serving) * 100)}%
                </Typography>
                <Box sx={{ width: '100%', bgcolor: '#e0e0e0', height: 10, borderRadius: 5, mt: 1, mb: 2 }}>
                  <Box
                    sx={{
                      width: `${Math.round((food.macronutrients.protein_per_serving * 4 / food.calories_per_serving) * 100)}%`,
                      bgcolor: '#2196f3',
                      height: 10,
                      borderRadius: 5
                    }}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Carbs: {Math.round((food.macronutrients.carbs_per_serving * 4 / food.calories_per_serving) * 100)}%
                </Typography>
                <Box sx={{ width: '100%', bgcolor: '#e0e0e0', height: 10, borderRadius: 5, mt: 1, mb: 2 }}>
                  <Box
                    sx={{
                      width: `${Math.round((food.macronutrients.carbs_per_serving * 4 / food.calories_per_serving) * 100)}%`,
                      bgcolor: '#ffc107',
                      height: 10,
                      borderRadius: 5
                    }}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Fat: {Math.round((food.macronutrients.fat_per_serving * 9 / food.calories_per_serving) * 100)}%
                </Typography>
                <Box sx={{ width: '100%', bgcolor: '#e0e0e0', height: 10, borderRadius: 5, mt: 1 }}>
                  <Box
                    sx={{
                      width: `${Math.round((food.macronutrients.fat_per_serving * 9 / food.calories_per_serving) * 100)}%`,
                      bgcolor: '#f50057',
                      height: 10,
                      borderRadius: 5
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FoodDetails;
