import { useState, useCallback } from 'react';
import { CameraService } from '../services/camera';
import { PhotoData, CameraOptions } from '../types';

interface UseCameraReturn {
  photos: PhotoData[];
  isLoading: boolean;
  error: string | null;
  takePhoto: (options?: CameraOptions) => Promise<PhotoData | null>;
  selectFromGallery: (options?: CameraOptions) => Promise<PhotoData | null>;
  choosePhoto: (options?: CameraOptions) => Promise<PhotoData | null>;
  removePhoto: (photoId: string) => void;
  clearPhotos: () => void;
  hasPermissions: () => Promise<boolean>;
}

export function useCamera(): UseCameraReturn {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const takePhoto = useCallback(async (options?: CameraOptions): Promise<PhotoData | null> => {
    setIsLoading(true);
    clearError();
    
    try {
      const photoData = await CameraService.takePhoto(options);
      setPhotos(prev => [...prev, photoData]);
      return photoData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to take photo';
      setError(errorMessage);
      console.error('useCamera - takePhoto error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const selectFromGallery = useCallback(async (options?: CameraOptions): Promise<PhotoData | null> => {
    setIsLoading(true);
    clearError();
    
    try {
      const photoData = await CameraService.selectFromGallery(options);
      setPhotos(prev => [...prev, photoData]);
      return photoData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select photo';
      setError(errorMessage);
      console.error('useCamera - selectFromGallery error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const choosePhoto = useCallback(async (options?: CameraOptions): Promise<PhotoData | null> => {
    setIsLoading(true);
    clearError();
    
    try {
      const photoData = await CameraService.choosePhoto(options);
      setPhotos(prev => [...prev, photoData]);
      return photoData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to choose photo';
      setError(errorMessage);
      console.error('useCamera - choosePhoto error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const removePhoto = useCallback((photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
    clearError();
  }, [clearError]);

  const clearPhotos = useCallback(() => {
    setPhotos([]);
    clearError();
  }, [clearError]);

  const hasPermissions = useCallback(async (): Promise<boolean> => {
    try {
      let permissions = await CameraService.checkPermissions();
      
      // If permissions are not granted, try to request them
      if (permissions.camera !== 'granted' || permissions.photos !== 'granted') {
        permissions = await CameraService.requestPermissions();
      }
      
      return permissions.camera === 'granted' && permissions.photos === 'granted';
    } catch (err) {
      console.error('useCamera - hasPermissions error:', err);
      return false;
    }
  }, []);

  return {
    photos,
    isLoading,
    error,
    takePhoto,
    selectFromGallery,
    choosePhoto,
    removePhoto,
    clearPhotos,
    hasPermissions
  };
}

export default useCamera;