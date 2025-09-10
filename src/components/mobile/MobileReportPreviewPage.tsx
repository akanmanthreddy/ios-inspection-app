import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { ChevronLeft, Share2, Check, Camera, MessageSquare } from 'lucide-react';

interface InspectionData {
  [itemId: string]: {
    status?: 'good' | 'fair' | 'repair';
    comment?: string;
    hasPhoto?: boolean;
  };
}

interface MobileReportPreviewPageProps {
  propertyAddress: string;
  inspectionData: InspectionData;
  selectedTemplate: string;
  onBack: () => void;
  onFinalize: () => void;
  onShare: (email: string) => void;
}

export function MobileReportPreviewPage({
  propertyAddress,
  inspectionData,
  selectedTemplate,
  onBack,
  onFinalize,
  onShare
}: MobileReportPreviewPageProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');

  // Mock inspection sections for the preview
  const inspectionSections = [
    {
      id: 'kitchen-appliances',
      title: 'Kitchen - Appliances',
      items: [
        { id: 'refrigerator', label: 'Refrigerator' },
        { id: 'stove', label: 'Stove/Oven' },
        { id: 'dishwasher', label: 'Dishwasher' },
        { id: 'microwave', label: 'Microwave' }
      ]
    },
    {
      id: 'bathroom-plumbing',
      title: 'Bathroom - Plumbing',
      items: [
        { id: 'toilet', label: 'Toilet' },
        { id: 'shower-tub', label: 'Shower/Tub' },
        { id: 'bathroom-sink', label: 'Bathroom Sink' }
      ]
    }
  ];

  // Filter completed sections and items
  const completedSectionsData = inspectionSections.map(section => ({
    ...section,
    items: section.items.filter(item => inspectionData[item.id]?.status)
  })).filter(section => section.items.length > 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'fair': return 'text-cyan-600 bg-cyan-50';
      case 'repair': return 'text-orange-600 bg-orange-50';
      default: return 'text-muted-foreground bg-gray-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'good': return 'Good';
      case 'fair': return 'Fair';
      case 'repair': return 'Repair';
      default: return 'Unknown';
    }
  };

  const handleShare = () => {
    if (shareEmail.trim()) {
      onShare(shareEmail.trim());
      setIsShareDialogOpen(false);
      setShareEmail('');
    }
  };

  const currentDate = new Date();
  const inspectionTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const reportCreatedTime = currentDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 pt-12 pb-6">
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
            <h1 className="text-xl font-medium">Report Preview</h1>
            <p className="text-primary-foreground/80 text-sm">
              {selectedTemplate === 'default' ? 'Default Template' : 'Premium Template'}
            </p>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div className="px-6 py-6">
        <Card className="border border-border/50 bg-white shadow-sm">
          <div className="p-6">
            {/* Report Header */}
            <div className="border-b border-border/30 pb-4 mb-6">
              <h2 className="text-lg font-medium mb-3">Property Inspection Report</h2>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><span className="font-medium">Property:</span> {propertyAddress}</p>
                <p><span className="font-medium">Inspection Time:</span> {inspectionTime}</p>
                <p><span className="font-medium">Report Created:</span> {reportCreatedTime}</p>
                <p><span className="font-medium">Template:</span> {selectedTemplate === 'default' ? 'Default' : 'Premium'}</p>
              </div>
            </div>

            {/* Report Body */}
            <div className="space-y-6">
              {completedSectionsData.map((section) => (
                <div key={section.id}>
                  <h3 className="font-medium text-base mb-3 text-primary">
                    {section.title}
                  </h3>
                  <div className="space-y-3">
                    {section.items.map((item) => {
                      const itemData = inspectionData[item.id];
                      if (!itemData?.status) return null;

                      return (
                        <div key={item.id} className="flex items-start justify-between py-2 border-b border-border/20 last:border-b-0">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{item.label}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(itemData.status)}`}>
                                {getStatusLabel(itemData.status)}
                              </span>
                            </div>
                            
                            {/* Notes */}
                            {itemData.comment && (
                              <div className="flex items-start mt-2">
                                <MessageSquare className="w-3 h-3 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" />
                                <p className="text-xs text-muted-foreground">{itemData.comment}</p>
                              </div>
                            )}
                            
                            {/* Photo indicator */}
                            {itemData.hasPhoto && (
                              <div className="flex items-center mt-2">
                                <Camera className="w-3 h-3 text-blue-600 mr-2" />
                                <span className="text-xs text-blue-600">Photo attached</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {completedSectionsData.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No completed inspection items to display</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <div className="flex space-x-3">
          <Button
            onClick={onFinalize}
            className="flex-1"
          >
            <Check className="w-4 h-4 mr-2" />
            Finalize
          </Button>
          
          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4">
              <DialogHeader>
                <DialogTitle>Share Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsShareDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleShare}
                    disabled={!shareEmail.trim()}
                    className="flex-1"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Bottom padding to account for fixed buttons */}
      <div className="h-20"></div>
    </div>
  );
}