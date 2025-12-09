import React, { useState } from 'react';

const GalleryGrid = ({ photos, onDelete, canEdit }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No photos yet. Add photos to build your gallery.</p>
      </div>
    );
  }

  // Helper function to get the media source
  const getMediaSource = (photo) => {
    // If fileData is already a URL (http/https), use it directly (GridFS files)
    if (photo.fileData && (photo.fileData.startsWith('http://') || photo.fileData.startsWith('https://'))) {
      return photo.fileData;
    }
    // If fileData is already a data URL, use it directly
    if (photo.fileData && photo.fileData.startsWith('data:')) {
      // Check if it's HEIC and try to handle it
      const mimeType = photo.fileData.split(';')[0].split(':')[1];
      if (mimeType === 'image/heic' || mimeType === 'image/heif') {
        // For HEIC files, we'll try to display as JPEG (they should be converted on upload)
        return photo.fileData.replace(/image\/(heic|heif)/, 'image/jpeg');
      }
      return photo.fileData;
    }
    // Otherwise, construct the data URL from mimeType and fileData
    if (photo.fileData && photo.mimeType) {
      // Handle HEIC mime types - convert to JPEG for display
      let displayMimeType = photo.mimeType;
      if (photo.mimeType === 'image/heic' || photo.mimeType === 'image/heif') {
        displayMimeType = 'image/jpeg';
      }
      return `data:${displayMimeType};base64,${photo.fileData}`;
    }
    // Fallback for old data structure (imageUrl)
    return photo.imageUrl || '';
  };

  const handleMediaClick = (photo) => {
    const source = getMediaSource(photo);
    setSelectedMedia(source);
    setSelectedMediaType(photo.fileType || 'image');
    setSelectedPhoto(photo);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    if (!selectedMedia || !selectedPhoto) return;

    try {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = selectedMedia;
      link.download = selectedPhoto.fileName || `trip-photo-${selectedPhoto._id}.${selectedPhoto.mimeType?.includes('video') ? 'mp4' : 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback: open in new tab
      window.open(selectedMedia, '_blank');
    }
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
            setSelectedPhoto(null);
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
              {selectedMediaType === 'video' ? (
                <video
                  src={selectedMedia}
                  controls
                  autoPlay
                  className="max-w-full max-h-[90vh] w-auto h-auto rounded-lg object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <img
                  src={selectedMedia}
                  alt="Full size"
                  className="max-w-full max-h-[90vh] w-auto h-auto rounded-lg object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={handleDownload}
                className="text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-all"
                title="Download"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
              <button
                onClick={() => {
                  setSelectedMedia(null);
                  setSelectedMediaType(null);
                  setSelectedPhoto(null);
                }}
                className="text-white text-2xl font-bold hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-all"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryGrid;

