export interface InspectionItem {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

export interface InspectionSection {
  id: string;
  name: string;
  items: InspectionItem[];
  isExpanded: boolean;
}

export interface InspectionTemplate {
  id: string;
  name: string;
  description: string;
  type: 'routine' | 'move-in' | 'move-out' | 'maintenance' | 'custom';
  sections: InspectionSection[];
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
}

export interface InspectionFormItem extends InspectionItem {
  rating: 'pass' | 'fail' | null;
  comments: string;
  photos: string[];
}

export interface InspectionFormSection extends Omit<InspectionSection, 'items'> {
  items: InspectionFormItem[];
}

// Mock templates storage - in production this would be a proper database
let mockTemplates: InspectionTemplate[] = [
  {
    id: 'template-1',
    name: 'Standard Property Inspection',
    description: 'Comprehensive inspection template covering all major areas of a property',
    type: 'routine',
    isDefault: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    sections: [
      {
        id: 'section-1',
        name: 'Exterior',
        isExpanded: true,
        items: [
          {
            id: 'item-1',
            name: 'Roof Condition',
            description: 'Check for damaged shingles, leaks, gutters, and overall structural integrity',
            required: true
          },
          {
            id: 'item-2',
            name: 'Siding & Paint',
            description: 'Inspect exterior walls, paint condition, and any visible damage',
            required: true
          },
          {
            id: 'item-3',
            name: 'Windows & Doors',
            description: 'Check window frames, glass, locks, and door functionality',
            required: true
          },
          {
            id: 'item-4',
            name: 'Landscaping & Drainage',
            description: 'Evaluate yard condition, drainage, and potential water issues',
            required: true
          }
        ]
      },
      {
        id: 'section-2',
        name: 'Interior',
        isExpanded: false,
        items: [
          {
            id: 'item-5',
            name: 'Flooring',
            description: 'Check carpet, hardwood, tile condition and any damage',
            required: true
          },
          {
            id: 'item-6',
            name: 'Walls & Ceilings',
            description: 'Inspect paint, drywall, cracks, and overall condition',
            required: true
          },
          {
            id: 'item-7',
            name: 'Lighting & Electrical',
            description: 'Test light fixtures, outlets, and visible electrical components',
            required: true
          },
          {
            id: 'item-8',
            name: 'Interior Doors',
            description: 'Check door operation, hardware, and overall condition',
            required: true
          }
        ]
      },
      {
        id: 'section-3',
        name: 'Kitchen',
        isExpanded: false,
        items: [
          {
            id: 'item-9',
            name: 'Appliances',
            description: 'Test refrigerator, stove, dishwasher, and other appliances',
            required: true
          },
          {
            id: 'item-10',
            name: 'Cabinets & Countertops',
            description: 'Check cabinet doors, drawers, and countertop condition',
            required: true
          },
          {
            id: 'item-11',
            name: 'Kitchen Plumbing',
            description: 'Test sink, faucet, and check for leaks',
            required: true
          }
        ]
      },
      {
        id: 'section-4',
        name: 'Bathrooms',
        isExpanded: false,
        items: [
          {
            id: 'item-12',
            name: 'Fixtures',
            description: 'Test toilet, sink, shower/tub functionality',
            required: true
          },
          {
            id: 'item-13',
            name: 'Plumbing',
            description: 'Check water pressure, drainage, and visible pipes',
            required: true
          },
          {
            id: 'item-14',
            name: 'Ventilation',
            description: 'Test exhaust fans and check for proper ventilation',
            required: true
          },
          {
            id: 'item-15',
            name: 'Tiles & Grout',
            description: 'Inspect tile condition, grout, and potential water damage',
            required: true
          }
        ]
      },
      {
        id: 'section-5',
        name: 'HVAC & Utilities',
        isExpanded: false,
        items: [
          {
            id: 'item-16',
            name: 'Heating System',
            description: 'Test heating system operation and check filters',
            required: true
          },
          {
            id: 'item-17',
            name: 'Cooling System',
            description: 'Test air conditioning and check vents',
            required: true
          },
          {
            id: 'item-18',
            name: 'Water Heater',
            description: 'Check water heater condition and operation',
            required: true
          },
          {
            id: 'item-19',
            name: 'Electrical Panel',
            description: 'Inspect main electrical panel and circuit breakers',
            required: true
          }
        ]
      },
      {
        id: 'section-6',
        name: 'Safety & Security',
        isExpanded: false,
        items: [
          {
            id: 'item-20',
            name: 'Smoke Detectors',
            description: 'Test all smoke detectors and check battery status',
            required: true
          },
          {
            id: 'item-21',
            name: 'Carbon Monoxide Detectors',
            description: 'Test CO detectors and verify proper placement',
            required: true
          },
          {
            id: 'item-22',
            name: 'Locks & Security',
            description: 'Check all door and window locks',
            required: true
          },
          {
            id: 'item-23',
            name: 'Railings & Steps',
            description: 'Inspect stair railings and step condition',
            required: true
          }
        ]
      }
    ]
  },
  {
    id: 'template-2',
    name: 'Move-In Inspection',
    description: 'Detailed inspection for new tenants moving in',
    type: 'move-in',
    isDefault: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    sections: [
      {
        id: 'section-7',
        name: 'Pre-Move Condition',
        isExpanded: true,
        items: [
          {
            id: 'item-24',
            name: 'Overall Cleanliness',
            description: 'Document the cleanliness state before tenant moves in',
            required: true
          },
          {
            id: 'item-25',
            name: 'Existing Damage',
            description: 'Document any pre-existing damage or wear',
            required: true
          }
        ]
      }
    ]
  }
];

export class TemplatesService {
  static async getAllTemplates(): Promise<InspectionTemplate[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...mockTemplates];
  }

  static async getTemplate(id: string): Promise<InspectionTemplate | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockTemplates.find(template => template.id === id) || null;
  }

  static async getDefaultTemplate(): Promise<InspectionTemplate> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const defaultTemplate = mockTemplates.find(template => template.isDefault && template.type === 'routine');
    if (!defaultTemplate) {
      throw new Error('No default template found');
    }
    return defaultTemplate;
  }

  static async createTemplate(template: Omit<InspectionTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<InspectionTemplate> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newTemplate: InspectionTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    mockTemplates.push(newTemplate);
    return newTemplate;
  }

  static async updateTemplate(id: string, updates: Partial<InspectionTemplate>): Promise<InspectionTemplate> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const templateIndex = mockTemplates.findIndex(template => template.id === id);
    if (templateIndex === -1) {
      throw new Error('Template not found');
    }

    const updatedTemplate = {
      ...mockTemplates[templateIndex],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    mockTemplates[templateIndex] = updatedTemplate;
    return updatedTemplate;
  }

  static async deleteTemplate(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const template = mockTemplates.find(t => t.id === id);
    if (template?.isDefault) {
      throw new Error('Cannot delete default templates');
    }

    mockTemplates = mockTemplates.filter(template => template.id !== id);
  }

  static convertTemplateToFormSections(template: InspectionTemplate): InspectionFormSection[] {
    return template.sections.map(section => ({
      ...section,
      items: section.items.map(item => ({
        ...item,
        rating: null as 'pass' | 'fail' | null,
        comments: '',
        photos: []
      }))
    }));
  }
}