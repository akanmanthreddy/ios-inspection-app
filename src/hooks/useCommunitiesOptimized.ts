import { useOptimizedResource } from './useOptimizedResource';
import { apiClient, Community, CreateCommunityData, mockData } from '../services/api';

export function useCommunitiesOptimized() {
  return useOptimizedResource<Community, CreateCommunityData>({
    fetcher: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockData.communities;
    },
    creator: async (data: CreateCommunityData) => {
      const newCommunity: Community = {
        id: Date.now().toString(),
        ...data,
        totalUnits: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      // In production, this would be: return apiClient.createCommunity(data);
      await new Promise(resolve => setTimeout(resolve, 100));
      return newCommunity;
    },
    updater: async (id: string, data: Partial<CreateCommunityData>) => {
      // In production, this would be: return apiClient.updateCommunity(id, data);
      await new Promise(resolve => setTimeout(resolve, 100));
      return {
        id,
        ...data,
        totalUnits: 0, // This would come from the API response
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Community;
    },
    remover: async (id: string) => {
      // In production, this would be: return apiClient.deleteCommunity(id);
      await new Promise(resolve => setTimeout(resolve, 100));
    },
    generateId: () => `temp-${Date.now()}-${Math.random()}`,
    createOptimisticItem: (data: CreateCommunityData): Community => ({
      id: '', // Will be overridden
      ...data,
      totalUnits: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  });
}