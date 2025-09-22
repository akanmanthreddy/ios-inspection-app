import { Building2, FileText, Package } from 'lucide-react';

interface MobileBottomNavProps {
  currentPage: string;
  onNavigateToCommunities: () => void;
  onNavigateToInspections: () => void;
  onNavigateToUnitTurns: () => void;
}

export function MobileBottomNav({
  currentPage,
  onNavigateToCommunities,
  onNavigateToInspections,
  onNavigateToUnitTurns
}: MobileBottomNavProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
      style={{
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <div className="flex">
        <button
          onClick={onNavigateToCommunities}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-2 min-h-[60px] transition-colors ${
            (currentPage === 'communities' || currentPage === 'properties')
              ? 'text-[#1b365d] bg-[#1b365d]/5'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Communities</span>
        </button>

        <button
          onClick={onNavigateToInspections}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-2 min-h-[60px] transition-colors ${
            (currentPage === 'inspections' || currentPage === 'inspections-overview')
              ? 'text-[#1b365d] bg-[#1b365d]/5'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Inspections</span>
        </button>

        <button
          onClick={onNavigateToUnitTurns}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-2 min-h-[60px] transition-colors ${
            currentPage === 'unit-turns'
              ? 'text-[#1b365d] bg-[#1b365d]/5'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Package className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Unit Turns</span>
        </button>
      </div>
    </div>
  );
}