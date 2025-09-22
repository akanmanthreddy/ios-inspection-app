import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';

interface ActionSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartInspection: () => void;
  onStartUnitTurn: () => void;
}

export function ActionSelectionModal({
  isOpen,
  onClose,
  onStartInspection,
  onStartUnitTurn
}: ActionSelectionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-xs mx-auto bg-background/95 backdrop-blur-sm border border-border/20 shadow-xl">
        {/* Header */}
        <div className="space-y-3 text-center">
          <DialogTitle className="text-lg font-semibold">Choose Your Action</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Select one of the options below to proceed:
          </DialogDescription>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 mt-6">
          <Button
            onClick={() => {
              onStartInspection();
              onClose();
            }}
            className="w-full py-3 transition-all duration-200 hover:scale-[1.02]"
          >
            Start Inspection
          </Button>

          <Button
            onClick={() => {
              onStartUnitTurn();
              onClose();
            }}
            variant="outline"
            className="w-full py-3 transition-all duration-200 hover:scale-[1.02]"
          >
            Start Unit Turn
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}