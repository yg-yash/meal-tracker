const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

// Test user data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'password123'
};

let authToken;

// Connect to test database before running tests
beforeAll(async () => {
  // Clear users collection before tests
  try {
    await User.deleteMany({ email: testUser.email });
  } catch (error) {
    console.error('Error clearing test users:', error);
  }
});

// Disconnect from database after tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Authentication Endpoints', () => {
  // Test user registration
  test('Should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('email', testUser.email);
  });

  // Test duplicate user registration
  test('Should not register a duplicate user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'User already exists');
  });

  // Test login
  test('Should login a user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    
    // Save token for profile test
    authToken = response.body.token;
  });

  // Test invalid login
  test('Should not login with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      });
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'Invalid credentials');
  });

  // Test profile access
  test('Should get user profile with valid token', async () => {
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('email', testUser.email);
  });

  // Test unauthorized profile access
  test('Should not get profile without token', async () => {
    const response = await request(app)
      .get('/api/auth/profile');
    
    expect(response.statusCode).toBe(401);
  });
});
