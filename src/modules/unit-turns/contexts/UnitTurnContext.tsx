import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type {
  UnitTurnInstance,
  UnitTurnLineItem,
  AccountingCostCode,
  UnitTurnSummary,
  CreateUnitTurnInstanceRequest,
  CreateUnitTurnLineItemRequest,
  UpdateUnitTurnInstanceRequest,
  UpdateUnitTurnLineItemRequest,
  UnitTurnStatus,
  GetUnitTurnInstancesParams
} from '../types';
import { unitTurnApi } from '../services/unitTurnApi';

// State structure aligned with database capabilities
interface UnitTurnState {
  // Core data
  instances: UnitTurnInstance[];
  lineItems: Record<string, UnitTurnLineItem[]>; // Keyed by instance ID
  costCodes: AccountingCostCode[];

  // Current working state
  currentInstance: UnitTurnInstance | null;
  currentInstanceSummary: UnitTurnSummary | null;

  // Loading states
  loading: {
    instances: boolean;
    lineItems: boolean;
    costCodes: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
  };

  // Error handling
  error: string | null;

  // Filters and pagination
  filters: GetUnitTurnInstancesParams;
  totalInstances: number;
  hasMoreInstances: boolean;
}

// Action types following existing app patterns
type UnitTurnAction =
  // Loading actions
  | { type: 'SET_LOADING'; payload: { key: keyof UnitTurnState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: string | null }

  // Data actions
  | { type: 'SET_INSTANCES'; payload: UnitTurnInstance[] }
  | { type: 'ADD_INSTANCE'; payload: UnitTurnInstance }
  | { type: 'UPDATE_INSTANCE'; payload: UnitTurnInstance }
  | { type: 'REMOVE_INSTANCE'; payload: string }

  | { type: 'SET_LINE_ITEMS'; payload: { instanceId: string; items: UnitTurnLineItem[] } }
  | { type: 'ADD_LINE_ITEM'; payload: UnitTurnLineItem }
  | { type: 'UPDATE_LINE_ITEM'; payload: UnitTurnLineItem }
  | { type: 'REMOVE_LINE_ITEM'; payload: { instanceId: string; itemId: string } }

  | { type: 'SET_COST_CODES'; payload: AccountingCostCode[] }

  // Current state actions
  | { type: 'SET_CURRENT_INSTANCE'; payload: UnitTurnInstance | null }
  | { type: 'SET_CURRENT_SUMMARY'; payload: UnitTurnSummary | null }

  // Filter actions
  | { type: 'SET_FILTERS'; payload: Partial<GetUnitTurnInstancesParams> }
  | { type: 'RESET_FILTERS' }

  // Pagination
  | { type: 'SET_PAGINATION'; payload: { total: number; hasMore: boolean } };

// Initial state
const initialState: UnitTurnState = {
  instances: [],
  lineItems: {},
  costCodes: [],
  currentInstance: null,
  currentInstanceSummary: null,
  loading: {
    instances: false,
    lineItems: false,
    costCodes: false,
    creating: false,
    updating: false,
    deleting: false,
  },
  error: null,
  filters: {
    page: 1,
    limit: 20,
    sort_by: 'last_modified_at',
    sort_order: 'desc'
  },
  totalInstances: 0,
  hasMoreInstances: false
};

// Reducer following existing app patterns
function unitTurnReducer(state: UnitTurnState, action: UnitTurnAction): UnitTurnState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value
        }
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    case 'SET_INSTANCES':
      return {
        ...state,
        instances: action.payload,
        error: null
      };

    case 'ADD_INSTANCE':
      return {
        ...state,
        instances: [action.payload, ...state.instances],
        totalInstances: state.totalInstances + 1
      };

    case 'UPDATE_INSTANCE':
      return {
        ...state,
        instances: state.instances.map(instance =>
          instance.id === action.payload.id ? action.payload : instance
        ),
        currentInstance: state.currentInstance?.id === action.payload.id
          ? action.payload
          : state.currentInstance
      };

    case 'REMOVE_INSTANCE':
      return {
        ...state,
        instances: state.instances.filter(instance => instance.id !== action.payload),
        lineItems: Object.fromEntries(
          Object.entries(state.lineItems).filter(([key]) => key !== action.payload)
        ),
        currentInstance: state.currentInstance?.id === action.payload ? null : state.currentInstance,
        currentInstanceSummary: state.currentInstance?.id === action.payload ? null : state.currentInstanceSummary,
        totalInstances: Math.max(0, state.totalInstances - 1)
      };

    case 'SET_LINE_ITEMS':
      return {
        ...state,
        lineItems: {
          ...state.lineItems,
          [action.payload.instanceId]: action.payload.items
        },
        error: null
      };

    case 'ADD_LINE_ITEM': {
      const instanceId = action.payload.unitTurnInstanceId;
      const existingItems = state.lineItems[instanceId] || [];
      return {
        ...state,
        lineItems: {
          ...state.lineItems,
          [instanceId]: [...existingItems, action.payload]
        }
      };
    }

    case 'UPDATE_LINE_ITEM': {
      const instanceId = action.payload.unitTurnInstanceId;
      const existingItems = state.lineItems[instanceId] || [];
      return {
        ...state,
        lineItems: {
          ...state.lineItems,
          [instanceId]: existingItems.map(item =>
            item.id === action.payload.id ? action.payload : item
          )
        }
      };
    }

    case 'REMOVE_LINE_ITEM': {
      const { instanceId, itemId } = action.payload;
      const existingItems = state.lineItems[instanceId] || [];
      return {
        ...state,
        lineItems: {
          ...state.lineItems,
          [instanceId]: existingItems.filter(item => item.id !== itemId)
        }
      };
    }

    case 'SET_COST_CODES':
      return {
        ...state,
        costCodes: action.payload,
        error: null
      };

    case 'SET_CURRENT_INSTANCE':
      return {
        ...state,
        currentInstance: action.payload
      };

    case 'SET_CURRENT_SUMMARY':
      return {
        ...state,
        currentInstanceSummary: action.payload
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      };

    case 'RESET_FILTERS':
      return {
        ...state,
        filters: initialState.filters
      };

    case 'SET_PAGINATION':
      return {
        ...state,
        totalInstances: action.payload.total,
        hasMoreInstances: action.payload.hasMore
      };

    default:
      return state;
  }
}

// Context interface
interface UnitTurnContextType {
  // State
  state: UnitTurnState;

  // Instance operations
  loadInstances: (filters?: Partial<GetUnitTurnInstancesParams>) => Promise<void>;
  createInstance: (data: CreateUnitTurnInstanceRequest) => Promise<UnitTurnInstance>;
  updateInstance: (id: string, data: UpdateUnitTurnInstanceRequest) => Promise<UnitTurnInstance>;
  deleteInstance: (id: string) => Promise<void>;
  setCurrentInstance: (instance: UnitTurnInstance | null) => void;

  // Line item operations
  loadLineItems: (instanceId: string) => Promise<void>;
  createLineItem: (data: CreateUnitTurnLineItemRequest) => Promise<UnitTurnLineItem>;
  updateLineItem: (id: string, data: UpdateUnitTurnLineItemRequest) => Promise<UnitTurnLineItem>;
  deleteLineItem: (instanceId: string, itemId: string) => Promise<void>;

  // Cost codes
  loadCostCodes: () => Promise<void>;

  // Summary and calculations
  calculateSummary: (instanceId: string) => Promise<UnitTurnSummary>;

  // Utility functions
  clearError: () => void;
  setFilters: (filters: Partial<GetUnitTurnInstancesParams>) => void;
  resetFilters: () => void;
}

// Create context
const UnitTurnContext = createContext<UnitTurnContextType | undefined>(undefined);

// Provider component
export function UnitTurnProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(unitTurnReducer, initialState);

  // Error handling utility
  const handleError = useCallback((error: unknown, fallbackMessage: string) => {
    const errorMessage = error instanceof Error ? error.message : fallbackMessage;
    console.error(`Unit Turn Error: ${errorMessage}`, error);
    dispatch({ type: 'SET_ERROR', payload: errorMessage });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Instance operations
  const loadInstances = useCallback(async (filters?: Partial<GetUnitTurnInstancesParams>) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'instances', value: true } });
    clearError();

    try {
      const mergedFilters = { ...state.filters, ...filters };
      const response = await unitTurnApi.getUnitTurnInstances(mergedFilters);

      if (response.success && response.data) {
        dispatch({ type: 'SET_INSTANCES', payload: response.data });

        // Update pagination if available in response
        if ('pagination' in response && response.pagination) {
          dispatch({
            type: 'SET_PAGINATION',
            payload: {
              total: response.pagination.total,
              hasMore: response.pagination.page < response.pagination.totalPages
            }
          });
        }
      } else {
        handleError(new Error(response.errors?.[0] || 'Failed to load unit turn instances'), 'Failed to load unit turn instances');
      }
    } catch (error) {
      handleError(error, 'Failed to load unit turn instances');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'instances', value: false } });
    }
  }, [state.filters, handleError, clearError]);

  const createInstance = useCallback(async (data: CreateUnitTurnInstanceRequest): Promise<UnitTurnInstance> => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'creating', value: true } });
    clearError();

    try {
      const response = await unitTurnApi.createUnitTurnInstance(data);

      if (response.success && response.data) {
        dispatch({ type: 'ADD_INSTANCE', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.errors?.[0] || 'Failed to create unit turn instance');
      }
    } catch (error) {
      handleError(error, 'Failed to create unit turn instance');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'creating', value: false } });
    }
  }, [handleError, clearError]);

  const updateInstance = useCallback(async (id: string, data: UpdateUnitTurnInstanceRequest): Promise<UnitTurnInstance> => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'updating', value: true } });
    clearError();

    try {
      const response = await unitTurnApi.updateUnitTurnInstance(id, data);

      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_INSTANCE', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.errors?.[0] || 'Failed to update unit turn instance');
      }
    } catch (error) {
      handleError(error, 'Failed to update unit turn instance');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'updating', value: false } });
    }
  }, [handleError, clearError]);

  const deleteInstance = useCallback(async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'deleting', value: true } });
    clearError();

    try {
      const response = await unitTurnApi.deleteUnitTurnInstance(id);

      if (response.success) {
        dispatch({ type: 'REMOVE_INSTANCE', payload: id });
      } else {
        throw new Error(response.errors?.[0] || 'Failed to delete unit turn instance');
      }
    } catch (error) {
      handleError(error, 'Failed to delete unit turn instance');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'deleting', value: false } });
    }
  }, [handleError, clearError]);

  const setCurrentInstance = useCallback((instance: UnitTurnInstance | null) => {
    dispatch({ type: 'SET_CURRENT_INSTANCE', payload: instance });
    dispatch({ type: 'SET_CURRENT_SUMMARY', payload: null }); // Reset summary when changing instance
  }, []);

  // Line item operations
  const loadLineItems = useCallback(async (instanceId: string) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'lineItems', value: true } });
    clearError();

    try {
      const response = await unitTurnApi.getUnitTurnLineItems({ unit_turn_instance_id: instanceId });

      if (response.success && response.data) {
        dispatch({ type: 'SET_LINE_ITEMS', payload: { instanceId, items: response.data } });
      } else {
        handleError(new Error(response.errors?.[0] || 'Failed to load line items'), 'Failed to load line items');
      }
    } catch (error) {
      handleError(error, 'Failed to load line items');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'lineItems', value: false } });
    }
  }, [handleError, clearError]);

  const createLineItem = useCallback(async (data: CreateUnitTurnLineItemRequest): Promise<UnitTurnLineItem> => {
    clearError();

    try {
      const response = await unitTurnApi.createUnitTurnLineItem(data);

      if (response.success && response.data) {
        dispatch({ type: 'ADD_LINE_ITEM', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.errors?.[0] || 'Failed to create line item');
      }
    } catch (error) {
      handleError(error, 'Failed to create line item');
      throw error;
    }
  }, [handleError, clearError]);

  const updateLineItem = useCallback(async (id: string, data: UpdateUnitTurnLineItemRequest): Promise<UnitTurnLineItem> => {
    clearError();

    try {
      const response = await unitTurnApi.updateUnitTurnLineItem(id, data);

      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_LINE_ITEM', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.errors?.[0] || 'Failed to update line item');
      }
    } catch (error) {
      handleError(error, 'Failed to update line item');
      throw error;
    }
  }, [handleError, clearError]);

  const deleteLineItem = useCallback(async (instanceId: string, itemId: string): Promise<void> => {
    clearError();

    try {
      const response = await unitTurnApi.deleteUnitTurnLineItem(itemId);

      if (response.success) {
        dispatch({ type: 'REMOVE_LINE_ITEM', payload: { instanceId, itemId } });
      } else {
        throw new Error(response.errors?.[0] || 'Failed to delete line item');
      }
    } catch (error) {
      handleError(error, 'Failed to delete line item');
      throw error;
    }
  }, [handleError, clearError]);

  // Cost codes
  const loadCostCodes = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'costCodes', value: true } });
    clearError();

    try {
      const response = await unitTurnApi.getAccountingCostCodes();

      if (response.success && response.data) {
        dispatch({ type: 'SET_COST_CODES', payload: response.data });
      } else {
        handleError(new Error(response.errors?.[0] || 'Failed to load cost codes'), 'Failed to load cost codes');
      }
    } catch (error) {
      handleError(error, 'Failed to load cost codes');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'costCodes', value: false } });
    }
  }, [handleError, clearError]);

  // Summary calculation
  const calculateSummary = useCallback(async (instanceId: string): Promise<UnitTurnSummary> => {
    try {
      const response = await unitTurnApi.getUnitTurnSummary(instanceId);

      if (response.success && response.data) {
        dispatch({ type: 'SET_CURRENT_SUMMARY', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.errors?.[0] || 'Failed to calculate summary');
      }
    } catch (error) {
      handleError(error, 'Failed to calculate summary');
      throw error;
    }
  }, [handleError]);

  // Filter management
  const setFilters = useCallback((filters: Partial<GetUnitTurnInstancesParams>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  // Load cost codes on mount
  useEffect(() => {
    loadCostCodes();
  }, [loadCostCodes]);

  const contextValue: UnitTurnContextType = {
    state,
    loadInstances,
    createInstance,
    updateInstance,
    deleteInstance,
    setCurrentInstance,
    loadLineItems,
    createLineItem,
    updateLineItem,
    deleteLineItem,
    loadCostCodes,
    calculateSummary,
    clearError,
    setFilters,
    resetFilters
  };

  return (
    <UnitTurnContext.Provider value={contextValue}>
      {children}
    </UnitTurnContext.Provider>
  );
}

// Hook to use context
export function useUnitTurn() {
  const context = useContext(UnitTurnContext);
  if (context === undefined) {
    throw new Error('useUnitTurn must be used within a UnitTurnProvider');
  }
  return context;
}