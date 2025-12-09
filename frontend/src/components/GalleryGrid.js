import React, { useState } from 'react';

const GalleryGrid = ({ photos, onDelete, canEdit }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState(null);

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No photos yet. Add photos to build your gallery.</p>
      </div>
    );
  }

  // Helper function to get the media source
  const getMediaSource = (photo) => {
    // If fileData is already a data URL, use it directly
    if (photo.fileData && photo.fileData.startsWith('data:')) {
      return photo.fileData;
    }
    // Otherwise, construct the data URL from mimeType and fileData
    if (photo.fileData && photo.mimeType) {
      return `data:${photo.mimeType};base64,${photo.fileData}`;
    }
    // Fallback for old data structure (imageUrl)
    return photo.imageUrl || '';
  };

  const handleMediaClick = (photo) => {
    const source = getMediaSource(photo);
    setSelectedMedia(source);
    setSelectedMediaType(photo.fileType || 'image');
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => {
          const mediaSource = getMediaSource(photo);
          const isVideo = (photo.fileType === 'video') || 
                         (photo.mimeType && photo.mimeType.startsWith('video/'));

          return (
            <div key={photo._id} className="relative group">
              {isVideo ? (
                <video
                  src={mediaSource}
                  className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleMediaClick(photo)}
                  controls={false}
                />
              ) : (
                <img
                  src={mediaSource}
                  alt={photo.fileName || 'Trip photo'}
                  className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleMediaClick(photo)}
                />
              )}
              {canEdit && (
                <button
                  onClick={() => onDelete(photo._id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  ✕
                </button>
              )}
              {isVideo && (
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  <span>▶ Video</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox/Modal for full-size view */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedMedia(null);
            setSelectedMediaType(null);
          }}
        >
          <div className="max-w-4xl max-h-full relative">
            {selectedMediaType === 'video' ? (
              <video
                src={selectedMedia}
                controls
                autoPlay
                className="max-w-full max-h-full rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img
                src={selectedMedia}
                alt="Full size"
                className="max-w-full max-h-full rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <button
              onClick={() => {
                setSelectedMedia(null);
                setSelectedMediaType(null);
              }}
              className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
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

