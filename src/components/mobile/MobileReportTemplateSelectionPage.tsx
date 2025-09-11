import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ChevronLeft, FileText, Loader2 } from 'lucide-react';
import { useTemplates } from '../../hooks/useTemplates';
import { Template } from '../../services/api';

interface MobileReportTemplateSelectionPageProps {
  propertyAddress: string;
  onBack: () => void;
  onSelectTemplate: (templateId: number) => void;
}

export function MobileReportTemplateSelectionPage({
  propertyAddress,
  onBack,
  onSelectTemplate
}: MobileReportTemplateSelectionPageProps) {
  // Use live templates API
  const { templates, loading, error } = useTemplates();
  
  // Set default selection to the first template that is marked as default, or the first template
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  // Update selection when templates load
  React.useEffect(() => {
    if (templates.length > 0 && selectedTemplate === null) {
      const defaultTemplate = templates.find(t => t.is_default) || templates[0];
      setSelectedTemplate(defaultTemplate.id);
    }
  }, [templates, selectedTemplate]);

  const handleContinue = () => {
    if (selectedTemplate !== null) {
      onSelectTemplate(selectedTemplate);
    }
  };

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
            <h1 className="text-xl font-medium">Select Report Template</h1>
            <p className="text-primary-foreground/80 text-sm line-clamp-1">{propertyAddress}</p>
          </div>
        </div>
      </div>

      {/* Template Selection */}
      <div className="px-6 py-6">
        <div className="mb-6">
          <p className="text-muted-foreground text-sm">
            Choose a template for your inspection report:
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading templates...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive text-sm mb-2">Failed to load templates</p>
            <p className="text-muted-foreground text-xs">{error}</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">No templates available</p>
          </div>
        ) : (
          <RadioGroup 
            value={selectedTemplate?.toString() || ''} 
            onValueChange={(value) => setSelectedTemplate(parseInt(value))}
          >
            <div className="space-y-4">
              {templates.map((template) => (
                <Card key={template.id} className="border border-border/50">
                  <label
                    htmlFor={template.id.toString()}
                    className="flex items-center p-4 cursor-pointer hover:bg-muted/10 transition-colors"
                  >
                    <RadioGroupItem
                      value={template.id.toString()}
                      id={template.id.toString()}
                      className="mr-4"
                    />
                    <div className="flex items-center flex-1">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <h3 className="font-medium text-base">{template.name}</h3>
                          {template.is_default && (
                            <span className="ml-2 text-xs bg-muted px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {template.description || 'No description available'}
                        </p>
                        <div className="mt-1">
                          <span className="text-xs text-muted-foreground capitalize">
                            {template.type.replace(/-/g, ' ')} • {template.sections?.length || 0} sections
                          </span>
                        </div>
                      </div>
                    </div>
                  </label>
                </Card>
              ))}
            </div>
          </RadioGroup>
        )}
      </div>

      {/* Continue Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-6">
        <Button
          onClick={handleContinue}
          className="w-full"
          disabled={!selectedTemplate || loading}
        >
          Continue to Preview
        </Button>
      </div>

      {/* Bottom padding to account for fixed button */}
      <div className="h-24"></div>
    </div>
  );
}