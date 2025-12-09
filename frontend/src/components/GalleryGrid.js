import React, { useState } from 'react';

const GalleryGrid = ({ photos, onDelete, canEdit }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No photos yet. Add photos to build your gallery.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div key={photo._id} className="relative group">
            <img
              src={photo.imageUrl}
              alt="Trip photo"
              className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedImage(photo.imageUrl)}
            />
            {canEdit && (
              <button
                onClick={() => onDelete(photo._id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryGrid;

