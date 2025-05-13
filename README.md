# Meal Calorie Counter Application

A full-stack application that allows users to search for foods, track their calorie intake, and monitor their nutrition. The application uses the USDA FoodData Central API to provide accurate nutrition information.

## Features

### Backend Features
- User authentication (register, login)
- Dish search using USDA FoodData Central API
- Calorie calculation based on servings
- Macronutrient information (protein, carbs, fat)
- Meal logging and tracking
- Nutrition summary and analytics
- Rate limiting to prevent API abuse
- Response caching for improved performance

### Frontend Features
- Modern, responsive UI built with React and Material-UI
- User authentication with JWT
- Food search with partial matching
- Detailed nutrition information display
- Meal logging and tracking
- Nutrition summary with charts and analytics
- User profile management

## Tech Stack

### Backend
- Node.js with Express
- MongoDB for data storage
- JWT for authentication
- USDA FoodData Central API for nutrition data

### Frontend
- React with hooks
- Material-UI for components
- React Router for navigation
- Axios for API requests
- Recharts for data visualization

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- USDA FoodData Central API key

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://your-mongodb-connection-string
   JWT_SECRET=your_jwt_secret_key
   USDA_API_KEY=your_usda_api_key
   ```
   Get your USDA API key from: https://fdc.nal.usda.gov/api-key-signup.html

### Running the Application

#### Development Mode (Backend and Frontend concurrently)
```
npm run dev
```

#### Backend Only
```
npm run server
```

#### Frontend Only
```
npm run client
```

#### Production Mode
```
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get user profile (requires authentication)

### Calorie Calculation

- `POST /api/calories/get-calories` - Get calories for a dish
- `POST /api/calories/get-nutrition` - Get extended nutrition info including macronutrients
- `POST /api/calories/search-foods` - Search for foods with partial matching
- `POST /api/calories/get-nutrition-by-id` - Get nutrition by food ID

### Meal Logging

- `POST /api/meal-log/add` - Add a meal to the log
- `GET /api/meal-log` - Get user's meal log
- `DELETE /api/meal-log/:id` - Delete a meal from the log
- `GET /api/meal-log/summary` - Get meal summary by date range

## Testing

The application includes comprehensive test suites for both the backend API and frontend components.

### Running Backend Tests
```
npm test
```

### Running Frontend Tests
```
cd frontend
npm test
```

## Deployment

### Deploying on Render (Free Tier)

This application is configured for easy deployment on Render's free tier using the included `render.yaml` file.

#### Prerequisites

1. Create a [Render account](https://render.com/)
2. Push your code to a GitHub repository
3. Have your MongoDB connection string ready

#### Deployment Steps

1. **Log in to Render** and go to your dashboard

2. **Deploy using Blueprint**:
   - Click "New" and select "Blueprint"
   - Connect your GitHub repository
   - Render will detect the `render.yaml` file and suggest services to deploy
   - For the backend service, add these environment variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure random string for JWT token signing
     - `CLIENT_URL`: The URL of your frontend (will be auto-filled)
   - Click "Apply"

3. **Verify Deployment**:
   - Once deployed, your services will be available at:
     - Backend API: https://meal-tracker-api.onrender.com
     - Frontend: https://meal-tracker-frontend.onrender.com

#### Important Notes

- The free tier has some limitations:
  - Backend services spin down after 15 minutes of inactivity
  - The first request after inactivity may take a few seconds
  - Free MongoDB databases on Atlas have storage limitations
- For production use, consider upgrading to a paid tier

### Alternative Deployment Options

#### Backend Alternatives
The backend can also be deployed to other Node.js hosting platforms such as Heroku or Railway.

#### Frontend Alternatives
The React frontend can also be deployed to platforms like Netlify, Vercel, or GitHub Pages.

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Input validation with express-validator
- Rate limiting to prevent brute force attacks
- Environment variables for sensitive information
- CORS protection

## Scaling Considerations

- Database scaling with MongoDB Atlas
- Caching with Node-Cache (already implemented)
- Rate limiting to prevent abuse (already implemented)
- Containerization with Docker for easy deployment
- Load balancing for high traffic scenarios

## Future Enhancements

- User goal setting and tracking
- Recipe creation and saving
- Social sharing features
- Mobile app using React Native
- Advanced analytics and reporting
- Integration with fitness trackers and wearables
