// Unit Turn Template Constants - Exact replica from CSV files
// CRITICAL: Damage charges are tracked separately and do NOT add to project total

export interface UnitTurnTemplateItem {
  id: string;
  costCode: number;
  area: string;
  description: string;
  quantity: number;
  units: string;
  costPerUnit: number;
  total: number;       // quantity × costPerUnit (for project cost)
  damages: number;     // SEPARATE from total - does NOT add to project cost
  notes: string;
  photos?: string[];   // Array of photo URIs for this item
}

export interface UnitTurnTemplateSection {
  id: string;
  name: string;
  items: UnitTurnTemplateItem[];
  subtotal: number;        // Sum of item totals (project costs only)
  damageSubtotal: number;  // Sum of item damages (separate)
  isExpanded: boolean;
}

export interface UnitTurnTemplate {
  id: string;
  name: string;
  sections: UnitTurnTemplateSection[];
  grandTotalProjectCost: number;   // Sum of section subtotals (excludes damages)
  grandTotalDamageCharges: number; // Sum of section damage subtotals (separate)
}

// GL Account Mappings from accounting-mapping.csv
export const GL_ACCOUNT_MAPPINGS = [
  { code: 1, glAccount: '58005', description: 'Irrigation Repair and Maintenance', classification: 'UT' },
  { code: 2, glAccount: '58010', description: 'Plumbing', classification: 'UT' },
  { code: 3, glAccount: '58015', description: 'Electrical', classification: 'UT' },
  { code: 4, glAccount: '58020', description: 'Appliance R&M', classification: 'UT' },
  { code: 5, glAccount: '58030', description: 'Windows and doors', classification: 'UT' },
  { code: 6, glAccount: '58035', description: 'Cabinets and Countertops', classification: 'UT' },
  { code: 8, glAccount: '58040', description: 'Tub/Shower Repairs', classification: 'UT' },
  { code: 9, glAccount: '58045', description: 'Gate/Fence Repairs', classification: 'UT' },
  { code: 10, glAccount: '58260', description: 'Drywall Repairs', classification: 'UT' },
  { code: 11, glAccount: '58305', description: 'Power Wash/Steam Cleaning', classification: 'UT' },
  { code: 12, glAccount: '58310', description: 'Trash Removal', classification: 'UT' },
  { code: 13, glAccount: '58100', description: 'Carpet Cleaning', classification: 'UT' },
  { code: 14, glAccount: '58250', description: 'Flooring Repairs', classification: 'UT' },
  { code: 15, glAccount: '58300', description: 'General Unit Cleaning', classification: 'UT' },
  { code: 16, glAccount: '58350', description: 'Interior Painting', classification: 'UT' },
  { code: 17, glAccount: '58400', description: 'Blinds', classification: 'UT' },
  { code: 18, glAccount: '60050', description: 'Appliance Purchase', classification: 'Cap Ex' },
  { code: 19, glAccount: '60100', description: 'Electrical', classification: 'Cap Ex' },
  { code: 20, glAccount: '60150', description: 'Carpet/Vinyl Replacement', classification: 'Cap Ex' },
  { code: 21, glAccount: '60200', description: 'Tile/Hardwood Flooring Replacement', classification: 'Cap Ex' },
  { code: 22, glAccount: '60250', description: 'HVAC', classification: 'Cap Ex' },
  { code: 23, glAccount: '60300', description: 'Plumbing', classification: 'Cap Ex' },
  { code: 24, glAccount: '60350', description: 'Roofing', classification: 'Cap Ex' },
  { code: 27, glAccount: '60450', description: 'Landscape Improvements', classification: 'Cap Ex' },
  { code: 28, glAccount: '60550', description: 'Water Heaters', classification: 'Cap Ex' },
  { code: 29, glAccount: '60700', description: 'Tub/Shower Replacement', classification: 'Cap Ex' },
  { code: 32, glAccount: '60450', description: 'Fence Replacement', classification: 'Cap Ex' },
  { code: 33, glAccount: '60460', description: 'Pool Equipment', classification: 'Cap Ex' },
  { code: 35, glAccount: '58265', description: 'HVAC R&M', classification: 'UT' },
  { code: 36, glAccount: '56700', description: 'Tree Trimming', classification: 'R&M' },
  { code: 37, glAccount: '57340', description: 'Roof Repairs', classification: 'R&M' },
  { code: 38, glAccount: '58255', description: 'Concrete Repairs', classification: 'UT' },
  { code: 39, glAccount: '57580', description: 'Lock and Key', classification: 'R&M' },
  { code: 40, glAccount: '57510', description: 'Garage Doors', classification: 'R&M' },
  { code: 41, glAccount: '60400', description: 'Doors/Windows', classification: 'Cap Ex' },
  { code: 42, glAccount: '58050', description: 'Carpet Replacement', classification: 'UT' },
  { code: 43, glAccount: '58150', description: 'Hardwood LVP Replacement', classification: 'UT' }
] as const;

// Helper function to get GL account info by cost code
export const getGLAccountByCode = (costCode: number) => {
  return GL_ACCOUNT_MAPPINGS.find(mapping => mapping.code === costCode);
};

// Default Unit Turn Template from ut-template.csv - EXACT structure
export const createDefaultUnitTurnTemplate = (): UnitTurnTemplate => ({
  id: 'default-unit-turn',
  name: 'Standard Unit Turn Template',
  grandTotalProjectCost: 0,
  grandTotalDamageCharges: 0,
  sections: [
    {
      id: 'exterior-building',
      name: 'Exterior (Building)',
      subtotal: 0,
      damageSubtotal: 0,
      isExpanded: true,
      items: [
        { id: 'ext-build-1', costCode: 16, area: 'Main Body Paint T.U', description: 'Main Body Paint T.U', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'ext-build-2', costCode: 16, area: 'Trim & Door Paint T.U', description: 'Trim & Door Paint T.U', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'ext-build-3', costCode: 40, area: 'Garage Door Repairs', description: 'Garage Door Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'ext-build-4', costCode: 5, area: 'Entry Door', description: 'Entry Door', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'ext-build-5', costCode: 37, area: 'Roofing Repairs', description: 'Roofing Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'ext-build-6', costCode: 37, area: 'Gutter Repairs', description: 'Gutter Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'ext-build-7', costCode: 38, area: 'Patios & Walks', description: 'Patios & Walks', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'ext-build-8', costCode: 12, area: 'Yard Trash out', description: 'Yard Trash out', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'ext-build-9', costCode: 11, area: 'Pressure Wash Exterior Decks', description: 'Pressure Wash Exterior Decks', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'ext-build-10', costCode: 38, area: 'Driveway Repairs', description: 'Driveway Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'ext-build-11', costCode: 3, area: 'Misc Electrical', description: 'Misc Electrical', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'ext-build-12', costCode: 39, area: 'Lockbox & Keys', description: 'Lockbox & Keys', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'ext-build-13', costCode: 2, area: 'Misc Plumbing', description: 'Misc Plumbing', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'ext-build-14', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' }
      ]
    },
    {
      id: 'exterior-lot',
      name: 'Exterior (Lot)',
      subtotal: 0,
      damageSubtotal: 0,
      isExpanded: false,
      items: [
        { id: 'ext-lot-1', costCode: 1, area: 'Front Landscaping', description: 'Front Landscaping', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'ext-lot-2', costCode: 1, area: 'Rear Landscaping', description: 'Rear Landscaping', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'ext-lot-3', costCode: 1, area: 'Sprinklers & Timers', description: 'Sprinklers & Timers', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'ext-lot-4', costCode: 38, area: 'Concrete Repairs', description: 'Concrete Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'ext-lot-5', costCode: 9, area: 'Fencing Repairs', description: 'Fencing Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'ext-lot-6', costCode: 9, area: 'Gate Repairs', description: 'Gate Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'ext-lot-7', costCode: 39, area: 'Mailbox', description: 'Mailbox', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'ext-lot-8', costCode: 36, area: 'Tree Trimming', description: 'Tree Trimming', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'ext-lot-9', costCode: 2, area: 'Misc Plumbing', description: 'Misc Plumbing', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' }
      ]
    },
    {
      id: 'interior-general',
      name: 'Interior (General)',
      subtotal: 0,
      damageSubtotal: 0,
      isExpanded: false,
      items: [
        { id: 'int-gen-1', costCode: 35, area: 'HVAC Repairs (under $1,000)', description: 'HVAC Repairs (under $1,000)', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'int-gen-2', costCode: 35, area: 'HVAC Filters', description: 'HVAC Filters', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'int-gen-3', costCode: 35, area: 'Thermostats', description: 'Thermostats', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'int-gen-4', costCode: 3, area: 'Smoke Detectors', description: 'Smoke Detectors', quantity: 0, units: 'ea', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'int-gen-5', costCode: 3, area: 'CO2 Detectors', description: 'CO2 Detectors', quantity: 0, units: 'ea', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'int-gen-6', costCode: 16, area: 'Paint T.U Whole House', description: 'Paint T.U Whole House', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'int-gen-7', costCode: 10, area: 'Drywall Repairs', description: 'Drywall Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'int-gen-8', costCode: 16, area: 'Repaint Whole House', description: 'Repaint Whole House', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'int-gen-9', costCode: 15, area: 'Hard Floors Cleaning', description: 'Hard Floors Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'int-gen-10', costCode: 13, area: 'Carpet Cleaning', description: 'Carpet Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'int-gen-11', costCode: 15, area: 'Final Clean', description: 'Final Clean', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'int-gen-12', costCode: 20, area: 'Carpet Replacement (ANY ROOM)', description: 'Carpet Replacement (ANY ROOM)', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'int-gen-13', costCode: 20, area: 'Hardwood LVP Replacement', description: 'Hardwood LVP Replacement', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' }
      ]
    },
    {
      id: 'entry',
      name: 'Entry',
      subtotal: 0,
      damageSubtotal: 0,
      isExpanded: false,
      items: [
        { id: 'entry-1', costCode: 39, area: 'Lockset & Keys', description: 'Lockset & Keys', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'entry-2', costCode: 14, area: 'Flooring Repairs', description: 'Flooring Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'entry-3', costCode: 16, area: 'Paint T.U', description: 'Paint T.U', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'entry-4', costCode: 10, area: 'Drywall', description: 'Drywall', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'entry-5', costCode: 3, area: 'Electrical', description: 'Electrical', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'entry-6', costCode: 5, area: 'Door/Window Repairs', description: 'Door/Window Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'entry-7', costCode: 17, area: 'Blinds', description: 'Blinds', quantity: 0, units: 'ea', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'entry-8', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' }
      ]
    },
    {
      id: 'living-dining',
      name: 'Living Room / Dining',
      subtotal: 0,
      damageSubtotal: 0,
      isExpanded: false,
      items: [
        { id: 'living-1', costCode: 16, area: 'Paint T.U', description: 'Paint T.U', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'living-2', costCode: 10, area: 'Drywall', description: 'Drywall', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'living-3', costCode: 14, area: 'Flooring Repairs', description: 'Flooring Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'living-4', costCode: 3, area: 'Electrical', description: 'Electrical', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'living-5', costCode: 5, area: 'Door/Window Repairs', description: 'Door/Window Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'living-6', costCode: 17, area: 'Blinds', description: 'Blinds', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'living-7', costCode: 39, area: 'Lockset & Keys', description: 'Lockset & Keys', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'living-8', costCode: 5, area: 'Fireplace', description: 'Fireplace', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'living-9', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' }
      ]
    },
    {
      id: 'kitchen-nook',
      name: 'Kitchen & Nook',
      subtotal: 0,
      damageSubtotal: 0,
      isExpanded: false,
      items: [
        { id: 'kitchen-1', costCode: 6, area: 'Cabinets Repairs', description: 'Cabinets Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'kitchen-2', costCode: 6, area: 'Counter Tops Repairs', description: 'Counter Tops Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'kitchen-3', costCode: 4, area: 'Appliance Repairs', description: 'Appliance Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'kitchen-4', costCode: 2, area: 'Plumbing', description: 'Plumbing', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'kitchen-5', costCode: 3, area: 'Electrical', description: 'Electrical', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'kitchen-6', costCode: 14, area: 'Flooring Repairs', description: 'Flooring Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'kitchen-7', costCode: 16, area: 'Paint T.U', description: 'Paint T.U', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'kitchen-8', costCode: 10, area: 'Drywall', description: 'Drywall', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'kitchen-9', costCode: 5, area: 'Door/Window Repairs', description: 'Door/Window Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'kitchen-10', costCode: 17, area: 'Blinds', description: 'Blinds', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'kitchen-11', costCode: 39, area: 'Lockset & Keys', description: 'Lockset & Keys', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'kitchen-12', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'kitchen-13', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' }
      ]
    },
    {
      id: 'family-room',
      name: 'Family room',
      subtotal: 0,
      damageSubtotal: 0,
      isExpanded: false,
      items: [
        { id: 'family-1', costCode: 16, area: 'Paint T.U', description: 'Paint T.U', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'family-2', costCode: 10, area: 'Drywall', description: 'Drywall', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'family-3', costCode: 14, area: 'Flooring Repairs', description: 'Flooring Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'family-4', costCode: 3, area: 'Electrical', description: 'Electrical', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'family-5', costCode: 5, area: 'Door/Window Repairs', description: 'Door/Window Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'family-6', costCode: 17, area: 'Blinds', description: 'Blinds', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'family-7', costCode: 39, area: 'Lockset & Keys', description: 'Lockset & Keys', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'family-8', costCode: 5, area: 'Fireplace', description: 'Fireplace', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'family-9', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' }
      ]
    },
    {
      id: 'powder-room',
      name: 'Powder room',
      subtotal: 0,
      damageSubtotal: 0,
      isExpanded: false,
      items: [
        { id: 'powder-1', costCode: 6, area: 'Cabinets Repairs', description: 'Cabinets Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'powder-2', costCode: 6, area: 'Counter Tops Repairs', description: 'Counter Tops Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'powder-3', costCode: 2, area: 'Tub/Shower/Toilet', description: 'Tub/Shower/Toilet', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'powder-4', costCode: 2, area: 'Plumbing', description: 'Plumbing', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'powder-5', costCode: 3, area: 'Electrical', description: 'Electrical', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'powder-6', costCode: 14, area: 'Flooring Repairs', description: 'Flooring Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'powder-7', costCode: 16, area: 'Paint T.U', description: 'Paint T.U', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'powder-8', costCode: 10, area: 'Drywall', description: 'Drywall', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'powder-9', costCode: 5, area: 'Door/Window Repairs', description: 'Door/Window Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'powder-10', costCode: 17, area: 'Blinds', description: 'Blinds', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'powder-11', costCode: 5, area: 'Door Hardware', description: 'Door Hardware', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'powder-12', costCode: 5, area: 'Mirrors', description: 'Mirrors', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'powder-13', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'powder-14', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' }
      ]
    },
    {
      id: 'hallway-stairs',
      name: 'Hallway & Stairs',
      subtotal: 0,
      damageSubtotal: 0,
      isExpanded: false,
      items: [
        { id: 'hallway-1', costCode: 16, area: 'Paint T.U', description: 'Paint T.U', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'hallway-2', costCode: 10, area: 'Drywall', description: 'Drywall', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'hallway-3', costCode: 14, area: 'Flooring Repairs', description: 'Flooring Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'hallway-4', costCode: 3, area: 'Electrical', description: 'Electrical', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'hallway-5', costCode: 3, area: 'Smoke Detectors', description: 'Smoke Detectors', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'hallway-6', costCode: 3, area: 'CO2 Detectors', description: 'CO2 Detectors', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'hallway-7', costCode: 5, area: 'Door Hardware', description: 'Door Hardware', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'hallway-8', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' }
      ]
    },
    {
      id: 'master-bedroom',
      name: 'Master bedroom',
      subtotal: 0,
      damageSubtotal: 0,
      isExpanded: false,
      items: [
        { id: 'master-bed-1', costCode: 16, area: 'Paint T.U', description: 'Paint T.U', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bed-2', costCode: 10, area: 'Drywall', description: 'Drywall', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bed-3', costCode: 14, area: 'Flooring Repairs', description: 'Flooring Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bed-4', costCode: 3, area: 'Electrical', description: 'Electrical', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bed-5', costCode: 3, area: 'Smoke Detectors', description: 'Smoke Detectors', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bed-6', costCode: 3, area: 'CO2 Detectors', description: 'CO2 Detectors', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bed-7', costCode: 5, area: 'Door/Window Repairs', description: 'Door/Window Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bed-8', costCode: 17, area: 'Blinds', description: 'Blinds', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bed-9', costCode: 5, area: 'Door Hardware', description: 'Door Hardware', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bed-10', costCode: 5, area: 'Closets', description: 'Closets', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bed-11', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' }
      ]
    },
    {
      id: 'master-bath',
      name: 'Master Bath',
      subtotal: 0,
      damageSubtotal: 0,
      isExpanded: false,
      items: [
        { id: 'master-bath-1', costCode: 6, area: 'Cabinets Repairs', description: 'Cabinets Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bath-2', costCode: 6, area: 'Counter Tops Repairs', description: 'Counter Tops Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bath-3', costCode: 2, area: 'Tub/Shower/Toilet', description: 'Tub/Shower/Toilet', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bath-4', costCode: 2, area: 'Plumbing', description: 'Plumbing', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bath-5', costCode: 3, area: 'Electrical', description: 'Electrical', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bath-6', costCode: 14, area: 'Flooring Repairs', description: 'Flooring Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bath-7', costCode: 16, area: 'Paint T.U', description: 'Paint T.U', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bath-8', costCode: 10, area: 'Drywall', description: 'Drywall', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bath-9', costCode: 5, area: 'Door/Window Repairs', description: 'Door/Window Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bath-10', costCode: 17, area: 'Blinds', description: 'Blinds', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bath-11', costCode: 5, area: 'Door Hardware', description: 'Door Hardware', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bath-12', costCode: 5, area: 'Mirrors', description: 'Mirrors', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bath-13', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'master-bath-14', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' }
      ]
    },
    {
      id: 'bath-2',
      name: 'Bath 2',
      subtotal: 0,
      damageSubtotal: 0,
      isExpanded: false,
      items: [
        { id: 'bath-2-1', costCode: 6, area: 'Cabinets Repairs', description: 'Cabinets Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-2-2', costCode: 6, area: 'Counter Tops Repairs', description: 'Counter Tops Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-2-3', costCode: 2, area: 'Tub/Shower/Toilet', description: 'Tub/Shower/Toilet', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-2-4', costCode: 2, area: 'Plumbing', description: 'Plumbing', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-2-5', costCode: 3, area: 'Electrical', description: 'Electrical', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-2-6', costCode: 14, area: 'Flooring Repairs', description: 'Flooring Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-2-7', costCode: 16, area: 'Paint T.U', description: 'Paint T.U', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-2-8', costCode: 10, area: 'Drywall', description: 'Drywall', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-2-9', costCode: 5, area: 'Door/Window Repairs', description: 'Door/Window Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-2-10', costCode: 17, area: 'Blinds', description: 'Blinds', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-2-11', costCode: 5, area: 'Door Hardware', description: 'Door Hardware', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-2-12', costCode: 5, area: 'Mirrors', description: 'Mirrors', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-2-13', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-2-14', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' }
      ]
    },
    {
      id: 'bath-3',
      name: 'Bath 3',
      subtotal: 0,
      damageSubtotal: 0,
      isExpanded: false,
      items: [
        { id: 'bath-3-1', costCode: 6, area: 'Cabinets Repairs', description: 'Cabinets Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-3-2', costCode: 6, area: 'Counter Tops Repairs', description: 'Counter Tops Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-3-3', costCode: 2, area: 'Tub/Shower/Toilet', description: 'Tub/Shower/Toilet', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-3-4', costCode: 2, area: 'Plumbing', description: 'Plumbing', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-3-5', costCode: 3, area: 'Electrical', description: 'Electrical', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-3-6', costCode: 14, area: 'Flooring Repairs', description: 'Flooring Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-3-7', costCode: 16, area: 'Paint T.U', description: 'Paint T.U', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-3-8', costCode: 17, area: 'Drywall', description: 'Drywall', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-3-9', costCode: 5, area: 'Door/Window Repairs', description: 'Door/Window Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-3-10', costCode: 17, area: 'Blinds', description: 'Blinds', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-3-11', costCode: 5, area: 'Door Hardware', description: 'Door Hardware', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-3-12', costCode: 5, area: 'Mirrors', description: 'Mirrors', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-3-13', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bath-3-14', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' }
      ]
    },
    {
      id: 'bed-2',
      name: 'Bed 2',
      subtotal: 0,
      damageSubtotal: 0,
      isExpanded: false,
      items: [
        { id: 'bed-2-1', costCode: 16, area: 'Paint T.U', description: 'Paint T.U', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-2-2', costCode: 10, area: 'Drywall', description: 'Drywall', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-2-3', costCode: 14, area: 'Flooring Repairs', description: 'Flooring Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-2-4', costCode: 3, area: 'Electrical', description: 'Electrical', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-2-5', costCode: 3, area: 'Smoke Detectors', description: 'Smoke Detectors', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-2-6', costCode: 3, area: 'CO2 Detectors', description: 'CO2 Detectors', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-2-7', costCode: 5, area: 'Door/Window Repairs', description: 'Door/Window Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-2-8', costCode: 17, area: 'Blinds', description: 'Blinds', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-2-9', costCode: 5, area: 'Door Hardware', description: 'Door Hardware', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-2-10', costCode: 5, area: 'Closets', description: 'Closets', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-2-11', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' }
      ]
    },
    {
      id: 'bed-3',
      name: 'Bed 3',
      subtotal: 0,
      damageSubtotal: 0,
      isExpanded: false,
      items: [
        { id: 'bed-3-1', costCode: 16, area: 'Paint T.U', description: 'Paint T.U', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-3-2', costCode: 10, area: 'Drywall', description: 'Drywall', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-3-3', costCode: 14, area: 'Flooring Repairs', description: 'Flooring Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-3-4', costCode: 3, area: 'Electrical', description: 'Electrical', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-3-5', costCode: 3, area: 'Smoke Detectors', description: 'Smoke Detectors', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-3-6', costCode: 3, area: 'CO2 Detectors', description: 'CO2 Detectors', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-3-7', costCode: 5, area: 'Door/Window Repairs', description: 'Door/Window Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-3-8', costCode: 17, area: 'Blinds', description: 'Blinds', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-3-9', costCode: 5, area: 'Door Hardware', description: 'Door Hardware', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-3-10', costCode: 5, area: 'Closets', description: 'Closets', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-3-11', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' }
      ]
    },
    {
      id: 'bed-4-office',
      name: 'Bed 4 or Office/Den',
      subtotal: 0,
      damageSubtotal: 0,
      isExpanded: false,
      items: [
        { id: 'bed-4-1', costCode: 16, area: 'Paint T.U', description: 'Paint T.U', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-4-2', costCode: 10, area: 'Drywall', description: 'Drywall', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-4-3', costCode: 14, area: 'Flooring Repairs', description: 'Flooring Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-4-4', costCode: 3, area: 'Electrical', description: 'Electrical', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-4-5', costCode: 3, area: 'Smoke Detectors', description: 'Smoke Detectors', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-4-6', costCode: 3, area: 'CO2 Detectors', description: 'CO2 Detectors', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-4-7', costCode: 5, area: 'Door/Window Repairs', description: 'Door/Window Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-4-8', costCode: 17, area: 'Blinds', description: 'Blinds', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-4-9', costCode: 5, area: 'Door Hardware', description: 'Door Hardware', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-4-10', costCode: 5, area: 'Closets', description: 'Closets', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-4-11', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' }
      ]
    },
    {
      id: 'bed-5-office',
      name: 'Bed 5 or Office/ Den',
      subtotal: 0,
      damageSubtotal: 0,
      isExpanded: false,
      items: [
        { id: 'bed-5-1', costCode: 16, area: 'Paint T.U', description: 'Paint T.U', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-5-2', costCode: 10, area: 'Drywall', description: 'Drywall', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-5-3', costCode: 14, area: 'Flooring Repairs', description: 'Flooring Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-5-4', costCode: 3, area: 'Electrical', description: 'Electrical', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-5-5', costCode: 3, area: 'Smoke Detectors', description: 'Smoke Detectors', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-5-6', costCode: 3, area: 'CO2 Detectors', description: 'CO2 Detectors', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-5-7', costCode: 5, area: 'Door/Window Repairs', description: 'Door/Window Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-5-8', costCode: 17, area: 'Blinds', description: 'Blinds', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-5-9', costCode: 5, area: 'Door Hardware', description: 'Door Hardware', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-5-10', costCode: 5, area: 'Closets', description: 'Closets', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-5-11', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' }
      ]
    },
    {
      id: 'bed-6-office',
      name: 'Bed 6 or Office/Den',
      subtotal: 0,
      damageSubtotal: 0,
      isExpanded: false,
      items: [
        { id: 'bed-6-1', costCode: 16, area: 'Paint T.U', description: 'Paint T.U', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-6-2', costCode: 10, area: 'Drywall', description: 'Drywall', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-6-3', costCode: 14, area: 'Flooring Repairs', description: 'Flooring Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-6-4', costCode: 3, area: 'Electrical', description: 'Electrical', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-6-5', costCode: 3, area: 'Smoke Detectors', description: 'Smoke Detectors', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-6-6', costCode: 3, area: 'CO2 Detectors', description: 'CO2 Detectors', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-6-7', costCode: 5, area: 'Door/Window Repairs', description: 'Door/Window Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-6-8', costCode: 17, area: 'Blinds', description: 'Blinds', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-6-9', costCode: 5, area: 'Door Hardware', description: 'Door Hardware', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-6-10', costCode: 5, area: 'Closets', description: 'Closets', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'bed-6-11', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' }
      ]
    },
    {
      id: 'basement',
      name: 'Basement',
      subtotal: 0,
      damageSubtotal: 0,
      isExpanded: false,
      items: [
        { id: 'basement-1', costCode: 16, area: 'Paint T.U', description: 'Paint T.U', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'basement-2', costCode: 10, area: 'Drywall', description: 'Drywall', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'basement-3', costCode: 14, area: 'Flooring Repairs', description: 'Flooring Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'basement-4', costCode: 3, area: 'Electrical', description: 'Electrical', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'basement-5', costCode: 3, area: 'Smoke Detectors', description: 'Smoke Detectors', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'basement-6', costCode: 3, area: 'CO2 Detectors', description: 'CO2 Detectors', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'basement-7', costCode: 5, area: 'Door/Window Repairs', description: 'Door/Window Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'basement-8', costCode: 17, area: 'Blinds', description: 'Blinds', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'basement-9', costCode: 5, area: 'Door Hardware', description: 'Door Hardware', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'basement-10', costCode: 5, area: 'Closets', description: 'Closets', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'basement-11', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'basement-12', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' }
      ]
    },
    {
      id: 'laundry-room',
      name: 'Laundry room',
      subtotal: 0,
      damageSubtotal: 0,
      isExpanded: false,
      items: [
        { id: 'laundry-1', costCode: 6, area: 'Cabinets Repairs', description: 'Cabinets Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'laundry-2', costCode: 6, area: 'Counter Top Repairs', description: 'Counter Top Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'laundry-3', costCode: 4, area: 'Appliance Repairs', description: 'Appliance Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'laundry-4', costCode: 2, area: 'Plumbing', description: 'Plumbing', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'laundry-5', costCode: 3, area: 'Electrical', description: 'Electrical', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'laundry-6', costCode: 14, area: 'Flooring Repairs', description: 'Flooring Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'laundry-7', costCode: 16, area: 'Paint T.U', description: 'Paint T.U', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'laundry-8', costCode: 10, area: 'Drywall', description: 'Drywall', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'laundry-9', costCode: 5, area: 'Door/Window Repairs', description: 'Door/Window Repairs', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'laundry-10', costCode: 17, area: 'Blinds', description: 'Blinds', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'laundry-11', costCode: 5, area: 'Door Hardware', description: 'Door Hardware', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'laundry-12', costCode: 2, area: 'Dryer Vent', description: 'Dryer Vent', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'laundry-13', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' }
      ]
    },
    {
      id: 'garage',
      name: 'Garage',
      subtotal: 0,
      damageSubtotal: 0,
      isExpanded: false,
      items: [
        { id: 'garage-1', costCode: 3, area: 'Garage Door Opener', description: 'Garage Door Opener', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: 'GDO Remotes?' },
        { id: 'garage-2', costCode: 39, area: 'Lockset & Keys', description: 'Lockset & Keys', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'garage-3', costCode: 3, area: 'Electrical', description: 'Electrical', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'garage-4', costCode: 2, area: 'Water heater Straps', description: 'Water heater Straps', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'garage-5', costCode: 11, area: 'Pressure Wash Floor', description: 'Pressure Wash Floor', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'garage-6', costCode: 5, area: 'Misc Door/Window', description: 'Misc Door/Window', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'garage-7', costCode: 15, area: 'Misc Cleaning', description: 'Misc Cleaning', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' }
      ]
    },
    {
      id: 'cap-x',
      name: 'CAP-X - Over $1,000',
      subtotal: 0,
      damageSubtotal: 0,
      isExpanded: false,
      items: [
        { id: 'cap-x-1', costCode: 18, area: 'Appliance Replacement (ANY cost)', description: 'Appliance Replacement (ANY cost)', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'cap-x-2', costCode: 22, area: 'HVAC Replacement (ANY cost)', description: 'HVAC Replacement (ANY cost)', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'cap-x-3', costCode: 29, area: 'Tub/Shower replacement', description: 'Tub/Shower replacement', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'cap-x-4', costCode: 19, area: 'Major Electrical', description: 'Major Electrical', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'cap-x-5', costCode: 41, area: 'Exterior Doors', description: 'Exterior Doors', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'cap-x-6', costCode: 41, area: 'Window Replacement', description: 'Window Replacement', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'cap-x-7', costCode: 27, area: 'Complete Landscaping Replace', description: 'Complete Landscaping Replace', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'cap-x-8', costCode: 27, area: 'Complete Irrigation', description: 'Complete Irrigation', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'cap-x-9', costCode: 20, area: 'LVP / Vinyl Floors Replace (Any cost)', description: 'LVP / Vinyl Floors Replace (Any cost)', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'cap-x-10', costCode: 20, area: 'Carpet Replacement (Any Full Room)', description: 'Carpet Replacement (Any Full Room)', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'cap-x-11', costCode: 28, area: 'Water Heaters (Any cost)', description: 'Water Heaters (Any cost)', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'cap-x-12', costCode: 41, area: 'Garage Doors (Any Cost)', description: 'Garage Doors (Any Cost)', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'cap-x-13', costCode: 24, area: 'Roofing', description: 'Roofing', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'cap-x-14', costCode: 24, area: 'Gutter Systems', description: 'Gutter Systems', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'cap-x-15', costCode: 33, area: 'Pool Equipment', description: 'Pool Equipment', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' },
        { id: 'cap-x-16', costCode: 32, area: 'Fencing Replacement', description: 'Fencing Replacement', quantity: 0, units: 'ls', costPerUnit: 0, total: 0, damages: 0, notes: '' }
      ]
    }
  ]
});

// Missing types and interfaces for calculations
export interface SectionSummary {
  sectionName: string;
  itemCount: number;
  projectTotal: number;
  damageTotal: number;
}

// Calculation helper functions - CRITICAL: Damages are separate from project costs
export const calculateItemTotal = (item: UnitTurnTemplateItem): number => {
  return item.quantity * item.costPerUnit;
};

export const calculateSectionSummary = (
  sectionName: string,
  items: UnitTurnTemplateItem[]
): SectionSummary => {
  // Only count items that have been used (quantity > 0 or damages > 0)
  const activeItems = items.filter(item => item.quantity > 0 || item.damages > 0);

  // Calculate project total using the calculateItemTotal function to ensure consistency
  const projectTotal = items.reduce((sum, item) => {
    const itemTotal = calculateItemTotal(item);
    return sum + itemTotal;
  }, 0);

  return {
    sectionName,
    itemCount: activeItems.length, // Only count items that are actually being used
    projectTotal,
    damageTotal: items.reduce((sum, item) => sum + item.damages, 0)
  };
};

export const calculateSectionTotals = (section: UnitTurnTemplateSection) => {
  const subtotal = section.items.reduce((sum, item) => sum + item.total, 0);
  const damageSubtotal = section.items.reduce((sum, item) => sum + item.damages, 0);

  return {
    subtotal,        // Project costs only
    damageSubtotal   // Damage charges only (separate)
  };
};

export const calculateGrandTotals = (template: UnitTurnTemplate) => {
  const grandTotalProjectCost = template.sections.reduce((sum, section) => sum + section.subtotal, 0);
  const grandTotalDamageCharges = template.sections.reduce((sum, section) => sum + section.damageSubtotal, 0);

  return {
    grandTotalProjectCost,    // Sum of all section subtotals (excludes damages)
    grandTotalDamageCharges   // Sum of all section damage subtotals (separate)
  };
};

// Helper to get GL classification color for UI
export const getGLClassificationColor = (classification: string) => {
  switch (classification) {
    case 'UT':
      return 'bg-blue-500/10 text-blue-700 border-blue-200';
    case 'R&M':
      return 'bg-green-500/10 text-green-700 border-green-200';
    case 'Cap Ex':
      return 'bg-purple-500/10 text-purple-700 border-purple-200';
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-200';
  }
};

// Unit options for dropdowns
export const UNIT_OPTIONS = ['ls', 'ea', 'sf', 'lf', 'hr'] as const;