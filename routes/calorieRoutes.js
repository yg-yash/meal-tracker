const express = require('express');
const calorieController = require('../controllers/calorieController');
const auth = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');
const router = express.Router();

// Get calories for a dish
router.post('/get-calories', auth, rateLimiter, calorieController.getCalories);

// Get extended nutrition info (with macronutrients)
router.post('/get-nutrition', auth, rateLimiter, calorieController.getNutritionInfo);

// Search foods with partial matching
router.post('/search-foods', auth, rateLimiter, calorieController.searchFoods);

// Get nutrition by food ID (for user selection)
router.post('/get-nutrition-by-id', auth, rateLimiter, calorieController.getNutritionById);

module.exports = router;
