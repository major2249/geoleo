import React, { useState } from 'react';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface GameImageProps {
  imageUrl: string;
  alt?: string;
  onLoad?: () => void;
  className?: string;
}

export const GameImage: React.FC<GameImageProps> = ({ 
  imageUrl, 
  alt = "Game image", 
  onLoad,
  className = ""
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const handleImageLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setLoading(false);
    setError(true);
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  if (error) {
    return (
      <div className={`bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-400">
          <EyeOff className="w-12 h-12 mx-auto mb-2" />
          <p>Failed to load image</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        )}
        
        <img
          src={imageUrl}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        />
        
        {!loading && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
            title="View fullscreen"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={toggleFullscreen}
        >
          <div className="relative max-w-screen-lg max-h-screen">
            <img
              src={imageUrl}
              alt={alt}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-lg transition-colors"
            >
              <EyeOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};