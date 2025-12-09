import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tripsAPI } from '../api/trips';
import { expensesAPI } from '../api/expenses';
import { itineraryAPI } from '../api/itinerary';
import { tasksAPI } from '../api/tasks';
import { galleryAPI } from '../api/gallery';
import { useAuth } from '../context/AuthContext';
import ExpenseItem from '../components/ExpenseItem';
import ExpenseChart from '../components/ExpenseChart';
import ItineraryItem from '../components/ItineraryItem';
import TaskItem from '../components/TaskItem';
import GalleryGrid from '../components/GalleryGrid';
import Chat from '../components/Chat';
import toast from 'react-hot-toast';

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchTripData();
  }, [id]);

  const fetchTripData = async () => {
    try {
      setLoading(true);
      const [tripRes, expensesRes, itineraryRes, tasksRes] = await Promise.all([
        tripsAPI.getById(id),
        expensesAPI.getByTrip(id),
        itineraryAPI.getByTrip(id),
        tasksAPI.getByTrip(id),
      ]);

      if (tripRes.data.success) {
        setTrip(tripRes.data.data);
      }
      if (expensesRes.data.success) {
        setExpenses(expensesRes.data.data);
      }
      if (itineraryRes.data.success) {
        setItinerary(itineraryRes.data.data);
      }
      if (tasksRes.data.success) {
        setTasks(tasksRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to load trip data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const isCreator = trip?.createdBy?._id === user?._id;
  const canEdit = isCreator || trip?.participants?.some((p) => p._id === user?._id);

  // Expense handlers
  const handleAddExpense = async (expenseData) => {
    try {
      if (editingItem) {
        await expensesAPI.update(editingItem._id, expenseData);
        toast.success('Expense updated');
      } else {
        await expensesAPI.create(id, expenseData);
        toast.success('Expense added');
      }
      setShowExpenseModal(false);
      setEditingItem(null);
      fetchTripData();
    } catch (error) {
      toast.error('Failed to save expense');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expensesAPI.delete(expenseId);
        toast.success('Expense deleted');
        fetchTripData();
      } catch (error) {
        toast.error('Failed to delete expense');
      }
    }
  };

  // Itinerary handlers
  const handleAddItinerary = async (itineraryData) => {
    try {
      if (editingItem) {
        await itineraryAPI.update(editingItem._id, itineraryData);
        toast.success('Itinerary updated');
      } else {
        await itineraryAPI.create(id, itineraryData);
        toast.success('Itinerary item added');
      }
      setShowItineraryModal(false);
      setEditingItem(null);
      fetchTripData();
    } catch (error) {
      toast.error('Failed to save itinerary');
    }
  };

  const handleDeleteItinerary = async (itineraryId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await itineraryAPI.delete(itineraryId);
        toast.success('Item deleted');
        fetchTripData();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  // Task handlers
  const handleAddTask = async (taskData) => {
    try {
      if (editingItem) {
        await tasksAPI.update(editingItem._id, taskData);
        toast.success('Task updated');
      } else {
        await tasksAPI.create(id, taskData);
        toast.success('Task added');
      }
      setShowTaskModal(false);
      setEditingItem(null);
      fetchTripData();
    } catch (error) {
      toast.error('Failed to save task');
    }
  };

  const handleToggleTask = async (taskId) => {
    const task = tasks.find((t) => t._id === taskId);
    if (task) {
      try {
        await tasksAPI.update(taskId, {
          status: task.status === 'complete' ? 'pending' : 'complete',
        });
        fetchTripData();
      } catch (error) {
        toast.error('Failed to update task');
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksAPI.delete(taskId);
        toast.success('Task deleted');
        fetchTripData();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  // Gallery handlers
  const handleAddPhoto = async (file) => {
    try {
      await galleryAPI.addPhoto(id, file);
      toast.success('Photo/Video added successfully');
      setShowGalleryModal(false);
      fetchTripData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add photo/video');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        await galleryAPI.deletePhoto(id, photoId);
        toast.success('Photo deleted');
        fetchTripData();
      } catch (error) {
        toast.error('Failed to delete photo');
      }
    }
  };

  const handleLeaveTrip = async () => {
    if (window.confirm('Are you sure you want to leave this trip? You will lose access to all trip details.')) {
      try {
        await tripsAPI.leaveTrip(id);
        toast.success('You have left the trip');
        navigate('/dashboard');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to leave trip');
      }
    }
  };

  const handleDeleteTrip = async () => {
    if (window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      try {
        await tripsAPI.delete(id);
        toast.success('Trip deleted');
        navigate('/dashboard');
      } catch (error) {
        toast.error('Failed to delete trip');
      }
    }
  };

  // Participant handlers (only for trip creator)
  const handleInviteParticipant = async (email) => {
    try {
      await tripsAPI.inviteParticipant(id, email);
      toast.success('Invitation sent successfully');
      setShowAddParticipantModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    }
  };

  const handleRemoveParticipant = async (userId) => {
    if (window.confirm('Are you sure you want to remove this participant?')) {
      try {
        await tripsAPI.removeParticipant(id, userId);
        toast.success('Participant removed');
        fetchTripData();
      } catch (error) {
        toast.error('Failed to remove participant');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Trip not found</h2>
          <button onClick={() => navigate('/dashboard')} className="btn-primary mt-4">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const completedTasks = tasks.filter((t) => t.status === 'complete').length;
  const totalTasks = tasks.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
        >
          ← Back to Dashboard
        </button>
        {trip.coverImage && (
          <div className="h-64 rounded-xl overflow-hidden mb-6">
            <img
              src={trip.coverImage}
              alt={trip.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{trip.title}</h1>
            <p className="text-xl text-gray-600 mb-4">📍 {trip.destination}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>📅 {format(new Date(trip.startDate), 'MMM dd, yyyy')}</span>
              <span>→</span>
              <span>{format(new Date(trip.endDate), 'MMM dd, yyyy')}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {!isCreator && canEdit && (
              <button
                onClick={handleLeaveTrip}
                className="text-orange-600 hover:text-orange-800 font-medium"
              >
                Leave Trip
              </button>
            )}
            {isCreator && (
              <button
                onClick={handleDeleteTrip}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Delete Trip
              </button>
            )}
          </div>
        </div>
        {trip.description && (
          <p className="mt-4 text-gray-700">{trip.description}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['overview', 'expenses', 'itinerary', 'tasks', 'gallery', 'chat'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Budget</h3>
                <p className="text-3xl font-bold text-blue-600">
                  ${trip.budget?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Expenses</h3>
                <p className="text-3xl font-bold text-purple-600">
                  ${totalExpenses.toLocaleString()}
                </p>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Remaining</h3>
                <p className="text-3xl font-bold text-green-600">
                  ${((trip.budget || 0) - totalExpenses).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Participants</h3>
                {isCreator && (
                  <button
                    onClick={() => setShowAddParticipantModal(true)}
                    className="btn-primary text-sm"
                  >
                    + Invite Participant
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {trip.participants?.map((participant) => (
                  <div
                    key={participant._id}
                    className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                      {participant.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">{participant.name}</span>
                    {participant._id === trip.createdBy?._id && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                        Creator
                      </span>
                    )}
                    {isCreator && participant._id !== trip.createdBy?._id && (
                      <button
                        onClick={() => handleRemoveParticipant(participant._id)}
                        className="text-red-600 hover:text-red-800 text-sm ml-2"
                        title="Remove participant"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Tasks Progress</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-600 h-4 rounded-full transition-all"
                    style={{
                      width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {completedTasks} / {totalTasks} completed
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
              {canEdit && (
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setShowExpenseModal(true);
                  }}
                  className="btn-primary"
                >
                  + Add Expense
                </button>
              )}
            </div>

            <ExpenseChart expenses={expenses} />

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Expense List</h3>
              {expenses.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No expenses yet. Add your first expense!</p>
                </div>
              ) : (
                expenses.map((expense) => (
                  <ExpenseItem
                    key={expense._id}
                    expense={expense}
                    onEdit={(exp) => {
                      setEditingItem(exp);
                      setShowExpenseModal(true);
                    }}
                    onDelete={handleDeleteExpense}
                    canEdit={canEdit}
                  />
                ))
              )}
            </div>

            {showExpenseModal && (
              <ExpenseModal
                expense={editingItem}
                onClose={() => {
                  setShowExpenseModal(false);
                  setEditingItem(null);
                }}
                onSave={handleAddExpense}
                participants={trip.participants}
              />
            )}
          </div>
        )}

        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Itinerary</h2>
              {canEdit && (
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setShowItineraryModal(true);
                  }}
                  className="btn-primary"
                >
                  + Add Item
                </button>
              )}
            </div>

            {itinerary.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No itinerary items yet. Start planning your trip!</p>
              </div>
            ) : (
              itinerary.map((item) => (
                <ItineraryItem
                  key={item._id}
                  item={item}
                  onEdit={(it) => {
                    setEditingItem(it);
                    setShowItineraryModal(true);
                  }}
                  onDelete={handleDeleteItinerary}
                  canEdit={canEdit}
                />
              ))
            )}

            {showItineraryModal && (
              <ItineraryModal
                item={editingItem}
                onClose={() => {
                  setShowItineraryModal(false);
                  setEditingItem(null);
                }}
                onSave={handleAddItinerary}
              />
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Tasks & Checklist</h2>
              {canEdit && (
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setShowTaskModal(true);
                  }}
                  className="btn-primary"
                >
                  + Add Task
                </button>
              )}
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No tasks yet. Create your first task!</p>
              </div>
            ) : (
              <div>
                {tasks.map((task) => (
                  <TaskItem
                    key={task._id}
                    task={task}
                    onToggle={handleToggleTask}
                    onEdit={(t) => {
                      setEditingItem(t);
                      setShowTaskModal(true);
                    }}
                    onDelete={handleDeleteTask}
                    canEdit={canEdit}
                    participants={trip.participants}
                  />
                ))}
              </div>
            )}

            {showTaskModal && (
              <TaskModal
                task={editingItem}
                onClose={() => {
                  setShowTaskModal(false);
                  setEditingItem(null);
                }}
                onSave={handleAddTask}
                participants={trip.participants}
              />
            )}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Photo Gallery</h2>
              {canEdit && (
                <button
                  onClick={() => setShowGalleryModal(true)}
                  className="btn-primary"
                >
                  + Add Photo
                </button>
              )}
            </div>

            <GalleryGrid
              photos={trip.gallery || []}
              onDelete={handleDeletePhoto}
              canEdit={canEdit}
            />

            {showGalleryModal && (
              <GalleryModal
                onClose={() => setShowGalleryModal(false)}
                onSave={handleAddPhoto}
              />
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Trip Chat</h2>
            </div>
            <Chat tripId={id} />
          </div>
        )}

        {showAddParticipantModal && (
          <AddParticipantModal
            onClose={() => setShowAddParticipantModal(false)}
            onInvite={handleInviteParticipant}
          />
        )}
      </div>
    </div>
  );
};

// Modal Components
const ExpenseModal = ({ expense, onClose, onSave, participants }) => {
  const [formData, setFormData] = useState({
    title: expense?.title || '',
    amount: expense?.amount || '',
    category: expense?.category || 'Misc',
    date: expense?.date ? format(new Date(expense.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      amount: parseFloat(formData.amount),
    });
  };

  return (
    <Modal onClose={onClose} title={expense ? 'Edit Expense' : 'Add Expense'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            required
            className="input-field"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            className="input-field"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            className="input-field"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="Travel">Travel</option>
            <option value="Food">Food</option>
            <option value="Stay">Stay</option>
            <option value="Shopping">Shopping</option>
            <option value="Activities">Activities</option>
            <option value="Misc">Misc</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            required
            className="input-field"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};

const ItineraryModal = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    day: item?.day || 1,
    activity: item?.activity || '',
    time: item?.time || '',
    notes: item?.notes || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal onClose={onClose} title={item ? 'Edit Itinerary' : 'Add Itinerary'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
          <input
            type="number"
            min="1"
            required
            className="input-field"
            value={formData.day}
            onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Activity</label>
          <input
            type="text"
            required
            className="input-field"
            value={formData.activity}
            onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <input
            type="text"
            required
            className="input-field"
            placeholder="e.g., 9:00 AM"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            className="input-field"
            rows="3"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};

const TaskModal = ({ task, onClose, onSave, participants }) => {
  const [formData, setFormData] = useState({
    task: task?.task || '',
    assignedTo: task?.assignedTo?._id || '',
    status: task?.status || 'pending',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      assignedTo: formData.assignedTo || null,
    });
  };

  return (
    <Modal onClose={onClose} title={task ? 'Edit Task' : 'Add Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
          <input
            type="text"
            required
            className="input-field"
            value={formData.task}
            onChange={(e) => setFormData({ ...formData, task: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
          <select
            className="input-field"
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
          >
            <option value="">Unassigned</option>
            {participants?.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            className="input-field"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="pending">Pending</option>
            <option value="complete">Complete</option>
          </select>
        </div>
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};

const GalleryModal = ({ onClose, onSave }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
        alert('Please select an image or video file');
        return;
      }
      
      // Validate file size (50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }

      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      setIsUploading(true);
      try {
        await onSave(file);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <Modal onClose={onClose} title="Add Photo/Video">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Photo or Video
          </label>
          <input
            type="file"
            accept="image/*,video/*"
            required
            className="input-field"
            onChange={handleFileChange}
          />
          {preview && (
            <div className="mt-4">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full h-48 object-contain rounded-lg border border-gray-300"
              />
            </div>
          )}
          {file && !preview && file.type.startsWith('video/') && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                Video selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isUploading || !file}
          >
            {isUploading ? 'Uploading...' : 'Add Photo/Video'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const AddParticipantModal = ({ onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setIsSending(true);
    try {
      await onInvite(email);
      setEmail('');
    } catch (error) {
      // Error is handled in parent component
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Invite Participant">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter Registered Email
          </label>
          <input
            type="email"
            required
            className="input-field"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSending}
          />
          <p className="text-xs text-gray-500 mt-1">
            An invitation will be sent to this user. They can accept or reject it.
          </p>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={isSending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSending}
          >
            {isSending ? 'Sending...' : 'Send Invitation'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const Modal = ({ onClose, title, children }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default TripDetail;

