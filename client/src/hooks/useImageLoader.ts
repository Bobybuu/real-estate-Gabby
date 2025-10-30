// hooks/useImageLoader.ts
import { useState, useEffect } from 'react';
import { getImageUrl, PLACEHOLDER_IMAGE } from '@/services/api';

export const useImageLoader = (imagePath: string) => {
  const [imageUrl, setImageUrl] = useState(() => getImageUrl(imagePath));
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (imagePath) {
      setIsLoading(true);
      setHasError(false);
      setImageUrl(getImageUrl(imagePath));
    } else {
      // If no image path, use placeholder
      setHasError(true);
      setIsLoading(false);
      setImageUrl(PLACEHOLDER_IMAGE);
    }
  }, [imagePath]);

  const handleImageError = () => {
    console.warn('Image failed to load, using placeholder:', imageUrl);
    setHasError(true);
    setIsLoading(false);
    setImageUrl(PLACEHOLDER_IMAGE);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const updateImage = (newImagePath: string) => {
    setIsLoading(true);
    setHasError(false);
    setImageUrl(getImageUrl(newImagePath));
  };

  return {
    imageUrl,
    isLoading,
    hasError,
    handleImageError,
    handleImageLoad,
    updateImage,
  };
};