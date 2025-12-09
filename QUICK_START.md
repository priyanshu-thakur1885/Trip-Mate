# Quick Start Guide

## Prerequisites
- Node.js (v14+) installed
- MongoDB running locally or MongoDB Atlas account

## Step 1: Backend Setup

```bash
cd travel-mern-app/backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/travel-app
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Start backend:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

## Step 2: Frontend Setup

Open a new terminal:

```bash
cd travel-mern-app/frontend
npm install
```

(Optional) Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm start
```

Frontend will open at `http://localhost:3000`

## Step 3: Use the App

1. Register a new account
2. Create your first trip
3. Add expenses, itinerary items, tasks, and photos
4. View your dashboard with all trips

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running: `mongod` or use MongoDB Atlas
- Check your `MONGODB_URI` in `.env`

### Port Already in Use
- Change `PORT` in backend `.env` file
- Update `REACT_APP_API_URL` in frontend `.env` if needed

### CORS Errors
- Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Default is `http://localhost:3000`

## Production Deployment

### Backend
1. Set environment variables on your hosting platform
2. Use MongoDB Atlas for database
3. Set secure `JWT_SECRET`
4. Update `FRONTEND_URL` to production URL

### Frontend
1. Set `REACT_APP_API_URL` to production backend URL
2. Run `npm run build`
3. Deploy the `build` folder

