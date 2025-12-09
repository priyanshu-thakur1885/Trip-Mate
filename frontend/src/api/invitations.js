import client from './client';

export const invitationsAPI = {
  getAll: () => client.get('/invitations'),
  accept: (id) => client.post(`/invitations/${id}/accept`),
  reject: (id) => client.post(`/invitations/${id}/reject`),
};

