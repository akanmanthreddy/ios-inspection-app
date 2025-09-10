import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ChevronLeft, FileText, CheckCircle } from 'lucide-react';

interface MobileCompletionOptionsPageProps {
  propertyAddress: string;
  onBack: () => void;
  onPreviewReport: () => void;
  onFinalizeWithoutSigning: () => void;
}

export function MobileCompletionOptionsPage({
  propertyAddress,
  onBack,
  onPreviewReport,
  onFinalizeWithoutSigning
}: MobileCompletionOptionsPageProps) {
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
            <h1 className="text-xl font-medium">Complete Inspection</h1>
            <p className="text-primary-foreground/80 text-sm line-clamp-1">{propertyAddress}</p>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="px-6 py-8">
        <div className="space-y-4">
          <p className="text-center text-muted mb-6">
            How would you like to complete this inspection?
          </p>

          {/* Preview Report Option */}
          <Card className="border border-border/50">
            <Button
              variant="ghost"
              onClick={onPreviewReport}
              className="w-full p-6 h-auto flex flex-col items-center space-y-4 hover:bg-muted/10"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-base mb-2">Preview Report</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Generate a PDF preview where you can select templates, review the report, and finalize or share it
                </p>
              </div>
            </Button>
          </Card>

          {/* Finalize Without Preview Option */}
          <Card className="border border-border/50">
            <Button
              variant="ghost"
              onClick={onFinalizeWithoutSigning}
              className="w-full p-6 h-auto flex flex-col items-center space-y-4 hover:bg-muted/10"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-base mb-2">Finalize Without Signing</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Complete the inspection immediately without generating a report preview
                </p>
              </div>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}