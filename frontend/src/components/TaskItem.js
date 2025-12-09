import React from 'react';

const TaskItem = ({ task, onToggle, onEdit, onDelete, canEdit, participants }) => {
  const assignedUser = participants?.find((p) => p._id === task.assignedTo?._id);

  return (
    <div className="card mb-3 hover:shadow-lg transition-shadow">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={task.status === 'complete'}
          onChange={() => onToggle(task._id)}
          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          disabled={!canEdit}
        />
        <div className="flex-1">
          <p
            className={`font-medium ${
              task.status === 'complete'
                ? 'line-through text-gray-500'
                : 'text-gray-900'
            }`}
          >
            {task.task}
          </p>
          {assignedUser && (
            <p className="text-sm text-gray-600 mt-1">
              👤 Assigned to: {assignedUser.name}
            </p>
          )}
        </div>
        {canEdit && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(task)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(task._id)}
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

export default TaskItem;

