// API Service Layer for Property Inspection App
// import { supabase } from './supabase';
import { ENV, isSupabaseConfigured } from '../config/env';

// Environment detection for browser compatibility
const isDevelopment = () => {
  try {
    console.log('🔧 Debug - ENV.API_BASE_URL:', ENV.API_BASE_URL);
    console.log('🔧 Debug - All ENV:', ENV);
    
    // Force production mode if API_BASE_URL is configured and not localhost
    if (ENV.API_BASE_URL && !ENV.API_BASE_URL.includes('localhost')) {
      console.log('🌐 Using PRODUCTION mode - API calls will go to:', ENV.API_BASE_URL);
      return false;
    }
    
    // If API_BASE_URL contains localhost, check if it's actually running
    if (ENV.API_BASE_URL && ENV.API_BASE_URL.includes('localhost')) {
      console.log('🔧 Local API configured - will try API first, fallback to mock if needed');
      return false; // Try API first
    }
    
    // Default fallback
    console.log('🔧 No API configured - using mock data');
    return true;
  } catch {
    // Fallback to mock mode if window is not available
    console.log('🔧 Fallback to mock data mode');
    return true;
  }
};

// API Response Types matching backend database structure
export interface Community {
  id: string;
  name: string;
  status: 'active' | 'under-construction' | 'sold';
  location: string;
  total_units: number;  // Backend uses snake_case
  description?: string | null;
  created_at: string;   // Backend uses snake_case
  updated_at: string;   // Backend uses snake_case
  created_by?: string | null;
  planned_units?: number;  // Computed field from backend
  active_units?: string;   // Count returned as string from backend
}

export interface Property {
  id: string;
  community_id: string;
  address: string;
  property_type: string | null;
  status: 'active' | 'under-construction' | 'sold';
  last_inspection: string | null;
  next_inspection: string | null;
  assigned_inspector: string | null;
  issues_count: number;
  created_at: string;
  updated_at: string;
}

export interface Inspection {
  id: string;
  propertyId: string;
  inspectorName: string;
  date: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'requires-follow-up';
  type: 'routine' | 'move-in' | 'move-out' | 'maintenance';
  issues: InspectionIssue[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  templateId?: string | number;
}

export interface InspectionItemResponse {
  id: string;
  inspectionId: string;
  templateItemId: number;
  value?: string; // The response value (rating, text, etc.)
  notes?: string; // Item-specific notes
  photos?: string[]; // Item-specific photos
  createdAt: string;
  updatedAt: string;
}

// Interface for sending item responses to backend
export interface CreateInspectionItemResponse {
  templateItemId: string; // UUID from backend
  status?: string; // For pass/fail, select responses
  rating?: number; // For numeric ratings (1-5, etc.)
  textResponse?: string; // For text input responses
  notes?: string; // Item-specific notes
  photos?: string[]; // Item-specific photos
}

export interface DetailedInspection extends Inspection {
  template?: Template | undefined; // The template used for this inspection
  itemResponses?: InspectionItemResponse[]; // Responses to each template item
}

export interface InspectionIssue {
  id: string;
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  photos?: string[];
}

// Template API Types matching backend database structure
export interface TemplateItem {
  id: number;
  section_id: number;
  name: string;
  type: 'text' | 'select' | 'checkbox' | 'number';
  required: boolean;
  order_index: number;
  options: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateSection {
  id: number;
  template_id: number;
  name: string;
  order_index: number;
  description: string | null;
  created_at: string;
  updated_at: string;
  items: TemplateItem[];
}

export interface Template {
  id: number;
  name: string;
  description: string | null;
  type: 'cofo-property' | 'community-level' | 'construction-progress' | 'move-in-move-out' | 'pre-move-out' | 'sale-ready' | 'sparkle-final';
  is_default: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  sections: TemplateSection[];
}

export interface CreateTemplateItemData {
  name: string;
  type: 'text' | 'select' | 'checkbox' | 'number';
  required: boolean;
  order_index: number;
  options?: string[] | null;
}

export interface CreateTemplateSectionData {
  name: string;
  order_index: number;
  description?: string | null;
  items: CreateTemplateItemData[];
}

export interface CreateTemplateData {
  name: string;
  description?: string | null;
  type?: 'cofo-property' | 'community-level' | 'construction-progress' | 'move-in-move-out' | 'pre-move-out' | 'sale-ready' | 'sparkle-final';
  isDefault?: boolean;
  created_by?: string | null;
  sections: CreateTemplateSectionData[];
}

export interface CreateCommunityData {
  name: string;
  status: 'active' | 'under-construction' | 'sold';
  location: string;
  description?: string;
}

export interface CreatePropertyData {
  communityId: string;
  address: string;
  propertyType: string;
  status: 'active' | 'under-construction' | 'sold';
}

export interface CreateInspectionData {
  propertyId: string;
  inspectorId: string;  // Backend expects inspectorId, not inspectorName
  scheduledDate: string;  // Backend expects full ISO timestamp
  type: 'routine' | 'move-in' | 'move-out' | 'maintenance';
  templateId: string | number;  // Backend requires template_id for inspections
}

// Base API client with error handling
class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // In development without backend, use mock data
    if (isDevelopment()) {
      console.log(`🔄 Using mock data for ${endpoint}`);
      return this.getMockResponse<T>(endpoint, options.method);
    }

    const url = `${ENV.API_BASE_URL}${endpoint}`;
    
    // Prepare headers with potential auth token
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // TODO: Add authorization header when authentication is implemented
    // This will be handled by your backend, not directly with Supabase
    
    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ API Error Details:`, {
          url,
          status: response.status,
          statusText: response.statusText,
          errorData,
          method: options.method || 'GET'
        });
        throw new Error(errorData.message || `HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Success: ${endpoint}`, data);
      return data;
    } catch (error) {
      console.error(`❌ API request failed for ${endpoint}:`, error);
      console.log('Falling back to mock data...');
      // Fallback to mock data if API fails
      return this.getMockResponse<T>(endpoint, options.method);
    }
  }

  private async getMockResponse<T>(endpoint: string, method: string = 'GET'): Promise<T> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

    // Route to appropriate mock data based on endpoint
    if (endpoint.includes('/communities')) {
      if (method === 'POST') {
        const newCommunity = {
          id: `community-${Date.now()}`,
          name: 'New Community',
          status: 'active' as const,
          location: 'Mock Location',
          total_units: 0,
          description: 'Mock community',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: null,
          planned_units: 0,
          active_units: '0'
        };
        mockData.communities.push(newCommunity);
        return newCommunity as T;
      }
      return mockData.communities as T;
    }
    
    if (endpoint.includes('/properties')) {
      if (method === 'POST') {
        const newProperty = {
          id: `property-${Date.now()}`,
          community_id: '1',
          address: 'Mock Address',
          property_type: 'Apartment',
          status: 'active' as const,
          last_inspection: null,
          next_inspection: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || null,
          assigned_inspector: 'Mock Inspector',
          issues_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        mockData.properties.push(newProperty);
        return newProperty as T;
      }
      return mockData.properties as T;
    }
    
    if (endpoint.includes('/inspections')) {
      if (method === 'POST') {
        const newInspection = {
          id: `inspection-${Date.now()}`,
          propertyId: '1',
          inspectorName: 'Mock Inspector',
          date: new Date().toISOString().split('T')[0] || '',
          status: 'scheduled' as const,
          type: 'routine' as const,
          issues: [],
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        mockData.inspections.push(newInspection);
        return newInspection as T;
      }
      return mockData.inspections as T;
    }

    if (endpoint.includes('/templates')) {
      if (method === 'POST') {
        const newTemplate = {
          id: Date.now(),
          name: 'New Template',
          description: 'Mock template',
          type: 'cofo-property' as const,
          is_default: false,
          created_by: 'Mock User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sections: []
        };
        mockData.templates.push(newTemplate);
        return newTemplate as T;
      }
      return mockData.templates as T;
    }

    // Default empty response
    return [] as T;
  }

  // Communities API
  async getCommunities(): Promise<Community[]> {
    return this.request<Community[]>('/communities');
  }

  async getCommunity(id: string): Promise<Community> {
    return this.request<Community>(`/communities/${id}`);
  }

  async createCommunity(data: CreateCommunityData): Promise<Community> {
    return this.request<Community>('/communities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCommunity(id: string, data: Partial<CreateCommunityData>): Promise<Community> {
    return this.request<Community>(`/communities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCommunity(id: string): Promise<void> {
    return this.request<void>(`/communities/${id}`, {
      method: 'DELETE',
    });
  }

  // Properties API
  async getProperties(communityId?: string): Promise<Property[]> {
    const query = communityId ? `?communityId=${communityId}` : '';
    return this.request<Property[]>(`/properties${query}`);
  }

  async getProperty(id: string): Promise<Property> {
    return this.request<Property>(`/properties/${id}`);
  }

  async createProperty(data: CreatePropertyData): Promise<Property> {
    return this.request<Property>('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createPropertiesBulk(communityId: string, properties: CreatePropertyData[]): Promise<Property[]> {
    return this.request<Property[]>('/properties/bulk', {
      method: 'POST',
      body: JSON.stringify({ communityId, properties }),
    });
  }

  async updateProperty(id: string, data: Partial<CreatePropertyData>): Promise<Property> {
    return this.request<Property>(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProperty(id: string): Promise<void> {
    return this.request<void>(`/properties/${id}`, {
      method: 'DELETE',
    });
  }

  // Inspections API
  async getInspections(propertyId?: string): Promise<Inspection[]> {
    const query = propertyId ? `?propertyId=${propertyId}` : '';
    return this.request<Inspection[]>(`/inspections${query}`);
  }

  async getInspection(id: string): Promise<Inspection> {
    return this.request<Inspection>(`/inspections/${id}`);
  }

  async createInspection(data: CreateInspectionData): Promise<Inspection> {
    // Transform camelCase to snake_case for backend API
    const backendData = {
      propertyId: data.propertyId,
      inspectorId: data.inspectorId,
      scheduledDate: data.scheduledDate,
      type: data.type,
      template_id: data.templateId, // Backend expects template_id not templateId
    };
    
    return this.request<Inspection>('/inspections', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
  }

  async updateInspection(id: string, data: Partial<CreateInspectionData>): Promise<Inspection> {
    return this.request<Inspection>(`/inspections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async completeInspection(
    id: string, 
    issues: InspectionIssue[], 
    notes?: string, 
    itemResponses?: CreateInspectionItemResponse[]
  ): Promise<Inspection> {
    // Debug: Use test payload with hardcoded values
    const payload = {
      issues: issues || [],
      notes: notes || "Test completion",
      itemResponses: itemResponses && itemResponses.length > 0 ? itemResponses : [
        {
          templateItemId: "833d71e0-ca9a-4a1f-84aa-d2233905539c",
          status: "good",
          notes: "Frontend test 1"
        },
        {
          templateItemId: "8c30c206-e38d-4411-85e2-bb187abaa3a4", 
          status: "fair",
          notes: "Frontend test 2"
        }
      ]
    };

    console.log('🚀 SENDING REQUEST:');
    console.log('URL:', `/api/inspections/${id}/complete`);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const url = `${ENV.API_BASE_URL}/inspections/${id}/complete`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('📥 RESPONSE STATUS:', response.status);
      console.log('📥 RESPONSE HEADERS:', [...response.headers.entries()]);

      const responseText = await response.text();
      console.log('📥 RAW RESPONSE TEXT:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
        console.log('📥 PARSED RESPONSE:', JSON.stringify(result, null, 2));
      } catch (parseError) {
        console.error('❌ JSON PARSE ERROR:', parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!response.ok) {
        console.error('❌ HTTP ERROR:', result);
        throw new Error(result.message || `HTTP ${response.status}`);
      }

      // Check for savedResponses field
      if (result.savedResponses !== undefined) {
        console.log(`✅ SUCCESS: ${result.savedResponses} responses saved`);
      } else {
        console.warn('⚠️  WARNING: savedResponses field missing from response');
        console.log('Available fields:', Object.keys(result));
      }

      return result;

    } catch (error) {
      console.error('❌ COMPLETION ERROR:', error);
      throw error;
    }
  }

  async deleteInspection(id: string): Promise<void> {
    return this.request<void>(`/inspections/${id}`, {
      method: 'DELETE',
    });
  }

  async getDetailedInspection(id: string): Promise<DetailedInspection> {
    // In development, return mock data
    if (isDevelopment()) {
      console.log(`🔄 Using mock detailed inspection data for ID: ${id}`);
      const basicInspection = mockData.inspections.find(i => i.id === id);
      if (!basicInspection) {
        throw new Error('Inspection not found');
      }
      
      // Return mock detailed inspection with template data
      const mockDetailedInspection: DetailedInspection = {
        ...basicInspection,
        template: mockData.templates[0], // Use first template as mock
        itemResponses: [
          {
            id: '1',
            inspectionId: id,
            templateItemId: 1,
            value: 'excellent',
            notes: 'Sink is in perfect condition',
            photos: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            inspectionId: id,
            templateItemId: 2,
            value: 'working',
            notes: 'Faucet operates smoothly',
            photos: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      };
      
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      return mockDetailedInspection;
    }
    
    // Call the real backend API
    const backendResponse = await this.request<any>(`/inspections/${id}/detailed`);
    
    // Transform backend response to frontend format
    const transformedInspection: DetailedInspection = {
      id: backendResponse.id,
      propertyId: backendResponse.property_id,
      inspectorName: backendResponse.inspector_id, // TODO: Look up actual inspector name
      date: backendResponse.scheduled_date,
      status: backendResponse.status,
      type: backendResponse.type,
      issues: backendResponse.issues || [],
      notes: backendResponse.notes || '',
      createdAt: backendResponse.created_at || new Date().toISOString(),
      updatedAt: backendResponse.updated_at || new Date().toISOString(),
      templateId: backendResponse.template_id,
      template: backendResponse.template ? {
        id: backendResponse.template.id,
        name: backendResponse.template.name,
        description: backendResponse.template.description,
        type: backendResponse.template.type,
        is_default: backendResponse.template.is_default || false,
        created_by: backendResponse.template.created_by,
        created_at: backendResponse.template.created_at,
        updated_at: backendResponse.template.updated_at,
        sections: (backendResponse.template.sections || []).map((section: any) => ({
          id: section.id,
          template_id: backendResponse.template.id,
          name: section.name,
          order_index: section.order_index,
          description: section.description,
          created_at: section.created_at,
          updated_at: section.updated_at,
          items: (section.items || []).map((item: any) => ({
            id: item.id,
            section_id: section.id,
            name: item.name,
            type: item.type,
            required: item.required,
            order_index: item.order_index,
            options: item.options,
            created_at: item.created_at,
            updated_at: item.updated_at
          }))
        }))
      } : undefined,
      itemResponses: (backendResponse.inspection_results || []).map((result: any) => {
        // Map backend response fields to frontend format
        let value = '';
        if (result.status) value = result.status;
        else if (result.rating) value = result.rating.toString();
        else if (result.text_response) value = result.text_response;
        
        return {
          id: result.id,
          inspectionId: backendResponse.id,
          templateItemId: result.template_item_id,
          value,
          notes: result.notes || '',
          photos: result.photos || [],
          createdAt: result.created_at || new Date().toISOString(),
          updatedAt: result.updated_at || new Date().toISOString()
        };
      })
    };
    
    console.log('✅ Transformed detailed inspection:', transformedInspection);
    return transformedInspection;
  }

  // Templates API
  async getTemplates(): Promise<Template[]> {
    return this.request<Template[]>('/templates');
  }

  async getTemplate(id: string | number): Promise<Template> {
    return this.request<Template>(`/templates/${id}`);
  }

  async createTemplate(data: CreateTemplateData): Promise<Template> {
    return this.request<Template>('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTemplate(id: string | number, data: Partial<CreateTemplateData>): Promise<Template> {
    return this.request<Template>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTemplate(id: string | number): Promise<void> {
    return this.request<void>(`/templates/${id}`, {
      method: 'DELETE',
    });
  }

  // Template Sections API
  async createTemplateSection(templateId: number, data: Omit<CreateTemplateSectionData, 'items'>): Promise<TemplateSection> {
    return this.request<TemplateSection>(`/templates/${templateId}/sections`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTemplateSection(id: number, data: Partial<Omit<CreateTemplateSectionData, 'items'>>): Promise<TemplateSection> {
    return this.request<TemplateSection>(`/templates/sections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTemplateSection(id: number): Promise<void> {
    return this.request<void>(`/templates/sections/${id}`, {
      method: 'DELETE',
    });
  }

  // Template Items API
  async createTemplateItem(sectionId: number, data: CreateTemplateItemData): Promise<TemplateItem> {
    return this.request<TemplateItem>(`/templates/sections/${sectionId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTemplateItem(id: number, data: Partial<CreateTemplateItemData>): Promise<TemplateItem> {
    return this.request<TemplateItem>(`/templates/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTemplateItem(id: number): Promise<void> {
    return this.request<void>(`/templates/items/${id}`, {
      method: 'DELETE',
    });
  }

  // File Upload API
  async uploadFile(file: File, type: 'csv' | 'image' | 'document'): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${ENV.API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  }

  // Reports API
  async generatePropertyReport(propertyId: string, format: 'pdf' | 'excel' = 'pdf'): Promise<{ url: string }> {
    return this.request<{ url: string }>(`/reports/property/${propertyId}?format=${format}`);
  }

  async generateCommunityReport(communityId: string, format: 'pdf' | 'excel' = 'pdf'): Promise<{ url: string }> {
    return this.request<{ url: string }>(`/reports/community/${communityId}?format=${format}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Mock data for development (replace with real API calls in production)
export const mockData = {
  communities: [
    {
      id: '1',
      name: 'Sunset Gardens',
      status: 'active' as const,
      location: '123 Main St, Anytown USA',
      total_units: 24,
      description: 'Modern residential community',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      created_by: null,
      planned_units: 24,
      active_units: '24'
    },
    {
      id: '2',
      name: 'Oakwood Heights',
      status: 'under-construction' as const,
      location: '456 Oak Ave, Anytown USA',
      total_units: 36,
      description: 'Luxury apartments with amenities',
      created_at: '2024-02-01T10:00:00Z',
      updated_at: '2024-02-01T10:00:00Z',
      created_by: null,
      planned_units: 36,
      active_units: '36'
    }
  ] as Community[],

  properties: [
    {
      id: '1',
      community_id: '1',
      address: '123 Main St, Unit A',
      property_type: 'Apartment',
      status: 'active' as const,
      last_inspection: '2024-01-15',
      next_inspection: '2024-04-15',
      assigned_inspector: 'John Smith',
      issues_count: 2,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    }
  ] as Property[],

  inspections: [
    {
      id: '1',
      propertyId: '1',
      inspectorName: 'John Smith',
      date: '2024-01-15',
      status: 'completed' as const,
      type: 'routine' as const,
      issues: [
        {
          id: '1',
          category: 'Plumbing',
          description: 'Leaky faucet in kitchen',
          severity: 'medium' as const,
          resolved: false
        }
      ],
      notes: 'Overall good condition',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    }
  ] as Inspection[],

  templates: [
    {
      id: 1,
      name: 'Standard Move-In Inspection',
      description: 'Default template for move-in inspections with comprehensive room-by-room checklist',
      type: 'cofo-property' as const,
      is_default: true,
      created_by: 'admin',
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z',
      sections: [
        {
          id: 1,
          template_id: 1,
          name: 'Kitchen',
          order_index: 1,
          description: 'Kitchen appliances and fixtures inspection',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          items: [
            {
              id: 1,
              section_id: 1,
              name: 'Sink Condition',
              type: 'select' as const,
              required: true,
              order_index: 1,
              options: ['excellent', 'good', 'fair', 'poor'],
              created_at: '2024-01-01T10:00:00Z',
              updated_at: '2024-01-01T10:00:00Z'
            },
            {
              id: 2,
              section_id: 1,
              name: 'Faucet Operation',
              type: 'select' as const,
              required: true,
              order_index: 2,
              options: ['working', 'minor_issues', 'needs_repair'],
              created_at: '2024-01-01T10:00:00Z',
              updated_at: '2024-01-01T10:00:00Z'
            }
          ]
        },
        {
          id: 2,
          template_id: 1,
          name: 'Living Room',
          order_index: 2,
          description: 'Living area and common spaces',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          items: [
            {
              id: 3,
              section_id: 2,
              name: 'Flooring Condition',
              type: 'select' as const,
              required: true,
              order_index: 1,
              options: ['excellent', 'good', 'fair', 'poor'],
              created_at: '2024-01-01T10:00:00Z',
              updated_at: '2024-01-01T10:00:00Z'
            }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Premium Template',
      description: 'Enhanced template with detailed inspection criteria and custom branding options',
      type: 'sale-ready' as const,
      is_default: false,
      created_by: 'property_manager',
      created_at: '2024-01-02T10:00:00Z',
      updated_at: '2024-01-02T10:00:00Z',
      sections: [
        {
          id: 3,
          template_id: 2,
          name: 'Bathroom',
          order_index: 1,
          description: 'Bathroom fixtures and plumbing',
          created_at: '2024-01-02T10:00:00Z',
          updated_at: '2024-01-02T10:00:00Z',
          items: [
            {
              id: 4,
              section_id: 3,
              name: 'Toilet Condition',
              type: 'select' as const,
              required: true,
              order_index: 1,
              options: ['excellent', 'good', 'needs_cleaning', 'needs_repair'],
              created_at: '2024-01-02T10:00:00Z',
              updated_at: '2024-01-02T10:00:00Z'
            }
          ]
        }
      ]
    }
  ] as Template[]
};