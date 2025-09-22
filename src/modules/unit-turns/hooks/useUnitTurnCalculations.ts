import { useMemo } from 'react';
import { UnitTurnTemplateItem, SectionSummary, calculateItemTotal, calculateSectionSummary, createDefaultUnitTurnTemplate } from '../constants/templates';

export interface UnitTurnTotals {
  totalProjectCost: number;
  totalDamageCharges: number;
  grandTotal: number; // Only project costs, damages tracked separately
  sectionSummaries: SectionSummary[];
  totalLineItems: number;
}

export function useUnitTurnCalculations(items: UnitTurnTemplateItem[]): UnitTurnTotals {
  return useMemo(() => {
    // Create a map for quick item lookup
    const itemMap = new Map(items.map(item => [item.id, item]));

    // Calculate section summaries
    const sectionSummaries: SectionSummary[] = [];
    let totalProjectCost = 0;
    let totalDamageCharges = 0;
    let totalLineItems = 0;

    // Group items by section
    const sectionGroups = new Map<string, UnitTurnTemplateItem[]>();

    // Initialize sections from template
    const defaultTemplate = createDefaultUnitTurnTemplate();
    defaultTemplate.sections.forEach(section => {
      sectionGroups.set(section.name, []);
    });

    // Group actual items by their parent section
    // We need to find which section each item belongs to by looking at the template structure
    const itemToSectionMap = new Map<string, string>();

    // Build a map of item ID to section name
    defaultTemplate.sections.forEach(section => {
      section.items.forEach(item => {
        itemToSectionMap.set(item.id, section.name);
      });
    });

    // Group items by their actual parent section
    items.forEach(item => {
      const sectionName = itemToSectionMap.get(item.id);
      if (sectionName) {
        const existingItems = sectionGroups.get(sectionName) || [];
        existingItems.push(item);
        sectionGroups.set(sectionName, existingItems);
      }
    });

    // Calculate summaries for each section
    sectionGroups.forEach((sectionItems, sectionName) => {
      if (sectionItems.length > 0) {
        const summary = calculateSectionSummary(sectionName, sectionItems);
        sectionSummaries.push(summary);

        totalProjectCost += summary.projectTotal;
        totalDamageCharges += summary.damageTotal;
        totalLineItems += summary.itemCount;
      } else {
        // Empty section - show in summary with zeros
        sectionSummaries.push({
          sectionName,
          itemCount: 0,
          projectTotal: 0,
          damageTotal: 0
        });
      }
    });

    // Sort sections by template order
    const templateSectionOrder = defaultTemplate.sections.map(s => s.name);
    sectionSummaries.sort((a, b) => {
      const aIndex = templateSectionOrder.indexOf(a.sectionName);
      const bIndex = templateSectionOrder.indexOf(b.sectionName);
      return aIndex - bIndex;
    });

    return {
      totalProjectCost,
      totalDamageCharges,
      grandTotal: totalProjectCost, // DAMAGES DO NOT ADD TO GRAND TOTAL
      sectionSummaries,
      totalLineItems
    };
  }, [items]);
}

export function useItemCalculation(item: UnitTurnTemplateItem) {
  return useMemo(() => {
    return calculateItemTotal(item);
  }, [item.quantity, item.costPerUnit]);
}

// Hook for real-time field updates with validation
export function useFieldUpdate() {
  const updateField = (
    items: UnitTurnTemplateItem[],
    itemId: string,
    field: keyof UnitTurnTemplateItem,
    value: string | number
  ): UnitTurnTemplateItem[] => {
    return items.map(item => {
      if (item.id !== itemId) return item;

      const updatedItem = { ...item, [field]: value };

      // Recalculate total when quantity or costPerUnit changes
      if (field === 'quantity' || field === 'costPerUnit') {
        updatedItem.total = calculateItemTotal(updatedItem);
      }

      return updatedItem;
    });
  };

  const validateField = (field: keyof UnitTurnTemplateItem, value: string | number): boolean => {
    switch (field) {
      case 'quantity':
      case 'costPerUnit':
      case 'damages':
        return typeof value === 'number' && value >= 0;
      case 'description':
      case 'notes':
        return typeof value === 'string';
      case 'costCode':
        return typeof value === 'number' && value > 0;
      default:
        return true;
    }
  };

  return { updateField, validateField };
}