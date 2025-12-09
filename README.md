# Travel / Trip Management App - MERN Stack

A complete, production-ready travel and trip management application built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## 🚀 Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Trip Management**: Create, view, update, and delete trips
- **Expense Tracking**: Track expenses by category with visual charts
- **Itinerary Planning**: Day-wise activity planning with timings and notes
- **Task Management**: Create and track tasks with assignment to participants
- **Photo Gallery**: Upload and manage trip photos with lightbox preview
- **Dashboard**: View all trips with search, filters, and statistics
- **Responsive Design**: Modern UI with TailwindCSS, fully responsive

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd travel-mern-app/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/travel-app
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

4. Start the backend server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd travel-mern-app/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
travel-mern-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── tripController.js
│   │   │   ├── expenseController.js
│   │   │   ├── itineraryController.js
│   │   │   ├── taskController.js
│   │   │   └── galleryController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Trip.js
│   │   │   ├── Expense.js
│   │   │   ├── Itinerary.js
│   │   │   └── Task.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── tripRoutes.js
│   │   │   ├── expenseRoutes.js
│   │   │   ├── itineraryRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   └── galleryRoutes.js
│   │   └── utils/
│   │       └── generateToken.js
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   │   ├── client.js
    │   │   ├── auth.js
    │   │   ├── trips.js
    │   │   ├── expenses.js
    │   │   ├── itinerary.js
    │   │   ├── tasks.js
    │   │   └── gallery.js
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── ProtectedRoute.js
    │   │   ├── TripCard.js
    │   │   ├── ExpenseItem.js
    │   │   ├── ExpenseChart.js
    │   │   ├── ItineraryItem.js
    │   │   ├── TaskItem.js
    │   │   ├── GalleryGrid.js
    │   │   └── SkeletonLoader.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js
    │   │   ├── CreateTrip.js
    │   │   └── TripDetail.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── package.json
    └── tailwind.config.js
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Trips
- `POST /api/trips` - Create a new trip
- `GET /api/trips` - Get all trips (with filters and search)
- `GET /api/trips/:id` - Get a single trip
- `PUT /api/trips/:id` - Update a trip
- `DELETE /api/trips/:id` - Delete a trip
- `PUT /api/trips/:id/participants` - Add participant
- `DELETE /api/trips/:id/participants/:userId` - Remove participant

### Expenses
- `POST /api/expenses/:tripId` - Create an expense
- `GET /api/expenses/:tripId` - Get all expenses for a trip
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense

### Itinerary
- `POST /api/itinerary/:tripId` - Create an itinerary item
- `GET /api/itinerary/:tripId` - Get all itinerary items for a trip
- `PUT /api/itinerary/:id` - Update an itinerary item
- `DELETE /api/itinerary/:id` - Delete an itinerary item

### Tasks
- `POST /api/tasks/:tripId` - Create a task
- `GET /api/tasks/:tripId` - Get all tasks for a trip
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Gallery
- `POST /api/gallery/:tripId` - Add a photo to gallery
- `DELETE /api/gallery/:tripId/:photoId` - Delete a photo

## 🎨 Tech Stack

### Frontend
- React 18
- React Router v6
- TailwindCSS
- Axios
- React Hot Toast
- Recharts (for expense charts)
- date-fns (for date formatting)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- cookie-parser

## 🔒 Security Features

- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt
- Protected routes on frontend
- Authentication middleware on backend
- Input validation
- Error handling

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop
- Tablet
- Mobile devices

## 🚀 Deployment

### Backend Deployment (e.g., Heroku, Railway, Render)
1. Set environment variables in your hosting platform
2. Update `MONGODB_URI` to your production MongoDB connection string
3. Update `FRONTEND_URL` to your frontend URL
4. Deploy the backend

### Frontend Deployment (e.g., Vercel, Netlify)
1. Set `REACT_APP_API_URL` to your backend API URL
2. Build the project: `npm run build`
3. Deploy the build folder

## 📝 Notes

- Make sure MongoDB is running before starting the backend
- Update JWT_SECRET to a secure random string in production
- The app uses HTTP-only cookies for JWT storage (more secure)
- All API calls include authentication tokens automatically

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the MIT License.

