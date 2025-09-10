import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  realTimeService, 
  RealTimeEvent, 
  LiveInspection, 
  LiveMessage, 
  LiveAlert 
} from '../services/realTimeService';

// Connection status hook
export function useRealTimeConnection() {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    if (connectionStatus === 'connected' || isConnecting) return;
    
    setIsConnecting(true);
    try {
      await realTimeService.connect();
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Failed to connect to real-time service:', error);
      setConnectionStatus('disconnected');
    } finally {
      setIsConnecting(false);
    }
  }, [connectionStatus, isConnecting]);

  const disconnect = useCallback(() => {
    realTimeService.disconnect();
    setConnectionStatus('disconnected');
  }, []);

  useEffect(() => {
    const unsubscribeConnection = realTimeService.subscribe('connection_established', () => {
      setConnectionStatus('connected');
    });

    const unsubscribeDisconnection = realTimeService.subscribe('connection_lost', () => {
      setConnectionStatus('disconnected');
    });

    // Auto-connect on mount
    connect();

    return () => {
      unsubscribeConnection();
      unsubscribeDisconnection();
    };
  }, [connect]);

  return {
    connectionStatus,
    isConnecting,
    connect,
    disconnect
  };
}

// Real-time events hook
export function useRealTimeEvents(eventTypes: string[] = ['all']) {
  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<RealTimeEvent | null>(null);

  useEffect(() => {
    const unsubscribeFunctions: (() => void)[] = [];

    eventTypes.forEach(eventType => {
      const unsubscribe = realTimeService.subscribe(eventType, (event) => {
        setLatestEvent(event);
        setEvents(prev => [event, ...prev].slice(0, 50)); // Keep last 50 events
      });
      unsubscribeFunctions.push(unsubscribe);
    });

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [eventTypes]);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setLatestEvent(null);
  }, []);

  return {
    events,
    latestEvent,
    clearEvents
  };
}

// Live inspections hook
export function useLiveInspections() {
  const [liveInspections, setLiveInspections] = useState<LiveInspection[]>([]);
  const [activeInspection, setActiveInspection] = useState<LiveInspection | null>(null);

  const startInspection = useCallback((propertyId: string, propertyAddress: string, inspectorName: string) => {
    return realTimeService.startLiveInspection(propertyId, propertyAddress, inspectorName);
  }, []);

  const updateInspection = useCallback((inspectionId: string, updates: Partial<LiveInspection>) => {
    realTimeService.updateInspectionStatus(inspectionId, updates);
  }, []);

  useEffect(() => {
    const updateInspections = () => {
      setLiveInspections(realTimeService.getLiveInspections());
    };

    const unsubscribeStarted = realTimeService.subscribe('inspection_started', (event) => {
      updateInspections();
      setActiveInspection(event.data.inspection);
    });

    const unsubscribeUpdated = realTimeService.subscribe('inspection_updated', () => {
      updateInspections();
    });

    const unsubscribeCompleted = realTimeService.subscribe('inspection_completed', (event) => {
      updateInspections();
      // Keep active inspection for a moment to show completion
      setTimeout(() => {
        setActiveInspection(null);
      }, 3000);
    });

    // Initial load
    updateInspections();

    return () => {
      unsubscribeStarted();
      unsubscribeUpdated();
      unsubscribeCompleted();
    };
  }, []);

  return {
    liveInspections,
    activeInspection,
    startInspection,
    updateInspection
  };
}

// Live messaging hook
export function useLiveMessaging(channelId: string = 'general') {
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback((message: string, type: LiveMessage['type'] = 'text') => {
    return realTimeService.sendMessage(channelId, message, type);
  }, [channelId]);

  const markAsRead = useCallback((messageId: string) => {
    realTimeService.markMessageAsRead(messageId);
  }, []);

  const markAllAsRead = useCallback(() => {
    messages.filter(msg => !msg.read).forEach(msg => {
      realTimeService.markMessageAsRead(msg.id);
    });
  }, [messages]);

  useEffect(() => {
    const updateMessages = () => {
      const channelMessages = realTimeService.getMessages(channelId);
      setMessages(channelMessages);
      setUnreadCount(channelMessages.filter(msg => !msg.read).length);
    };

    const unsubscribeReceived = realTimeService.subscribe('message_received', (event) => {
      if (event.data.message.channelId === channelId) {
        updateMessages();
      }
    });

    const unsubscribeSent = realTimeService.subscribe('message_sent', (event) => {
      if (event.data.message.channelId === channelId) {
        updateMessages();
      }
    });

    const unsubscribeRead = realTimeService.subscribe('message_read', () => {
      updateMessages();
    });

    // Initial load
    updateMessages();

    return () => {
      unsubscribeReceived();
      unsubscribeSent();
      unsubscribeRead();
    };
  }, [channelId]);

  return {
    messages,
    unreadCount,
    isTyping,
    sendMessage,
    markAsRead,
    markAllAsRead
  };
}

// Live alerts hook
export function useLiveAlerts() {
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<LiveAlert[]>([]);
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);

  const acknowledgeAlert = useCallback((alertId: string) => {
    realTimeService.acknowledgeAlert(alertId);
  }, []);

  const createAlert = useCallback((alertData: Omit<LiveAlert, 'id' | 'timestamp' | 'acknowledged'>) => {
    return realTimeService.createAlert(alertData);
  }, []);

  useEffect(() => {
    const updateAlerts = () => {
      const activeAlerts = realTimeService.getActiveAlerts();
      setAlerts(activeAlerts);
      setCriticalAlerts(activeAlerts.filter(alert => alert.severity === 'critical'));
      setUnacknowledgedCount(activeAlerts.filter(alert => !alert.acknowledged).length);
    };

    const unsubscribeAlert = realTimeService.subscribe('urgent_alert', () => {
      updateAlerts();
    });

    const unsubscribeAcknowledged = realTimeService.subscribe('alert_acknowledged', () => {
      updateAlerts();
    });

    // Initial load
    updateAlerts();

    return () => {
      unsubscribeAlert();
      unsubscribeAcknowledged();
    };
  }, []);

  return {
    alerts,
    criticalAlerts,
    unacknowledgedCount,
    acknowledgeAlert,
    createAlert
  };
}

// Real-time notifications hook
export function useRealTimeNotifications() {
  const [notifications, setNotifications] = useState<RealTimeEvent[]>([]);
  const [showNotifications, setShowNotifications] = useState(true);
  const notificationTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    
    const timeout = notificationTimeouts.current.get(notificationId);
    if (timeout) {
      clearTimeout(timeout);
      notificationTimeouts.current.delete(notificationId);
    }
  }, []);

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  useEffect(() => {
    const handleNewNotification = (event: RealTimeEvent) => {
      if (!showNotifications) return;

      // Only show certain types as notifications
      const notificationTypes = [
        'inspection_started',
        'inspection_completed',
        'issue_found',
        'urgent_alert',
        'message_received'
      ];

      if (notificationTypes.includes(event.type)) {
        setNotifications(prev => [event, ...prev].slice(0, 10)); // Keep only 10 notifications

        // Auto-dismiss based on priority
        const dismissTime = event.priority === 'urgent' ? 10000 : 
                           event.priority === 'high' ? 7000 : 5000;

        const timeout = setTimeout(() => {
          dismissNotification(event.id);
        }, dismissTime);

        notificationTimeouts.current.set(event.id, timeout);
      }
    };

    const unsubscribe = realTimeService.subscribe('all', handleNewNotification);

    return () => {
      unsubscribe();
      // Clear all timeouts
      notificationTimeouts.current.forEach(timeout => clearTimeout(timeout));
      notificationTimeouts.current.clear();
    };
  }, [showNotifications, dismissNotification]);

  return {
    notifications,
    showNotifications,
    dismissNotification,
    toggleNotifications
  };
}

// Data synchronization hook
export function useRealTimeSync() {
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [pendingChanges, setPendingChanges] = useState(0);

  const forcSync = useCallback(() => {
    setSyncStatus('syncing');
    // Simulate sync process
    setTimeout(() => {
      setLastSyncTime(new Date().toISOString());
      setSyncStatus('idle');
      setPendingChanges(0);
    }, 2000);
  }, []);

  useEffect(() => {
    const unsubscribeSync = realTimeService.subscribe('data_sync', (event) => {
      setLastSyncTime(event.timestamp);
      setSyncStatus('idle');
      
      // Simulate pending changes detection
      if (event.data.count) {
        setPendingChanges(prev => prev + event.data.count);
      }
    });

    return () => {
      unsubscribeSync();
    };
  }, []);

  return {
    lastSyncTime,
    syncStatus,
    pendingChanges,
    forcSync
  };
}

// Performance monitoring hook
export function useRealTimePerformance() {
  const [metrics, setMetrics] = useState({
    latency: 0,
    eventCount: 0,
    errorCount: 0,
    reconnectCount: 0
  });

  const eventCountRef = useRef(0);
  const errorCountRef = useRef(0);
  const reconnectCountRef = useRef(0);
  const lastEventTime = useRef<number>(Date.now());

  useEffect(() => {
    const unsubscribeAll = realTimeService.subscribe('all', (event) => {
      const now = Date.now();
      const eventTime = new Date(event.timestamp).getTime();
      const latency = now - eventTime;

      eventCountRef.current++;
      
      setMetrics(prev => ({
        ...prev,
        latency: Math.round((prev.latency + latency) / 2), // Moving average
        eventCount: eventCountRef.current
      }));

      lastEventTime.current = now;
    });

    const unsubscribeError = realTimeService.subscribe('connection_lost', () => {
      errorCountRef.current++;
      setMetrics(prev => ({
        ...prev,
        errorCount: errorCountRef.current
      }));
    });

    const unsubscribeReconnect = realTimeService.subscribe('connection_established', () => {
      reconnectCountRef.current++;
      setMetrics(prev => ({
        ...prev,
        reconnectCount: reconnectCountRef.current
      }));
    });

    return () => {
      unsubscribeAll();
      unsubscribeError();
      unsubscribeReconnect();
    };
  }, []);

  return metrics;
}