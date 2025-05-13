/**
 * API configuration for the application
 * This centralizes all API URL handling to make deployment easier
 */

// Base API URL - uses environment variable in production or localhost in development
const API_BASE_URL = "https://xcel-pros.onrender.com"

// API endpoints
const API = {
  // Auth endpoints
  auth: {
    register: `${API_BASE_URL}/api/auth/register`,
    login: `${API_BASE_URL}/api/auth/login`,
    profile: `${API_BASE_URL}/api/auth/profile`,
    updateProfile: `${API_BASE_URL}/api/auth/update-profile`,
  },
  
  // Calorie endpoints
  calories: {
    search: `${API_BASE_URL}/api/calories/search-foods`,
    getNutritionById: `${API_BASE_URL}/api/calories/get-nutrition-by-id`,
    getCalories: `${API_BASE_URL}/api/calories/get-calories`,
    getNutrition: `${API_BASE_URL}/api/calories/get-nutrition`,
  },
  
  // Meal log endpoints
  mealLog: {
    add: `${API_BASE_URL}/api/meal-log/add`,
    getAll: `${API_BASE_URL}/api/meal-log`,
    delete: (id) => `${API_BASE_URL}/api/meal-log/${id}`,
    summary: `${API_BASE_URL}/api/meal-log/summary`,
  }
};

export default API;
