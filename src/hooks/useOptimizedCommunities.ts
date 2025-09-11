import { useState, useEffect, useCallback, useMemo } from 'react';
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

export function useOptimizedCommunities(): UseCommunitiesReturn {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunities = useCallback(async () => {
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
  }, []);

  const createCommunity = useCallback(async (data: CreateCommunityData): Promise<Community> => {
    try {
      setError(null);
      
      // Optimistic update - add community immediately
      const newCommunity: Community = {
        id: Date.now().toString(),
        ...data,
        totalUnits: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Optimistic update
      setCommunities(prev => [...prev, newCommunity]);
      
      try {
        // Always use mock creation for now (until backend is ready)
        // In real implementation, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 100));
        return newCommunity;
      } catch (apiError) {
        // Rollback on API failure
        setCommunities(prev => prev.filter(c => c.id !== newCommunity.id));
        throw apiError;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create community';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateCommunity = useCallback(async (id: string, data: Partial<CreateCommunityData>): Promise<Community> => {
    try {
      setError(null);
      
      // Store original community for rollback
      let originalCommunity: Community | undefined;
      
      // Optimistic update
      setCommunities(prev => {
        const index = prev.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Community not found');
        
        originalCommunity = prev[index];
        const updated = { ...originalCommunity, ...data, updatedAt: new Date().toISOString() };
        return prev.map((community, i) => i === index ? updated : community);
      });
      
      try {
        // Always use mock update for now (until backend is ready)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const updatedCommunity = communities.find(c => c.id === id);
        if (!updatedCommunity) throw new Error('Community not found after update');
        
        return updatedCommunity;
      } catch (apiError) {
        // Rollback on API failure
        if (originalCommunity) {
          setCommunities(prev => prev.map(c => c.id === id ? originalCommunity! : c));
        }
        throw apiError;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update community';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [communities]);

  const deleteCommunity = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      
      // Store original list for rollback
      let originalCommunities: Community[] = [];
      
      // Optimistic update
      setCommunities(prev => {
        originalCommunities = prev;
        return prev.filter(community => community.id !== id);
      });
      
      try {
        // Always use mock deletion for now (until backend is ready)
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (apiError) {
        // Rollback on API failure
        setCommunities(originalCommunities);
        throw apiError;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete community';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  // Memoize the return object to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    communities,
    loading,
    error,
    createCommunity,
    updateCommunity,
    deleteCommunity,
    refetch: fetchCommunities,
  }), [communities, loading, error, createCommunity, updateCommunity, deleteCommunity, fetchCommunities]);

  return returnValue;
}