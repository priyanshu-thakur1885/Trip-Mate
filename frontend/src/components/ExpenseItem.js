import React from 'react';
import { format } from 'date-fns';

const ExpenseItem = ({ expense, onEdit, onDelete, canEdit }) => {
  const categoryColors = {
    Travel: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    Food: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    Stay: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    Shopping: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
    Activities: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    Misc: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  };

  return (
    <div className="card mb-4 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{expense.title}</h4>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                categoryColors[expense.category] || categoryColors.Misc
              }`}
            >
              {expense.category}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span>💰 ₹{expense.amount.toLocaleString()}</span>
            <span>👤 {expense.paidBy?.name || 'Unknown'}</span>
            <span>📅 {format(new Date(expense.date), 'MMM dd, yyyy')}</span>
          </div>
        </div>
        {canEdit && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(expense)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(expense._id)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
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

