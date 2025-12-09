# Backend API - Travel App

## Setup Instructions

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment Variables**
Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/travel-app
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

3. **Start MongoDB**
Make sure MongoDB is running on your system or use MongoDB Atlas connection string.

4. **Run the Server**
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

All endpoints are prefixed with `/api`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user (protected)
- `POST /auth/logout` - Logout (protected)

### Trips
- `POST /trips` - Create trip (protected)
- `GET /trips?filter=upcoming&search=paris` - Get all trips (protected)
- `GET /trips/:id` - Get single trip (protected)
- `PUT /trips/:id` - Update trip (protected, creator only)
- `DELETE /trips/:id` - Delete trip (protected, creator only)
- `PUT /trips/:id/participants` - Add participant (protected)
- `DELETE /trips/:id/participants/:userId` - Remove participant (protected, creator only)

### Expenses
- `POST /expenses/:tripId` - Create expense (protected)
- `GET /expenses/:tripId` - Get all expenses for trip (protected)
- `PUT /expenses/:id` - Update expense (protected)
- `DELETE /expenses/:id` - Delete expense (protected)

### Itinerary
- `POST /itinerary/:tripId` - Create itinerary item (protected)
- `GET /itinerary/:tripId` - Get all itinerary items (protected)
- `PUT /itinerary/:id` - Update itinerary item (protected)
- `DELETE /itinerary/:id` - Delete itinerary item (protected)

### Tasks
- `POST /tasks/:tripId` - Create task (protected)
- `GET /tasks/:tripId` - Get all tasks (protected)
- `PUT /tasks/:id` - Update task (protected)
- `DELETE /tasks/:id` - Delete task (protected)

### Gallery
- `POST /gallery/:tripId` - Add photo (protected)
- `DELETE /gallery/:tripId/:photoId` - Delete photo (protected)

## Authentication

All protected routes require a JWT token in:
- Cookie: `token` (HTTP-only)
- Header: `Authorization: Bearer <token>`

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Success Responses

All success responses follow this format:
```json
{
  "success": true,
  "data": { ... }
}
```

