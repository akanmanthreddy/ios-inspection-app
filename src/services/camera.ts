import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { PhotoData, CameraOptions } from '../types';

export class CameraService {
  /**
   * Web fallback - use HTML file input for photo selection
   */
  static async selectPhotoWeb(): Promise<PhotoData> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Use rear camera on mobile
      
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }
        
        try {
          // Create object URL for display
          const uri = URL.createObjectURL(file);
          
          // Convert to base64
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            
            const photoData: PhotoData = {
              id: `web_photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              uri,
              base64,
              timestamp: Date.now(),
              metadata: {
                width: undefined,
                height: undefined,
                orientation: undefined
              }
            };
            
            resolve(photoData);
          };
          
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        } catch (error) {
          reject(error);
        }
      };
      
      input.oncancel = () => reject(new Error('User cancelled photo selection'));
      
      // Trigger the file picker
      input.click();
    });
  }

  /**
   * Take a photo using device camera
   */
  static async takePhoto(options: CameraOptions = {}): Promise<PhotoData> {
    const defaultOptions = {
      quality: options.quality ?? 80,
      allowEditing: options.allowEditing ?? false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      saveToGallery: true,
      correctOrientation: true
    };

    try {
      const image: Photo = await Camera.getPhoto(defaultOptions);
      
      const photoData: PhotoData = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        uri: image.webPath || image.path || '',
        base64: image.base64String,
        timestamp: Date.now(),
        metadata: {
          width: image.width,
          height: image.height,
          orientation: image.orientation
        }
      };

      return photoData;
      
    } catch (error) {
      console.error('Error taking photo:', error);
      throw new Error(`Failed to take photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Select photo from gallery
   */
  static async selectFromGallery(options: CameraOptions = {}): Promise<PhotoData> {
    const defaultOptions = {
      quality: options.quality ?? 80,
      allowEditing: options.allowEditing ?? false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos
    };

    try {
      const image: Photo = await Camera.getPhoto(defaultOptions);
      
      const photoData: PhotoData = {
        id: `gallery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        uri: image.webPath || image.path || '',
        base64: image.base64String,
        timestamp: Date.now(),
        metadata: {
          width: image.width,
          height: image.height,
          orientation: image.orientation
        }
      };

      return photoData;
      
    } catch (error) {
      console.error('Error selecting photo:', error);
      throw new Error(`Failed to select photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Prompt user to choose between camera or gallery
   */
  static async choosePhoto(options: CameraOptions = {}): Promise<PhotoData> {
    // Check if running in web browser - use web fallback
    if (Capacitor.getPlatform() === 'web') {
      return this.selectPhotoWeb();
    }

    const defaultOptions = {
      quality: options.quality ?? 80,
      allowEditing: options.allowEditing ?? false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt
    };

    try {
      const image: Photo = await Camera.getPhoto(defaultOptions);
      
      const photoData: PhotoData = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        uri: image.webPath || image.path || '',
        base64: image.base64String,
        timestamp: Date.now(),
        metadata: {
          width: image.width,
          height: image.height,
          orientation: image.orientation
        }
      };

      return photoData;
      
    } catch (error) {
      console.error('Error choosing photo:', error);
      throw new Error(`Failed to choose photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check camera permissions
   */
  static async checkPermissions() {
    try {
      const permissions = await Camera.checkPermissions();
      return permissions;
    } catch (error) {
      console.error('Error checking camera permissions:', error);
      return { camera: 'denied', photos: 'denied' };
    }
  }

  /**
   * Request camera permissions
   */
  static async requestPermissions() {
    try {
      const permissions = await Camera.requestPermissions();
      return permissions;
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return { camera: 'denied', photos: 'denied' };
    }
  }

  /**
   * Convert photo to base64 for storage/transmission
   */
  static async convertToBase64(photoData: PhotoData): Promise<PhotoData> {
    if (photoData.base64) {
      return photoData; // Already has base64
    }

    try {
      // For web/PWA, convert image URI to base64
      if (photoData.uri) {
        const response = await fetch(photoData.uri);
        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            resolve({
              ...photoData,
              base64: base64.split(',')[1] // Remove data:image/jpeg;base64, prefix
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
      
      throw new Error('No URI available for conversion');
    } catch (error) {
      console.error('Error converting photo to base64:', error);
      throw new Error(`Failed to convert photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate photo data
   */
  static isValidPhoto(photoData: PhotoData): boolean {
    return !!(photoData.id && (photoData.uri || photoData.base64) && photoData.timestamp);
  }

  /**
   * Get photo file size estimate
   */
  static estimatePhotoSize(photoData: PhotoData): number {
    if (photoData.base64) {
      // Base64 encoding increases size by ~33%
      return Math.floor((photoData.base64.length * 3) / 4);
    }
    
    // Rough estimate based on typical photo dimensions
    const width = photoData.metadata?.width || 1920;
    const height = photoData.metadata?.height || 1080;
    return Math.floor((width * height * 3) / 1024); // Rough KB estimate
  }
}

export default CameraService;