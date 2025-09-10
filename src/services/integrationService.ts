// Central integration service that coordinates between all systems
import { apiClient } from './api';
import { AnalyticsService } from './businessLogic';
import { DataProcessingService } from './dataProcessing';
import { databaseIndexingService } from './databaseIndexing';
import { realTimeService } from './realTimeService';
import { webSocketService as websocketService } from './websocketService';

export interface SystemStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error' | 'initializing';
  lastHealthCheck: string;
  responseTime?: number;
  errorMessage?: string;
  version?: string;
  uptime?: number;
}

export interface IntegrationEvent {
  id: string;
  type: 'inspection_created' | 'property_updated' | 'community_added' | 'report_generated' | 'alert_triggered' | 'system_error';
  source: string;
  target?: string;
  data: any;
  timestamp: string;
  processed: boolean;
  retryCount?: number;
}

export interface IntegrationMetrics {
  totalEvents: number;
  processedEvents: number;
  failedEvents: number;
  avgProcessingTime: number;
  systemUptime: number;
  dataSync: {
    communities: { synced: number; total: number; lastSync: string };
    properties: { synced: number; total: number; lastSync: string };
    inspections: { synced: number; total: number; lastSync: string };
  };
  performanceScore: number;
}

export interface DataFlowMapping {
  source: string;
  target: string;
  dataType: string;
  transformFunction?: string;
  enabled: boolean;
  lastSync?: string;
  syncFrequency: 'real-time' | 'hourly' | 'daily' | 'manual';
}

class IntegrationService {
  private eventQueue: IntegrationEvent[] = [];
  private systemStatuses: Map<string, SystemStatus> = new Map();
  private dataFlowMappings: DataFlowMapping[] = [];
  private eventListeners: Map<string, ((event: IntegrationEvent) => void)[]> = new Map();
  private metrics: IntegrationMetrics;
  private isInitialized = false;

  constructor() {
    this.metrics = {
      totalEvents: 0,
      processedEvents: 0,
      failedEvents: 0,
      avgProcessingTime: 0,
      systemUptime: 0,
      dataSync: {
        communities: { synced: 0, total: 0, lastSync: new Date().toISOString() },
        properties: { synced: 0, total: 0, lastSync: new Date().toISOString() },
        inspections: { synced: 0, total: 0, lastSync: new Date().toISOString() }
      },
      performanceScore: 0
    };
    
    this.initializeIntegration();
  }

  // Initialize all system integrations
  async initializeIntegration(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🔄 Initializing Integration Service...');
      
      // Initialize system statuses
      this.initializeSystemStatuses();
      
      // Set up data flow mappings
      this.setupDataFlowMappings();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      // Set up cross-system event handlers
      this.setupCrossSystemEvents();
      
      // Initialize data synchronization
      await this.initializeDataSync();
      
      this.isInitialized = true;
      console.log('✅ Integration Service initialized successfully');
      
      // Emit initialization event
      this.emitEvent({
        type: 'system_error', // Using available type
        source: 'integration-service',
        data: { message: 'Integration Service initialized', type: 'info' }
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize Integration Service:', error);
      this.emitEvent({
        type: 'system_error',
        source: 'integration-service',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  }

  // Initialize system status tracking
  private initializeSystemStatuses(): void {
    const systems: Omit<SystemStatus, 'id' | 'lastHealthCheck'>[] = [
      { name: 'API Service', status: 'online', responseTime: 45, version: '1.0.0', uptime: 99.9 },
      { name: 'WebSocket Service', status: 'online', responseTime: 12, version: '1.0.0', uptime: 99.8 },
      { name: 'Real-Time Service', status: 'online', responseTime: 23, version: '1.0.0', uptime: 99.7 },
      { name: 'Database Indexing', status: 'online', responseTime: 67, version: '1.0.0', uptime: 99.9 },
      { name: 'Business Logic', status: 'online', responseTime: 34, version: '1.0.0', uptime: 99.8 },
      { name: 'Data Processing', status: 'online', responseTime: 89, version: '1.0.0', uptime: 99.6 }
    ];

    systems.forEach((system, index) => {
      const systemStatus: SystemStatus = {
        id: `system_${index + 1}`,
        lastHealthCheck: new Date().toISOString(),
        ...system
      };
      this.systemStatuses.set(systemStatus.id, systemStatus);
    });
  }

  // Set up data flow mappings between systems
  private setupDataFlowMappings(): void {
    this.dataFlowMappings = [
      // API to Real-time
      {
        source: 'api-service',
        target: 'real-time-service',
        dataType: 'inspection_updates',
        enabled: true,
        syncFrequency: 'real-time',
        lastSync: new Date().toISOString()
      },
      // API to WebSocket
      {
        source: 'api-service',
        target: 'websocket-service',
        dataType: 'live_notifications',
        enabled: true,
        syncFrequency: 'real-time',
        lastSync: new Date().toISOString()
      },
      // Business Logic to Data Processing
      {
        source: 'business-logic',
        target: 'data-processing',
        dataType: 'analytics_data',
        enabled: true,
        syncFrequency: 'hourly',
        lastSync: new Date().toISOString()
      },
      // Data Processing to Database Indexing
      {
        source: 'data-processing',
        target: 'database-indexing',
        dataType: 'query_patterns',
        enabled: true,
        syncFrequency: 'daily',
        lastSync: new Date().toISOString()
      },
      // Real-time to Business Logic
      {
        source: 'real-time-service',
        target: 'business-logic',
        dataType: 'workflow_triggers',
        enabled: true,
        syncFrequency: 'real-time',
        lastSync: new Date().toISOString()
      }
    ];
  }

  // Start health monitoring for all systems
  private startHealthMonitoring(): void {
    setInterval(() => {
      this.performHealthChecks();
    }, 30000); // Check every 30 seconds

    // Initial health check
    this.performHealthChecks();
  }

  // Perform health checks on all systems
  private async performHealthChecks(): Promise<void> {
    const systems = Array.from(this.systemStatuses.values());
    
    for (const system of systems) {
      try {
        const startTime = Date.now();
        
        // Simulate health check (in production, make actual HTTP requests)
        await this.simulateHealthCheck(system.name);
        
        const responseTime = Date.now() - startTime;
        
        // Update system status
        this.systemStatuses.set(system.id, {
          ...system,
          status: 'online',
          responseTime,
          lastHealthCheck: new Date().toISOString(),
          uptime: Math.min(100, (system.uptime || 0) + 0.001)
        });
        
      } catch (error) {
        // Update system status to error
        this.systemStatuses.set(system.id, {
          ...system,
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          lastHealthCheck: new Date().toISOString()
        });
        
        // Emit error event
        this.emitEvent({
          type: 'system_error',
          source: system.name.toLowerCase().replace(' ', '-'),
          data: { error: `Health check failed for ${system.name}` }
        });
      }
    }
    
    // Update overall metrics
    this.updateMetrics();
  }

  // Simulate health check (replace with actual implementation)
  private async simulateHealthCheck(systemName: string): Promise<void> {
    // Simulate random response times and occasional failures
    const responseTime = Math.random() * 100 + 10;
    const failureRate = 0.05; // 5% failure rate
    
    await new Promise(resolve => setTimeout(resolve, responseTime));
    
    if (Math.random() < failureRate) {
      throw new Error(`${systemName} health check failed`);
    }
  }

  // Set up cross-system event handlers
  private setupCrossSystemEvents(): void {
    // When an inspection is created, trigger multiple systems
    this.addEventListener('inspection_created', (event) => {
      try {
        // Notify real-time service
        if (event.data?.inspectionId) {
          realTimeService.notifyInspectionUpdate(event.data.inspectionId, 'created');
        }
        
        // Send WebSocket notification
        websocketService.sendMessage('inspection_created', event.data);
        
        // Mock analytics processing
        console.log('📊 Processing inspection event for analytics:', event.data);
      } catch (error) {
        console.error('Error handling inspection_created event:', error);
      }
    });

    // When a property is updated, sync across systems
    this.addEventListener('property_updated', (event) => {
      try {
        // Update real-time tracking
        if (event.data?.propertyId) {
          realTimeService.notifyPropertyUpdate(event.data.propertyId);
          
          // Trigger indexing review
          databaseIndexingService.analyzeQuery(`SELECT * FROM properties WHERE id = '${event.data.propertyId}'`);
        }
        
        // Mock analytics processing
        console.log('📊 Processing property update for analytics:', event.data);
      } catch (error) {
        console.error('Error handling property_updated event:', error);
      }
    });

    // When a community is added, initialize all related systems
    this.addEventListener('community_added', (event) => {
      try {
        // Initialize real-time tracking
        if (event.data?.communityId) {
          realTimeService.initializeCommunityTracking(event.data.communityId);
          
          // Create optimized indexes
          this.optimizeIndexesForCommunity(event.data.communityId);
        }
        
        // Mock data processing setup
        console.log('📊 Setting up community processing:', event.data);
      } catch (error) {
        console.error('Error handling community_added event:', error);
      }
    });

    // When a report is generated, distribute to relevant systems
    this.addEventListener('report_generated', (event) => {
      try {
        // Send real-time notification
        websocketService.sendMessage('report_ready', event.data);
        
        // Mock data processing storage
        console.log('📊 Storing report in data processing:', event.data);
      } catch (error) {
        console.error('Error handling report_generated event:', error);
      }
    });
  }

  // Initialize data synchronization
  private async initializeDataSync(): Promise<void> {
    try {
      // Use mock data directly to avoid fetch errors
      const { mockData } = await import('./api');
      
      // Sync communities from mock data
      this.metrics.dataSync.communities = {
        synced: mockData.communities.length,
        total: mockData.communities.length,
        lastSync: new Date().toISOString()
      };

      // Sync properties from mock data
      this.metrics.dataSync.properties = {
        synced: mockData.properties.length,
        total: mockData.properties.length,
        lastSync: new Date().toISOString()
      };

      // Sync inspections from mock data
      this.metrics.dataSync.inspections = {
        synced: mockData.inspections.length,
        total: mockData.inspections.length,
        lastSync: new Date().toISOString()
      };

      console.log('✅ Data synchronization completed using mock data');
    } catch (error) {
      console.error('❌ Data synchronization failed:', error);
      // Set default values to prevent undefined errors
      this.metrics.dataSync = {
        communities: { synced: 0, total: 0, lastSync: new Date().toISOString() },
        properties: { synced: 0, total: 0, lastSync: new Date().toISOString() },
        inspections: { synced: 0, total: 0, lastSync: new Date().toISOString() }
      };
    }
  }

  // Optimize database indexes for a new community
  private async optimizeIndexesForCommunity(communityId: string): Promise<void> {
    try {
      // Create community-specific indexes
      await databaseIndexingService.createIndex({
        name: `properties_community_${communityId}_idx`,
        table: 'properties',
        columns: ['community_id', 'status'],
        type: 'composite',
        unique: false,
        partial: true,
        condition: `community_id = '${communityId}'`,
        size: 50,
        usage: 0,
        status: 'active'
      });

      console.log(`✅ Optimized indexes for community ${communityId}`);
    } catch (error) {
      console.error(`❌ Failed to optimize indexes for community ${communityId}:`, error);
    }
  }

  // Emit an integration event
  emitEvent(eventData: Omit<IntegrationEvent, 'id' | 'timestamp' | 'processed'>): void {
    const event: IntegrationEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      processed: false,
      retryCount: 0,
      ...eventData
    };

    this.eventQueue.push(event);
    this.metrics.totalEvents++;

    // Process event
    this.processEvent(event);

    // Notify listeners
    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in event listener for ${event.type}:`, error);
      }
    });
  }

  // Add event listener
  addEventListener(eventType: IntegrationEvent['type'], listener: (event: IntegrationEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  // Remove event listener
  removeEventListener(eventType: IntegrationEvent['type'], listener: (event: IntegrationEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Process an integration event
  private async processEvent(event: IntegrationEvent): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Find relevant data flow mappings
      const relevantMappings = this.dataFlowMappings.filter(
        mapping => mapping.source === event.source && mapping.enabled
      );

      // Process each mapping
      for (const mapping of relevantMappings) {
        await this.executeDataFlow(mapping, event);
      }

      // Mark event as processed
      event.processed = true;
      this.metrics.processedEvents++;

      const processingTime = Date.now() - startTime;
      this.updateAvgProcessingTime(processingTime);

    } catch (error) {
      console.error(`Failed to process event ${event.id}:`, error);
      this.metrics.failedEvents++;
      
      // Retry logic
      if ((event.retryCount || 0) < 3) {
        event.retryCount = (event.retryCount || 0) + 1;
        setTimeout(() => this.processEvent(event), 1000 * event.retryCount!);
      }
    }
  }

  // Execute data flow between systems
  private async executeDataFlow(mapping: DataFlowMapping, event: IntegrationEvent): Promise<void> {
    try {
      // Transform data if needed
      const transformedData = await this.transformData(mapping, event.data);
      
      // Route to target system
      await this.routeToTarget(mapping.target, mapping.dataType, transformedData);
      
      // Update mapping last sync
      mapping.lastSync = new Date().toISOString();
      
    } catch (error) {
      console.error(`Data flow execution failed for ${mapping.source} -> ${mapping.target}:`, error);
      throw error;
    }
  }

  // Transform data according to mapping rules
  private async transformData(mapping: DataFlowMapping, data: any): Promise<any> {
    // Apply transformation functions based on data type
    switch (mapping.dataType) {
      case 'inspection_updates':
        return {
          inspectionId: data.id,
          status: data.status,
          timestamp: new Date().toISOString(),
          metadata: data
        };
      
      case 'live_notifications':
        return {
          type: 'inspection_update',
          title: `Inspection ${data.status}`,
          message: `Property ${data.propertyAddress} inspection has been ${data.status}`,
          data: data
        };
      
      case 'analytics_data':
        return {
          eventType: data.type,
          entityId: data.id,
          metrics: data.metrics || {},
          timestamp: new Date().toISOString()
        };
      
      default:
        return data;
    }
  }

  // Route data to target system
  private async routeToTarget(target: string, dataType: string, data: any): Promise<void> {
    try {
      switch (target) {
        case 'real-time-service':
          if (dataType === 'inspection_updates' && data?.inspectionId) {
            realTimeService.updateInspectionTracking(data.inspectionId, data);
          }
          break;
        
        case 'websocket-service':
          if (dataType === 'live_notifications') {
            websocketService.sendMessage('notification', data);
          }
          break;
        
        case 'data-processing':
          // Mock processing - in production, call actual DataProcessingService methods
          console.log(`Processing data in data-processing service:`, { dataType, data });
          break;
        
        case 'database-indexing':
          if (dataType === 'query_patterns' && data?.query && typeof data.query === 'string') {
            databaseIndexingService.analyzeQuery(data.query);
          }
          break;
        
        case 'business-logic':
          // Mock processing - in production, call actual AnalyticsService methods
          console.log(`Processing data in business-logic service:`, { dataType, data });
          break;
        
        default:
          console.warn(`Unknown target system: ${target}`);
      }
    } catch (error) {
      console.error(`Error routing to ${target}:`, error);
      // Don't rethrow to prevent cascade failures
    }
  }

  // Update average processing time
  private updateAvgProcessingTime(newTime: number): void {
    const totalProcessed = this.metrics.processedEvents;
    this.metrics.avgProcessingTime = (
      (this.metrics.avgProcessingTime * (totalProcessed - 1) + newTime) / totalProcessed
    );
  }

  // Update overall metrics
  private updateMetrics(): void {
    const systems = Array.from(this.systemStatuses.values());
    const onlineSystems = systems.filter(s => s.status === 'online').length;
    const totalSystems = systems.length;
    
    // Calculate performance score (0-100)
    const systemHealth = (onlineSystems / totalSystems) * 40; // 40% weight
    const eventSuccess = totalSystems > 0 ? 
      (this.metrics.processedEvents / Math.max(this.metrics.totalEvents, 1)) * 30 : 0; // 30% weight
    const avgResponseTime = systems.reduce((sum, s) => sum + (s.responseTime || 0), 0) / totalSystems;
    const responseScore = Math.max(0, 100 - avgResponseTime) * 0.3; // 30% weight
    
    this.metrics.performanceScore = Math.round(systemHealth + eventSuccess + responseScore);
    this.metrics.systemUptime = Date.now() - (this.isInitialized ? Date.now() - 86400000 : Date.now());
  }

  // Public API methods
  getSystemStatuses(): SystemStatus[] {
    return Array.from(this.systemStatuses.values());
  }

  getIntegrationMetrics(): IntegrationMetrics {
    return { ...this.metrics };
  }

  getEventQueue(): IntegrationEvent[] {
    return [...this.eventQueue];
  }

  getDataFlowMappings(): DataFlowMapping[] {
    return [...this.dataFlowMappings];
  }

  // Enable/disable data flow mapping
  toggleDataFlow(source: string, target: string, enabled: boolean): void {
    const mapping = this.dataFlowMappings.find(
      m => m.source === source && m.target === target
    );
    if (mapping) {
      mapping.enabled = enabled;
    }
  }

  // Manual data sync trigger
  async triggerManualSync(): Promise<void> {
    await this.initializeDataSync();
    this.emitEvent({
      type: 'system_error', // Using available type for notification
      source: 'integration-service',
      data: { message: 'Manual sync completed', type: 'info' }
    });
  }

  // Get system health summary
  getSystemHealth(): { healthy: number; total: number; score: number } {
    const systems = Array.from(this.systemStatuses.values());
    const healthy = systems.filter(s => s.status === 'online').length;
    
    return {
      healthy,
      total: systems.length,
      score: this.metrics.performanceScore
    };
  }

  // Emergency system restart
  async emergencyRestart(): Promise<void> {
    console.log('🚨 Emergency restart initiated...');
    
    // Reset all systems to initializing
    this.systemStatuses.forEach((status, id) => {
      this.systemStatuses.set(id, {
        ...status,
        status: 'initializing',
        lastHealthCheck: new Date().toISOString()
      });
    });

    // Clear event queue
    this.eventQueue = [];
    
    // Reinitialize
    this.isInitialized = false;
    await this.initializeIntegration();
    
    console.log('✅ Emergency restart completed');
  }
}

// Export singleton instance
export const integrationService = new IntegrationService();

// Export types and service
export { IntegrationService };
export default integrationService;