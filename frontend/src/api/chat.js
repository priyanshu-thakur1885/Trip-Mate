import client from './client';

export const chatAPI = {
  getMessages: (tripId) => client.get(`/chat/${tripId}`),
};

