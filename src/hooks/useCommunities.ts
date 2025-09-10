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
      
      // Always use mock data for now (until backend is ready)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setCommunities(mockData.communities);
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
      
      // Always use mock creation for now (until backend is ready)
      const newCommunity: Community = {
        id: Date.now().toString(),
        ...data,
        totalUnits: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
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
      
      // Always use mock update for now (until backend is ready)
      setCommunities(prev => prev.map(community => 
        community.id === id 
          ? { ...community, ...data, updatedAt: new Date().toISOString() }
          : community
      ));
      const updated = communities.find(c => c.id === id)!;
      return { ...updated, ...data, updatedAt: new Date().toISOString() };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update community';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteCommunity = async (id: string): Promise<void> => {
    try {
      setError(null);
      
      // Always use mock deletion for now (until backend is ready)
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