import React from 'react';
import { format } from 'date-fns';

const ExpenseItem = ({ expense, onEdit, onDelete, canEdit }) => {
  const categoryColors = {
    Travel: 'bg-blue-100 text-blue-800',
    Food: 'bg-orange-100 text-orange-800',
    Stay: 'bg-purple-100 text-purple-800',
    Shopping: 'bg-pink-100 text-pink-800',
    Activities: 'bg-green-100 text-green-800',
    Misc: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="card mb-4 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="font-semibold text-gray-900">{expense.title}</h4>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                categoryColors[expense.category] || categoryColors.Misc
              }`}
            >
              {expense.category}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>💰 ${expense.amount.toLocaleString()}</span>
            <span>👤 {expense.paidBy?.name || 'Unknown'}</span>
            <span>📅 {format(new Date(expense.date), 'MMM dd, yyyy')}</span>
          </div>
        </div>
        {canEdit && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(expense)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(expense._id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseItem;

