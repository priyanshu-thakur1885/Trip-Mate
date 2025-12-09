# Frontend - Travel App

## Setup Instructions

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment Variables (Optional)**
Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

3. **Start Development Server**
```bash
npm start
```

The app will open at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Features

- **Authentication**: Login and Register pages
- **Dashboard**: View all trips with search and filters
- **Trip Management**: Create, view, edit, and delete trips
- **Expense Tracking**: Add expenses with category-wise charts
- **Itinerary**: Day-wise activity planning
- **Tasks**: Create and manage trip tasks
- **Gallery**: Upload and view trip photos

## Tech Stack

- React 18
- React Router v6
- TailwindCSS
- Axios
- React Hot Toast
- Recharts
- date-fns

## Project Structure

```
src/
├── api/          # API service functions
├── components/    # Reusable UI components
├── context/       # React Context (Auth)
├── pages/         # Page components
├── App.js         # Main app component
└── index.js       # Entry point
```

