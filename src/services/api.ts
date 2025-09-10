// API Service Layer for Property Inspection App
// import { supabase } from './supabase';
import { ENV, isSupabaseConfigured } from '../config/env';

// Environment detection for browser compatibility
const isDevelopment = () => {
  try {
    // Check if we're in a development environment
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('localhost');
  } catch {
    // Fallback to development mode if window is not available
    return true;
  }
};

// API Response Types
export interface Community {
  id: string;
  name: string;
  status: 'active' | 'under-construction' | 'sold';
  location: string;
  totalUnits: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  communityId: string;
  address: string;
  propertyType: string;
  status: 'active' | 'under-construction' | 'sold';
  lastInspection: string | null;
  nextInspection: string;
  inspector: string;
  issues: number;
  createdAt: string;
  updatedAt: string;
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
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed, falling back to mock data:', error);
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
          totalUnits: 0,
          description: 'Mock community',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
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
          communityId: '1',
          address: 'Mock Address',
          propertyType: 'Apartment',
          status: 'active' as const,
          lastInspection: null,
          nextInspection: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          inspector: 'Mock Inspector',
          issues: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
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
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('communities')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return (data || []).map(item => ({
          id: item.id,
          name: item.name,
          status: item.status,
          location: item.location,
          totalUnits: item.total_units,
          description: item.description,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));
      } catch (error) {
        console.error('Supabase error, falling back to mock data:', error);
        return mockData.communities;
      }
    }
    return this.request<Community[]>('/communities');
  }

  async getCommunity(id: string): Promise<Community> {
    return this.request<Community>(`/communities/${id}`);
  }

  async createCommunity(data: CreateCommunityData): Promise<Community> {
    if (isSupabaseConfigured()) {
      try {
        const { data: result, error } = await supabase
          .from('communities')
          .insert({
            name: data.name,
            status: data.status,
            location: data.location,
            description: data.description,
            total_units: 0,
            created_by: 'current-user-id' // TODO: Get from auth context
          })
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          id: result.id,
          name: result.name,
          status: result.status,
          location: result.location,
          totalUnits: result.total_units,
          description: result.description,
          createdAt: result.created_at,
          updatedAt: result.updated_at
        };
      } catch (error) {
        console.error('Supabase error, falling back to mock data:', error);
        // Fallback to mock creation
        const newCommunity: Community = {
          id: Date.now().toString(),
          ...data,
          totalUnits: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockData.communities.push(newCommunity);
        return newCommunity;
      }
    }
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
      totalUnits: 24,
      description: 'Modern residential community',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Oakwood Heights',
      status: 'under-construction' as const,
      location: '456 Oak Ave, Anytown USA',
      totalUnits: 36,
      description: 'Luxury apartments with amenities',
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: '2024-02-01T10:00:00Z'
    }
  ] as Community[],

  properties: [
    {
      id: '1',
      communityId: '1',
      address: '123 Main St, Unit A',
      propertyType: 'Apartment',
      status: 'active' as const,
      lastInspection: '2024-01-15',
      nextInspection: '2024-04-15',
      inspector: 'John Smith',
      issues: 2,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
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