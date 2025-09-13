import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Camera, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Inspection, DetailedInspection } from '../../services/api';
import { 
  UnifiedSectionDisplay, 
  UnifiedItemDisplay, 
  unifyInspectionData, 
  getUnifiedInspectionStats 
} from '../../utils/inspectionUnifier';

interface UnifiedInspectionCardProps {
  inspection: Inspection | DetailedInspection;
}

interface SectionHeaderProps {
  section: UnifiedSectionDisplay;
  isExpanded: boolean;
  onToggle: () => void;
}

interface InspectionItemProps {
  item: UnifiedItemDisplay;
}

interface ItemPhotosProps {
  photos: string[];
  maxVisible?: number;
}

/**
 * Display photos for an inspection item with thumbnail grid
 */
const ItemPhotos: React.FC<ItemPhotosProps> = ({ photos, maxVisible = 3 }) => {
  if (!photos || photos.length === 0) return null;

  const visiblePhotos = photos.slice(0, maxVisible);
  const remainingCount = photos.length - maxVisible;

  return (
    <div className="mt-2">
      <div className="flex items-center text-xs text-slate-600 font-medium mb-2">
        <Camera className="w-3 h-3 mr-1" />
        {photos.length} photo{photos.length !== 1 ? 's' : ''}
      </div>
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {visiblePhotos.map((photo, index) => (
          <div 
            key={index}
            className="flex-shrink-0 w-12 h-12 rounded cursor-pointer hover:opacity-80 transition-opacity overflow-hidden border border-slate-200"
            onClick={() => {
              // TODO: Implement photo viewer modal
            }}
          >
            <img 
              src={photo} 
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to camera icon if image fails to load
                const target = e.target as HTMLImageElement;
                const container = target.parentElement;
                if (container) {
                  container.innerHTML = '<div class="w-full h-full bg-slate-200 flex items-center justify-center"><svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>';
                }
              }}
            />
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="flex-shrink-0 w-12 h-12 rounded bg-slate-100 border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-150 transition-colors">
            <span className="text-xs font-medium text-slate-600">+{remainingCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Display individual inspection item with status, notes, and photos
 */
const InspectionItem: React.FC<InspectionItemProps> = ({ item }) => {
  const getStatusBadge = () => {
    if (!item.status && !item.isRepairItem) return null;

    let badgeClass = '';
    let displayText = '';

    if (item.isRepairItem) {
      // Repair items get severity-based styling
      switch (item.severity) {
        case 'critical':
          badgeClass = 'bg-red-500/10 text-red-700 border-red-300';
          displayText = 'Critical';
          break;
        case 'high':
          badgeClass = 'bg-orange-500/10 text-orange-700 border-orange-300';
          displayText = 'High Priority';
          break;
        case 'medium':
          badgeClass = 'bg-yellow-500/10 text-yellow-700 border-yellow-300';
          displayText = 'Medium Priority';
          break;
        case 'low':
          badgeClass = 'bg-blue-500/10 text-blue-700 border-blue-300';
          displayText = 'Low Priority';
          break;
        default:
          badgeClass = 'bg-red-500/10 text-red-700 border-red-300';
          displayText = 'Repair';
      }
    } else {
      // Template items get status-based styling
      switch (item.status) {
        case 'good':
        case 'pass':
          badgeClass = 'bg-green-500/10 text-green-700 border-green-200';
          displayText = item.status === 'good' ? 'Good' : 'Pass';
          break;
        case 'fair':
          badgeClass = 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
          displayText = 'Fair';
          break;
        case 'repair':
        case 'fail':
          badgeClass = 'bg-red-500/10 text-red-700 border-red-200';
          displayText = item.status === 'repair' ? 'Repair' : 'Fail';
          break;
        case 'not_applicable':
          badgeClass = 'bg-gray-500/10 text-gray-700 border-gray-200';
          displayText = 'N/A';
          break;
        default:
          if (item.value) {
            badgeClass = 'bg-blue-500/10 text-blue-700 border-blue-200';
            displayText = item.value;
          } else {
            return null;
          }
      }
    }

    return (
      <Badge className={badgeClass}>
        {displayText}
      </Badge>
    );
  };

  const getStatusIcon = () => {
    if (item.isRepairItem) {
      return item.resolved ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-red-600" />
      );
    }
    
    switch (item.status) {
      case 'good':
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'repair':
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className={`border-l-2 pl-4 py-2 ${
      item.isRepairItem 
        ? 'border-red-400 bg-red-50/30' 
        : 'border-slate-200'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center mb-1">
            {getStatusIcon()}
            <h5 className="font-medium text-sm ml-2">{item.itemName}</h5>
            {item.isRequired && (
              <Badge variant="outline" className="text-xs ml-2">Required</Badge>
            )}
          </div>
          
          {item.notes && (
            <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-2 rounded">
              {item.notes}
            </p>
          )}
          
          {item.isRepairItem && item.resolved !== undefined && (
            <div className="flex items-center mt-1">
              <span className="text-xs text-slate-600 font-medium">
                Status: {item.resolved ? 'Resolved' : 'Unresolved'}
              </span>
            </div>
          )}
        </div>
        
        <div className="ml-3">
          {getStatusBadge()}
        </div>
      </div>

      <ItemPhotos photos={item.photos || []} maxVisible={3} />
    </div>
  );
};

/**
 * Collapsible section header with expand/collapse functionality
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({ section, isExpanded, onToggle }) => {
  const repairItemsCount = section.items.filter(item => item.isRepairItem).length;
  
  return (
    <div 
      className="flex items-center justify-between p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
      onClick={onToggle}
    >
      <div className="flex items-center flex-1">
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-slate-600 mr-2" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-600 mr-2" />
        )}
        
        <div>
          <h4 className="font-semibold text-base">{section.sectionName}</h4>
          {section.sectionDescription && (
            <p className="text-sm text-slate-600">{section.sectionDescription}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {repairItemsCount > 0 && (
          <Badge className="bg-red-100 text-red-800">
            {repairItemsCount} Repair Item{repairItemsCount !== 1 ? 's' : ''}
          </Badge>
        )}
        
        {section.totalPhotos > 0 && (
          <Badge variant="outline" className="text-slate-600">
            <Camera className="w-3 h-3 mr-1" />
            {section.totalPhotos}
          </Badge>
        )}
        
        <Badge variant="outline" className="text-slate-600">
          {section.items.length} Item{section.items.length !== 1 ? 's' : ''}
        </Badge>
      </div>
    </div>
  );
};

/**
 * Main unified inspection card component
 */
export const UnifiedInspectionCard: React.FC<UnifiedInspectionCardProps> = ({ inspection }) => {
  // Transform inspection data into unified structure
  const unifiedSections = useMemo(() => 
    unifyInspectionData(inspection), 
    [inspection]
  );
  
  const stats = useMemo(() => 
    getUnifiedInspectionStats(unifiedSections), 
    [unifiedSections]
  );

  // State for expanded sections - auto-expand sections with repair items
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const sectionsWithRepairItems = unifiedSections
      .filter(section => section.hasRepairItems)
      .map(section => section.sectionId);
    return new Set(sectionsWithRepairItems);
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Handle empty state
  if (unifiedSections.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-700 mb-2">No Repair Items Found</h3>
        <p className="text-sm text-slate-600">
          This inspection was completed with no repair items identified.
        </p>
      </Card>
    );
  }

  return (
    <div>
      {/* Summary header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          Repair Items ({stats.totalItems} items)
        </h3>
      </div>

      {/* Unified card with all sections */}
      <Card className="divide-y divide-border">
        {unifiedSections.map((section) => (
          <div key={section.sectionId}>
            <SectionHeader
              section={section}
              isExpanded={expandedSections.has(section.sectionId)}
              onToggle={() => toggleSection(section.sectionId)}
            />
            
            {expandedSections.has(section.sectionId) && (
              <div className="p-4 space-y-3">
                {section.items.length > 0 ? (
                  section.items.map((item) => (
                    <InspectionItem key={item.itemId} item={item} />
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    No items recorded for this section
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
};