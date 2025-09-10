import { useState, useEffect } from 'react';
import { apiClient, Community, CreateCommunityData, mockData } from '../services/api';

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

export interface UseCommunitiesReturn {
  communities: Community[];
  loading: boolean;
  error: string | null;
  createCommunity: (data: CreateCommunityData) => Promise<Community>;
  updateCommunity: (id: string, data: Partial<CreateCommunityData>) => Promise<Community>;
  deleteCommunity: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useCommunities(): UseCommunitiesReturn {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the API client which handles fallback to mock data automatically
      const data = await apiClient.getCommunities();
      setCommunities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch communities');
      console.error('Error fetching communities:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCommunity = async (data: CreateCommunityData): Promise<Community> => {
    try {
      setError(null);
      
      // Use API client which handles fallback automatically
      const newCommunity = await apiClient.createCommunity(data);
      setCommunities(prev => [...prev, newCommunity]);
      return newCommunity;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create community';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateCommunity = async (id: string, data: Partial<CreateCommunityData>): Promise<Community> => {
    try {
      setError(null);
      
      // Use API client which handles fallback automatically
      const updated = await apiClient.updateCommunity(id, data);
      setCommunities(prev => prev.map(community => 
        community.id === id ? updated : community
      ));
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update community';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteCommunity = async (id: string): Promise<void> => {
    try {
      setError(null);
      
      // Use API client which handles fallback automatically
      await apiClient.deleteCommunity(id);
      setCommunities(prev => prev.filter(community => community.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete community';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  return {
    communities,
    loading,
    error,
    createCommunity,
    updateCommunity,
    deleteCommunity,
    refetch: fetchCommunities,
  };
}