const MealLog = require('../models/MealLog');

// Add a meal to the log
exports.addMeal = async (req, res) => {
  try {
    const { food_name, servings, calories, protein, carbs, fat, meal_type, date } = req.body;

    // Validate input
    if (!food_name || !servings || !calories || !meal_type) {
      return res.status(400).json({ message: 'Food name, servings, calories, and meal type are required' });
    }

    // Create new meal log entry
    const mealLog = new MealLog({
      user: req.user._id,
      food_name,
      servings,
      calories,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      meal_type,
      date: date ? new Date(date) : new Date()
    });

    await mealLog.save();

    res.status(201).json({
      message: 'Meal added to log successfully',
      meal: mealLog
    });
  } catch (error) {
    console.error('Error adding meal to log:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's meal log
exports.getMeals = async (req, res) => {
  try {
    const { startDate, endDate, meal_type } = req.query;
    
    // Build query
    const query = { user: req.user._id };
    
    // Add date range if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }
    
    // Add meal type if provided
    if (meal_type) {
      query.meal_type = meal_type;
    }
    
    // Get meals
    const meals = await MealLog.find(query).sort({ date: -1 });
    
    // Calculate totals
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
    
    meals.forEach(meal => {
      totals.calories += meal.calories;
      totals.protein += meal.protein;
      totals.carbs += meal.carbs;
      totals.fat += meal.fat;
    });
    
    res.json({
      meals,
      totals
    });
  } catch (error) {
    console.error('Error getting meal log:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a meal from the log
exports.deleteMeal = async (req, res) => {
  try {
    const meal = await MealLog.findById(req.params.id);
    
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    
    // Check if the meal belongs to the user
    if (meal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this meal' });
    }
    
    // Use deleteOne instead of remove() which is deprecated
    await MealLog.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Meal removed from log' });
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get meal summary by date range
exports.getMealSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Get meals in date range
    const meals = await MealLog.find({
      user: req.user._id,
      date: { $gte: start, $lte: end }
    });
    
    // Group meals by date
    const mealsByDate = {};
    
    meals.forEach(meal => {
      const dateStr = meal.date.toISOString().split('T')[0];
      
      if (!mealsByDate[dateStr]) {
        mealsByDate[dateStr] = {
          date: dateStr,
          total_calories: 0,
          total_protein: 0,
          total_carbs: 0,
          total_fat: 0,
          meals: []
        };
      }
      
      mealsByDate[dateStr].total_calories += meal.calories;
      mealsByDate[dateStr].total_protein += meal.protein;
      mealsByDate[dateStr].total_carbs += meal.carbs;
      mealsByDate[dateStr].total_fat += meal.fat;
      mealsByDate[dateStr].meals.push(meal);
    });
    
    // Convert to array and sort by date
    const summary = Object.values(mealsByDate).sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    
    res.json({ summary });
  } catch (error) {
    console.error('Error getting meal summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
