import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tripsAPI } from '../api/trips';
import TripCard from '../components/TripCard';
import { TripCardSkeleton } from '../components/SkeletonLoader';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalExpenses: 0,
    topSpendingTrip: null,
  });

  useEffect(() => {
    fetchTrips();
  }, [filter, search]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await tripsAPI.getAll({ filter, search });
      if (response.data.success) {
        setTrips(response.data.data);
        calculateStats(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (tripsData) => {
    let totalExpenses = 0;
    let topSpending = null;
    let maxSpending = 0;

    tripsData.forEach((trip) => {
      if (trip.budget > maxSpending) {
        maxSpending = trip.budget;
        topSpending = trip;
      }
      totalExpenses += trip.budget || 0;
    });

    setStats({
      totalTrips: tripsData.length,
      totalExpenses,
      topSpendingTrip: topSpending,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">My Trips</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage and track all your travel adventures</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Trips</p>
              <p className="text-3xl font-bold mt-1">{stats.totalTrips}</p>
            </div>
            <div className="text-4xl">✈️</div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Budget</p>
              <p className="text-3xl font-bold mt-1">
                ₹{stats.totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Top Spending</p>
              <p className="text-xl font-bold mt-1 truncate">
                {stats.topSpendingTrip?.title || 'N/A'}
              </p>
              {stats.topSpendingTrip && (
                <p className="text-green-100 text-sm">
                  ₹{stats.topSpendingTrip.budget?.toLocaleString()}
                </p>
              )}
            </div>
            <div className="text-4xl">🏆</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search trips by name or destination..."
            className="input-field w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('ongoing')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'ongoing'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Ongoing
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'past'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      {/* Trips Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <TripCardSkeleton key={i} />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✈️</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No trips found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {search || filter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start planning your first trip!'}
          </p>
          {!search && filter === 'all' && (
            <Link to="/create-trip" className="btn-primary inline-block">
              Create Your First Trip
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCard key={trip._id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

