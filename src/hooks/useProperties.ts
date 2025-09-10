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
      
      // Always use mock data for now (until backend is ready)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter mock properties by community if specified
      const filteredProperties = communityId 
        ? mockData.properties.filter(p => p.communityId === communityId)
        : mockData.properties;
      
      setProperties(filteredProperties);
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
      
      // Always use mock creation for now (until backend is ready)
      const newProperty: Property = {
        id: Date.now().toString(),
        ...data,
        lastInspection: null,
        nextInspection: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
        inspector: 'Unassigned',
        issues: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
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
      
      // Always use mock bulk creation for now (until backend is ready)
      const newProperties: Property[] = propertiesData.map(data => ({
        id: (Date.now() + Math.random()).toString(),
        ...data,
        lastInspection: null,
        nextInspection: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        inspector: 'Unassigned',
        issues: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
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
      
      // Always use mock update for now (until backend is ready)
      setProperties(prev => prev.map(property => 
        property.id === id 
          ? { ...property, ...data, updatedAt: new Date().toISOString() }
          : property
      ));
      const updated = properties.find(p => p.id === id)!;
      return { ...updated, ...data, updatedAt: new Date().toISOString() };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update property';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteProperty = async (id: string): Promise<void> => {
    try {
      setError(null);
      
      // Always use mock deletion for now (until backend is ready)
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