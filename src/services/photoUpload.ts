import { PhotoData } from '../types';
import { Capacitor } from '@capacitor/core';
import { ENV } from '../config/env';

export interface PhotoUploadOptions {
  inspectionId: string;
  itemId: string;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface PhotoUploadResult {
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  size: number;
  path: string;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
  };
}

export class PhotoUploadService {
  private static readonly UPLOAD_ENDPOINT = '/photos/upload'; // Will be appended to API base URL
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

  /**
   * Upload a single photo to backend API
   */
  static async uploadPhoto(
    photoData: PhotoData, 
    options: PhotoUploadOptions
  ): Promise<PhotoUploadResult> {
    try {
      console.log('📤 Starting backend photo upload:', photoData.id);
      
      // Convert photo data to uploadable format
      const { blob, filename } = await this.preparePhotoForUpload(photoData, options);
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('photo', blob, filename);
      formData.append('inspectionId', options.inspectionId);
      formData.append('itemId', options.itemId);
      formData.append('quality', (options.quality || 80).toString());

      // Upload to backend API
      const uploadUrl = `${ENV.API_BASE_URL}${this.UPLOAD_ENDPOINT}`;
      console.log('📤 Uploading to:', uploadUrl);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('✅ Photo uploaded to backend:', result.url);

      return {
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        uploadedAt: new Date().toISOString(),
        size: blob.size,
        path: result.path,
        metadata: {
          width: photoData.metadata?.width,
          height: photoData.metadata?.height,
          format: blob.type
        }
      };
    } catch (error) {
      console.error('💥 Backend photo upload failed:', error);
      throw new Error(`Failed to upload photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload multiple photos for an inspection item
   */
  static async uploadPhotos(
    photos: PhotoData[], 
    options: PhotoUploadOptions
  ): Promise<PhotoUploadResult[]> {
    const results: PhotoUploadResult[] = [];
    const errors: Error[] = [];

    console.log(`📤 Uploading ${photos.length} photos to backend for item ${options.itemId}`);

    for (const photo of photos) {
      try {
        const result = await this.uploadPhoto(photo, options);
        results.push(result);
        console.log(`✅ Photo uploaded successfully: ${result.url}`);
      } catch (error) {
        console.error(`❌ Failed to upload photo ${photo.id}:`, error);
        errors.push(error instanceof Error ? error : new Error('Unknown upload error'));
      }
    }

    if (errors.length > 0 && results.length === 0) {
      throw new Error(`All photo uploads failed: ${errors.map(e => e.message).join(', ')}`);
    }

    if (errors.length > 0) {
      console.warn(`⚠️ Some photos failed to upload: ${errors.length}/${photos.length}`);
    }

    return results;
  }


  /**
   * Prepare photo data for upload (compression, format conversion, etc.)
   */
  private static async preparePhotoForUpload(
    photoData: PhotoData, 
    options: PhotoUploadOptions
  ): Promise<{ blob: Blob; filename: string }> {
    let blob: Blob;
    
    // Convert photo data to blob
    if (photoData.base64) {
      // Convert base64 to blob
      const byteCharacters = atob(photoData.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      blob = new Blob([byteArray], { type: 'image/jpeg' });
    } else if (photoData.uri) {
      // Fetch from URI (for web file picker)
      const response = await fetch(photoData.uri);
      blob = await response.blob();
    } else {
      throw new Error('No photo data available for upload');
    }

    // Validate file size
    if (blob.size > this.MAX_FILE_SIZE) {
      throw new Error(`File too large: ${Math.round(blob.size / 1024 / 1024)}MB (max: ${this.MAX_FILE_SIZE / 1024 / 1024}MB)`);
    }

    // Validate file type
    if (!this.SUPPORTED_FORMATS.includes(blob.type)) {
      throw new Error(`Unsupported file format: ${blob.type}`);
    }

    // Generate filename
    const timestamp = Date.now();
    const extension = this.getFileExtension(blob.type);
    const filename = `${photoData.id}_${timestamp}.${extension}`;

    return { blob, filename };
  }

  /**
   * Get file extension from MIME type
   */
  private static getFileExtension(mimeType: string): string {
    switch (mimeType) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'image/webp':
        return 'webp';
      default:
        return 'jpg';
    }
  }

  /**
   * Delete a photo via backend API
   */
  static async deletePhoto(photoId: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting photo via backend:', photoId);
      
      const deleteUrl = `${ENV.API_BASE_URL}/photos/${photoId}`;
      console.log('🗑️ Deleting from:', deleteUrl);
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
      }
      
      console.log('✅ Photo deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to delete photo:', error);
      return false;
    }
  }

  /**
   * List photos for an inspection via backend API
   */
  static async listInspectionPhotos(inspectionId: string): Promise<string[]> {
    try {
      const listUrl = `${ENV.API_BASE_URL}/inspections/${inspectionId}/photos`;
      const response = await fetch(listUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to list photos: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.photos || [];
    } catch (error) {
      console.error('❌ Failed to list inspection photos:', error);
      return [];
    }
  }

  /**
   * Validate photo data before upload
   */
  static validatePhoto(photoData: PhotoData): boolean {
    if (!photoData.id || !photoData.timestamp) {
      return false;
    }
    
    if (!photoData.uri && !photoData.base64) {
      return false;
    }
    
    return true;
  }

  /**
   * Check if backend photo upload API is available
   */
  static async checkStorageAvailability(): Promise<boolean> {
    try {
      const healthUrl = `${ENV.API_BASE_URL}/photos/health`;
      const response = await fetch(healthUrl);
      return response.ok;
    } catch (error) {
      console.error('❌ Backend photo upload not available:', error);
      return false;
    }
  }
}

export default PhotoUploadService;