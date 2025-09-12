import { Inspection, DetailedInspection, TemplateSection, TemplateItem, InspectionItemResponse } from '../services/api';

/**
 * Unified data structure for displaying inspection sections and items
 * in a single card format with nested hierarchy
 */
export interface UnifiedSectionDisplay {
  sectionId: string;
  sectionName: string;
  sectionDescription?: string;
  sectionOrder: number;
  items: UnifiedItemDisplay[];
  hasRepairItems: boolean;
  totalPhotos: number;
}

export interface UnifiedItemDisplay {
  itemId: string;
  itemName: string;
  itemType?: 'text' | 'select' | 'number' | 'checkbox' | undefined;
  status?: 'good' | 'fair' | 'repair' | 'pass' | 'fail' | 'not_applicable' | undefined;
  value?: string | undefined;
  notes?: string | undefined;
  photos?: string[];
  isRepairItem: boolean;
  severity?: 'low' | 'medium' | 'high' | 'critical' | undefined;
  isRequired?: boolean | undefined;
  resolved?: boolean | undefined; // For repair items
}

/**
 * Type guard to check if inspection has detailed template data
 */
export function isDetailedInspection(inspection: Inspection | DetailedInspection): inspection is DetailedInspection {
  return 'template' in inspection && inspection.template !== undefined;
}

/**
 * Transform a template item and its response into unified format
 */
function transformTemplateItemToUnified(
  item: TemplateItem, 
  response: InspectionItemResponse | undefined,
  isRepairItem: boolean = false
): UnifiedItemDisplay {
  return {
    itemId: `template-${item.id}`,
    itemName: item.name,
    itemType: item.type as UnifiedItemDisplay['itemType'],
    status: response?.value as UnifiedItemDisplay['status'],
    value: response?.value,
    notes: response?.notes,
    photos: response?.photos || [],
    isRepairItem,
    isRequired: item.required,
    severity: undefined, // Template items don't have severity
    resolved: undefined
  };
}

// Removed unused functions:
// - transformIssueToUnified (was creating duplicate UUID items)  
// - getRepairItemSectionName (no longer needed since we skip issues processing)

/**
 * Main function to unify inspection data into a single display structure
 */
export function unifyInspectionData(inspection: Inspection | DetailedInspection): UnifiedSectionDisplay[] {
  if (!inspection) return [];

  const sectionsMap = new Map<string, UnifiedSectionDisplay>();

  // Phase 1: Process template sections if available - ONLY include items that need repair
  if (isDetailedInspection(inspection) && inspection.template?.sections) {
    inspection.template.sections.forEach((section: TemplateSection) => {
      const sectionItems: UnifiedItemDisplay[] = section.items
        .sort((a, b) => a.order_index - b.order_index)
        .map((item: TemplateItem) => {
          const response = inspection.itemResponses?.find(
            r => r.templateItemId === item.id
          );
          return transformTemplateItemToUnified(item, response, false);
        })
        .filter(item => 
          // Only include items that require repair
          item.status === 'repair' || item.status === 'fail' || item.isRepairItem
        );

      // Only add section if it has repair items
      if (sectionItems.length > 0) {
        sectionsMap.set(section.name, {
          sectionId: `section-${section.id}`,
          sectionName: section.name,
          sectionDescription: section.description,
          sectionOrder: section.order_index,
          items: sectionItems,
          hasRepairItems: true, // Always true since we only include repair items
          totalPhotos: sectionItems.reduce((sum, item) => sum + (item.photos?.length || 0), 0)
        });
      }
    });
  }

  // Phase 2: Skip processing inspection issues separately since they're duplicates
  // The template items already contain the repair information we need
  // inspection.issues contains duplicate data that creates the UUID items

  // Phase 3: Return sorted sections (all sections will have repair items now)
  const sections = Array.from(sectionsMap.values())
    .sort((a, b) => a.sectionOrder - b.sectionOrder);

  return sections;
}

/**
 * Get summary statistics for unified inspection data
 */
export function getUnifiedInspectionStats(sections: UnifiedSectionDisplay[]) {
  const totalItems = sections.reduce((sum, section) => sum + section.items.length, 0);
  const repairItems = sections.reduce((sum, section) => 
    sum + section.items.filter(item => item.isRepairItem).length, 0
  );
  const totalPhotos = sections.reduce((sum, section) => sum + section.totalPhotos, 0);
  const sectionsWithIssues = sections.filter(section => section.hasRepairItems).length;

  return {
    totalSections: sections.length,
    totalItems,
    repairItems,
    totalPhotos,
    sectionsWithIssues
  };
}