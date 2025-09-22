# Unit Turn Photo Management API - Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Base Configuration](#base-configuration)
3. [Authentication](#authentication)
4. [Rate Limiting](#rate-limiting)
5. [API Endpoints](#api-endpoints)
6. [Error Handling](#error-handling)
7. [Frontend Integration Guide](#frontend-integration-guide)
8. [Implementation Examples](#implementation-examples)
9. [Testing Guidelines](#testing-guidelines)
10. [Security Considerations](#security-considerations)
11. [Best Practices](#best-practices)

---

## Overview

The Unit Turn Photo Management System provides secure, validated photo upload and management capabilities for unit turn line items. This system supports photo uploads, retrieval with pagination, and deletion with comprehensive security measures including rate limiting, file validation, and transaction support.

### Key Features
- **Secure file uploads** with content validation (magic number checking)
- **Pagination support** for large photo collections
- **Transaction-based operations** ensuring data consistency
- **Rate limiting** to prevent abuse
- **Automatic file type validation** by content and extension
- **Storage in Supabase** with PostgreSQL metadata tracking

---

## Base Configuration

### Base URL
```
https://your-domain.com/api
```

### API Version
Current version: 1.0

### Content Types
- **Request**: `multipart/form-data` (for uploads), `application/json` (for other requests)
- **Response**: `application/json`

### File Storage
- **Provider**: Supabase Storage
- **Bucket**: `inspection-photos`
- **Path Structure**: `unit-turns/{instanceId}/{lineItemId}/{timestamp}-{filename}`

---

## Authentication

All endpoints require authentication via one of the following methods:

### Method 1: Authorization Header (Bearer Token)
```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Method 2: API Key Header
```http
X-API-Key: YOUR_API_KEY
```

### Authentication Error Response
```json
{
  "success": false,
  "error": "Authentication required",
  "message": "Please provide valid authentication credentials"
}
```

**Status Code**: `401 Unauthorized`

---

## Rate Limiting

### Configuration
- **Window**: 15 minutes (900 seconds)
- **Max Requests**: 100 per window
- **Identifier**: Client IP address

### Rate Limit Headers
Every response includes rate limit information:

```http
X-RateLimit-Remaining: 95
X-RateLimit-Window: 900
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "details": {
    "resetTime": 1758500000,
    "message": "Too many photo requests. Please try again later."
  }
}
```

**Status Code**: `429 Too Many Requests`

---

## API Endpoints

### 1. Upload Photo

**Endpoint**: `POST /api/unit-turns/:instanceId/line-items/:lineItemId/photos`

**Purpose**: Upload a photo for a specific unit turn line item.

#### Request Parameters

**URL Parameters**:
- `instanceId` (UUID) - Unit turn instance identifier
- `lineItemId` (UUID) - Line item identifier

**Body** (multipart/form-data):
- `file` (File) - The photo file to upload

**Headers**:
```http
Content-Type: multipart/form-data
Authorization: Bearer YOUR_TOKEN
```

#### File Validation Rules

| Criteria | Requirement |
|----------|------------|
| **File Types** | JPEG, PNG, WebP only |
| **Max Size** | 10 MB (10,485,760 bytes) |
| **Content Validation** | Magic number verification |
| **Filename** | Sanitized to alphanumeric + dash + underscore |

#### Success Response (201 Created)
```json
{
  "success": true,
  "data": {
    "file_id": "550e8400-e29b-41d4-a716-446655440000",
    "file_path": "unit-turns/123e4567.../456e7890.../1758500000-photo.jpg",
    "entity_type": "unit_turn_line_item",
    "entity_id": "456e7890-e89b-12d3-a456-426614174000",
    "url": "https://storage.supabase.co/...",
    "filename": "1758500000-photo.jpg",
    "created_at": "2025-01-22T10:30:00Z"
  }
}
```

#### Error Responses

**400 Bad Request** - Invalid input
```json
{
  "success": false,
  "error": "File too large. Maximum size is 10MB"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Line item not found or does not belong to this unit turn instance"
}
```

---

### 2. Get Photos (with Pagination)

**Endpoint**: `GET /api/unit-turns/:instanceId/line-items/:lineItemId/photos`

**Purpose**: Retrieve all photos for a specific line item with pagination support.

#### Request Parameters

**URL Parameters**:
- `instanceId` (UUID) - Unit turn instance identifier
- `lineItemId` (UUID) - Line item identifier

**Query Parameters**:
- `page` (integer, optional) - Page number (default: 1, min: 1)
- `limit` (integer, optional) - Items per page (default: 20, min: 1, max: 50)

**Headers**:
```http
Authorization: Bearer YOUR_TOKEN
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "photos": [
      {
        "file_id": "550e8400-e29b-41d4-a716-446655440000",
        "filename": "1758500000-photo.jpg",
        "original_name": "photo.jpg",
        "file_path": "unit-turns/123e4567.../456e7890.../1758500000-photo.jpg",
        "file_type": "image/jpeg",
        "file_size": 2048576,
        "entity_type": "unit_turn_line_item",
        "entity_id": "456e7890-e89b-12d3-a456-426614174000",
        "uploaded_by": "user-uuid-here",
        "url": "https://storage.supabase.co/...",
        "created_at": "2025-01-22T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### 3. Delete Photo

**Endpoint**: `DELETE /api/unit-turns/:instanceId/line-items/:lineItemId/photos/:photoId`

**Purpose**: Delete a specific photo from a line item.

#### Request Parameters

**URL Parameters**:
- `instanceId` (UUID) - Unit turn instance identifier
- `lineItemId` (UUID) - Line item identifier
- `photoId` (UUID) - Photo file identifier

**Headers**:
```http
Authorization: Bearer YOUR_TOKEN
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": null
}
```

#### Error Response (404 Not Found)
```json
{
  "success": false,
  "error": "Photo not found or does not belong to this unit turn instance"
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed description (optional)",
  "details": {
    "field": "Additional context (optional)"
  }
}
```

### Common Error Codes

| Status Code | Meaning | Common Causes |
|------------|---------|---------------|
| 400 | Bad Request | Invalid UUID, file too large, invalid file type |
| 401 | Unauthorized | Missing or invalid authentication |
| 404 | Not Found | Resource doesn't exist or wrong hierarchy |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

---

## Frontend Integration Guide

### 1. File Upload Component Requirements

```javascript
// Required validations before upload
const validateFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
  }

  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 10MB.');
  }

  return true;
};
```

### 2. Handle Pagination

```javascript
// Pagination state management
const [photos, setPhotos] = useState([]);
const [pagination, setPagination] = useState({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false
});

// Load more functionality
const loadMore = async () => {
  if (!pagination.hasNext) return;

  const nextPage = pagination.page + 1;
  const response = await fetchPhotos(instanceId, lineItemId, nextPage);

  setPhotos([...photos, ...response.data.photos]);
  setPagination(response.data.pagination);
};
```

### 3. Rate Limit Handling

```javascript
// Track rate limit headers
const handleRateLimit = (headers) => {
  const remaining = headers.get('X-RateLimit-Remaining');
  const window = headers.get('X-RateLimit-Window');

  if (remaining && parseInt(remaining) < 10) {
    console.warn(`Rate limit warning: Only ${remaining} requests remaining`);
    // Show warning to user
  }
};

// Retry with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
};
```

---

## Implementation Examples

### Complete TypeScript Implementation

```typescript
// types.ts
interface Photo {
  file_id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  entity_type: 'unit_turn_line_item';
  entity_id: string;
  uploaded_by: string | null;
  url: string;
  created_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: Record<string, any>;
}

// api-client.ts
class UnitTurnPhotoAPI {
  private baseURL: string;
  private authToken: string;

  constructor(baseURL: string, authToken: string) {
    this.baseURL = baseURL;
    this.authToken = authToken;
  }

  private getHeaders(isMultipart = false): HeadersInit {
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.authToken}`
    };

    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  async uploadPhoto(
    instanceId: string,
    lineItemId: string,
    file: File
  ): Promise<ApiResponse<Photo>> {
    // Validate file before upload
    this.validateFile(file);

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${this.baseURL}/unit-turns/${instanceId}/line-items/${lineItemId}/photos`,
      {
        method: 'POST',
        headers: this.getHeaders(true),
        body: formData
      }
    );

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  async getPhotos(
    instanceId: string,
    lineItemId: string,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{ photos: Photo[]; pagination: PaginationInfo }>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await fetch(
      `${this.baseURL}/unit-turns/${instanceId}/line-items/${lineItemId}/photos?${params}`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    );

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  async deletePhoto(
    instanceId: string,
    lineItemId: string,
    photoId: string
  ): Promise<ApiResponse<null>> {
    const response = await fetch(
      `${this.baseURL}/unit-turns/${instanceId}/line-items/${lineItemId}/photos/${photoId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders()
      }
    );

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  private validateFile(file: File): void {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 10MB.');
    }
  }

  private async handleError(response: Response): Promise<Error> {
    const errorData = await response.json();
    const error = new Error(errorData.error || 'Request failed');
    (error as any).status = response.status;
    (error as any).details = errorData;
    return error;
  }
}

// React Hook Example
import { useState, useCallback } from 'react';

export const useUnitTurnPhotos = (instanceId: string, lineItemId: string) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = new UnitTurnPhotoAPI(
    process.env.REACT_APP_API_URL!,
    process.env.REACT_APP_AUTH_TOKEN!
  );

  const loadPhotos = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getPhotos(instanceId, lineItemId, page);

      if (response.success && response.data) {
        if (page === 1) {
          setPhotos(response.data.photos);
        } else {
          setPhotos(prev => [...prev, ...response.data!.photos]);
        }
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  }, [instanceId, lineItemId]);

  const uploadPhoto = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.uploadPhoto(instanceId, lineItemId, file);

      if (response.success && response.data) {
        // Reload photos to include the new one
        await loadPhotos(1);
        return response.data;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [instanceId, lineItemId, loadPhotos]);

  const deletePhoto = useCallback(async (photoId: string) => {
    setLoading(true);
    setError(null);

    try {
      await api.deletePhoto(instanceId, lineItemId, photoId);

      // Remove photo from local state
      setPhotos(prev => prev.filter(p => p.file_id !== photoId));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete photo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [instanceId, lineItemId]);

  return {
    photos,
    pagination,
    loading,
    error,
    loadPhotos,
    uploadPhoto,
    deletePhoto,
    loadMore: () => loadPhotos(pagination.page + 1)
  };
};
```

### React Component Example

```jsx
import React, { useEffect, useState } from 'react';
import { useUnitTurnPhotos } from './hooks/useUnitTurnPhotos';

const UnitTurnPhotoManager = ({ instanceId, lineItemId }) => {
  const {
    photos,
    pagination,
    loading,
    error,
    loadPhotos,
    uploadPhoto,
    deletePhoto,
    loadMore
  } = useUnitTurnPhotos(instanceId, lineItemId);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadPhotos();
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    // Validate each file
    const validFiles = files.filter(file => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert(`${file.name} is not a valid image type`);
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large (max 10MB)`);
        return false;
      }

      return true;
    });

    setSelectedFiles(validFiles);
  };

  const handleUpload = async () => {
    setUploadProgress(0);
    const total = selectedFiles.length;

    for (let i = 0; i < selectedFiles.length; i++) {
      try {
        await uploadPhoto(selectedFiles[i]);
        setUploadProgress(((i + 1) / total) * 100);
      } catch (err) {
        console.error(`Failed to upload ${selectedFiles[i].name}:`, err);
      }
    }

    setSelectedFiles([]);
    setUploadProgress(0);
  };

  const handleDelete = async (photoId) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        await deletePhoto(photoId);
      } catch (err) {
        alert('Failed to delete photo');
      }
    }
  };

  return (
    <div className="photo-manager">
      {/* Upload Section */}
      <div className="upload-section">
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
        />

        {selectedFiles.length > 0 && (
          <button onClick={handleUpload} disabled={loading}>
            Upload {selectedFiles.length} photo(s)
          </button>
        )}

        {uploadProgress > 0 && (
          <div className="progress">
            <div
              className="progress-bar"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Photo Grid */}
      <div className="photo-grid">
        {photos.map(photo => (
          <div key={photo.file_id} className="photo-item">
            <img src={photo.url} alt={photo.original_name} />
            <div className="photo-info">
              <span>{photo.original_name}</span>
              <span>{(photo.file_size / 1024 / 1024).toFixed(2)} MB</span>
              <button onClick={() => handleDelete(photo.file_id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.hasNext && (
        <button onClick={loadMore} disabled={loading}>
          Load More ({pagination.total - photos.length} remaining)
        </button>
      )}

      {loading && <div className="loading">Loading...</div>}
    </div>
  );
};

export default UnitTurnPhotoManager;
```

---

## Testing Guidelines

### 1. Unit Tests

```javascript
// Test file validation
describe('File Validation', () => {
  test('should accept valid image types', () => {
    const validFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    expect(() => validateFile(validFile)).not.toThrow();
  });

  test('should reject invalid file types', () => {
    const invalidFile = new File([''], 'test.pdf', { type: 'application/pdf' });
    expect(() => validateFile(invalidFile)).toThrow('Invalid file type');
  });

  test('should reject files over 10MB', () => {
    const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg'
    });
    expect(() => validateFile(largeFile)).toThrow('File too large');
  });
});
```

### 2. Integration Tests

```javascript
// Test API endpoints
describe('Photo API Integration', () => {
  const instanceId = 'test-instance-id';
  const lineItemId = 'test-line-item-id';

  test('should upload photo successfully', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const response = await api.uploadPhoto(instanceId, lineItemId, file);

    expect(response.success).toBe(true);
    expect(response.data.file_id).toBeDefined();
    expect(response.data.url).toMatch(/^https:\/\//);
  });

  test('should handle pagination correctly', async () => {
    const response = await api.getPhotos(instanceId, lineItemId, 1, 10);

    expect(response.success).toBe(true);
    expect(response.data.photos).toBeInstanceOf(Array);
    expect(response.data.pagination.limit).toBe(10);
  });

  test('should handle rate limiting gracefully', async () => {
    // Simulate multiple rapid requests
    const requests = Array(101).fill(null).map(() =>
      api.getPhotos(instanceId, lineItemId)
    );

    try {
      await Promise.all(requests);
    } catch (error) {
      expect(error.status).toBe(429);
      expect(error.details.error).toContain('Rate limit exceeded');
    }
  });
});
```

### 3. End-to-End Testing Checklist

- [ ] **Upload Flow**
  - [ ] Single file upload
  - [ ] Multiple file upload
  - [ ] Progress indication
  - [ ] Error handling for invalid files
  - [ ] Network failure recovery

- [ ] **Display & Pagination**
  - [ ] Initial load
  - [ ] Load more functionality
  - [ ] Empty state handling
  - [ ] Loading states

- [ ] **Delete Flow**
  - [ ] Delete confirmation
  - [ ] UI update after deletion
  - [ ] Error handling

- [ ] **Edge Cases**
  - [ ] Offline mode
  - [ ] Rate limit handling
  - [ ] Session expiration
  - [ ] Concurrent operations

---

## Security Considerations

### 1. File Upload Security

- **Content Validation**: Files are validated by magic numbers (file signatures) to prevent disguised malicious files
- **Extension Validation**: Double validation with both MIME type and file extension
- **Size Limits**: Strict 10MB limit prevents resource exhaustion
- **Filename Sanitization**: Special characters removed to prevent path traversal attacks

### 2. Authentication & Authorization

- **Required Authentication**: All endpoints require valid authentication
- **Token Expiration**: Implement token refresh mechanism in frontend
- **Secure Storage**: Store tokens in secure storage (not localStorage for sensitive apps)

### 3. Rate Limiting

- **IP-based Tracking**: Prevents single client from overwhelming the server
- **Reasonable Limits**: 100 requests per 15 minutes balances usability and protection
- **Header Information**: Allows clients to self-regulate

### 4. Data Validation

- **UUID Validation**: All IDs validated as proper UUIDs
- **SQL Injection Prevention**: Parameterized queries throughout
- **Input Sanitization**: All user inputs sanitized before storage

### 5. Frontend Security Best Practices

```javascript
// Secure token storage
class SecureStorage {
  static setToken(token) {
    // Use secure storage mechanism
    if (window.crypto && window.crypto.subtle) {
      // Encrypt token before storage
      // Implementation depends on security requirements
    }
  }

  static getToken() {
    // Retrieve and decrypt token
  }

  static clearToken() {
    // Secure cleanup
  }
}

// XSS Prevention
const sanitizeFilename = (filename) => {
  return filename.replace(/[<>:"\/\\|?*]/g, '_');
};

// CSRF Protection
const getCsrfToken = () => {
  return document.querySelector('meta[name="csrf-token"]')?.content;
};
```

---

## Best Practices

### 1. Performance Optimization

```javascript
// Lazy loading for images
const LazyImage = ({ src, alt }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return <img ref={imgRef} src={imageSrc} alt={alt} />;
};

// Image compression before upload
const compressImage = async (file, maxWidth = 1920) => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(blob => {
        resolve(new File([blob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now()
        }));
      }, 'image/jpeg', 0.85);
    };

    img.src = URL.createObjectURL(file);
  });
};
```

### 2. User Experience

```javascript
// Optimistic updates
const optimisticDelete = async (photoId) => {
  // Immediately update UI
  setPhotos(prev => prev.filter(p => p.file_id !== photoId));

  try {
    await api.deletePhoto(instanceId, lineItemId, photoId);
  } catch (error) {
    // Revert on failure
    await loadPhotos();
    throw error;
  }
};

// Upload queue management
class UploadQueue {
  constructor(maxConcurrent = 3) {
    this.queue = [];
    this.active = 0;
    this.maxConcurrent = maxConcurrent;
  }

  async add(uploadTask) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task: uploadTask, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.active >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.active++;
    const { task, resolve, reject } = this.queue.shift();

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.active--;
      this.process();
    }
  }
}
```

### 3. Error Recovery

```javascript
// Automatic retry with exponential backoff
const uploadWithRetry = async (file, maxRetries = 3) => {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await api.uploadPhoto(instanceId, lineItemId, file);
    } catch (error) {
      lastError = error;

      // Don't retry client errors
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Connection status monitoring
const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
```

### 4. Monitoring & Logging

```javascript
// Performance monitoring
const trackPhotoOperation = (operation, duration, success) => {
  if (window.analytics) {
    window.analytics.track('Photo Operation', {
      operation,
      duration,
      success,
      instanceId,
      lineItemId
    });
  }
};

// Error reporting
const reportError = (error, context) => {
  console.error('Photo operation error:', error, context);

  if (window.Sentry) {
    window.Sentry.captureException(error, {
      extra: context
    });
  }
};
```

---

## Appendix

### A. UUID Format
All IDs must follow UUID v4 format:
```
xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
```
Where x is any hexadecimal digit and y is one of 8, 9, A, or B.

### B. Supported MIME Types
- `image/jpeg` - JPEG images
- `image/png` - PNG images
- `image/webp` - WebP images

### C. Magic Numbers Reference
| File Type | Magic Number (Hex) |
|-----------|-------------------|
| JPEG | FF D8 FF |
| PNG | 89 50 4E 47 0D 0A 1A 0A |
| WebP | 52 49 46 46 (RIFF header) |

### D. Status Code Reference
| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Success |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Check input validation |
| 401 | Unauthorized | Refresh auth token |
| 404 | Not Found | Verify resource IDs |
| 429 | Too Many Requests | Implement backoff |
| 500 | Internal Server Error | Retry with backoff |

---

## Contact & Support

For questions or issues with the API:
- Review this documentation thoroughly
- Check the error messages and status codes
- Ensure proper authentication is configured
- Verify file formats and sizes meet requirements
- Test with the provided examples

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-22 | Initial release with full photo management capabilities |

---

*This documentation is maintained alongside the backend implementation. For the latest updates, check the repository.*