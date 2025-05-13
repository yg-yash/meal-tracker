const express = require('express');
const mealLogController = require('../controllers/mealLogController');
const auth = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');
const router = express.Router();

// Add a meal to the log
router.post('/add', auth, rateLimiter, mealLogController.addMeal);

// Get user's meal log
router.get('/', auth, mealLogController.getMeals);

// Delete a meal from the log
router.delete('/:id', auth, mealLogController.deleteMeal);

// Get meal summary by date range
router.get('/summary', auth, mealLogController.getMealSummary);

module.exports = router;
