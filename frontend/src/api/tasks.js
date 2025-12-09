import client from './client';

export const tasksAPI = {
  getByTrip: (tripId) =>
    client.get(`/tasks/${tripId}`),

  create: (tripId, data) =>
    client.post(`/tasks/${tripId}`, data),

  update: (id, data) =>
    client.put(`/tasks/${id}`, data),

  delete: (id) =>
    client.delete(`/tasks/${id}`),
};

