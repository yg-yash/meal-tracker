const axios = require('axios');
const NodeCache = require('node-cache');

// Cache with TTL of 1 hour
const cache = new NodeCache({ stdTTL: 3600 });

exports.getCalories = async (req, res) => {
  try {
    const { dish_name, servings } = req.body;

    // Validate input
    if (!dish_name || dish_name.trim() === '') {
      return res.status(400).json({ message: 'Dish name is required' });
    }

    if (!servings || isNaN(servings) || servings <= 0) {
      return res.status(400).json({ message: 'Servings must be a positive number' });
    }

    // Check cache first
    const cacheKey = `${dish_name.toLowerCase()}_${servings}`;
    const cachedResult = cache.get(cacheKey);
    
    if (cachedResult) {
      return res.json(cachedResult);
    }

    // Call USDA API
    const response = await axios.get('https://api.nal.usda.gov/fdc/v1/foods/search', {
      params: {
        query: dish_name,
        api_key: process.env.USDA_API_KEY,
        pageSize: 5 // Get top 5 matches
      }
    });

    const { foods } = response.data;

    if (!foods || foods.length === 0) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    // Find best match (first result for simplicity, could be improved with fuzzy matching)
    const bestMatch = foods[0];
    
    // Get nutrients
    const nutrients = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };

    bestMatch.foodNutrients.forEach(nutrient => {
      if (nutrient.nutrientName === 'Energy' && nutrient.unitName === 'KCAL') {
        nutrients.calories = nutrient.value;
      } else if (nutrient.nutrientName === 'Protein') {
        nutrients.protein = nutrient.value;
      } else if (nutrient.nutrientName === 'Carbohydrate, by difference') {
        nutrients.carbs = nutrient.value;
      } else if (nutrient.nutrientName === 'Total lipid (fat)') {
        nutrients.fat = nutrient.value;
      }
    });

    if (nutrients.calories === 0) {
      return res.status(404).json({ message: 'Calorie information not available for this dish' });
    }

    // Prepare response
    const result = {
      dish_name: dish_name,
      servings: servings,
      calories_per_serving: nutrients.calories,
      total_calories: nutrients.calories * servings,
      macronutrients: {
        protein_per_serving: nutrients.protein,
        total_protein: nutrients.protein * servings,
        carbs_per_serving: nutrients.carbs,
        total_carbs: nutrients.carbs * servings,
        fat_per_serving: nutrients.fat,
        total_fat: nutrients.fat * servings
      },
      source: 'USDA FoodData Central'
    };

    // Cache the result
    cache.set(cacheKey, result);

    res.json(result);
  } catch (error) {
    console.error('Error fetching calories:', error);
    
    if (error.response && error.response.status === 429) {
      return res.status(429).json({ message: 'Rate limit exceeded for USDA API' });
    }
    
    res.status(500).json({ message: 'Error fetching calorie information' });
  }
};

// Search foods with partial matching
exports.searchFoods = async (req, res) => {
  try {
    const { query } = req.body;

    // Validate input
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Check cache first
    const cacheKey = `search_${query.toLowerCase()}`;
    const cachedResult = cache.get(cacheKey);
    
    if (cachedResult) {
      return res.json(cachedResult);
    }

    // Call USDA API
    const response = await axios.get('https://api.nal.usda.gov/fdc/v1/foods/search', {
      params: {
        query: query,
        api_key: process.env.USDA_API_KEY,
        pageSize: 10 // Get top 10 matches
      }
    });

    const { foods } = response.data;

    if (!foods || foods.length === 0) {
      return res.status(404).json({ message: 'No foods found matching your query' });
    }

    // Format results for the frontend
    const results = foods.map(food => ({
      id: food.fdcId,
      description: food.description,
      brandOwner: food.brandOwner || 'Generic',
      ingredients: food.ingredients || 'Not available',
      servingSize: food.servingSize || 'Not specified',
      servingSizeUnit: food.servingSizeUnit || 'g'
    }));

    // Cache the result
    cache.set(cacheKey, { results });

    res.json({ results });
  } catch (error) {
    console.error('Error searching foods:', error);
    
    if (error.response && error.response.status === 429) {
      return res.status(429).json({ message: 'Rate limit exceeded for USDA API' });
    }
    
    res.status(500).json({ message: 'Error searching for foods' });
  }
};

// Get nutrition by food ID
exports.getNutritionById = async (req, res) => {
  try {
    const { foodId, servings } = req.body;

    // Validate input
    if (!foodId) {
      return res.status(400).json({ message: 'Food ID is required' });
    }

    if (!servings || isNaN(servings) || servings <= 0) {
      return res.status(400).json({ message: 'Servings must be a positive number' });
    }

    // Check cache first
    const cacheKey = `nutrition_id_${foodId}_${servings}`;
    const cachedResult = cache.get(cacheKey);
    
    if (cachedResult) {
      return res.json(cachedResult);
    }

    // Call USDA API to get food details by ID
    const response = await axios.get(`https://api.nal.usda.gov/fdc/v1/food/${foodId}`, {
      params: {
        api_key: process.env.USDA_API_KEY
      }
    });

    const food = response.data;

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Get nutrients
    const nutrients = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };

    // Extract nutrients from the food data
    if (food.foodNutrients) {
      food.foodNutrients.forEach(nutrient => {
        // Check for nutrient name or nutrient number
        if ((nutrient.nutrient && nutrient.nutrient.name === 'Energy' && nutrient.nutrient.unitName === 'kcal') ||
            (nutrient.nutrientNumber === 208)) {
          nutrients.calories = nutrient.amount || 0;
        } else if ((nutrient.nutrient && nutrient.nutrient.name === 'Protein') ||
                   (nutrient.nutrientNumber === 203)) {
          nutrients.protein = nutrient.amount || 0;
        } else if ((nutrient.nutrient && nutrient.nutrient.name === 'Carbohydrate, by difference') ||
                   (nutrient.nutrientNumber === 205)) {
          nutrients.carbs = nutrient.amount || 0;
        } else if ((nutrient.nutrient && nutrient.nutrient.name === 'Total lipid (fat)') ||
                   (nutrient.nutrientNumber === 204)) {
          nutrients.fat = nutrient.amount || 0;
        }
      });
    }

    // Prepare response
    const result = {
      food_name: food.description,
      brand: food.brandOwner || 'Generic',
      servings: servings,
      calories_per_serving: nutrients.calories,
      total_calories: nutrients.calories * servings,
      macronutrients: {
        protein_per_serving: nutrients.protein,
        total_protein: nutrients.protein * servings,
        carbs_per_serving: nutrients.carbs,
        total_carbs: nutrients.carbs * servings,
        fat_per_serving: nutrients.fat,
        total_fat: nutrients.fat * servings
      },
      source: 'USDA FoodData Central'
    };

    // Cache the result
    cache.set(cacheKey, result);

    res.json(result);
  } catch (error) {
    console.error('Error fetching nutrition by ID:', error);
    
    if (error.response && error.response.status === 429) {
      return res.status(429).json({ message: 'Rate limit exceeded for USDA API' });
    }
    
    res.status(500).json({ message: 'Error fetching nutrition information' });
  }
};

// Extended version with macronutrients
exports.getNutritionInfo = async (req, res) => {
  try {
    const { dish_name, servings } = req.body;

    // Validate input
    if (!dish_name || dish_name.trim() === '') {
      return res.status(400).json({ message: 'Dish name is required' });
    }

    if (!servings || isNaN(servings) || servings <= 0) {
      return res.status(400).json({ message: 'Servings must be a positive number' });
    }

    // Check cache first
    const cacheKey = `nutrition_${dish_name.toLowerCase()}_${servings}`;
    const cachedResult = cache.get(cacheKey);
    
    if (cachedResult) {
      return res.json(cachedResult);
    }

    // Call USDA API
    const response = await axios.get('https://api.nal.usda.gov/fdc/v1/foods/search', {
      params: {
        query: dish_name,
        api_key: process.env.USDA_API_KEY,
        pageSize: 5
      }
    });

    const { foods } = response.data;

    if (!foods || foods.length === 0) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    // Find best match
    const bestMatch = foods[0];
    
    // Get nutrients
    const nutrients = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };

    bestMatch.foodNutrients.forEach(nutrient => {
      if (nutrient.nutrientName === 'Energy' && nutrient.unitName === 'KCAL') {
        nutrients.calories = nutrient.value;
      } else if (nutrient.nutrientName === 'Protein') {
        nutrients.protein = nutrient.value;
      } else if (nutrient.nutrientName === 'Carbohydrate, by difference') {
        nutrients.carbs = nutrient.value;
      } else if (nutrient.nutrientName === 'Total lipid (fat)') {
        nutrients.fat = nutrient.value;
      }
    });

    // Calculate total values
    const result = {
      dish_name: dish_name,
      servings: servings,
      calories_per_serving: nutrients.calories,
      total_calories: nutrients.calories * servings,
      macronutrients: {
        protein_per_serving: nutrients.protein,
        total_protein: nutrients.protein * servings,
        carbs_per_serving: nutrients.carbs,
        total_carbs: nutrients.carbs * servings,
        fat_per_serving: nutrients.fat,
        total_fat: nutrients.fat * servings
      },
      source: 'USDA FoodData Central'
    };

    // Cache the result
    cache.set(cacheKey, result);

    res.json(result);
  } catch (error) {
    console.error('Error fetching nutrition info:', error);
    
    if (error.response && error.response.status === 429) {
      return res.status(429).json({ message: 'Rate limit exceeded for USDA API' });
    }
    
    res.status(500).json({ message: 'Error fetching nutrition information' });
  }
};
