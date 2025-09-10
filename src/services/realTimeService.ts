// Real-time service for live updates and notifications
// Simulates WebSocket functionality for demo purposes

export interface RealTimeEvent {
  id: string;
  type: 'inspection_started' | 'inspection_completed' | 'issue_found' | 'issue_resolved' | 
        'property_updated' | 'inspector_location' | 'urgent_alert' | 'message_received' |
        'data_sync' | 'maintenance_scheduled' | 'report_generated';
  data: any;
  userId: string;
  timestamp: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface LiveInspection {
  id: string;
  propertyId: string;
  propertyAddress: string;
  inspectorId: string;
  inspectorName: string;
  status: 'starting' | 'in-progress' | 'paused' | 'completing' | 'completed';
  startedAt: string;
  currentRoom?: string;
  currentTask?: string;
  issuesFound: number;
  criticalIssues: number;
  estimatedCompletion?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export interface LiveMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId?: string;
  channelId: string;
  message: string;
  type: 'text' | 'image' | 'voice' | 'system' | 'alert';
  timestamp: string;
  read: boolean;
  urgent?: boolean;
}

export interface LiveAlert {
  id: string;
  type: 'critical_issue' | 'emergency' | 'maintenance_required' | 'inspection_overdue' | 
        'system_alert' | 'weather_warning' | 'security_alert';
  title: string;
  message: string;
  propertyId?: string;
  propertyAddress?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;
  acknowledged: boolean;
  expiresAt?: string;
  actionRequired?: boolean;
  actions?: Array<{
    id: string;
    label: string;
    type: 'primary' | 'secondary' | 'danger';
  }>;
}

class RealTimeService {
  private eventListeners: Map<string, Set<(event: RealTimeEvent) => void>> = new Map();
  private liveInspections: Map<string, LiveInspection> = new Map();
  private liveMessages: LiveMessage[] = [];
  private liveAlerts: LiveAlert[] = [];
  private connectionStatus: 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  private simulationInterval: NodeJS.Timeout | null = null;
  private currentUserId: string = 'user-1'; // Mock current user

  // Initialize the real-time service
  connect(): Promise<void> {
    return new Promise((resolve) => {
      this.connectionStatus = 'reconnecting';
      
      // Simulate connection delay
      setTimeout(() => {
        this.connectionStatus = 'connected';
        this.startSimulation();
        this.emit('connection_established', { status: 'connected' });
        resolve();
      }, 1000);
    });
  }

  // Disconnect from real-time service
  disconnect(): void {
    this.connectionStatus = 'disconnected';
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.emit('connection_lost', { status: 'disconnected' });
  }

  // Subscribe to specific event types
  subscribe(eventType: string, callback: (event: RealTimeEvent) => void): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    
    this.eventListeners.get(eventType)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  // Emit events to subscribers
  private emit(eventType: string, data: any, priority: RealTimeEvent['priority'] = 'normal'): void {
    const event: RealTimeEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: eventType as any,
      data,
      userId: this.currentUserId,
      timestamp: new Date().toISOString(),
      priority
    };

    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }

    // Also emit to 'all' listeners
    const allListeners = this.eventListeners.get('all');
    if (allListeners) {
      allListeners.forEach(callback => callback(event));
    }
  }

  // Start simulation of real-time events
  private startSimulation(): void {
    if (this.simulationInterval) return;

    this.simulationInterval = setInterval(() => {
      this.generateRandomEvent();
    }, 3000 + Math.random() * 7000); // Random interval between 3-10 seconds
  }

  // Generate random events for demonstration
  private generateRandomEvent(): void {
    const eventTypes = [
      'inspection_started',
      'issue_found',
      'inspector_location',
      'data_sync',
      'message_received'
    ];

    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    switch (randomType) {
      case 'inspection_started':
        this.simulateInspectionStart();
        break;
      case 'issue_found':
        this.simulateIssueFound();
        break;
      case 'inspector_location':
        this.simulateLocationUpdate();
        break;
      case 'data_sync':
        this.simulateDataSync();
        break;
      case 'message_received':
        this.simulateMessage();
        break;
    }
  }

  // Live Inspection Management
  startLiveInspection(propertyId: string, propertyAddress: string, inspectorName: string): LiveInspection {
    const inspection: LiveInspection = {
      id: `live-${Date.now()}`,
      propertyId,
      propertyAddress,
      inspectorId: `inspector-${Date.now()}`,
      inspectorName,
      status: 'starting',
      startedAt: new Date().toISOString(),
      currentRoom: 'Entrance',
      currentTask: 'Initial walkthrough',
      issuesFound: 0,
      criticalIssues: 0,
      progress: {
        completed: 0,
        total: 12, // Mock total inspection items
        percentage: 0
      }
    };

    this.liveInspections.set(inspection.id, inspection);
    
    this.emit('inspection_started', {
      inspection,
      message: `${inspectorName} started inspection at ${propertyAddress}`
    }, 'normal');

    // Simulate inspection progress
    this.simulateInspectionProgress(inspection.id);

    return inspection;
  }

  updateInspectionStatus(inspectionId: string, updates: Partial<LiveInspection>): void {
    const inspection = this.liveInspections.get(inspectionId);
    if (!inspection) return;

    const updatedInspection = { ...inspection, ...updates };
    this.liveInspections.set(inspectionId, updatedInspection);

    this.emit('inspection_updated', {
      inspection: updatedInspection,
      changes: updates
    });
  }

  // Simulate inspection progress
  private simulateInspectionProgress(inspectionId: string): void {
    const inspection = this.liveInspections.get(inspectionId);
    if (!inspection) return;

    const progressInterval = setInterval(() => {
      const current = this.liveInspections.get(inspectionId);
      if (!current || current.status === 'completed') {
        clearInterval(progressInterval);
        return;
      }

      // Simulate progress
      const newCompleted = Math.min(current.progress.completed + 1, current.progress.total);
      const newPercentage = Math.round((newCompleted / current.progress.total) * 100);

      // Simulate room changes
      const rooms = ['Entrance', 'Kitchen', 'Living Room', 'Bedroom 1', 'Bedroom 2', 'Bathroom', 'Utility Room'];
      const currentRoomIndex = rooms.indexOf(current.currentRoom || 'Entrance');
      const newRoom = rooms[Math.min(currentRoomIndex + 1, rooms.length - 1)];

      // Occasionally find issues
      const foundNewIssue = Math.random() < 0.3; // 30% chance
      const foundCriticalIssue = Math.random() < 0.1; // 10% chance

      const updates: Partial<LiveInspection> = {
        progress: {
          completed: newCompleted,
          total: current.progress.total,
          percentage: newPercentage
        },
        currentRoom: newRoom,
        currentTask: `Inspecting ${newRoom}`,
        issuesFound: current.issuesFound + (foundNewIssue ? 1 : 0),
        criticalIssues: current.criticalIssues + (foundCriticalIssue ? 1 : 0),
        status: newPercentage >= 100 ? 'completed' : 'in-progress'
      };

      this.updateInspectionStatus(inspectionId, updates);

      if (foundCriticalIssue) {
        this.createAlert({
          type: 'critical_issue',
          title: 'Critical Issue Found',
          message: `Critical issue discovered in ${newRoom} at ${current.propertyAddress}`,
          propertyId: current.propertyId,
          propertyAddress: current.propertyAddress,
          severity: 'critical',
          actionRequired: true,
          actions: [
            { id: 'view', label: 'View Details', type: 'primary' },
            { id: 'escalate', label: 'Escalate', type: 'danger' }
          ]
        });
      }

      if (newPercentage >= 100) {
        this.emit('inspection_completed', {
          inspection: { ...current, ...updates },
          summary: {
            duration: '45 minutes',
            issuesFound: updates.issuesFound,
            criticalIssues: updates.criticalIssues
          }
        }, 'high');
      }
    }, 5000); // Update every 5 seconds
  }

  // Live Messaging
  sendMessage(channelId: string, message: string, type: LiveMessage['type'] = 'text'): LiveMessage {
    const liveMessage: LiveMessage = {
      id: `msg-${Date.now()}`,
      senderId: this.currentUserId,
      senderName: 'Current User',
      channelId,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      urgent: type === 'alert'
    };

    this.liveMessages.push(liveMessage);
    
    this.emit('message_sent', {
      message: liveMessage
    });

    return liveMessage;
  }

  getMessages(channelId: string): LiveMessage[] {
    return this.liveMessages
      .filter(msg => msg.channelId === channelId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  markMessageAsRead(messageId: string): void {
    const message = this.liveMessages.find(msg => msg.id === messageId);
    if (message && !message.read) {
      message.read = true;
      this.emit('message_read', { messageId });
    }
  }

  // Live Alerts
  createAlert(alertData: Omit<LiveAlert, 'id' | 'timestamp' | 'acknowledged'>): LiveAlert {
    const alert: LiveAlert = {
      id: `alert-${Date.now()}`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      ...alertData
    };

    this.liveAlerts.unshift(alert); // Add to beginning

    this.emit('urgent_alert', {
      alert,
      requiresAttention: alert.severity === 'critical' || alert.actionRequired
    }, alert.severity === 'critical' ? 'urgent' : 'high');

    return alert;
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.liveAlerts.find(a => a.id === alertId);
    if (alert && !alert.acknowledged) {
      alert.acknowledged = true;
      this.emit('alert_acknowledged', { alertId });
    }
  }

  getActiveAlerts(): LiveAlert[] {
    return this.liveAlerts
      .filter(alert => !alert.acknowledged && (!alert.expiresAt || new Date(alert.expiresAt) > new Date()))
      .slice(0, 10); // Limit to 10 most recent
  }

  // Simulation methods
  private simulateInspectionStart(): void {
    const properties = [
      { id: 'prop-1', address: '123 Oak Street, Unit 2A' },
      { id: 'prop-2', address: '456 Pine Avenue, Unit 1B' },
      { id: 'prop-3', address: '789 Maple Drive, Unit 3C' }
    ];

    const inspectors = ['Sarah Johnson', 'Mike Chen', 'Amanda Rodriguez', 'David Kim'];
    
    const randomProperty = properties[Math.floor(Math.random() * properties.length)];
    const randomInspector = inspectors[Math.floor(Math.random() * inspectors.length)];

    this.startLiveInspection(randomProperty.id, randomProperty.address, randomInspector);
  }

  private simulateIssueFound(): void {
    const issues = [
      'Water leak detected in bathroom',
      'HVAC filter needs replacement',
      'Loose electrical outlet in kitchen',
      'Cracked window in bedroom',
      'Damaged flooring in living room'
    ];

    const randomIssue = issues[Math.floor(Math.random() * issues.length)];
    
    this.emit('issue_found', {
      issue: randomIssue,
      severity: Math.random() < 0.2 ? 'critical' : 'medium',
      propertyAddress: '123 Oak Street, Unit 2A',
      inspectorName: 'Sarah Johnson'
    });
  }

  private simulateLocationUpdate(): void {
    // Mock GPS coordinates (around a city center)
    const baseLatitude = 40.7128;
    const baseLongitude = -74.0060;
    
    this.emit('inspector_location', {
      inspectorId: 'inspector-1',
      inspectorName: 'Sarah Johnson',
      location: {
        latitude: baseLatitude + (Math.random() - 0.5) * 0.01,
        longitude: baseLongitude + (Math.random() - 0.5) * 0.01,
        accuracy: Math.floor(Math.random() * 20) + 5
      },
      timestamp: new Date().toISOString()
    });
  }

  private simulateDataSync(): void {
    this.emit('data_sync', {
      type: 'properties_updated',
      count: Math.floor(Math.random() * 5) + 1,
      source: 'field_updates'
    });
  }

  private simulateMessage(): void {
    const messages = [
      'Inspection completed early - no major issues found',
      'Need maintenance team for Unit 2A urgently',
      'Weather alert: Rain expected, may affect outdoor inspections',
      'New property added to portfolio - needs initial inspection',
      'Weekly report ready for review'
    ];

    const senders = ['Property Manager', 'Maintenance Team', 'System Alert', 'Inspector Sarah'];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const randomSender = senders[Math.floor(Math.random() * senders.length)];

    const message: LiveMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'system',
      senderName: randomSender,
      channelId: 'general',
      message: randomMessage,
      type: 'text',
      timestamp: new Date().toISOString(),
      read: false,
      urgent: randomMessage.includes('urgently') || randomMessage.includes('alert')
    };

    this.liveMessages.push(message);
    
    this.emit('message_received', {
      message,
      channel: 'general'
    });
  }

  // Update inspection tracking (for integration service)
  updateInspectionTracking(inspectionId: string, data: any): void {
    const inspection = this.liveInspections.get(inspectionId);
    if (inspection) {
      this.updateInspectionStatus(inspectionId, data);
    } else {
      console.log(`Creating new live inspection tracking for ${inspectionId}`);
      // Create new tracking if it doesn't exist
      const newInspection: LiveInspection = {
        id: inspectionId,
        propertyId: data.propertyId || 'unknown',
        propertyAddress: data.propertyAddress || 'Unknown Address',
        inspectorId: data.inspectorId || 'unknown',
        inspectorName: data.inspectorName || 'Unknown Inspector',
        status: data.status || 'starting',
        startedAt: data.timestamp || new Date().toISOString(),
        currentRoom: 'Starting inspection',
        currentTask: 'Initial setup',
        issuesFound: 0,
        criticalIssues: 0,
        progress: {
          completed: 0,
          total: 12,
          percentage: 0
        }
      };
      this.liveInspections.set(inspectionId, newInspection);
      this.emit('inspection_tracking_started', { inspection: newInspection });
    }
  }

  // Notify inspection update (for integration service)
  notifyInspectionUpdate(inspectionId: string, updateType: string): void {
    this.emit('inspection_updated', {
      inspectionId,
      updateType,
      timestamp: new Date().toISOString()
    });
  }

  // Notify property update (for integration service)
  notifyPropertyUpdate(propertyId: string): void {
    this.emit('property_updated', {
      propertyId,
      timestamp: new Date().toISOString()
    });
  }

  // Initialize community tracking (for integration service)
  initializeCommunityTracking(communityId: string): void {
    this.emit('community_tracking_initialized', {
      communityId,
      timestamp: new Date().toISOString()
    });
  }

  // Getters
  getConnectionStatus(): string {
    return this.connectionStatus;
  }

  getLiveInspections(): LiveInspection[] {
    return Array.from(this.liveInspections.values());
  }

  getLiveInspection(inspectionId: string): LiveInspection | undefined {
    return this.liveInspections.get(inspectionId);
  }

  // Cleanup
  cleanup(): void {
    this.disconnect();
    this.eventListeners.clear();
    this.liveInspections.clear();
    this.liveMessages = [];
    this.liveAlerts = [];
  }
}

// Export singleton instance
export const realTimeService = new RealTimeService();

// Export types and service
export { RealTimeService };
export default realTimeService;