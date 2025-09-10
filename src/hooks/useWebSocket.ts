import { useState, useEffect, useCallback, useRef } from 'react';
import { webSocketService, WebSocketMessage, WebSocketStats } from '../services/websocketService';

// Hook for WebSocket connection management
export function useWebSocket() {
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [stats, setStats] = useState<WebSocketStats>({
    connected: false,
    messagesSent: 0,
    messagesReceived: 0,
    reconnectAttempts: 0,
    latency: 0,
    bandwidth: { upstream: 0, downstream: 0 },
    connectionQuality: 'poor'
  });
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    try {
      setError(null);
      await webSocketService.connect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  }, []);

  const disconnect = useCallback(() => {
    webSocketService.disconnect();
    setError(null);
  }, []);

  const send = useCallback(async (type: string, payload: any, options?: any) => {
    try {
      await webSocketService.send(type, payload, options);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Send failed');
      throw err;
    }
  }, []);

  useEffect(() => {
    // Subscribe to connection events
    const unsubscribeEstablished = webSocketService.subscribe('connection:established', () => {
      setConnectionState('connected');
      setError(null);
    });

    const unsubscribeClosed = webSocketService.subscribe('connection:closed', () => {
      setConnectionState('disconnected');
    });

    const unsubscribeError = webSocketService.subscribe('connection:error', (message) => {
      setError(message.payload.error?.message || 'Connection error');
    });

    const unsubscribeReconnecting = webSocketService.subscribe('connection:reconnecting', () => {
      setConnectionState('reconnecting');
    });

    // Update stats periodically
    const statsInterval = setInterval(() => {
      setStats(webSocketService.getStats());
      setConnectionState(webSocketService.getConnectionState());
    }, 1000);

    return () => {
      unsubscribeEstablished();
      unsubscribeClosed();
      unsubscribeError();
      unsubscribeReconnecting();
      clearInterval(statsInterval);
    };
  }, []);

  return {
    connectionState,
    stats,
    error,
    connect,
    disconnect,
    send,
    isConnected: connectionState === 'connected',
    clientId: webSocketService.getClientId(),
    queueSize: webSocketService.getQueueSize()
  };
}

// Hook for subscribing to specific message types
export function useWebSocketSubscription(messageType: string) {
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const messagesRef = useRef<WebSocketMessage[]>([]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setLastMessage(null);
    messagesRef.current = [];
  }, []);

  const addMessage = useCallback((message: WebSocketMessage) => {
    messagesRef.current = [message, ...messagesRef.current.slice(0, 99)]; // Keep last 100 messages
    setMessages([...messagesRef.current]);
    setLastMessage(message);
  }, []);

  useEffect(() => {
    const unsubscribe = webSocketService.subscribe(messageType, addMessage);
    return unsubscribe;
  }, [messageType, addMessage]);

  return {
    messages,
    lastMessage,
    clearMessages,
    messageCount: messages.length
  };
}

// Hook for database performance monitoring via WebSocket
export function useDatabaseWebSocketMonitoring() {
  const indexUpdates = useWebSocketSubscription('database:index_usage_updated');
  const slowQueries = useWebSocketSubscription('database:slow_query_detected');
  const performanceAlerts = useWebSocketSubscription('database:performance_alert');
  const { send, isConnected } = useWebSocket();

  const sendDatabaseMetrics = useCallback(async (metrics: any) => {
    if (isConnected) {
      try {
        await send('database:metrics', metrics, { priority: 'normal' });
      } catch (error) {
        console.error('Failed to send database metrics:', error);
      }
    }
  }, [send, isConnected]);

  const requestPerformanceData = useCallback(async (timeRange?: string) => {
    if (isConnected) {
      try {
        await send('database:performance_request', {
          timeRange: timeRange || '1h',
          requestId: `perf-${Date.now()}`
        }, { requiresAck: true });
      } catch (error) {
        console.error('Failed to request performance data:', error);
      }
    }
  }, [send, isConnected]);

  return {
    indexUpdates: indexUpdates.messages,
    slowQueries: slowQueries.messages,
    performanceAlerts: performanceAlerts.messages,
    sendDatabaseMetrics,
    requestPerformanceData,
    isConnected,
    clearData: () => {
      indexUpdates.clearMessages();
      slowQueries.clearMessages();
      performanceAlerts.clearMessages();
    }
  };
}

// Hook for real-time inspection updates
export function useInspectionWebSocket() {
  const inspectionUpdates = useWebSocketSubscription('inspection:update');
  const inspectionStarted = useWebSocketSubscription('inspection:started');
  const inspectionCompleted = useWebSocketSubscription('inspection:completed');
  const { send, isConnected } = useWebSocket();

  const sendInspectionUpdate = useCallback(async (inspectionId: string, update: any) => {
    if (isConnected) {
      try {
        await webSocketService.sendInspectionUpdate(inspectionId, update);
      } catch (error) {
        console.error('Failed to send inspection update:', error);
        throw error;
      }
    }
  }, [isConnected]);

  const subscribeToInspection = useCallback(async (inspectionId: string) => {
    if (isConnected) {
      try {
        await send('inspection:subscribe', { inspectionId }, { requiresAck: true });
      } catch (error) {
        console.error('Failed to subscribe to inspection:', error);
      }
    }
  }, [send, isConnected]);

  const unsubscribeFromInspection = useCallback(async (inspectionId: string) => {
    if (isConnected) {
      try {
        await send('inspection:unsubscribe', { inspectionId });
      } catch (error) {
        console.error('Failed to unsubscribe from inspection:', error);
      }
    }
  }, [send, isConnected]);

  return {
    inspectionUpdates: inspectionUpdates.messages,
    inspectionStarted: inspectionStarted.messages,
    inspectionCompleted: inspectionCompleted.messages,
    sendInspectionUpdate,
    subscribeToInspection,
    unsubscribeFromInspection,
    isConnected
  };
}

// Hook for real-time alerts and notifications
export function useAlertWebSocket() {
  const criticalAlerts = useWebSocketSubscription('alert:critical');
  const systemAlerts = useWebSocketSubscription('alert:system');
  const maintenanceAlerts = useWebSocketSubscription('alert:maintenance');
  const { send, isConnected } = useWebSocket();

  const sendCriticalAlert = useCallback(async (alert: any) => {
    if (isConnected) {
      try {
        await webSocketService.sendCriticalAlert(alert);
      } catch (error) {
        console.error('Failed to send critical alert:', error);
        throw error;
      }
    }
  }, [isConnected]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    if (isConnected) {
      try {
        await send('alert:acknowledge', { alertId }, { requiresAck: true });
      } catch (error) {
        console.error('Failed to acknowledge alert:', error);
      }
    }
  }, [send, isConnected]);

  const dismissAlert = useCallback(async (alertId: string) => {
    if (isConnected) {
      try {
        await send('alert:dismiss', { alertId });
      } catch (error) {
        console.error('Failed to dismiss alert:', error);
      }
    }
  }, [send, isConnected]);

  return {
    criticalAlerts: criticalAlerts.messages,
    systemAlerts: systemAlerts.messages,
    maintenanceAlerts: maintenanceAlerts.messages,
    allAlerts: [
      ...criticalAlerts.messages,
      ...systemAlerts.messages,
      ...maintenanceAlerts.messages
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    sendCriticalAlert,
    acknowledgeAlert,
    dismissAlert,
    isConnected
  };
}

// Hook for property data synchronization
export function usePropertyDataSync() {
  const dataSyncUpdates = useWebSocketSubscription('property:data_sync');
  const communityUpdates = useWebSocketSubscription('community:update');
  const propertyUpdates = useWebSocketSubscription('property:update');
  const { send, isConnected } = useWebSocket();

  const syncPropertyData = useCallback(async (propertyId: string, data: any) => {
    if (isConnected) {
      try {
        await send('property:sync', {
          propertyId,
          data,
          timestamp: new Date().toISOString()
        }, { priority: 'high', requiresAck: true });
      } catch (error) {
        console.error('Failed to sync property data:', error);
        throw error;
      }
    }
  }, [send, isConnected]);

  const requestDataRefresh = useCallback(async (entityType: 'community' | 'property' | 'inspection', entityId: string) => {
    if (isConnected) {
      try {
        await send('data:refresh_request', {
          entityType,
          entityId,
          requestId: `refresh-${Date.now()}`
        }, { requiresAck: true });
      } catch (error) {
        console.error('Failed to request data refresh:', error);
      }
    }
  }, [send, isConnected]);

  return {
    dataSyncUpdates: dataSyncUpdates.messages,
    communityUpdates: communityUpdates.messages,
    propertyUpdates: propertyUpdates.messages,
    syncPropertyData,
    requestDataRefresh,
    isConnected
  };
}

// Hook for system health monitoring
export function useSystemHealthWebSocket() {
  const healthChecks = useWebSocketSubscription('system:health_check');
  const performanceMetrics = useWebSocketSubscription('system:performance');
  const { send, isConnected } = useWebSocket();

  const requestHealthCheck = useCallback(async () => {
    if (isConnected) {
      try {
        await send('system:health_request', {
          requestId: `health-${Date.now()}`,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to request health check:', error);
      }
    }
  }, [send, isConnected]);

  const sendPerformanceMetrics = useCallback(async (metrics: any) => {
    if (isConnected) {
      try {
        await send('system:performance_metrics', {
          metrics,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to send performance metrics:', error);
      }
    }
  }, [send, isConnected]);

  return {
    healthChecks: healthChecks.messages,
    performanceMetrics: performanceMetrics.messages,
    requestHealthCheck,
    sendPerformanceMetrics,
    isConnected,
    lastHealthCheck: healthChecks.lastMessage,
    systemStatus: healthChecks.lastMessage?.payload?.status || 'unknown'
  };
}

// Master hook combining all WebSocket functionality
export function useWebSocketIntegration() {
  const connection = useWebSocket();
  const database = useDatabaseWebSocketMonitoring();
  const inspections = useInspectionWebSocket();
  const alerts = useAlertWebSocket();
  const dataSync = usePropertyDataSync();
  const systemHealth = useSystemHealthWebSocket();

  const connectAll = useCallback(async () => {
    try {
      await connection.connect();
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      throw error;
    }
  }, [connection]);

  const disconnectAll = useCallback(() => {
    connection.disconnect();
  }, [connection]);

  const getConnectionSummary = useCallback(() => {
    return {
      isConnected: connection.isConnected,
      connectionState: connection.connectionState,
      stats: connection.stats,
      queueSize: connection.queueSize,
      totalMessages: {
        database: database.indexUpdates.length + database.slowQueries.length + database.performanceAlerts.length,
        inspections: inspections.inspectionUpdates.length + inspections.inspectionStarted.length + inspections.inspectionCompleted.length,
        alerts: alerts.allAlerts.length,
        dataSync: dataSync.dataSyncUpdates.length + dataSync.communityUpdates.length + dataSync.propertyUpdates.length,
        systemHealth: systemHealth.healthChecks.length + systemHealth.performanceMetrics.length
      }
    };
  }, [connection, database, inspections, alerts, dataSync, systemHealth]);

  return {
    connection,
    database,
    inspections,
    alerts,
    dataSync,
    systemHealth,
    connectAll,
    disconnectAll,
    getConnectionSummary
  };
}