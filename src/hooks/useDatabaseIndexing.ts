import { useState, useEffect, useCallback } from 'react';
import { 
  databaseIndexingService, 
  DatabaseIndex, 
  QueryPlan, 
  IndexRecommendation, 
  DatabaseSchema,
  QueryAnalytics
} from '../services/databaseIndexing';

// Hook for managing database indexes
export function useDatabaseIndexes() {
  const [indexes, setIndexes] = useState<DatabaseIndex[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshIndexes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 500));
      const allIndexes = databaseIndexingService.getAllIndexes();
      setIndexes(allIndexes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load indexes');
    } finally {
      setLoading(false);
    }
  }, []);

  const createIndex = useCallback(async (indexData: Omit<DatabaseIndex, 'id' | 'createdAt' | 'lastUsed' | 'performance'>) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newIndex = databaseIndexingService.createIndex(indexData);
      setIndexes(prev => [...prev, newIndex]);
      return newIndex;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create index');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const dropIndex = useCallback(async (indexId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 800));
      const success = databaseIndexingService.dropIndex(indexId);
      if (success) {
        setIndexes(prev => prev.filter(idx => idx.id !== indexId));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to drop index');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTableIndexes = useCallback((tableName: string) => {
    return indexes.filter(index => index.table === tableName);
  }, [indexes]);

  useEffect(() => {
    refreshIndexes();
  }, [refreshIndexes]);

  return {
    indexes,
    loading,
    error,
    refreshIndexes,
    createIndex,
    dropIndex,
    getTableIndexes
  };
}

// Hook for query analysis and optimization
export function useQueryAnalysis() {
  const [queryPlans, setQueryPlans] = useState<QueryPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<QueryPlan | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeQuery = useCallback(async (query: string) => {
    setAnalyzing(true);
    try {
      // Simulate analysis time
      await new Promise(resolve => setTimeout(resolve, 800));
      const plan = databaseIndexingService.analyzeQuery(query);
      setCurrentPlan(plan);
      setQueryPlans(prev => [plan, ...prev.slice(0, 49)]); // Keep last 50 plans
      return plan;
    } catch (err) {
      console.error('Query analysis failed:', err);
      throw err;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const getOptimizationSuggestions = useCallback((query: string) => {
    return databaseIndexingService.suggestQueryOptimizations(query);
  }, []);

  const getRecentPlans = useCallback((limit: number = 20) => {
    return queryPlans.slice(0, limit);
  }, [queryPlans]);

  useEffect(() => {
    // Load recent query plans on mount
    const recentPlans = databaseIndexingService.getRecentQueryPlans(20);
    setQueryPlans(recentPlans);
  }, []);

  return {
    queryPlans: queryPlans,
    currentPlan,
    analyzing,
    analyzeQuery,
    getOptimizationSuggestions,
    getRecentPlans
  };
}

// Hook for index recommendations
export function useIndexRecommendations() {
  const [recommendations, setRecommendations] = useState<IndexRecommendation[]>([]);
  const [maintenanceRecommendations, setMaintenanceRecommendations] = useState<IndexRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 600));
      const recs = databaseIndexingService.getRecommendations();
      const maintenance = databaseIndexingService.getMaintenanceRecommendations();
      setRecommendations(recs);
      setMaintenanceRecommendations(maintenance);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyRecommendation = useCallback(async (recommendationId: string) => {
    const recommendation = [...recommendations, ...maintenanceRecommendations]
      .find(rec => rec.id === recommendationId);
    
    if (!recommendation) return false;

    try {
      if (recommendation.type === 'create') {
        await databaseIndexingService.createIndex({
          name: `${recommendation.table}_${recommendation.columns.join('_')}_idx`,
          table: recommendation.table,
          columns: recommendation.columns,
          type: recommendation.indexType,
          unique: false,
          partial: false,
          size: Math.round(recommendation.expectedImprovement.storageImpact),
          usage: 0,
          status: 'active'
        });
      } else if (recommendation.type === 'drop') {
        // Find and drop the index
        const indexes = databaseIndexingService.getAllIndexes();
        const indexToDrop = indexes.find(idx => 
          idx.table === recommendation.table && 
          idx.columns.every((col, i) => col === recommendation.columns[i])
        );
        if (indexToDrop) {
          await databaseIndexingService.dropIndex(indexToDrop.id);
        }
      }

      // Remove applied recommendation
      setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId));
      setMaintenanceRecommendations(prev => prev.filter(rec => rec.id !== recommendationId));
      
      return true;
    } catch (err) {
      console.error('Failed to apply recommendation:', err);
      return false;
    }
  }, [recommendations, maintenanceRecommendations]);

  const dismissRecommendation = useCallback((recommendationId: string) => {
    setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId));
    setMaintenanceRecommendations(prev => prev.filter(rec => rec.id !== recommendationId));
  }, []);

  const getRecommendationsByPriority = useCallback((priority?: IndexRecommendation['priority']) => {
    const allRecs = [...recommendations, ...maintenanceRecommendations];
    return priority ? 
      allRecs.filter(rec => rec.priority === priority) : 
      allRecs.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  }, [recommendations, maintenanceRecommendations]);

  useEffect(() => {
    refreshRecommendations();
  }, [refreshRecommendations]);

  return {
    recommendations,
    maintenanceRecommendations,
    loading,
    refreshRecommendations,
    applyRecommendation,
    dismissRecommendation,
    getRecommendationsByPriority
  };
}

// Hook for database schema information
export function useDatabaseSchema() {
  const [schema, setSchema] = useState<DatabaseSchema | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSchema = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 400));
      const schemaData = databaseIndexingService.getSchema();
      setSchema(schemaData);
    } catch (err) {
      console.error('Failed to load schema:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTableInfo = useCallback((tableName: string) => {
    return schema?.tables[tableName] || null;
  }, [schema]);

  const getTableColumns = useCallback((tableName: string) => {
    const tableInfo = getTableInfo(tableName);
    return tableInfo ? Object.entries(tableInfo.columns) : [];
  }, [getTableInfo]);

  const getIndexedColumns = useCallback((tableName: string) => {
    const tableInfo = getTableInfo(tableName);
    if (!tableInfo) return [];
    
    return Object.entries(tableInfo.columns)
      .filter(([_, column]) => column.indexed)
      .map(([name]) => name);
  }, [getTableInfo]);

  useEffect(() => {
    loadSchema();
  }, [loadSchema]);

  return {
    schema,
    loading,
    loadSchema,
    getTableInfo,
    getTableColumns,
    getIndexedColumns
  };
}

// Hook for performance analytics
export function useDatabasePerformance() {
  const [analytics, setAnalytics] = useState<QueryAnalytics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const refreshAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 500));
      const analyticsData = databaseIndexingService.getAnalytics();
      const metricsData = databaseIndexingService.getPerformanceMetrics();
      setAnalytics(analyticsData);
      setPerformanceMetrics(metricsData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSlowQueries = useCallback(() => {
    return analytics?.slowestQueries || [];
  }, [analytics]);

  const getFrequentQueries = useCallback(() => {
    return analytics?.mostFrequentQueries || [];
  }, [analytics]);

  const getIndexUsageStats = useCallback(() => {
    return analytics?.indexUsage || {};
  }, [analytics]);

  const getPerformanceTrends = useCallback(() => {
    // Simulate trend data
    const trends = [];
    const now = Date.now();
    for (let i = 23; i >= 0; i--) {
      trends.push({
        timestamp: new Date(now - i * 60 * 60 * 1000).toISOString(),
        avgQueryTime: Math.random() * 50 + 10,
        slowQueries: Math.floor(Math.random() * 20),
        totalQueries: Math.floor(Math.random() * 500 + 100)
      });
    }
    return trends;
  }, []);

  useEffect(() => {
    refreshAnalytics();
    
    // Set up periodic refresh
    const interval = setInterval(refreshAnalytics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [refreshAnalytics]);

  return {
    analytics,
    performanceMetrics,
    loading,
    refreshAnalytics,
    getSlowQueries,
    getFrequentQueries,
    getIndexUsageStats,
    getPerformanceTrends
  };
}

// Combined hook for all database indexing functionality
export function useDatabaseIndexing() {
  const indexes = useDatabaseIndexes();
  const queryAnalysis = useQueryAnalysis();
  const recommendations = useIndexRecommendations();
  const schema = useDatabaseSchema();
  const performance = useDatabasePerformance();

  return {
    indexes,
    queryAnalysis,
    recommendations,
    schema,
    performance
  };
}