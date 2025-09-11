import { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Home, FileText, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { useTemplates } from '../../hooks/useTemplates';

interface MobileStartInspectionPageProps {
  onBack: () => void;
  onStartInspection: (communityId: string, propertyId: string, templateId: string | number) => void;
  communities: Array<{ id: string; name: string; }>;
  properties: Array<{ id: string; address: string; unitNumber?: string; }>;
  onCommunityChange: (communityId: string) => void;
  preSelectedCommunity?: string;
  preSelectedProperty?: { id: string; address: string; };
}

export function MobileStartInspectionPage({
  onBack,
  onStartInspection,
  communities,
  properties,
  onCommunityChange,
  preSelectedCommunity,
  preSelectedProperty
}: MobileStartInspectionPageProps) {
  const [selectedCommunity, setSelectedCommunity] = useState<string>(preSelectedCommunity || '');
  const [selectedProperty, setSelectedProperty] = useState<string>(preSelectedProperty?.id || '');
  const [selectedTemplate, setSelectedTemplate] = useState<string | number | null>(null);

  // Use live templates API
  const { templates, loading: templatesLoading, error: templatesError } = useTemplates();

  // Determine if we're in pre-filled mode (coming from a specific property)
  const isPreFilled = preSelectedCommunity && preSelectedProperty;

  // Set default template selection
  useEffect(() => {
    if (templates.length > 0 && selectedTemplate === null) {
      const defaultTemplate = templates.find(t => t.is_default) || templates[0];
      setSelectedTemplate(defaultTemplate.id);
    }
  }, [templates, selectedTemplate]);

  const handleCommunityChange = (communityId: string) => {
    setSelectedCommunity(communityId);
    setSelectedProperty(''); // Reset property when community changes
    onCommunityChange(communityId);
  };

  const isFormValid = selectedCommunity && selectedProperty && selectedTemplate !== null;

  const handleStartInspection = () => {
    if (isFormValid && selectedTemplate !== null) {
      onStartInspection(selectedCommunity, selectedProperty, selectedTemplate);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 pt-12 pb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-medium">Start New Inspection</h1>
        </div>
        <div className="text-center">
          <p className="text-primary-foreground/80 text-sm">
            {isPreFilled 
              ? "Select inspection template to begin" 
              : "Select community, property, and inspection template"
            }
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Community Selection */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <Label className="text-base font-medium">Select Community</Label>
              <p className="text-sm text-muted-foreground">
                {isPreFilled ? "Pre-selected community" : "Choose the community to inspect"}
              </p>
            </div>
          </div>
          {isPreFilled ? (
            <div className="w-full p-3 bg-muted/20 border border-border/50 rounded-md">
              <span className="text-foreground">
                {communities.find(c => c.id === selectedCommunity)?.name || 'Unknown Community'}
              </span>
            </div>
          ) : (
            <Select value={selectedCommunity} onValueChange={handleCommunityChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a community..." />
              </SelectTrigger>
              <SelectContent>
                {communities.map((community) => (
                  <SelectItem key={community.id} value={community.id}>
                    {community.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Card>

        {/* Property Selection */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mr-3">
              <Home className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <Label className="text-base font-medium">Select Property</Label>
              <p className="text-sm text-muted-foreground">
                {isPreFilled ? "Pre-selected property" : "Choose the specific property unit"}
              </p>
            </div>
          </div>
          {isPreFilled ? (
            <div className="w-full p-3 bg-muted/20 border border-border/50 rounded-md">
              <span className="text-foreground">
                {preSelectedProperty?.address}
              </span>
            </div>
          ) : (
            <Select 
              value={selectedProperty} 
              onValueChange={setSelectedProperty}
              disabled={!selectedCommunity}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={selectedCommunity ? "Choose a property..." : "Select community first"} />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.address}
                    {property.unitNumber && ` - Unit ${property.unitNumber}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Card>

        {/* Template Selection */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mr-3">
              <FileText className="w-5 h-5 text-accent" />
            </div>
            <div>
              <Label className="text-base font-medium">Select Template</Label>
              <p className="text-sm text-muted-foreground">Choose inspection type and checklist</p>
            </div>
          </div>
          {templatesLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-primary mr-2" />
              <span className="text-sm text-muted-foreground">Loading templates...</span>
            </div>
          ) : templatesError ? (
            <div className="text-center py-4">
              <p className="text-destructive text-sm mb-1">Failed to load templates</p>
              <p className="text-muted-foreground text-xs">{templatesError}</p>
            </div>
          ) : (
            <Select 
              value={selectedTemplate?.toString() || ''} 
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose inspection template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    {template.name}{template.is_default ? ' (Default)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Card>

        {/* Selected Summary */}
        {(selectedCommunity || selectedProperty || selectedTemplate !== null) && (
          <Card className="p-6 bg-muted/10 border-muted/20">
            <h3 className="font-medium mb-3">Inspection Summary</h3>
            <div className="space-y-2 text-sm">
              {selectedCommunity && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Community:</span>
                  <span className="font-medium">
                    {communities.find(c => c.id === selectedCommunity)?.name || 'Unknown'}
                  </span>
                </div>
              )}
              {selectedProperty && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property:</span>
                  <span className="font-medium">
                    {properties.find(p => p.id === selectedProperty)?.address || 'Unknown'}
                  </span>
                </div>
              )}
              {selectedTemplate !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Template:</span>
                  <span className="font-medium">
                    {templates.find(t => t.id.toString() === selectedTemplate.toString())?.name || 'Unknown'}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/30 px-6 py-4">
        <Button
          onClick={handleStartInspection}
          disabled={!isFormValid}
          className="w-full h-12 text-base"
          size="lg"
        >
          Start Inspection
        </Button>
      </div>
    </div>
  );
}