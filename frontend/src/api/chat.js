import client from './client';

export const chatAPI = {
  getMessages: (tripId) => client.get(`/chat/${tripId}`),
  unsendMessage: (tripId, messageId) => client.delete(`/chat/${tripId}/${messageId}`),
};

