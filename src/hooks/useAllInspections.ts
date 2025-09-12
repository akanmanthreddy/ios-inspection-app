import { useState, useEffect } from 'react';
import { apiClient, EnrichedInspection, mockData } from '../services/api';

// Environment detection - check if backend API is available
const shouldUseMockData = async () => {
  try {
    // Try to ping the backend API to see if it's available
    const response = await fetch('http://localhost:3001/api/test-db', {
      method: 'GET',
      timeout: 2000 // 2 second timeout
    } as any);
    
    if (response.ok) {
      console.log('🌐 Backend API is available - using real data');
      return false; // Use real API
    } else {
      console.log('🔄 Backend API not responding - using mock data');
      return true; // Use mock data
    }
  } catch (error) {
    console.log('🔄 Backend API unreachable - using mock data:', error);
    return true; // Use mock data
  }
};

export interface InspectionOverviewItem {
  id: string;
  propertyAddress: string;
  community: string;
  date: string;
  scheduledDate: string;
  completedAt: string | null;
  type: string;
  inspectionType: string;
  status: 'completed' | 'in-progress' | 'pending' | 'scheduled';
  inspector: string;
  issues: number;
}

export interface UseAllInspectionsReturn {
  inspections: InspectionOverviewItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAllInspections(): UseAllInspectionsReturn {
  const [inspections, setInspections] = useState<InspectionOverviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllInspections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TEMP: Force API usage to debug connection issues
      console.log('🔧 DEBUG: Attempting to connect to backend API...');
      
      if (true) { // Temporarily force API usage
        console.log('🌐 Fetching all inspections from new enriched API endpoint');
        
        try {
          // Use the new enriched endpoint that includes property and community data
          const enrichedInspections = await apiClient.getAllInspectionsEnriched();
          console.log(`📋 Found ${enrichedInspections.length} enriched inspections from API`);
          
          // Transform enriched API data to overview format
          const transformedInspections: InspectionOverviewItem[] = enrichedInspections.map(inspection => {
            // Helper function to extract date from datetime string and use noon UTC to avoid timezone issues
            const extractDate = (datetime: string) => {
              if (!datetime) return datetime;
              const datePart = datetime.split('T')[0]; // Extract "2025-09-11" from "2025-09-11T00:00:00.000Z"
              return datePart + 'T12:00:00Z'; // Add noon UTC to avoid timezone conversion issues
            };

            // Use completion date for completed inspections, scheduled date for others
            const displayDate = inspection.status === 'completed' && inspection.completed_at 
              ? extractDate(inspection.completed_at)
              : extractDate(inspection.scheduled_date);

            return {
              id: inspection.id,
              propertyAddress: inspection.property_address,
              community: inspection.community_name,
              date: displayDate,
              scheduledDate: extractDate(inspection.scheduled_date),
              completedAt: inspection.completed_at ? extractDate(inspection.completed_at) : null,
              type: inspection.type,
              inspectionType: `${inspection.type.charAt(0).toUpperCase() + inspection.type.slice(1)} Inspection`,
              status: inspection.status as any,
              inspector: inspection.inspector_name || 'Unknown Inspector',
              issues: inspection.issues_count
            };
          });
          
          console.log(`✅ Transformed ${transformedInspections.length} inspections for overview`);
          setInspections(transformedInspections);
        } catch (apiError) {
          console.error('❌ API call failed, falling back to mock data:', apiError);
          throw apiError; // This will trigger the catch block below
        }
      } else {
        console.log('🔄 Using enhanced mock data for all inspections');
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Transform mock data to match overview format
        const mockOverviewInspections: InspectionOverviewItem[] = [
          {
            id: '1',
            propertyAddress: '1234 Oak Street, Unit A',
            community: 'Sunset Ridge',
            date: '2024-01-16T12:00:00Z', // Completed date (different from scheduled)
            scheduledDate: '2024-01-15T12:00:00Z',
            completedAt: '2024-01-16T12:00:00Z',
            type: 'move-out',
            inspectionType: 'Move-out Inspection',
            status: 'completed',
            inspector: 'John Smith',
            issues: 2
          },
          {
            id: '2',
            propertyAddress: '1234 Oak Street, Unit B',
            community: 'Sunset Ridge',
            date: '2024-01-16T12:00:00Z', // Scheduled date (in progress)
            scheduledDate: '2024-01-16T12:00:00Z',
            completedAt: null,
            type: 'routine',
            inspectionType: 'Routine Inspection',
            status: 'in-progress',
            inspector: 'Current User',
            issues: 0
          },
          {
            id: '3',
            propertyAddress: '5678 Pine Avenue, Unit 12',
            community: 'Garden View',
            date: '2024-01-17T12:00:00Z', // Scheduled date (pending)
            scheduledDate: '2024-01-17T12:00:00Z',
            completedAt: null,
            type: 'maintenance',
            inspectionType: 'Maintenance Inspection',
            status: 'pending',
            inspector: 'Current User',
            issues: 0
          },
          {
            id: '4',
            propertyAddress: '9012 Maple Drive, Unit C',
            community: 'Riverside',
            date: '2024-01-15T12:00:00Z', // Completed date (different from scheduled)
            scheduledDate: '2024-01-14T12:00:00Z',
            completedAt: '2024-01-15T12:00:00Z',
            type: 'move-in',
            inspectionType: 'Move-in Inspection',
            status: 'completed',
            inspector: 'Jane Doe',
            issues: 5
          },
          {
            id: '5',
            propertyAddress: '3456 Cedar Lane, Unit 8',
            community: 'Hillside Manor',
            date: '2024-01-14T12:00:00Z', // Completed date (same as scheduled)
            scheduledDate: '2024-01-13T12:00:00Z',
            completedAt: '2024-01-14T12:00:00Z',
            type: 'routine',
            inspectionType: 'Annual Inspection',
            status: 'completed',
            inspector: 'Current User',
            issues: 1
          }
        ];
        
        console.log(`📋 Using ${mockOverviewInspections.length} mock inspections`);
        setInspections(mockOverviewInspections);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inspections');
      console.error('❌ Error fetching all inspections:', err);
      
      // Fallback to mock data if everything fails
      const today = new Date().toISOString().split('T')[0] + 'T12:00:00Z';
      const fallbackMockInspections: InspectionOverviewItem[] = [
        {
          id: 'fallback-1',
          propertyAddress: 'Fallback Property',
          community: 'Fallback Community',
          date: today,
          scheduledDate: today,
          completedAt: today,
          type: 'routine',
          inspectionType: 'Routine Inspection',
          status: 'completed',
          inspector: 'System',
          issues: 0
        }
      ];
      setInspections(fallbackMockInspections);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllInspections();
  }, []);

  return {
    inspections,
    loading,
    error,
    refetch: fetchAllInspections,
  };
}