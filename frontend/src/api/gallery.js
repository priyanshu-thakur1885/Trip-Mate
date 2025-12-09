import client from './client';

export const galleryAPI = {
  addPhoto: (tripId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return client.post(`/gallery/${tripId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deletePhoto: (tripId, photoId) =>
    client.delete(`/gallery/${tripId}/${photoId}`),
};

