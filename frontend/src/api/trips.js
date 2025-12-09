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

  inviteParticipant: (id, email) =>
    client.put(`/trips/${id}/participants`, { email }),

  leaveTrip: (id) =>
    client.post(`/trips/${id}/leave`),

  removeParticipant: (id, userId) =>
    client.delete(`/trips/${id}/participants/${userId}`),
};
