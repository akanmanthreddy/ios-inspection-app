import React, { useState, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronRight, Camera, ImageIcon } from 'lucide-react';
import { UnitTurnTemplateItem, SectionSummary, getGLAccountByCode } from '../../constants/templates';
import { useCamera } from '../../../../hooks/useCamera';
import { PhotoData } from '../../../../types';
import { Button } from '../../../../components/ui/button';

interface CollapsibleSectionProps {
  sectionName: string;
  items: UnitTurnTemplateItem[];
  summary: SectionSummary;
  isExpanded: boolean;
  onToggle: () => void;
  onItemUpdate: (itemId: string, field: keyof UnitTurnTemplateItem, value: string | number) => void;
  existingPhotos?: Record<string, PhotoData[]>; // Pre-loaded photos
  onPhotoUpdate?: (itemId: string, photos: PhotoData[]) => void; // Photo state callback
}

export default function CollapsibleSection({
  sectionName,
  items,
  summary,
  isExpanded,
  onToggle,
  onItemUpdate,
  existingPhotos = {},
  onPhotoUpdate
}: CollapsibleSectionProps) {
  // Photo management state - initialize with existing photos
  const [itemPhotos, setItemPhotos] = useState<Record<string, PhotoData[]>>(existingPhotos);
  const [loadingCameraForItem, setLoadingCameraForItem] = useState<string | null>(null);
  const [cameraErrorForItem, setCameraErrorForItem] = useState<Record<string, string>>({});

  // Camera hook
  const { choosePhoto } = useCamera();

  // Update local state when existing photos change
  useEffect(() => {
    setItemPhotos(existingPhotos);
  }, [existingPhotos]);

  // Note: Removed automatic photo loading on mount to match regular inspection pattern
  // Photos will be handled locally during editing and uploaded on form submission

  // Photo handling functions - simplified to match regular inspection pattern
  const handleCameraClick = useCallback(async (itemId: string) => {
    try {
      // Set loading state for this specific item and clear any previous errors
      setLoadingCameraForItem(itemId);
      setCameraErrorForItem(prev => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });

      // Capture photo
      const photo = await choosePhoto({
        quality: 80,
        allowEditing: false
      });

      if (photo) {
        // Add photo to item's photo collection (local storage)
        const updatedPhotos = [...(itemPhotos[itemId] || []), photo];
        setItemPhotos(prev => ({
          ...prev,
          [itemId]: updatedPhotos
        }));

        // Notify parent component
        onPhotoUpdate?.(itemId, updatedPhotos);
      }
    } catch (error) {
      console.error('Error capturing photo for item:', itemId, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to capture photo';
      if (!errorMessage.toLowerCase().includes('cancel')) {
        setCameraErrorForItem(prev => ({
          ...prev,
          [itemId]: errorMessage
        }));
      }
    } finally {
      setLoadingCameraForItem(null);
    }
  }, [choosePhoto, itemPhotos, onPhotoUpdate]);

  const removePhotoFromItem = useCallback((itemId: string, photoId: string) => {
    // Remove photo from local state (no backend calls)
    const updatedPhotos = (itemPhotos[itemId] || []).filter(photo => photo.id !== photoId);
    setItemPhotos(prev => ({
      ...prev,
      [itemId]: updatedPhotos
    }));

    // Notify parent component
    onPhotoUpdate?.(itemId, updatedPhotos);
  }, [itemPhotos, onPhotoUpdate]);
  return (
    <div className="border border-gray-200 rounded-lg mb-4 bg-white shadow-sm">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 rounded-t-lg"
      >
        <div className="flex items-center space-x-3">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">{sectionName}</h3>
          <span className="text-sm text-gray-500">({summary.itemCount} items)</span>
        </div>

        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            Total: ${summary.projectTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-red-600">
            Damages: ${summary.damageTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="p-4 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="p-4 border border-gray-100 rounded-lg space-y-4">
                {/* Row 1: Description (Full Width) */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => onItemUpdate(item.id, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    GL Code: {getGLAccountByCode(item.costCode)?.glAccount || item.costCode}
                  </div>
                </div>

                {/* Row 2: Quantity, Units, Cost/Unit */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => onItemUpdate(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Units
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-center">
                      {item.units}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Cost/Unit
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.costPerUnit}
                      onChange={(e) => onItemUpdate(item.id, 'costPerUnit', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Row 3: Total and Damage Charges */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Total
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium">
                      ${item.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Damage Charges
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.damages}
                      onChange={(e) => onItemUpdate(item.id, 'damages', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-red-200 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <div className="text-xs text-red-600 mt-1">Separate from total</div>
                  </div>
                </div>

                {/* Row 4: Notes and Photos */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-10">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={item.notes}
                      onChange={(e) => onItemUpdate(item.id, 'notes', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Additional notes for this item..."
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Photos
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCameraClick(item.id)}
                      disabled={loadingCameraForItem === item.id}
                      className={`w-full h-16 p-0 ${
                        (itemPhotos[item.id]?.length || 0) > 0
                          ? 'bg-blue-50 border-blue-200 text-blue-600'
                          : ''
                      } ${loadingCameraForItem === item.id ? 'opacity-50' : ''}`}
                    >
                      {loadingCameraForItem === item.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Camera className="w-4 h-4 mb-1" />
                          <span className="text-xs">
                            {itemPhotos[item.id]?.length || 0}
                          </span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Photo Gallery */}
                {itemPhotos[item.id] && (itemPhotos[item.id]?.length || 0) > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center text-xs text-blue-600">
                        <ImageIcon className="w-3 h-3 mr-1" />
                        {itemPhotos[item.id]?.length || 0} photo{(itemPhotos[item.id]?.length || 0) > 1 ? 's' : ''} attached
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {itemPhotos[item.id]?.map((photo) => (
                        <div key={photo.id} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded overflow-hidden">
                            <img
                              src={photo.uri}
                              alt={`Photo for ${item.description}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            <div className="hidden w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          </div>
                          <button
                            onClick={() => removePhotoFromItem(item.id, photo.id)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold"
                            title="Remove photo"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Camera Error Display */}
                {cameraErrorForItem[item.id] && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded flex items-center justify-between">
                      <span>Camera Error: {cameraErrorForItem[item.id]}</span>
                      <button
                        onClick={() => setCameraErrorForItem(prev => {
                          const updated = { ...prev };
                          delete updated[item.id];
                          return updated;
                        })}
                        className="ml-2 text-red-400 hover:text-red-600 text-sm font-bold"
                        title="Dismiss error"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}