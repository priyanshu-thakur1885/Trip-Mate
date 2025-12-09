import client from './client';

export const expensesAPI = {
  getByTrip: (tripId) =>
    client.get(`/expenses/${tripId}`),

  create: (tripId, data) =>
    client.post(`/expenses/${tripId}`, data),

  update: (id, data) =>
    client.put(`/expenses/${id}`, data),

  delete: (id) =>
    client.delete(`/expenses/${id}`),
};

