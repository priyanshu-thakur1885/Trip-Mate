import client from './client';

export const notificationsAPI = {
  getAll: (unreadOnly = false) =>
    client.get('/notifications', { params: { unreadOnly } }),
  markAsRead: (id) => client.put(`/notifications/${id}/read`),
  markAllAsRead: () => client.put('/notifications/read-all'),
  delete: (id) => client.delete(`/notifications/${id}`),
};


