import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ChevronLeft, FileText } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
}

interface MobileReportTemplateSelectionPageProps {
  propertyAddress: string;
  onBack: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export function MobileReportTemplateSelectionPage({
  propertyAddress,
  onBack,
  onSelectTemplate
}: MobileReportTemplateSelectionPageProps) {
  // Mock templates - in real app these would come from API
  const availableTemplates: Template[] = [
    {
      id: 'default',
      name: 'Default Template',
      description: 'Standard inspection report format with all essential sections',
      isDefault: true
    },
    {
      id: 'property-assigned',
      name: 'Premium Template',
      description: 'Enhanced template with additional formatting and branding options',
      isDefault: false
    }
  ];

  const [selectedTemplate, setSelectedTemplate] = useState<string>('default');

  const handleContinue = () => {
    onSelectTemplate(selectedTemplate);
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

        <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate}>
          <div className="space-y-4">
            {availableTemplates.map((template) => (
              <Card key={template.id} className="border border-border/50">
                <label
                  htmlFor={template.id}
                  className="flex items-center p-4 cursor-pointer hover:bg-muted/10 transition-colors"
                >
                  <RadioGroupItem
                    value={template.id}
                    id={template.id}
                    className="mr-4"
                  />
                  <div className="flex items-center flex-1">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h3 className="font-medium text-base">{template.name}</h3>
                        {template.isDefault && (
                          <span className="ml-2 text-xs bg-muted px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </label>
              </Card>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Continue Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-6">
        <Button
          onClick={handleContinue}
          className="w-full"
          disabled={!selectedTemplate}
        >
          Continue to Preview
        </Button>
      </div>

      {/* Bottom padding to account for fixed button */}
      <div className="h-24"></div>
    </div>
  );
}