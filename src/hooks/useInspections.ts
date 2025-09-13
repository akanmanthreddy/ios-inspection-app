import { useState, useEffect } from 'react';
import { apiClient, Inspection, CreateInspectionData, InspectionIssue, CreateInspectionItemResponse, mockData } from '../services/api';

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

export interface UseInspectionsReturn {
  inspections: Inspection[];
  loading: boolean;
  error: string | null;
  createInspection: (data: CreateInspectionData) => Promise<Inspection>;
  updateInspection: (id: string, data: Partial<CreateInspectionData>) => Promise<Inspection>;
  completeInspection: (id: string, issues: InspectionIssue[], notes?: string, itemResponses?: CreateInspectionItemResponse[]) => Promise<Inspection>;
  deleteInspection: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useInspections(propertyId?: string): UseInspectionsReturn {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Don't fetch if no propertyId is provided
      if (!propertyId) {
        setInspections([]);
        return;
      }
      
      // Use API in production, enhanced mock data in development
      if (!isDevelopment()) {
        const apiInspections = await apiClient.getInspections(propertyId);
        setInspections(apiInspections);
      } else {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use basic mock data in development
        const persistedInspections = [...mockData.inspections];
        
        // Filter inspections by property if specified
        const filteredInspections = propertyId 
          ? persistedInspections.filter(i => i.propertyId === propertyId)
          : persistedInspections;
        
        setInspections(filteredInspections);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inspections');
      console.error('❌ Error fetching inspections:', err);
      
      // Fallback to basic mock data if everything fails
      const basicMockInspections = propertyId 
        ? mockData.inspections.filter(i => i.propertyId === propertyId)
        : mockData.inspections;
      setInspections(basicMockInspections);
    } finally {
      setLoading(false);
    }
  };

  const createInspection = async (data: CreateInspectionData): Promise<Inspection> => {
    try {
      setError(null);
      
      let newInspection: Inspection;
      
      if (!isDevelopment()) {
        // Use real API to create inspection in database
        newInspection = await apiClient.createInspection(data);
      } else {
        // Mock creation for development
        newInspection = {
          id: Date.now().toString(),
          propertyId: data.propertyId,
          inspectorName: data.inspectorId, // Map inspectorId to inspectorName for display
          date: data.scheduledDate,
          status: 'scheduled',
          type: data.type,
          issues: [],
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      
      // Update local state with the new inspection
      setInspections(prev => [...prev, newInspection]);
      return newInspection;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create inspection';
      setError(errorMessage);
      console.error('❌ Error creating inspection:', err);
      throw new Error(errorMessage);
    }
  };

  const updateInspection = async (id: string, data: Partial<CreateInspectionData>): Promise<Inspection> => {
    try {
      setError(null);
      
      // Always use mock update for now (until backend is ready)
      setInspections(prev => prev.map(inspection => 
        inspection.id === id 
          ? { 
              ...inspection, 
              inspectorName: data.inspectorId || inspection.inspectorName,
              date: data.scheduledDate || inspection.date,
              type: data.type || inspection.type,
              updatedAt: new Date().toISOString() 
            }
          : inspection
      ));
      const updated = inspections.find(i => i.id === id)!;
      return { 
        ...updated, 
        inspectorName: data.inspectorId || updated.inspectorName,
        date: data.scheduledDate || updated.date,
        type: data.type || updated.type,
        updatedAt: new Date().toISOString() 
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update inspection';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const completeInspection = async (id: string, issues: InspectionIssue[], notes?: string, itemResponses?: CreateInspectionItemResponse[]): Promise<Inspection> => {
    try {
      setError(null);
      
      // Try to use real API, fallback to mock if needed
      let updatedInspection: Inspection;
      
      if (!isDevelopment()) {
        updatedInspection = await apiClient.completeInspection(id, issues, notes, itemResponses);
      } else {
        // Mock completion for development
        setInspections(prev => prev.map(inspection => 
          inspection.id === id 
            ? { 
                ...inspection, 
                status: 'completed' as const,
                issues,
                notes: notes || inspection.notes || '',
                updatedAt: new Date().toISOString() 
              }
            : inspection
        ));
        const existing = inspections.find(i => i.id === id);
        updatedInspection = { 
          ...existing!,
          status: 'completed' as const,
          issues,
          notes: notes || existing?.notes || '',
          updatedAt: new Date().toISOString() 
        };
      }
      
      // Update local state with the completed inspection
      setInspections(prev => prev.map(inspection => 
        inspection.id === id ? updatedInspection : inspection
      ));
      
      return updatedInspection;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete inspection';
      setError(errorMessage);
      console.error('❌ Error completing inspection:', err);
      throw new Error(errorMessage);
    }
  };

  const deleteInspection = async (id: string): Promise<void> => {
    try {
      setError(null);
      
      // Always use mock deletion for now (until backend is ready)
      setInspections(prev => prev.filter(inspection => inspection.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete inspection';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [propertyId]);

  return {
    inspections,
    loading,
    error,
    createInspection,
    updateInspection,
    completeInspection,
    deleteInspection,
    refetch: fetchInspections,
  };
}