import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronDown, Check, Star, Wrench, Camera, NotebookPen } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

interface MobileInspectionFormPageProps {
  propertyId: string;
  propertyAddress: string;
  inspectionId: string;
  onBack: () => void;
  onComplete: (data: any) => void;
}

export function MobileInspectionFormPage({
  propertyId,
  propertyAddress,
  inspectionId,
  onBack,
  onComplete
}: MobileInspectionFormPageProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [currentStickySection, setCurrentStickySection] = useState<string>('');
  const sectionRefs = useRef<Record<string, HTMLElement>>({});

  // Mock inspection template data - now structured as sections (areas) with items
  const inspectionSections = [
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
  ];

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

  const handleCameraClick = (itemId: string) => {
    // In a real app, this would trigger the device camera
    console.log('Opening camera for item:', itemId);
    // For now, just simulate adding a photo
    updateFormData(itemId, 'hasPhoto', true);
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
    onComplete(formData);
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
                                      className={`w-12 h-10 p-0 ${
                                        formData[item.id]?.hasPhoto 
                                          ? 'bg-blue-50 border-blue-200 text-blue-600' 
                                          : ''
                                      }`}
                                    >
                                      <Camera className="w-4 h-4" />
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

                              {/* Photo indicator */}
                              {formData[item.id]?.hasPhoto && (
                                <div className="mt-3 pt-3 border-t border-border/30">
                                  <div className="flex items-center text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                    <Camera className="w-3 h-3 mr-1" />
                                    Photo attached
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