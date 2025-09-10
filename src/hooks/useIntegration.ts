import { useState, useEffect, useCallback } from 'react';
import { 
  integrationService, 
  SystemStatus, 
  IntegrationEvent, 
  IntegrationMetrics,
  DataFlowMapping
} from '../services/integrationService';

// Hook for system status monitoring
export function useSystemStatus() {
  const [systemStatuses, setSystemStatuses] = useState<SystemStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());

  const refreshSystemStatus = useCallback(() => {
    const statuses = integrationService.getSystemStatuses();
    setSystemStatuses(statuses);
    setLastUpdate(new Date().toISOString());
    setLoading(false);
  }, []);

  const getSystemHealth = useCallback(() => {
    return integrationService.getSystemHealth();
  }, []);

  const getSystemByName = useCallback((name: string) => {
    return systemStatuses.find(status => 
      status.name.toLowerCase().includes(name.toLowerCase())
    );
  }, [systemStatuses]);

  const getOnlineSystems = useCallback(() => {
    return systemStatuses.filter(status => status.status === 'online');
  }, [systemStatuses]);

  const getOfflineSystems = useCallback(() => {
    return systemStatuses.filter(status => status.status !== 'online');
  }, [systemStatuses]);

  useEffect(() => {
    // Initial load
    refreshSystemStatus();
    
    // Set up periodic refresh
    const interval = setInterval(refreshSystemStatus, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [refreshSystemStatus]);

  return {
    systemStatuses,
    loading,
    lastUpdate,
    refreshSystemStatus,
    getSystemHealth,
    getSystemByName,
    getOnlineSystems,
    getOfflineSystems
  };
}

// Hook for integration metrics and analytics
export function useIntegrationMetrics() {
  const [metrics, setMetrics] = useState<IntegrationMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMetrics = useCallback(() => {
    const currentMetrics = integrationService.getIntegrationMetrics();
    setMetrics(currentMetrics);
    setLoading(false);
  }, []);

  const getPerformanceScore = useCallback(() => {
    return metrics?.performanceScore || 0;
  }, [metrics]);

  const getEventSuccessRate = useCallback(() => {
    if (!metrics || metrics.totalEvents === 0) return 100;
    return Math.round((metrics.processedEvents / metrics.totalEvents) * 100);
  }, [metrics]);

  const getDataSyncStatus = useCallback(() => {
    if (!metrics) return { communities: 0, properties: 0, inspections: 0 };
    
    return {
      communities: metrics.dataSync.communities.total > 0 ? 
        Math.round((metrics.dataSync.communities.synced / metrics.dataSync.communities.total) * 100) : 100,
      properties: metrics.dataSync.properties.total > 0 ? 
        Math.round((metrics.dataSync.properties.synced / metrics.dataSync.properties.total) * 100) : 100,
      inspections: metrics.dataSync.inspections.total > 0 ? 
        Math.round((metrics.dataSync.inspections.synced / metrics.dataSync.inspections.total) * 100) : 100
    };
  }, [metrics]);

  const getSystemUptime = useCallback(() => {
    if (!metrics) return '0h 0m';
    
    const uptimeMs = metrics.systemUptime;
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }, [metrics]);

  useEffect(() => {
    // Initial load
    refreshMetrics();
    
    // Set up periodic refresh
    const interval = setInterval(refreshMetrics, 10000); // Every 10 seconds
    
    return () => clearInterval(interval);
  }, [refreshMetrics]);

  return {
    metrics,
    loading,
    refreshMetrics,
    getPerformanceScore,
    getEventSuccessRate,
    getDataSyncStatus,
    getSystemUptime
  };
}

// Hook for event monitoring and management
export function useIntegrationEvents() {
  const [events, setEvents] = useState<IntegrationEvent[]>([]);
  const [recentEvents, setRecentEvents] = useState<IntegrationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshEvents = useCallback(() => {
    const eventQueue = integrationService.getEventQueue();
    setEvents(eventQueue);
    
    // Get recent events (last 50)
    const recent = eventQueue
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);
    setRecentEvents(recent);
    
    setLoading(false);
  }, []);

  const getEventsByType = useCallback((type: IntegrationEvent['type']) => {
    return events.filter(event => event.type === type);
  }, [events]);

  const getEventsBySource = useCallback((source: string) => {
    return events.filter(event => event.source === source);
  }, [events]);

  const getFailedEvents = useCallback(() => {
    return events.filter(event => !event.processed && (event.retryCount || 0) >= 3);
  }, [events]);

  const getPendingEvents = useCallback(() => {
    return events.filter(event => !event.processed && (event.retryCount || 0) < 3);
  }, [events]);

  const emitEvent = useCallback((eventData: Omit<IntegrationEvent, 'id' | 'timestamp' | 'processed'>) => {
    integrationService.emitEvent(eventData);
    // Refresh events after a short delay to see the new event
    setTimeout(refreshEvents, 500);
  }, [refreshEvents]);

  const addEventListener = useCallback((
    eventType: IntegrationEvent['type'], 
    listener: (event: IntegrationEvent) => void
  ) => {
    integrationService.addEventListener(eventType, listener);
    
    // Return cleanup function
    return () => {
      integrationService.removeEventListener(eventType, listener);
    };
  }, []);

  useEffect(() => {
    // Initial load
    refreshEvents();
    
    // Set up periodic refresh
    const interval = setInterval(refreshEvents, 5000); // Every 5 seconds
    
    return () => clearInterval(interval);
  }, [refreshEvents]);

  return {
    events,
    recentEvents,
    loading,
    refreshEvents,
    getEventsByType,
    getEventsBySource,
    getFailedEvents,
    getPendingEvents,
    emitEvent,
    addEventListener
  };
}

// Hook for data flow management
export function useDataFlowManagement() {
  const [dataFlows, setDataFlows] = useState<DataFlowMapping[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshDataFlows = useCallback(() => {
    const mappings = integrationService.getDataFlowMappings();
    setDataFlows(mappings);
    setLoading(false);
  }, []);

  const toggleDataFlow = useCallback((source: string, target: string, enabled: boolean) => {
    integrationService.toggleDataFlow(source, target, enabled);
    refreshDataFlows();
  }, [refreshDataFlows]);

  const getEnabledDataFlows = useCallback(() => {
    return dataFlows.filter(flow => flow.enabled);
  }, [dataFlows]);

  const getDisabledDataFlows = useCallback(() => {
    return dataFlows.filter(flow => !flow.enabled);
  }, [dataFlows]);

  const getDataFlowsBySource = useCallback((source: string) => {
    return dataFlows.filter(flow => flow.source === source);
  }, [dataFlows]);

  const getDataFlowsByTarget = useCallback((target: string) => {
    return dataFlows.filter(flow => flow.target === target);
  }, [dataFlows]);

  const getRealTimeDataFlows = useCallback(() => {
    return dataFlows.filter(flow => flow.syncFrequency === 'real-time');
  }, [dataFlows]);

  const getScheduledDataFlows = useCallback(() => {
    return dataFlows.filter(flow => flow.syncFrequency !== 'real-time');
  }, [dataFlows]);

  useEffect(() => {
    // Initial load
    refreshDataFlows();
    
    // Set up periodic refresh
    const interval = setInterval(refreshDataFlows, 15000); // Every 15 seconds
    
    return () => clearInterval(interval);
  }, [refreshDataFlows]);

  return {
    dataFlows,
    loading,
    refreshDataFlows,
    toggleDataFlow,
    getEnabledDataFlows,
    getDisabledDataFlows,
    getDataFlowsBySource,
    getDataFlowsByTarget,
    getRealTimeDataFlows,
    getScheduledDataFlows
  };
}

// Hook for system operations and maintenance
export function useSystemOperations() {
  const [isRestarting, setIsRestarting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const triggerManualSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await integrationService.triggerManualSync();
    } catch (error) {
      console.error('Manual sync failed:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const emergencyRestart = useCallback(async () => {
    setIsRestarting(true);
    try {
      await integrationService.emergencyRestart();
    } catch (error) {
      console.error('Emergency restart failed:', error);
      throw error;
    } finally {
      setIsRestarting(false);
    }
  }, []);

  const checkSystemHealth = useCallback(() => {
    return integrationService.getSystemHealth();
  }, []);

  return {
    isRestarting,
    isSyncing,
    triggerManualSync,
    emergencyRestart,
    checkSystemHealth
  };
}

// Combined hook for all integration functionality
export function useIntegration() {
  const systemStatus = useSystemStatus();
  const metrics = useIntegrationMetrics();
  const events = useIntegrationEvents();
  const dataFlows = useDataFlowManagement();
  const operations = useSystemOperations();

  const isSystemHealthy = useCallback(() => {
    const health = systemStatus.getSystemHealth();
    return health.score > 80 && health.healthy === health.total;
  }, [systemStatus]);

  const getOverallStatus = useCallback(() => {
    const health = systemStatus.getSystemHealth();
    const successRate = metrics.getEventSuccessRate();
    const performanceScore = metrics.getPerformanceScore();
    
    if (health.score > 90 && successRate > 95 && performanceScore > 85) {
      return 'excellent';
    } else if (health.score > 75 && successRate > 85 && performanceScore > 70) {
      return 'good';
    } else if (health.score > 50 && successRate > 70 && performanceScore > 50) {
      return 'fair';
    } else {
      return 'poor';
    }
  }, [systemStatus, metrics]);

  const getCriticalIssues = useCallback(() => {
    const issues: string[] = [];
    
    const offlineSystems = systemStatus.getOfflineSystems();
    if (offlineSystems.length > 0) {
      issues.push(`${offlineSystems.length} system(s) offline`);
    }
    
    const failedEvents = events.getFailedEvents();
    if (failedEvents.length > 0) {
      issues.push(`${failedEvents.length} failed event(s)`);
    }
    
    const performanceScore = metrics.getPerformanceScore();
    if (performanceScore < 50) {
      issues.push('Low performance score');
    }
    
    return issues;
  }, [systemStatus, events, metrics]);

  return {
    systemStatus,
    metrics,
    events,
    dataFlows,
    operations,
    isSystemHealthy,
    getOverallStatus,
    getCriticalIssues
  };
}