const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

// Test user data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'calorie-test@example.com',
  password: 'password123'
};

let authToken;

// Connect to test database and create a test user before running tests
beforeAll(async () => {
  try {
    // Clear test user if exists
    await User.deleteMany({ email: testUser.email });
    
    // Register test user
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    authToken = response.body.token;
  } catch (error) {
    console.error('Error setting up calorie tests:', error);
  }
});

// Disconnect from database after tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Calorie Endpoints', () => {
  // Test getting calories for a valid dish
  test('Should get calories for macaroni and cheese', async () => {
    const response = await request(app)
      .post('/api/calories/get-calories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        dish_name: 'macaroni and cheese',
        servings: 2
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('dish_name', 'macaroni and cheese');
    expect(response.body).toHaveProperty('servings', 2);
    expect(response.body).toHaveProperty('calories_per_serving');
    expect(response.body).toHaveProperty('total_calories');
    expect(response.body.total_calories).toBe(response.body.calories_per_serving * 2);
  });

  // Test getting calories for another valid dish
  test('Should get calories for grilled salmon', async () => {
    const response = await request(app)
      .post('/api/calories/get-calories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        dish_name: 'grilled salmon',
        servings: 1
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('dish_name', 'grilled salmon');
    expect(response.body).toHaveProperty('calories_per_serving');
  });

  // Test getting calories for a third valid dish
  test('Should get calories for paneer butter masala', async () => {
    const response = await request(app)
      .post('/api/calories/get-calories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        dish_name: 'paneer butter masala',
        servings: 3
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('dish_name', 'paneer butter masala');
    expect(response.body).toHaveProperty('servings', 3);
  });

  // Test with non-existent dish
  test('Should handle non-existent dish', async () => {
    const response = await request(app)
      .post('/api/calories/get-calories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        dish_name: 'xyznonexistentfooditem',
        servings: 1
      });
    
    expect(response.statusCode).toBe(404);
  });

  // Test with zero servings
  test('Should reject zero servings', async () => {
    const response = await request(app)
      .post('/api/calories/get-calories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        dish_name: 'pizza',
        servings: 0
      });
    
    expect(response.statusCode).toBe(400);
  });

  // Test with negative servings
  test('Should reject negative servings', async () => {
    const response = await request(app)
      .post('/api/calories/get-calories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        dish_name: 'pizza',
        servings: -2
      });
    
    expect(response.statusCode).toBe(400);
  });

  // Test without authentication
  test('Should require authentication', async () => {
    const response = await request(app)
      .post('/api/calories/get-calories')
      .send({
        dish_name: 'pizza',
        servings: 1
      });
    
    expect(response.statusCode).toBe(401);
  });

  // Test extended nutrition info
  test('Should get extended nutrition info', async () => {
    const response = await request(app)
      .post('/api/calories/get-nutrition')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        dish_name: 'chicken biryani',
        servings: 2
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('macronutrients');
    expect(response.body.macronutrients).toHaveProperty('protein_per_serving');
    expect(response.body.macronutrients).toHaveProperty('carbs_per_serving');
    expect(response.body.macronutrients).toHaveProperty('fat_per_serving');
  });

  // Test handling of multiple similar matches
  test('Should handle multiple similar matches', async () => {
    const response = await request(app)
      .post('/api/calories/get-calories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        dish_name: 'chicken', // This will return many similar matches
        servings: 1
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('dish_name', 'chicken');
    expect(response.body).toHaveProperty('calories_per_serving');
    expect(response.body).toHaveProperty('total_calories');
    expect(response.body).toHaveProperty('source', 'USDA FoodData Central');
  });
});
