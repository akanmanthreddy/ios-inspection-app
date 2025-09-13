import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronDown, Check, Star, Wrench, Camera, NotebookPen, ImageIcon } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { useTemplate } from '../../hooks/useTemplates';
import { useCamera } from '../../hooks/useCamera';
import { PhotoData } from '../../types';

interface MobileInspectionFormPageProps {
  propertyId: string;
  propertyAddress: string;
  inspectionId: string;
  templateId?: string | number; // Optional for backward compatibility
  onBack: () => void;
  onComplete: (data: any) => void;
}

export function MobileInspectionFormPage({
  propertyId,
  propertyAddress,
  inspectionId,
  templateId,
  onBack,
  onComplete
}: MobileInspectionFormPageProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [currentStickySection, setCurrentStickySection] = useState<string>('');
  const [itemPhotos, setItemPhotos] = useState<Record<string, PhotoData[]>>({});
  const [loadingCameraForItem, setLoadingCameraForItem] = useState<string | null>(null);
  const [cameraErrorForItem, setCameraErrorForItem] = useState<Record<string, string>>({});
  const sectionRefs = useRef<Record<string, HTMLElement>>({});
  
  // Camera hook
  const { choosePhoto } = useCamera();

  // Fetch template data if templateId is provided
  const shouldFetchTemplate = templateId !== undefined && templateId !== null;
  
  // Handle both UUID strings and number IDs - if it's a UUID string, don't try to parse as int
  const templateIdForHook = shouldFetchTemplate ? (
    typeof templateId === 'string' && templateId.includes('-') 
      ? templateId // Keep UUID strings as-is
      : (typeof templateId === 'string' ? parseInt(templateId) : templateId)
  ) : 0;
  
  const { template, loading: templateLoading, error: templateError } = useTemplate(templateIdForHook);

  // Debug logging for template data
  useEffect(() => {
    if (shouldFetchTemplate) {
      console.log('Inspection Form - Template ID:', templateId);
      console.log('Inspection Form - Template Loading:', templateLoading);
      console.log('Inspection Form - Template Data:', template);
      console.log('Inspection Form - Template Error:', templateError);
    }
  }, [templateId, templateLoading, template, templateError, shouldFetchTemplate]);

  // Function to convert template data to inspection sections format
  const convertTemplateToInspectionSections = (templateData: any) => {
    if (!templateData || !templateData.sections) {
      return [];
    }

    return templateData.sections.map((section: any) => ({
      id: `section-${section.id}`,
      title: section.name,
      items: section.items.map((item: any) => ({
        id: `item-${item.id}`,
        label: item.name,
        // Force all items to use good-fair-repair rating system regardless of backend type
        type: 'good-fair-repair' as const,
        // Store original item data for backend submission
        originalItem: item
      }))
    }));
  };

  // Mock inspection template data - used as fallback when no template provided or while loading
  const mockInspectionSections = useMemo(() => [
    {
      id: 'kitchen-appliances',
      title: 'Kitchen - Appliances',
      items: [
        { id: 'refrigerator', label: 'Refrigerator', type: 'good-fair-repair' as const },
        { id: 'stove', label: 'Stove/Oven', type: 'good-fair-repair' as const },
        { id: 'dishwasher', label: 'Dishwasher', type: 'good-fair-repair' as const },
        { id: 'microwave', label: 'Microwave', type: 'good-fair-repair' as const }
      ]
    },
    {
      id: 'kitchen-fixtures',
      title: 'Kitchen - Fixtures & Plumbing',
      items: [
        { id: 'kitchen-sink', label: 'Kitchen Sink', type: 'good-fair-repair' as const },
        { id: 'kitchen-faucet', label: 'Faucet', type: 'good-fair-repair' as const },
        { id: 'garbage-disposal', label: 'Garbage Disposal', type: 'good-fair-repair' as const },
        { id: 'kitchen-cabinets', label: 'Cabinet Doors & Drawers', type: 'good-fair-repair' as const }
      ]
    },
    {
      id: 'bathroom-plumbing',
      title: 'Bathroom - Plumbing',
      items: [
        { id: 'toilet', label: 'Toilet', type: 'good-fair-repair' as const },
        { id: 'shower-tub', label: 'Shower/Tub', type: 'good-fair-repair' as const },
        { id: 'bathroom-sink', label: 'Bathroom Sink', type: 'good-fair-repair' as const },
        { id: 'bathroom-faucet', label: 'Bathroom Faucet', type: 'good-fair-repair' as const }
      ]
    },
    {
      id: 'bathroom-ventilation',
      title: 'Bathroom - Ventilation',
      items: [
        { id: 'exhaust-fan', label: 'Exhaust Fan', type: 'good-fair-repair' as const },
        { id: 'proper-ventilation', label: 'Proper Ventilation', type: 'good-fair-repair' as const },
        { id: 'bathroom-lighting', label: 'Bathroom Lighting', type: 'good-fair-repair' as const }
      ]
    },
    {
      id: 'electrical-outlets',
      title: 'Electrical - Outlets & Switches',
      items: [
        { id: 'gfci-outlets', label: 'GFCI Outlets', type: 'good-fair-repair' as const },
        { id: 'light-switches', label: 'Light Switches', type: 'good-fair-repair' as const },
        { id: 'outlet-covers', label: 'Outlet Covers', type: 'good-fair-repair' as const },
        { id: 'electrical-panel', label: 'Electrical Panel Access', type: 'good-fair-repair' as const }
      ]
    },
    {
      id: 'living-areas',
      title: 'Living Areas - General',
      items: [
        { id: 'flooring', label: 'Flooring Condition', type: 'good-fair-repair' as const },
        { id: 'walls', label: 'Walls & Paint', type: 'good-fair-repair' as const },
        { id: 'windows', label: 'Windows & Screens', type: 'good-fair-repair' as const },
        { id: 'doors', label: 'Interior Doors', type: 'good-fair-repair' as const }
      ]
    },
    {
      id: 'hvac-system',
      title: 'HVAC System',
      items: [
        { id: 'air-filter', label: 'Air Filter', type: 'good-fair-repair' as const },
        { id: 'thermostat', label: 'Thermostat Function', type: 'good-fair-repair' as const },
        { id: 'vents', label: 'Air Vents & Returns', type: 'good-fair-repair' as const },
        { id: 'heating-cooling', label: 'Heating/Cooling Operation', type: 'good-fair-repair' as const }
      ]
    },
    {
      id: 'safety-security',
      title: 'Safety & Security',
      items: [
        { id: 'smoke-detectors', label: 'Smoke Detectors', type: 'good-fair-repair' as const },
        { id: 'carbon-monoxide', label: 'Carbon Monoxide Detector', type: 'good-fair-repair' as const },
        { id: 'door-locks', label: 'Entry Door Locks', type: 'good-fair-repair' as const },
        { id: 'window-locks', label: 'Window Locks', type: 'good-fair-repair' as const }
      ]
    }
  ], []);

  // Choose between live template data and mock data
  const inspectionSections = useMemo(() => {
    // Use live template data if available and loaded
    if (shouldFetchTemplate && template && !templateLoading && !templateError) {
      console.log('Using live template data:', template.name);
      return convertTemplateToInspectionSections(template);
    }
    
    // Fallback to mock data
    console.log('Using mock inspection data');
    return mockInspectionSections;
  }, [shouldFetchTemplate, template, templateLoading, templateError]);

  // Create mapping between item IDs and their section titles for issue categorization
  const itemToSectionMapping = useMemo(() => {
    const mapping: Record<string, string> = {};
    inspectionSections.forEach(section => {
      section.items.forEach(item => {
        mapping[item.id] = section.title;
      });
    });
    return mapping;
  }, [inspectionSections]);

  const totalItems = inspectionSections.reduce((total, section) => 
    total + section.items.length, 0
  );

  const completedItems = Object.keys(formData).filter(key => 
    formData[key]?.status !== undefined
  ).length;

  const progress = (completedItems / totalItems) * 100;

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const updateFormData = (itemId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const handleStatusChange = (itemId: string, status: 'good' | 'fair' | 'repair') => {
    updateFormData(itemId, 'status', status);
  };

  const handleCommentChange = (itemId: string, comment: string) => {
    updateFormData(itemId, 'comment', comment);
  };

  const toggleNotes = (itemId: string) => {
    setExpandedNotes(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleCameraClick = async (itemId: string) => {
    try {
      console.log('🎯 Camera button clicked for item:', itemId);
      console.log('📱 Using choosePhoto method (will prompt user)');
      
      // Set loading state for this specific item and clear any previous errors
      setLoadingCameraForItem(itemId);
      setCameraErrorForItem(prev => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
      
      const photo = await choosePhoto({ 
        quality: 80, 
        allowEditing: false 
      });
      
      if (photo) {
        console.log('📸 Photo received:', photo);
        
        // Add photo to item's photo collection
        setItemPhotos(prev => {
          const updated = {
            ...prev,
            [itemId]: [...(prev[itemId] || []), photo]
          };
          console.log('📊 Updated item photos:', updated);
          return updated;
        });
        
        // Update form data to indicate photo exists
        const newPhotoCount = (itemPhotos[itemId]?.length || 0) + 1;
        updateFormData(itemId, 'hasPhoto', true);
        updateFormData(itemId, 'photoCount', newPhotoCount);
        
        console.log('✅ Photo captured successfully for item:', itemId, 'Photo ID:', photo.id, 'New count:', newPhotoCount);
      } else {
        console.log('❌ No photo received (user cancelled or error)');
        // Don't show error for user cancellation - this is expected behavior
      }
    } catch (error) {
      console.error('💥 Error taking photo for item:', itemId, error);
      
      // Only show error if it's not a user cancellation
      const errorMessage = error instanceof Error ? error.message : 'Failed to capture photo';
      if (!errorMessage.toLowerCase().includes('cancel')) {
        setCameraErrorForItem(prev => ({
          ...prev,
          [itemId]: errorMessage
        }));
      }
    } finally {
      // Clear loading state for this item
      setLoadingCameraForItem(null);
    }
  };
  
  const removePhotoFromItem = (itemId: string, photoId: string) => {
    setItemPhotos(prev => {
      const updated = {
        ...prev,
        [itemId]: (prev[itemId] || []).filter(photo => photo.id !== photoId)
      };
      
      // Update form data
      const photoCount = updated[itemId]?.length || 0;
      updateFormData(itemId, 'hasPhoto', photoCount > 0);
      updateFormData(itemId, 'photoCount', photoCount);
      
      return updated;
    });
  };

  // Handle scroll to update sticky section header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const headerHeight = 200; // Approximate header height
      
      // Find which section is currently in view
      for (const sectionId of Object.keys(sectionRefs.current)) {
        const element = sectionRefs.current[sectionId];
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + scrollTop - headerHeight;
          const elementBottom = elementTop + rect.height;
          
          if (scrollTop >= elementTop && scrollTop < elementBottom) {
            setCurrentStickySection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  // Calculate completion status for each section
  const getSectionCompletionStatus = (section: typeof inspectionSections[0]) => {
    const sectionItems = section.items;
    const completedSectionItems = sectionItems.filter(item => 
      formData[item.id]?.status !== undefined
    ).length;
    return {
      completed: completedSectionItems,
      total: sectionItems.length,
      isComplete: completedSectionItems === sectionItems.length
    };
  };

  const handleSubmit = () => {
    // Include photos and section mapping in the form data
    const submissionData = {
      ...formData,
      photos: itemPhotos,
      _sectionMapping: itemToSectionMapping // Add section mapping for issue categorization
    };
    
    console.log('Submitting inspection with photos and section mapping:', submissionData);
    onComplete(submissionData);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 pt-12 pb-6 relative z-20">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 mr-2 hover:bg-primary-foreground/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-medium">Inspection Form</h1>
            <p className="text-primary-foreground/80 text-sm line-clamp-1">{propertyAddress}</p>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Overall Progress</span>
            <span>{completedItems}/{totalItems} items completed</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Sticky Section Header */}
      {currentStickySection && (
        <div className="sticky top-0 bg-background border-b border-border z-10 px-6 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">
              {inspectionSections.find(s => s.id === currentStickySection)?.title}
            </h3>
            <div className="text-xs text-muted-foreground px-2 py-1 bg-muted/20 rounded-full">
              {(() => {
                const section = inspectionSections.find(s => s.id === currentStickySection);
                if (section) {
                  const status = getSectionCompletionStatus(section);
                  return `${status.completed}/${status.total}`;
                }
                return '';
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="px-6 py-6">
        <div className="space-y-6">
          {inspectionSections.map((section) => {
            const completionStatus = getSectionCompletionStatus(section);
            
            return (
              <div 
                key={section.id} 
                ref={(el) => {
                  if (el) sectionRefs.current[section.id] = el;
                }}
                className="space-y-4"
              >
                {/* Section Header */}
                <Card className="border border-border/50 bg-muted/5">
                  <Collapsible
                    open={expandedSections[section.id] !== false}
                    onOpenChange={() => toggleSection(section.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="p-4 cursor-pointer flex items-center justify-between hover:bg-muted/10">
                        <div className="flex items-center flex-1">
                          <h3 className="font-medium mr-3 text-base">{section.title}</h3>
                          <div className="flex items-center space-x-2">
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              completionStatus.isComplete 
                                ? 'bg-green-100 text-green-800' 
                                : completionStatus.completed > 0
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-muted-foreground'
                            }`}>
                              {completionStatus.completed}/{completionStatus.total}
                            </div>
                            {completionStatus.isComplete && (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                        </div>
                        <ChevronDown className="w-5 h-5 transition-transform ui-open:rotate-180" />
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-4 pb-4 space-y-3">
                        {section.items.map((item) => (
                          <Card key={item.id} className="border border-border/30 bg-background">
                            <div className="p-4">
                              {/* Item Header with Label */}
                              <div className="mb-4">
                                <label className="font-medium text-sm block mb-3">{item.label}</label>
                                
                                {/* Main Control Row */}
                                <div className="flex items-center justify-between">
                                  {/* Good/Fair/Repair Selection on Left */}
                                  <div className="flex flex-col items-start">
                                    <div className="flex space-x-3 mb-2">
                                      {/* Good - Green with Star */}
                                      <button
                                        onClick={() => handleStatusChange(item.id, 'good')}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                          formData[item.id]?.status === 'good'
                                            ? 'bg-green-500 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-150'
                                        }`}
                                      >
                                        <Star className="w-5 h-5" fill={formData[item.id]?.status === 'good' ? 'currentColor' : 'none'} />
                                      </button>
                                      
                                      {/* Fair - Light Blue with Check */}
                                      <button
                                        onClick={() => handleStatusChange(item.id, 'fair')}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                          formData[item.id]?.status === 'fair'
                                            ? 'bg-cyan-400 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-150'
                                        }`}
                                      >
                                        <Check className="w-5 h-5" />
                                      </button>
                                      
                                      {/* Repair - Orange/Yellow with Wrench */}
                                      <button
                                        onClick={() => handleStatusChange(item.id, 'repair')}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                          formData[item.id]?.status === 'repair'
                                            ? 'bg-orange-500 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-150'
                                        }`}
                                      >
                                        <Wrench className="w-5 h-5" />
                                      </button>
                                    </div>
                                    
                                    {/* Labels */}
                                    <div className="flex space-x-3 text-xs text-muted-foreground">
                                      <span className="w-12 text-center">Good</span>
                                      <span className="w-12 text-center">Fair</span>
                                      <span className="w-12 text-center">Repair</span>
                                    </div>
                                  </div>

                                  {/* Camera & Notes Icons on Right */}
                                  <div className="flex flex-col space-y-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCameraClick(item.id)}
                                      disabled={loadingCameraForItem === item.id}
                                      className={`w-12 h-10 p-0 ${
                                        formData[item.id]?.hasPhoto 
                                          ? 'bg-blue-50 border-blue-200 text-blue-600' 
                                          : ''
                                      } ${loadingCameraForItem === item.id ? 'opacity-50' : ''}`}
                                    >
                                      {loadingCameraForItem === item.id ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <Camera className="w-4 h-4" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => toggleNotes(item.id)}
                                      className={`w-12 h-10 p-0 ${
                                        expandedNotes[item.id] || formData[item.id]?.comment
                                          ? 'bg-amber-50 border-amber-200 text-amber-600' 
                                          : ''
                                      }`}
                                    >
                                      <NotebookPen className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Expandable Notes Section */}
                              {expandedNotes[item.id] && (
                                <div className="mt-3 pt-3 border-t border-border/30">
                                  <Textarea
                                    placeholder="Add notes for this item..."
                                    value={formData[item.id]?.comment || ''}
                                    onChange={(e) => handleCommentChange(item.id, e.target.value)}
                                    className="text-sm"
                                    rows={3}
                                    autoFocus
                                  />
                                </div>
                              )}

                              {/* Show existing comment preview when collapsed */}
                              {!expandedNotes[item.id] && formData[item.id]?.comment && (
                                <div className="mt-3 pt-3 border-t border-border/30">
                                  <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                                    {formData[item.id].comment.length > 50 
                                      ? `${formData[item.id].comment.substring(0, 50)}...` 
                                      : formData[item.id].comment
                                    }
                                  </div>
                                </div>
                              )}

                              {/* Photos Section */}
                              {itemPhotos[item.id] && itemPhotos[item.id].length > 0 && (
                                <div className="mt-3 pt-3 border-t border-border/30">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center text-xs text-blue-600">
                                      <ImageIcon className="w-3 h-3 mr-1" />
                                      {itemPhotos[item.id].length} photo{itemPhotos[item.id].length > 1 ? 's' : ''} attached
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    {itemPhotos[item.id].map((photo) => (
                                      <div key={photo.id} className="relative group">
                                        <div className="aspect-square bg-gray-100 rounded overflow-hidden">
                                          <img 
                                            src={photo.uri} 
                                            alt={`Photo for ${item.label}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              // Fallback for broken images
                                              const target = e.target as HTMLImageElement;
                                              target.style.display = 'none';
                                              target.nextElementSibling?.classList.remove('hidden');
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

                              {/* Camera Error Display - Per Item */}
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
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-6">
        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={completedItems < totalItems}
        >
          Complete ({completedItems}/{totalItems})
        </Button>
      </div>

      {/* Bottom padding to account for fixed button */}
      <div className="h-24"></div>
    </div>
  );
}