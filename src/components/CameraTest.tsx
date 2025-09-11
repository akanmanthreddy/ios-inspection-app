import React from 'react';
import { Camera, ImageIcon, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useCamera } from '../hooks/useCamera';

export function CameraTest() {
  const { 
    photos, 
    isLoading, 
    error, 
    takePhoto, 
    selectFromGallery, 
    choosePhoto, 
    removePhoto, 
    clearPhotos, 
    hasPermissions 
  } = useCamera();

  const handleTakePhoto = async () => {
    await takePhoto({ quality: 80, allowEditing: false });
  };

  const handleSelectFromGallery = async () => {
    await selectFromGallery({ quality: 80, allowEditing: false });
  };

  const handleChoosePhoto = async () => {
    await choosePhoto({ quality: 80, allowEditing: false });
  };

  const handleCheckPermissions = async () => {
    const granted = await hasPermissions();
    console.log('Camera permissions granted:', granted);
    alert(`Camera permissions granted: ${granted}`);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Camera Test</h1>
          <p className="text-muted-foreground text-sm">
            Test Capacitor Camera functionality
          </p>
        </div>

        {/* Camera Controls */}
        <Card className="p-4 space-y-3">
          <h2 className="font-semibold">Camera Controls</h2>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleTakePhoto}
              disabled={isLoading}
              className="flex items-center gap-2"
              variant="default"
              size="sm"
            >
              <Camera className="w-4 h-4" />
              Take Photo
            </Button>
            
            <Button
              onClick={handleSelectFromGallery}
              disabled={isLoading}
              className="flex items-center gap-2"
              variant="outline"
              size="sm"
            >
              <ImageIcon className="w-4 h-4" />
              Gallery
            </Button>
          </div>

          <Button
            onClick={handleChoosePhoto}
            disabled={isLoading}
            className="w-full flex items-center gap-2"
            variant="secondary"
            size="sm"
          >
            <Camera className="w-4 h-4" />
            Choose (Prompt)
          </Button>

          <Button
            onClick={handleCheckPermissions}
            className="w-full"
            variant="ghost"
            size="sm"
          >
            Check Permissions
          </Button>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="p-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Opening camera...</span>
            </div>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="text-red-700 text-sm">
              <strong>Error:</strong> {error}
            </div>
          </Card>
        )}

        {/* Photo Count */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">
              Photos: {photos.length}
            </span>
            {photos.length > 0 && (
              <Button
                onClick={clearPhotos}
                size="sm"
                variant="outline"
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </Card>

        {/* Photo Grid */}
        {photos.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Captured Photos</h3>
            <div className="grid grid-cols-2 gap-3">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={photo.uri} 
                      alt="Captured photo"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm font-bold"
                    title="Remove photo"
                  >
                    ×
                  </button>
                  
                  <div className="mt-1 text-xs text-muted-foreground text-center truncate">
                    {photo.id}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Photo Details */}
        {photos.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Photo Details</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              {photos.map((photo, index) => (
                <div key={photo.id} className="border-b pb-2">
                  <div><strong>#{index + 1}:</strong> {photo.id}</div>
                  <div><strong>URI:</strong> {photo.uri}</div>
                  <div><strong>Timestamp:</strong> {new Date(photo.timestamp).toLocaleString()}</div>
                  {photo.metadata && (
                    <div>
                      <strong>Size:</strong> {photo.metadata.width}×{photo.metadata.height}
                    </div>
                  )}
                  <div><strong>Has Base64:</strong> {photo.base64 ? 'Yes' : 'No'}</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default CameraTest;