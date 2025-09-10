// WebSocket service for real-time communication
// Provides both real WebSocket connectivity and fallback simulation

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  enableCompression: boolean;
  protocols?: string[];
}

export interface WebSocketMessage {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
  clientId: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  requiresAck?: boolean;
  correlationId?: string;
}

export interface WebSocketStats {
  connected: boolean;
  connectionTime?: string;
  lastMessageTime?: string;
  messagesSent: number;
  messagesReceived: number;
  reconnectAttempts: number;
  latency: number;
  bandwidth: {
    upstream: number; // bytes per second
    downstream: number;
  };
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ConnectionOptions {
  autoReconnect: boolean;
  enableHeartbeat: boolean;
  enableCompression: boolean;
  messageQueueSize: number;
  timeout: number;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private clientId: string;
  private messageQueue: WebSocketMessage[] = [];
  private messageHandlers: Map<string, Set<(message: WebSocketMessage) => void>> = new Map();
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' = 'disconnected';
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private stats: WebSocketStats;
  private lastPingTime = 0;
  private messageBuffer: { [messageId: string]: WebSocketMessage } = {};
  private options: ConnectionOptions;

  constructor(config?: Partial<WebSocketConfig>, options?: Partial<ConnectionOptions>) {
    this.config = {
      url: 'wss://your-websocket-server.com/ws',
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      enableCompression: true,
      protocols: ['property-inspection-v1'],
      ...config
    };

    this.options = {
      autoReconnect: true,
      enableHeartbeat: true,
      enableCompression: true,
      messageQueueSize: 1000,
      timeout: 10000,
      ...options
    };

    this.clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.stats = {
      connected: false,
      messagesSent: 0,
      messagesReceived: 0,
      reconnectAttempts: 0,
      latency: 0,
      bandwidth: { upstream: 0, downstream: 0 },
      connectionQuality: 'poor'
    };
  }

  // Connect to WebSocket server
  async connect(): Promise<void> {
    if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.connectionState = 'connecting';
        
        // For demo purposes, simulate WebSocket connection
        // In production, replace with actual WebSocket
        if (this.config.url.includes('your-websocket-server')) {
          this.simulateConnection().then(resolve).catch(reject);
          return;
        }

        this.ws = new WebSocket(this.config.url, this.config.protocols);
        
        this.ws.onopen = () => {
          this.connectionState = 'connected';
          this.stats.connected = true;
          this.stats.connectionTime = new Date().toISOString();
          this.reconnectAttempts = 0;
          
          this.sendHandshake();
          this.startHeartbeat();
          this.processMessageQueue();
          
          this.emit('connection:established', { clientId: this.clientId });
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
          this.handleClose(event);
        };

        this.ws.onerror = (error) => {
          this.handleError(error);
          reject(error);
        };

      } catch (error) {
        this.connectionState = 'disconnected';
        reject(error);
      }
    });
  }

  // Simulate WebSocket connection for demo
  private async simulateConnection(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.connectionState = 'connected';
        this.stats.connected = true;
        this.stats.connectionTime = new Date().toISOString();
        this.stats.connectionQuality = 'excellent';
        this.stats.latency = 15; // 15ms simulated latency
        
        this.startHeartbeat();
        this.startMessageSimulation();
        
        this.emit('connection:established', { 
          clientId: this.clientId,
          simulated: true 
        });
        
        resolve();
      }, 1000);
    });
  }

  // Disconnect from WebSocket
  disconnect(): void {
    this.connectionState = 'disconnected';
    this.stats.connected = false;
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.emit('connection:closed', { reason: 'manual_disconnect' });
  }

  // Send message through WebSocket
  send(type: string, payload: any, options?: { 
    priority?: WebSocketMessage['priority'];
    requiresAck?: boolean;
    timeout?: number;
  }): Promise<void> {
    const message: WebSocketMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: new Date().toISOString(),
      clientId: this.clientId,
      priority: options?.priority || 'normal',
      requiresAck: options?.requiresAck || false
    };

    if (this.connectionState === 'connected') {
      return this.sendMessage(message);
    } else {
      // Queue message for later delivery
      if (this.messageQueue.length < this.options.messageQueueSize) {
        this.messageQueue.push(message);
      }
      return Promise.resolve();
    }
  }

  // Send message immediately
  private async sendMessage(message: WebSocketMessage): Promise<void> {
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      } else {
        // Simulate sending for demo
        this.simulateSendMessage(message);
      }
      
      this.stats.messagesSent++;
      this.stats.lastMessageTime = new Date().toISOString();
      this.updateBandwidthStats(JSON.stringify(message).length, 'upstream');
      
      if (message.requiresAck) {
        this.messageBuffer[message.id] = message;
        this.startAckTimeout(message.id, this.options.timeout);
      }
      
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      throw error;
    }
  }

  // Simulate message sending for demo
  private simulateSendMessage(message: WebSocketMessage): void {
    // Simulate network delay
    setTimeout(() => {
      if (message.requiresAck) {
        // Simulate acknowledgment
        this.handleAcknowledgment(message.id);
      }
      
      // Simulate response for certain message types
      if (message.type === 'inspection:start') {
        setTimeout(() => {
          this.simulateIncomingMessage({
            type: 'inspection:started',
            payload: {
              inspectionId: message.payload.inspectionId,
              status: 'in-progress',
              startTime: new Date().toISOString()
            }
          });
        }, 500);
      }
    }, 50 + Math.random() * 100); // 50-150ms delay
  }

  // Handle incoming messages
  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      
      this.stats.messagesReceived++;
      this.stats.lastMessageTime = new Date().toISOString();
      this.updateBandwidthStats(data.length, 'downstream');
      
      // Handle special message types
      if (message.type === 'ping') {
        this.handlePing(message);
        return;
      }
      
      if (message.type === 'pong') {
        this.handlePong(message);
        return;
      }
      
      if (message.type === 'ack') {
        this.handleAcknowledgment(message.payload.messageId);
        return;
      }
      
      // Send acknowledgment if required
      if (message.requiresAck) {
        this.sendAck(message.id);
      }
      
      // Emit to message handlers
      this.emit(message.type, message);
      
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  // Simulate incoming message for demo
  private simulateIncomingMessage(data: { type: string; payload: any }): void {
    const message: WebSocketMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: data.type,
      payload: data.payload,
      timestamp: new Date().toISOString(),
      clientId: 'server',
      priority: 'normal'
    };
    
    this.handleMessage(JSON.stringify(message));
  }

  // Subscribe to message types
  subscribe(messageType: string, handler: (message: WebSocketMessage) => void): () => void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }
    
    this.messageHandlers.get(messageType)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(messageType);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  // Emit message to handlers
  private emit(messageType: string, message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    }
    
    // Also emit to 'all' handlers
    const allHandlers = this.messageHandlers.get('*');
    if (allHandlers) {
      allHandlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in global message handler:', error);
        }
      });
    }
  }

  // Handle connection close
  private handleClose(event: CloseEvent): void {
    this.connectionState = 'disconnected';
    this.stats.connected = false;
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    this.emit('connection:closed', { 
      code: event.code, 
      reason: event.reason 
    });
    
    // Auto-reconnect if enabled
    if (this.options.autoReconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  // Handle connection error
  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
    this.emit('connection:error', { error });
  }

  // Schedule reconnection
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    
    this.connectionState = 'reconnecting';
    this.reconnectAttempts++;
    this.stats.reconnectAttempts = this.reconnectAttempts;
    
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
        if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
          this.scheduleReconnect();
        } else {
          this.emit('connection:failed', { 
            maxAttemptsReached: true,
            attempts: this.reconnectAttempts 
          });
        }
      });
    }, delay);
    
    this.emit('connection:reconnecting', { 
      attempt: this.reconnectAttempts,
      delay 
    });
  }

  // Send handshake message
  private sendHandshake(): void {
    this.send('handshake', {
      clientId: this.clientId,
      version: '1.0.0',
      capabilities: ['compression', 'heartbeat', 'ack'],
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  }

  // Start heartbeat
  private startHeartbeat(): void {
    if (!this.options.enableHeartbeat || this.heartbeatTimer) return;
    
    this.heartbeatTimer = setInterval(() => {
      if (this.connectionState === 'connected') {
        this.lastPingTime = Date.now();
        this.send('ping', { timestamp: this.lastPingTime });
      }
    }, this.config.heartbeatInterval);
  }

  // Handle ping message
  private handlePing(message: WebSocketMessage): void {
    this.send('pong', { 
      timestamp: Date.now(),
      pingTimestamp: message.payload.timestamp 
    });
  }

  // Handle pong message
  private handlePong(message: WebSocketMessage): void {
    if (this.lastPingTime) {
      this.stats.latency = Date.now() - this.lastPingTime;
      this.updateConnectionQuality();
    }
  }

  // Send acknowledgment
  private sendAck(messageId: string): void {
    this.send('ack', { messageId }, { priority: 'high' });
  }

  // Handle acknowledgment
  private handleAcknowledgment(messageId: string): void {
    if (this.messageBuffer[messageId]) {
      delete this.messageBuffer[messageId];
      this.emit('message:acknowledged', { messageId });
    }
  }

  // Start acknowledgment timeout
  private startAckTimeout(messageId: string, timeout: number): void {
    setTimeout(() => {
      if (this.messageBuffer[messageId]) {
        delete this.messageBuffer[messageId];
        this.emit('message:timeout', { messageId });
      }
    }, timeout);
  }

  // Process queued messages
  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.connectionState === 'connected') {
      const message = this.messageQueue.shift()!;
      this.sendMessage(message).catch(error => {
        console.error('Failed to send queued message:', error);
      });
    }
  }

  // Update bandwidth statistics
  private updateBandwidthStats(bytes: number, direction: 'upstream' | 'downstream'): void {
    const now = Date.now();
    const windowSize = 10000; // 10 seconds
    
    // Simple bandwidth calculation (bytes per second over last 10 seconds)
    this.stats.bandwidth[direction] = bytes / (windowSize / 1000);
  }

  // Update connection quality based on latency
  private updateConnectionQuality(): void {
    const latency = this.stats.latency;
    
    if (latency < 50) {
      this.stats.connectionQuality = 'excellent';
    } else if (latency < 150) {
      this.stats.connectionQuality = 'good';
    } else if (latency < 300) {
      this.stats.connectionQuality = 'fair';
    } else {
      this.stats.connectionQuality = 'poor';
    }
  }

  // Start message simulation for demo
  private startMessageSimulation(): void {
    // Simulate various real-time events
    const simulationTypes = [
      'database:index_usage_updated',
      'database:slow_query_detected',
      'database:performance_alert',
      'inspection:status_update',
      'property:data_sync',
      'system:health_check'
    ];

    setInterval(() => {
      const randomType = simulationTypes[Math.floor(Math.random() * simulationTypes.length)];
      
      let payload = {};
      
      switch (randomType) {
        case 'database:index_usage_updated':
          payload = {
            indexName: `idx_properties_${Math.random().toString(36).substr(2, 4)}`,
            usage: Math.round(Math.random() * 100),
            performance: Math.round(Math.random() * 50 + 10) // 10-60ms
          };
          break;
        case 'database:slow_query_detected':
          payload = {
            query: 'SELECT * FROM inspections WHERE property_id = ? AND status = ?',
            executionTime: Math.round(Math.random() * 500 + 100), // 100-600ms
            recommendations: ['Create composite index on (property_id, status)']
          };
          break;
        case 'database:performance_alert':
          payload = {
            type: 'high_cpu_usage',
            value: Math.round(Math.random() * 30 + 70), // 70-100%
            threshold: 80,
            severity: 'warning'
          };
          break;
        case 'inspection:status_update':
          payload = {
            inspectionId: `insp-${Math.random().toString(36).substr(2, 8)}`,
            status: ['in-progress', 'completed', 'paused'][Math.floor(Math.random() * 3)],
            progress: Math.round(Math.random() * 100)
          };
          break;
        case 'property:data_sync':
          payload = {
            propertyId: `prop-${Math.random().toString(36).substr(2, 8)}`,
            updatedFields: ['status', 'last_inspection_date'],
            source: 'field_update'
          };
          break;
        case 'system:health_check':
          payload = {
            status: 'healthy',
            uptime: Math.round(Math.random() * 86400), // seconds
            memoryUsage: Math.round(Math.random() * 100),
            diskUsage: Math.round(Math.random() * 100)
          };
          break;
      }
      
      this.simulateIncomingMessage({
        type: randomType,
        payload
      });
      
    }, 5000 + Math.random() * 10000); // 5-15 seconds
  }

  // Public getters
  getConnectionState(): string {
    return this.connectionState;
  }

  getStats(): WebSocketStats {
    return { ...this.stats };
  }

  getClientId(): string {
    return this.clientId;
  }

  getQueueSize(): number {
    return this.messageQueue.length;
  }

  // High-level methods for property inspection app
  
  // Send inspection update
  sendInspectionUpdate(inspectionId: string, update: any): Promise<void> {
    return this.send('inspection:update', {
      inspectionId,
      update,
      timestamp: new Date().toISOString()
    }, { priority: 'high', requiresAck: true });
  }

  // Send database performance data
  sendDatabaseMetrics(metrics: any): Promise<void> {
    return this.send('database:metrics', {
      metrics,
      timestamp: new Date().toISOString()
    }, { priority: 'normal' });
  }

  // Send critical alert
  sendCriticalAlert(alert: any): Promise<void> {
    return this.send('alert:critical', {
      alert,
      timestamp: new Date().toISOString()
    }, { priority: 'urgent', requiresAck: true });
  }

  // Request real-time data
  requestRealTimeData(dataType: string, filters?: any): Promise<void> {
    return this.send('data:request', {
      dataType,
      filters,
      requestId: `req-${Date.now()}`,
      timestamp: new Date().toISOString()
    }, { requiresAck: true });
  }

  // Cleanup
  cleanup(): void {
    this.disconnect();
    this.messageHandlers.clear();
    this.messageQueue = [];
    this.messageBuffer = {};
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();

// Export types and service
export { WebSocketService };
export default webSocketService;