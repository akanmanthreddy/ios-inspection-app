import { useState, useRef } from 'react';
import { ArrowLeft, Camera, Check, X, ChevronDown, ChevronUp, Upload, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';

interface InspectionItem {
  id: string;
  name: string;
  description: string;
  rating: 'pass' | 'fail' | null;
  comments: string;
  photos: string[];
}

interface InspectionArea {
  id: string;
  name: string;
  items: InspectionItem[];
  isExpanded: boolean;
}

interface InspectionFormPageProps {
  propertyId: string;
  propertyAddress: string;
  inspectionId: string;
  onBack: () => void;
  onSubmit: (inspectionData: any) => void;
}

const INSPECTION_AREAS: InspectionArea[] = [
  {
    id: 'exterior',
    name: 'Exterior',
    isExpanded: true,
    items: [
      {
        id: 'ext-roof',
        name: 'Roof Condition',
        description: 'Check for damaged shingles, leaks, gutters, and overall structural integrity',
        rating: null,
        comments: '',
        photos: []
      },
      {
        id: 'ext-siding',
        name: 'Siding & Paint',
        description: 'Inspect exterior walls, paint condition, and any visible damage',
        rating: null,
        comments: '',
        photos: []
      },
      {
        id: 'ext-windows',
        name: 'Windows & Doors',
        description: 'Check window frames, glass, locks, and door functionality',
        rating: null,
        comments: '',
        photos: []
      },
      {
        id: 'ext-landscape',
        name: 'Landscaping & Drainage',
        description: 'Evaluate yard condition, drainage, and potential water issues',
        rating: null,
        comments: '',
        photos: []
      }
    ]
  },
  {
    id: 'interior',
    name: 'Interior',
    isExpanded: false,
    items: [
      {
        id: 'int-flooring',
        name: 'Flooring',
        description: 'Check carpet, hardwood, tile condition and any damage',
        rating: null,
        comments: '',
        photos: []
      },
      {
        id: 'int-walls',
        name: 'Walls & Ceilings',
        description: 'Inspect paint, drywall, cracks, and overall condition',
        rating: null,
        comments: '',
        photos: []
      },
      {
        id: 'int-lighting',
        name: 'Lighting & Electrical',
        description: 'Test light fixtures, outlets, and visible electrical components',
        rating: null,
        comments: '',
        photos: []
      },
      {
        id: 'int-doors',
        name: 'Interior Doors',
        description: 'Check door operation, hardware, and overall condition',
        rating: null,
        comments: '',
        photos: []
      }
    ]
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    isExpanded: false,
    items: [
      {
        id: 'kit-appliances',
        name: 'Appliances',
        description: 'Test refrigerator, stove, dishwasher, and other appliances',
        rating: null,
        comments: '',
        photos: []
      },
      {
        id: 'kit-cabinets',
        name: 'Cabinets & Countertops',
        description: 'Check cabinet doors, drawers, and countertop condition',
        rating: null,
        comments: '',
        photos: []
      },
      {
        id: 'kit-plumbing',
        name: 'Kitchen Plumbing',
        description: 'Test sink, faucet, and check for leaks',
        rating: null,
        comments: '',
        photos: []
      }
    ]
  },
  {
    id: 'bathrooms',
    name: 'Bathrooms',
    isExpanded: false,
    items: [
      {
        id: 'bath-fixtures',
        name: 'Fixtures',
        description: 'Test toilet, sink, shower/tub functionality',
        rating: null,
        comments: '',
        photos: []
      },
      {
        id: 'bath-plumbing',
        name: 'Plumbing',
        description: 'Check water pressure, drainage, and visible pipes',
        rating: null,
        comments: '',
        photos: []
      },
      {
        id: 'bath-ventilation',
        name: 'Ventilation',
        description: 'Test exhaust fans and check for proper ventilation',
        rating: null,
        comments: '',
        photos: []
      },
      {
        id: 'bath-tiles',
        name: 'Tiles & Grout',
        description: 'Inspect tile condition, grout, and potential water damage',
        rating: null,
        comments: '',
        photos: []
      }
    ]
  },
  {
    id: 'hvac',
    name: 'HVAC & Utilities',
    isExpanded: false,
    items: [
      {
        id: 'hvac-heating',
        name: 'Heating System',
        description: 'Test heating system operation and check filters',
        rating: null,
        comments: '',
        photos: []
      },
      {
        id: 'hvac-cooling',
        name: 'Cooling System',
        description: 'Test air conditioning and check vents',
        rating: null,
        comments: '',
        photos: []
      },
      {
        id: 'hvac-water',
        name: 'Water Heater',
        description: 'Check water heater condition and operation',
        rating: null,
        comments: '',
        photos: []
      },
      {
        id: 'hvac-electrical',
        name: 'Electrical Panel',
        description: 'Inspect main electrical panel and circuit breakers',
        rating: null,
        comments: '',
        photos: []
      }
    ]
  },
  {
    id: 'safety',
    name: 'Safety & Security',
    isExpanded: false,
    items: [
      {
        id: 'safety-smoke',
        name: 'Smoke Detectors',
        description: 'Test all smoke detectors and check battery status',
        rating: null,
        comments: '',
        photos: []
      },
      {
        id: 'safety-co',
        name: 'Carbon Monoxide Detectors',
        description: 'Test CO detectors and verify proper placement',
        rating: null,
        comments: '',
        photos: []
      },
      {
        id: 'safety-locks',
        name: 'Locks & Security',
        description: 'Check all door and window locks',
        rating: null,
        comments: '',
        photos: []
      },
      {
        id: 'safety-railings',
        name: 'Railings & Steps',
        description: 'Inspect stair railings and step condition',
        rating: null,
        comments: '',
        photos: []
      }
    ]
  }
];

export function InspectionFormPage({ 
  propertyId, 
  propertyAddress, 
  inspectionId, 
  onBack, 
  onSubmit 
}: InspectionFormPageProps) {
  const [inspectionAreas, setInspectionAreas] = useState<InspectionArea[]>(INSPECTION_AREAS);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const toggleAreaExpansion = (areaId: string) => {
    setInspectionAreas(areas =>
      areas.map(area =>
        area.id === areaId ? { ...area, isExpanded: !area.isExpanded } : area
      )
    );
  };

  const updateItemRating = (areaId: string, itemId: string, rating: 'pass' | 'fail') => {
    setInspectionAreas(areas =>
      areas.map(area =>
        area.id === areaId
          ? {
              ...area,
              items: area.items.map(item =>
                item.id === itemId ? { ...item, rating } : item
              )
            }
          : area
      )
    );
  };

  const updateItemComments = (areaId: string, itemId: string, comments: string) => {
    setInspectionAreas(areas =>
      areas.map(area =>
        area.id === areaId
          ? {
              ...area,
              items: area.items.map(item =>
                item.id === itemId ? { ...item, comments } : item
              )
            }
          : area
      )
    );
  };

  const handlePhotoUpload = (areaId: string, itemId: string, files: FileList | null) => {
    if (!files) return;

    // In a real app, you'd upload to a server/cloud storage
    // For now, we'll create local URLs for preview
    const newPhotos: string[] = [];
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const photoUrl = URL.createObjectURL(file);
        newPhotos.push(photoUrl);
      }
    });

    setInspectionAreas(areas =>
      areas.map(area =>
        area.id === areaId
          ? {
              ...area,
              items: area.items.map(item =>
                item.id === itemId
                  ? { ...item, photos: [...item.photos, ...newPhotos] }
                  : item
              )
            }
          : area
      )
    );

    toast.success(`${newPhotos.length} photo(s) added`);
  };

  const removePhoto = (areaId: string, itemId: string, photoIndex: number) => {
    setInspectionAreas(areas =>
      areas.map(area =>
        area.id === areaId
          ? {
              ...area,
              items: area.items.map(item =>
                item.id === itemId
                  ? {
                      ...item,
                      photos: item.photos.filter((_, index) => index !== photoIndex)
                    }
                  : item
              )
            }
          : area
      )
    );
  };

  const getCompletionStats = () => {
    const totalItems = inspectionAreas.reduce((sum, area) => sum + area.items.length, 0);
    const completedItems = inspectionAreas.reduce(
      (sum, area) => sum + area.items.filter(item => item.rating !== null).length,
      0
    );
    const failedItems = inspectionAreas.reduce(
      (sum, area) => sum + area.items.filter(item => item.rating === 'fail').length,
      0
    );

    return { totalItems, completedItems, failedItems };
  };

  const handleSubmit = async () => {
    const { completedItems, totalItems } = getCompletionStats();
    
    if (completedItems < totalItems) {
      const proceed = window.confirm(
        `You have completed ${completedItems} out of ${totalItems} items. Do you want to submit the inspection anyway?`
      );
      if (!proceed) return;
    }

    setIsSaving(true);
    try {
      const inspectionData = {
        inspectionId,
        propertyId,
        propertyAddress,
        areas: inspectionAreas,
        completedAt: new Date().toISOString(),
        completionRate: (completedItems / totalItems) * 100
      };

      await onSubmit(inspectionData);
      toast.success('Inspection submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit inspection. Please try again.');
      console.error('Submission error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const { totalItems, completedItems, failedItems } = getCompletionStats();
  const completionPercentage = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Property Inspection</h1>
                <p className="text-sm text-gray-600">{propertyAddress}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {completedItems} of {totalItems} completed
                </div>
                <div className="text-xs text-gray-500">
                  {completionPercentage}% • {failedItems} issues found
                </div>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Submit Inspection
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Inspection Areas */}
      <div className="p-4 space-y-4">
        {inspectionAreas.map((area) => (
          <Card key={area.id} className="shadow-sm">
            <Collapsible
              open={area.isExpanded}
              onOpenChange={() => toggleAreaExpansion(area.id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{area.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {area.items.filter(item => item.rating !== null).length} / {area.items.length}
                      </Badge>
                      {area.items.some(item => item.rating === 'fail') && (
                        <Badge variant="destructive" className="text-xs">
                          Issues Found
                        </Badge>
                      )}
                    </div>
                    {area.isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    {area.items.map((item, itemIndex) => (
                      <div key={item.id}>
                        {itemIndex > 0 && <Separator className="my-6" />}
                        
                        <div className="space-y-4">
                          {/* Item Header */}
                          <div>
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          </div>

                          {/* Rating Buttons */}
                          <div className="flex gap-3">
                            <Button
                              variant={item.rating === 'pass' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateItemRating(area.id, item.id, 'pass')}
                              className={
                                item.rating === 'pass'
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'border-green-600 text-green-600 hover:bg-green-50'
                              }
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Pass
                            </Button>
                            <Button
                              variant={item.rating === 'fail' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateItemRating(area.id, item.id, 'fail')}
                              className={
                                item.rating === 'fail'
                                  ? 'bg-red-600 hover:bg-red-700 text-white'
                                  : 'border-red-600 text-red-600 hover:bg-red-50'
                              }
                            >
                              <X className="w-4 h-4 mr-2" />
                              Fail
                            </Button>
                          </div>

                          {/* Comments */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Comments
                            </label>
                            <Textarea
                              value={item.comments}
                              onChange={(e) => updateItemComments(area.id, item.id, e.target.value)}
                              placeholder="Add any additional notes or observations..."
                              className="resize-none"
                              rows={3}
                            />
                          </div>

                          {/* Photos */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <label className="block text-sm font-medium text-gray-700">
                                Photos ({item.photos.length})
                              </label>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const input = fileInputRefs.current[`${area.id}-${item.id}`];
                                    input?.click();
                                  }}
                                >
                                  <Camera className="w-4 h-4 mr-2" />
                                  Take Photo
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const input = fileInputRefs.current[`${area.id}-${item.id}`];
                                    input?.click();
                                  }}
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload
                                </Button>
                              </div>
                            </div>

                            <input
                              ref={el => fileInputRefs.current[`${area.id}-${item.id}`] = el}
                              type="file"
                              accept="image/*"
                              multiple
                              capture="environment"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload(area.id, item.id, e.target.files)}
                            />

                            {item.photos.length > 0 && (
                              <div className="grid grid-cols-3 gap-3 mt-3">
                                {item.photos.map((photo, photoIndex) => (
                                  <div key={photoIndex} className="relative group">
                                    <img
                                      src={photo}
                                      alt={`${item.name} photo ${photoIndex + 1}`}
                                      className="w-full h-24 object-cover rounded-lg border"
                                    />
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                                      onClick={() => removePhoto(area.id, item.id, photoIndex)}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {/* Bottom Spacer */}
      <div className="h-20" />
    </div>
  );
}