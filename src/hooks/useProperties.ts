import { useState, useEffect } from 'react';
import { apiClient, Property, CreatePropertyData, mockData } from '../services/api';

// Environment detection for browser compatibility
const isDevelopment = () => {
  try {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('localhost');
  } catch {
    return true;
  }
};

export interface UsePropertiesReturn {
  properties: Property[];
  loading: boolean;
  error: string | null;
  createProperty: (data: CreatePropertyData) => Promise<Property>;
  createPropertiesBulk: (communityId: string, properties: CreatePropertyData[]) => Promise<Property[]>;
  updateProperty: (id: string, data: Partial<CreatePropertyData>) => Promise<Property>;
  deleteProperty: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useProperties(communityId?: string): UsePropertiesReturn {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the API client which handles fallback to mock data automatically
      const data = await apiClient.getProperties(communityId);
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProperty = async (data: CreatePropertyData): Promise<Property> => {
    try {
      setError(null);
      
      // Use API client which handles fallback automatically
      const newProperty = await apiClient.createProperty(data);
      setProperties(prev => [...prev, newProperty]);
      return newProperty;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create property';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const createPropertiesBulk = async (communityId: string, propertiesData: CreatePropertyData[]): Promise<Property[]> => {
    try {
      setError(null);
      
      // Use API client which handles fallback automatically
      const newProperties = await apiClient.createPropertiesBulk(communityId, propertiesData);
      setProperties(prev => [...prev, ...newProperties]);
      return newProperties;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create properties';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateProperty = async (id: string, data: Partial<CreatePropertyData>): Promise<Property> => {
    try {
      setError(null);
      
      // Use API client which handles fallback automatically
      const updated = await apiClient.updateProperty(id, data);
      setProperties(prev => prev.map(property => 
        property.id === id ? updated : property
      ));
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update property';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteProperty = async (id: string): Promise<void> => {
    try {
      setError(null);
      
      // Use API client which handles fallback automatically
      await apiClient.deleteProperty(id);
      setProperties(prev => prev.filter(property => property.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete property';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [communityId]);

  return {
    properties,
    loading,
    error,
    createProperty,
    createPropertiesBulk,
    updateProperty,
    deleteProperty,
    refetch: fetchProperties,
  };
}