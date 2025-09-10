import { Building2, FileText } from 'lucide-react';

interface MobileBottomNavProps {
  currentPage: string;
  onNavigateToCommunities: () => void;
  onNavigateToInspections: () => void;
}

export function MobileBottomNav({
  currentPage,
  onNavigateToCommunities,
  onNavigateToInspections
}: MobileBottomNavProps) {
  const isCommunitiesActive = currentPage === 'communities' || currentPage === 'properties';
  const isInspectionsActive = currentPage === 'inspections' || currentPage === 'inspection-form';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/30 ios-safe-bottom">
      <div className="flex">
        <button
          onClick={onNavigateToCommunities}
          className={`flex-1 flex flex-col items-center py-2 px-4 touch-target transition-colors ${
            isCommunitiesActive 
              ? 'text-primary' 
              : 'text-muted hover:text-foreground'
          }`}
        >
          <Building2 className="w-6 h-6 mb-1" />
          <span className="text-xs">Communities</span>
        </button>
        
        <button
          onClick={onNavigateToInspections}
          className={`flex-1 flex flex-col items-center py-2 px-4 touch-target transition-colors ${
            isInspectionsActive 
              ? 'text-primary' 
              : 'text-muted hover:text-foreground'
          }`}
        >
          <FileText className="w-6 h-6 mb-1" />
          <span className="text-xs">Inspections</span>
        </button>
      </div>
    </div>
  );
}