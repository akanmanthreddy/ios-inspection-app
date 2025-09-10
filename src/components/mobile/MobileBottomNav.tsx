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
          className={`flex-1 flex flex-col items-center justify-center py-3 px-4 min-h-[60px] transition-colors ${
            (currentPage === 'communities' || currentPage === 'properties') 
              ? 'text-[#1b365d] bg-[#1b365d]/5' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Building2 className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Communities</span>
        </button>
        
        <button
          onClick={onNavigateToInspections}
          className={`flex-1 flex flex-col items-center justify-center py-3 px-4 min-h-[60px] transition-colors ${
            (currentPage === 'inspections' || currentPage === 'inspections-overview') 
              ? 'text-[#1b365d] bg-[#1b365d]/5' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FileText className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Inspections</span>
        </button>
      </div>
    </div>
  );
}