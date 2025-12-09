import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const TripCard = ({ trip }) => {
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const isUpcoming = startDate > new Date();
  const isPast = endDate < new Date();
  const isOngoing = startDate <= new Date() && endDate >= new Date();

  return (
    <Link to={`/trip/${trip._id}`}>
      <div className="card hover:scale-105 cursor-pointer h-full">
        {trip.coverImage && (
          <div className="h-48 rounded-lg overflow-hidden mb-4">
            <img
              src={trip.coverImage}
              alt={trip.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900 truncate">{trip.title}</h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              isUpcoming
                ? 'bg-blue-100 text-blue-800'
                : isPast
                ? 'bg-gray-100 text-gray-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {isUpcoming ? 'Upcoming' : isPast ? 'Past' : 'Ongoing'}
          </span>
        </div>
        <p className="text-gray-600 mb-2">📍 {trip.destination}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd, yyyy')}
          </span>
          <span className="font-semibold text-blue-600">
            ${trip.budget?.toLocaleString() || '0'}
          </span>
        </div>
        {trip.participants && trip.participants.length > 0 && (
          <div className="mt-3 flex items-center space-x-2">
            <div className="flex -space-x-2">
              {trip.participants.slice(0, 3).map((participant, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                >
                  {participant.name?.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            {trip.participants.length > 3 && (
              <span className="text-sm text-gray-500">
                +{trip.participants.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default TripCard;

