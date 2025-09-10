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
      console.log('🔧 Using PRODUCTION mode - API calls will go to:', ENV.API_BASE_URL);
      return false;
    }
    
    // Check if we're in a development environment
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' ||
                  window.location.hostname.includes('localhost');
    
    console.log('🔧 Using DEVELOPMENT mode - will use mock data. isDev:', isDev);
    return isDev;
  } catch {
    // Fallback to development mode if window is not available
    console.log('🔧 Fallback to development mode');
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
}

export interface InspectionIssue {
  id: string;
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  photos?: string[];
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
  inspectorName: string;
  scheduledDate: string;
  type: 'routine' | 'move-in' | 'move-out' | 'maintenance';
  notes?: string;
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
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
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
          next_inspection: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
          date: new Date().toISOString().split('T')[0],
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
    return this.request<Inspection>('/inspections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInspection(id: string, data: Partial<CreateInspectionData>): Promise<Inspection> {
    return this.request<Inspection>(`/inspections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async completeInspection(id: string, issues: InspectionIssue[], notes?: string): Promise<Inspection> {
    return this.request<Inspection>(`/inspections/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ issues, notes }),
    });
  }

  async deleteInspection(id: string): Promise<void> {
    return this.request<void>(`/inspections/${id}`, {
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
  ] as Inspection[]
};