import { useState, useEffect } from 'react';
import { apiClient, Inspection, CreateInspectionData, InspectionIssue, mockData } from '../services/api';

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
  completeInspection: (id: string, issues: InspectionIssue[], notes?: string) => Promise<Inspection>;
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
      
      // Always use mock data for now (until backend is ready)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter mock inspections by property if specified
      const filteredInspections = propertyId 
        ? mockData.inspections.filter(i => i.propertyId === propertyId)
        : mockData.inspections;
      
      setInspections(filteredInspections);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inspections');
      console.error('Error fetching inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  const createInspection = async (data: CreateInspectionData): Promise<Inspection> => {
    try {
      setError(null);
      
      // Always use mock creation for now (until backend is ready)
      const newInspection: Inspection = {
        id: Date.now().toString(),
        propertyId: data.propertyId,
        inspectorName: data.inspectorName,
        date: data.scheduledDate,
        status: 'scheduled',
        type: data.type,
        issues: [],
        notes: data.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setInspections(prev => [...prev, newInspection]);
      return newInspection;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create inspection';
      setError(errorMessage);
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
              inspectorName: data.inspectorName || inspection.inspectorName,
              date: data.scheduledDate || inspection.date,
              type: data.type || inspection.type,
              notes: data.notes || inspection.notes,
              updatedAt: new Date().toISOString() 
            }
          : inspection
      ));
      const updated = inspections.find(i => i.id === id)!;
      return { 
        ...updated, 
        inspectorName: data.inspectorName || updated.inspectorName,
        date: data.scheduledDate || updated.date,
        type: data.type || updated.type,
        notes: data.notes || updated.notes,
        updatedAt: new Date().toISOString() 
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update inspection';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const completeInspection = async (id: string, issues: InspectionIssue[], notes?: string): Promise<Inspection> => {
    try {
      setError(null);
      
      // Always use mock completion for now (until backend is ready)
      setInspections(prev => prev.map(inspection => 
        inspection.id === id 
          ? { 
              ...inspection, 
              status: 'completed' as const,
              issues,
              notes: notes || inspection.notes,
              updatedAt: new Date().toISOString() 
            }
          : inspection
      ));
      const updated = inspections.find(i => i.id === id)!;
      return { 
        ...updated, 
        status: 'completed' as const,
        issues,
        notes: notes || updated.notes,
        updatedAt: new Date().toISOString() 
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete inspection';
      setError(errorMessage);
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