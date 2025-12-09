import client from './client';

export const galleryAPI = {
  addPhoto: (tripId, imageUrl) =>
    client.post(`/gallery/${tripId}`, { imageUrl }),

  deletePhoto: (tripId, photoId) =>
    client.delete(`/gallery/${tripId}/${photoId}`),
};

