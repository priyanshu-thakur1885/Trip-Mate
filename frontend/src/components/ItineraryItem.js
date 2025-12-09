import React from 'react';

const ItineraryItem = ({ item, onEdit, onDelete, canEdit }) => {
  return (
    <div className="card mb-4 hover:shadow-xl transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
            Day {item.day}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">{item.activity}</h4>
              <p className="text-sm text-gray-600">🕐 {item.time}</p>
            </div>
            {canEdit && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(item)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item._id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          {item.notes && (
            <p className="text-sm text-gray-600 mt-2">{item.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItineraryItem;

