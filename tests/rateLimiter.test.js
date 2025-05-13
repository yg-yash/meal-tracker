const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const rateLimiter = require('../middleware/rateLimiter');

// For testing rate limiting, we need to modify the rate limiter settings
// This is a mock implementation for testing purposes
jest.mock('../middleware/rateLimiter', () => {
  const rateLimit = require('express-rate-limit');
  return rateLimit({
    windowMs: 1000, // 1 second window for testing
    max: 3, // Only allow 3 requests per window for testing
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: 'Too many requests, please try again later.'
    }
  });
});

// Test user data
const testUser = {
  firstName: 'Rate',
  lastName: 'Limiter',
  email: 'rate-test@example.com',
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
    console.error('Error setting up rate limiter tests:', error);
  }
});

// Disconnect from database after tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Rate Limiting', () => {
  // Test that rate limiting works
  test('Should enforce rate limits', async () => {
    // Make multiple requests in quick succession
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(
        request(app)
          .post('/api/calories/get-calories')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            dish_name: 'pizza',
            servings: 1
          })
      );
    }
    
    // Execute all requests
    const responses = await Promise.all(requests);
    
    // Check that some requests were rate limited
    // The first 3 should succeed (status 200) and the rest should be rate limited (status 429)
    let successCount = 0;
    let rateLimitedCount = 0;
    
    responses.forEach(response => {
      if (response.statusCode === 200) {
        successCount++;
      } else if (response.statusCode === 429) {
        rateLimitedCount++;
      }
    });
    
    // We expect 3 successful responses and 2 rate limited responses
    expect(successCount).toBeGreaterThan(0);
    expect(rateLimitedCount).toBeGreaterThan(0);
    expect(successCount + rateLimitedCount).toBe(5);
  });
  
  // Test rate limit message
  test('Should return appropriate rate limit message', async () => {
    // Make multiple requests to trigger rate limiting
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(
        request(app)
          .post('/api/calories/get-nutrition')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            dish_name: 'burger',
            servings: 1
          })
      );
    }
    
    // Execute all requests
    const responses = await Promise.all(requests);
    
    // Find a rate-limited response
    const rateLimitedResponse = responses.find(response => response.statusCode === 429);
    
    // If we found a rate-limited response, check its message
    if (rateLimitedResponse) {
      expect(rateLimitedResponse.body).toHaveProperty('message', 'Too many requests, please try again later.');
    } else {
      // If no rate-limited response was found, fail the test
      fail('No rate-limited response was found');
    }
  });
});
