import React from 'react';

export const TripCardSkeleton = () => {
  return (
    <div className="card">
      <div className="skeleton h-48 rounded-lg mb-4"></div>
      <div className="skeleton h-6 w-3/4 mb-2"></div>
      <div className="skeleton h-4 w-1/2 mb-4"></div>
      <div className="skeleton h-4 w-full"></div>
    </div>
  );
};

export const ExpenseSkeleton = () => {
  return (
    <div className="card mb-4">
      <div className="skeleton h-5 w-1/3 mb-2"></div>
      <div className="skeleton h-4 w-1/2"></div>
    </div>
  );
};

