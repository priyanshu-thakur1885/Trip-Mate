import client from './client';

export const tripsAPI = {
  getAll: (params = {}) =>
    client.get('/trips', { params }),

  getById: (id) =>
    client.get(`/trips/${id}`),

  create: (data) =>
    client.post('/trips', data),

  update: (id, data) =>
    client.put(`/trips/${id}`, data),

  delete: (id) =>
    client.delete(`/trips/${id}`),

  addParticipant: (id, userId) =>
    client.put(`/trips/${id}/participants`, { userId }),

  removeParticipant: (id, userId) =>
    client.delete(`/trips/${id}/participants/${userId}`),
};

