import { useState, useEffect, useCallback, useMemo } from 'react';

// Generic optimized resource hook with optimistic updates and better error handling
export interface OptimizedResourceState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  isOptimistic: boolean; // Track if we have pending optimistic updates
}

export interface OptimizedResourceActions<T, CreateData, UpdateData = Partial<CreateData>> {
  create: (data: CreateData) => Promise<T>;
  update: (id: string, data: UpdateData) => Promise<T>;
  remove: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export interface OptimizedResourceOptions<T, CreateData, UpdateData = Partial<CreateData>> {
  fetcher: () => Promise<T[]>;
  creator: (data: CreateData) => Promise<T>;
  updater: (id: string, data: UpdateData) => Promise<T>;
  remover: (id: string) => Promise<void>;
  generateId: () => string;
  createOptimisticItem: (data: CreateData) => T;
  dependencies?: any[];
}

export function useOptimizedResource<T extends { id: string }, CreateData, UpdateData = Partial<CreateData>>(
  options: OptimizedResourceOptions<T, CreateData, UpdateData>
): OptimizedResourceState<T> & OptimizedResourceActions<T, CreateData, UpdateData> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Set<string>>(new Set());

  const { 
    fetcher, 
    creator, 
    updater, 
    remover, 
    generateId, 
    createOptimisticItem,
    dependencies = []
  } = options;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
      // Clear optimistic updates on successful fetch
      setOptimisticUpdates(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  const create = useCallback(async (createData: CreateData): Promise<T> => {
    try {
      setError(null);
      
      // Generate temporary ID and create optimistic item
      const tempId = generateId();
      const optimisticItem = createOptimisticItem(createData);
      const optimisticItemWithId = { ...optimisticItem, id: tempId };
      
      // Add to optimistic updates tracking
      setOptimisticUpdates(prev => new Set(prev).add(tempId));
      
      // Optimistic update
      setData(prev => [...prev, optimisticItemWithId]);
      
      try {
        const result = await creator(createData);
        
        // Replace optimistic item with real result
        setData(prev => prev.map(item => 
          item.id === tempId ? result : item
        ));
        
        // Remove from optimistic tracking
        setOptimisticUpdates(prev => {
          const newSet = new Set(prev);
          newSet.delete(tempId);
          return newSet;
        });
        
        return result;
      } catch (apiError) {
        // Rollback optimistic update
        setData(prev => prev.filter(item => item.id !== tempId));
        setOptimisticUpdates(prev => {
          const newSet = new Set(prev);
          newSet.delete(tempId);
          return newSet;
        });
        throw apiError;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [creator, generateId, createOptimisticItem]);

  const update = useCallback(async (id: string, updateData: UpdateData): Promise<T> => {
    try {
      setError(null);
      
      // Store original for rollback
      let originalItem: T | undefined;
      
      // Add to optimistic updates tracking
      setOptimisticUpdates(prev => new Set(prev).add(id));
      
      // Optimistic update
      setData(prev => {
        const index = prev.findIndex(item => item.id === id);
        if (index === -1) throw new Error('Item not found');
        
        originalItem = prev[index];
        const updatedItem = { ...originalItem, ...updateData as Partial<T> };
        return prev.map((item, i) => i === index ? updatedItem : item);
      });
      
      try {
        const result = await updater(id, updateData);
        
        // Update with real result
        setData(prev => prev.map(item => 
          item.id === id ? result : item
        ));
        
        // Remove from optimistic tracking
        setOptimisticUpdates(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        
        return result;
      } catch (apiError) {
        // Rollback optimistic update
        if (originalItem) {
          setData(prev => prev.map(item => 
            item.id === id ? originalItem! : item
          ));
        }
        setOptimisticUpdates(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        throw apiError;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [updater]);

  const remove = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      
      // Store original data for rollback
      let originalData: T[] = [];
      
      // Add to optimistic updates tracking
      setOptimisticUpdates(prev => new Set(prev).add(id));
      
      // Optimistic update
      setData(prev => {
        originalData = prev;
        return prev.filter(item => item.id !== id);
      });
      
      try {
        await remover(id);
        
        // Remove from optimistic tracking on success
        setOptimisticUpdates(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } catch (apiError) {
        // Rollback optimistic update
        setData(originalData);
        setOptimisticUpdates(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        throw apiError;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [remover]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  // Memoize return object
  return useMemo(() => ({
    data,
    loading,
    error,
    isOptimistic: optimisticUpdates.size > 0,
    create,
    update,
    remove,
    refetch: fetchData,
    clearError,
  }), [
    data, 
    loading, 
    error, 
    optimisticUpdates.size,
    create, 
    update, 
    remove, 
    fetchData,
    clearError
  ]);
}