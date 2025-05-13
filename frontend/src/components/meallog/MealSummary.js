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
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const MealSummary = () => {
  const navigate = useNavigate();
  
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  
  const [endDate, setEndDate] = useState(new Date());
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    days: 0
  });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    
    setLoading(true);
    try {
      const baseUrl = API.mealLog.summary;
      const params = `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      const res = await axios.get(`${baseUrl}${params}`);
      
      const summaryData = res.data.summary || [];
      setSummary(summaryData);
      
      // Calculate totals
      const totalCalories = summaryData.reduce((sum, day) => sum + day.total_calories, 0);
      const totalProtein = summaryData.reduce((sum, day) => sum + day.total_protein, 0);
      const totalCarbs = summaryData.reduce((sum, day) => sum + day.total_carbs, 0);
      const totalFat = summaryData.reduce((sum, day) => sum + day.total_fat, 0);
      
      setTotals({
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        days: summaryData.length
      });
      
      setLoading(false);
    } catch (err) {
      setError('Error fetching nutrition summary');
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Prepare data for charts
  const chartData = summary.map(day => ({
    name: formatDate(day.date),
    calories: Math.round(day.total_calories),
    protein: Math.round(day.total_protein),
    carbs: Math.round(day.total_carbs),
    fat: Math.round(day.total_fat)
  })).reverse();

  // Prepare data for macronutrient distribution pie chart
  const calculateMacroPercentages = () => {
    const totalCalories = totals.protein * 4 + totals.carbs * 4 + totals.fat * 9;
    
    if (totalCalories === 0) return [];
    
    return [
      {
        name: 'Protein',
        value: Math.round((totals.protein * 4 / totalCalories) * 100),
        color: '#2196f3'
      },
      {
        name: 'Carbs',
        value: Math.round((totals.carbs * 4 / totalCalories) * 100),
        color: '#ffc107'
      },
      {
        name: 'Fat',
        value: Math.round((totals.fat * 9 / totalCalories) * 100),
        color: '#f50057'
      }
    ];
  };

  const macroData = calculateMacroPercentages();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/meal-log')}
          sx={{ mr: 2 }}
        >
          Back to Meal Log
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Nutrition Summary
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Date Range
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={5}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={fetchSummary}
              sx={{ height: '56px' }}
            >
              Update
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : summary.length > 0 ? (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary for {formatDate(startDate)} - {formatDate(endDate)}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Daily Calories
                  </Typography>
                  <Typography variant="h5">
                    {(totals.calories / totals.days).toFixed(0)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Daily Protein
                  </Typography>
                  <Typography variant="h5">
                    {(totals.protein / totals.days).toFixed(1)}g
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Daily Carbs
                  </Typography>
                  <Typography variant="h5">
                    {(totals.carbs / totals.days).toFixed(1)}g
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Daily Fat
                  </Typography>
                  <Typography variant="h5">
                    {(totals.fat / totals.days).toFixed(1)}g
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Box sx={{ width: '100%', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              centered
              variant="fullWidth"
            >
              <Tab label="Calories" />
              <Tab label="Macronutrients" />
              <Tab label="Distribution" />
            </Tabs>
          </Box>
          
          {activeTab === 0 && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Daily Calorie Intake
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="calories" fill="#4caf50" name="Calories" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          )}
          
          {activeTab === 1 && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Daily Macronutrient Intake
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="protein" fill="#2196f3" name="Protein (g)" />
                    <Bar dataKey="carbs" fill="#ffc107" name="Carbs (g)" />
                    <Bar dataKey="fat" fill="#f50057" name="Fat (g)" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          )}
          
          {activeTab === 2 && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Macronutrient Distribution
              </Typography>
              <Box sx={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                  Based on caloric contribution: Protein (4 cal/g), Carbs (4 cal/g), Fat (9 cal/g)
                </Typography>
              </Box>
            </Paper>
          )}
          
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Daily Breakdown
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Typography variant="subtitle2">Date</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="subtitle2">Calories</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="subtitle2">Protein (g)</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="subtitle2">Carbs (g)</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="subtitle2">Fat (g)</Typography>
              </Grid>
              <Grid item xs={1}>
                <Typography variant="subtitle2">Details</Typography>
              </Grid>
            </Grid>
            {summary.map((day) => (
              <Box key={day.date} sx={{ mt: 2 }}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={3}>
                      <Typography variant="body1">
                        {new Date(day.date).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="body1">
                        {day.total_calories.toFixed(0)}
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="body1">
                        {day.total_protein.toFixed(1)}
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="body1">
                        {day.total_carbs.toFixed(1)}
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="body1">
                        {day.total_fat.toFixed(1)}
                      </Typography>
                    </Grid>
                    <Grid item xs={1}>
                      <Button 
                        size="small" 
                        onClick={() => navigate(`/meal-log?date=${day.date}`)}
                      >
                        View
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            ))}
          </Paper>
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No data available
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            No meal data found for the selected date range. Try selecting a different date range or add some meals to your log.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/search')}
            sx={{ mt: 2 }}
          >
            Add Meals
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default MealSummary;
