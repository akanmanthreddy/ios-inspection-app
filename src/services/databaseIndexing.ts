// Database indexing and query optimization service
// Simulates database indexing for demo purposes and provides optimization utilities

export interface DatabaseIndex {
  id: string;
  name: string;
  table: string;
  columns: string[];
  type: 'btree' | 'hash' | 'gin' | 'gist' | 'spgist' | 'brin' | 'composite';
  unique: boolean;
  partial: boolean;
  condition?: string;
  size: number; // in KB
  usage: number; // usage frequency
  lastUsed: string;
  createdAt: string;
  status: 'active' | 'unused' | 'rebuilding' | 'invalid';
  performance: {
    avgQueryTime: number; // in ms
    totalScans: number;
    totalReturns: number;
    selectivity: number; // 0-1, lower is better
  };
}

export interface QueryPlan {
  id: string;
  query: string;
  executionTime: number;
  cost: number;
  rows: number;
  operations: QueryOperation[];
  indexes: string[];
  recommendations: IndexRecommendation[];
  timestamp: string;
}

export interface QueryOperation {
  type: 'seq_scan' | 'index_scan' | 'bitmap_scan' | 'nested_loop' | 'hash_join' | 'sort' | 'aggregate';
  table?: string;
  index?: string;
  cost: number;
  rows: number;
  time: number;
  filter?: string;
}

export interface IndexRecommendation {
  id: string;
  type: 'create' | 'drop' | 'rebuild' | 'modify';
  priority: 'low' | 'medium' | 'high' | 'critical';
  table: string;
  columns: string[];
  indexType: DatabaseIndex['type'];
  reason: string;
  expectedImprovement: {
    queryTimeReduction: number; // percentage
    storageImpact: number; // KB
    maintenanceOverhead: number; // percentage
  };
  queries: string[]; // queries that would benefit
  conflictsWith?: string[]; // existing indexes that might conflict
}

export interface DatabaseSchema {
  tables: {
    [tableName: string]: {
      columns: {
        [columnName: string]: {
          type: string;
          nullable: boolean;
          primaryKey: boolean;
          foreignKey?: {
            table: string;
            column: string;
          };
          indexed: boolean;
          cardinality?: number;
          selectivity?: number;
        };
      };
      indexes: string[];
      rowCount: number;
      size: number; // in KB
      lastAnalyzed: string;
    };
  };
}

export interface QueryAnalytics {
  totalQueries: number;
  slowQueries: number;
  avgQueryTime: number;
  mostFrequentQueries: {
    query: string;
    count: number;
    avgTime: number;
  }[];
  slowestQueries: {
    query: string;
    time: number;
    timestamp: string;
  }[];
  indexUsage: {
    [indexName: string]: {
      scans: number;
      returns: number;
      lastUsed: string;
    };
  };
}

class DatabaseIndexingService {
  private indexes: Map<string, DatabaseIndex> = new Map();
  private queryPlans: QueryPlan[] = [];
  private recommendations: IndexRecommendation[] = [];
  private schema: DatabaseSchema;
  private analytics: QueryAnalytics;

  constructor() {
    this.initializeSchema();
    this.createDefaultIndexes();
    this.initializeAnalytics();
  }

  // Initialize database schema
  private initializeSchema(): void {
    this.schema = {
      tables: {
        communities: {
          columns: {
            id: { type: 'uuid', nullable: false, primaryKey: true, indexed: true, cardinality: 1000 },
            name: { type: 'varchar(255)', nullable: false, primaryKey: false, indexed: true, cardinality: 950 },
            status: { type: 'enum', nullable: false, primaryKey: false, indexed: true, cardinality: 3, selectivity: 0.33 },
            address: { type: 'text', nullable: true, primaryKey: false, indexed: false },
            created_at: { type: 'timestamp', nullable: false, primaryKey: false, indexed: true },
            updated_at: { type: 'timestamp', nullable: false, primaryKey: false, indexed: false }
          },
          indexes: ['communities_pkey', 'communities_name_idx', 'communities_status_idx', 'communities_created_at_idx'],
          rowCount: 1000,
          size: 150,
          lastAnalyzed: new Date().toISOString()
        },
        properties: {
          columns: {
            id: { type: 'uuid', nullable: false, primaryKey: true, indexed: true, cardinality: 25000 },
            community_id: { 
              type: 'uuid', 
              nullable: false, 
              primaryKey: false, 
              indexed: true,
              foreignKey: { table: 'communities', column: 'id' },
              cardinality: 1000,
              selectivity: 0.04
            },
            address: { type: 'varchar(500)', nullable: false, primaryKey: false, indexed: true, cardinality: 24800 },
            unit_number: { type: 'varchar(50)', nullable: true, primaryKey: false, indexed: true, cardinality: 5000 },
            status: { type: 'enum', nullable: false, primaryKey: false, indexed: true, cardinality: 4, selectivity: 0.25 },
            property_type: { type: 'enum', nullable: false, primaryKey: false, indexed: true, cardinality: 5, selectivity: 0.2 },
            created_at: { type: 'timestamp', nullable: false, primaryKey: false, indexed: true },
            updated_at: { type: 'timestamp', nullable: false, primaryKey: false, indexed: false }
          },
          indexes: [
            'properties_pkey', 
            'properties_community_id_idx', 
            'properties_address_idx',
            'properties_status_idx',
            'properties_community_status_idx'
          ],
          rowCount: 25000,
          size: 4500,
          lastAnalyzed: new Date().toISOString()
        },
        inspections: {
          columns: {
            id: { type: 'uuid', nullable: false, primaryKey: true, indexed: true, cardinality: 150000 },
            property_id: { 
              type: 'uuid', 
              nullable: false, 
              primaryKey: false, 
              indexed: true,
              foreignKey: { table: 'properties', column: 'id' },
              cardinality: 25000,
              selectivity: 0.17
            },
            inspector_name: { type: 'varchar(255)', nullable: false, primaryKey: false, indexed: true, cardinality: 50 },
            inspection_date: { type: 'date', nullable: false, primaryKey: false, indexed: true, cardinality: 730 },
            scheduled_date: { type: 'date', nullable: false, primaryKey: false, indexed: true },
            status: { type: 'enum', nullable: false, primaryKey: false, indexed: true, cardinality: 6, selectivity: 0.17 },
            type: { type: 'enum', nullable: false, primaryKey: false, indexed: true, cardinality: 4, selectivity: 0.25 },
            priority: { type: 'enum', nullable: false, primaryKey: false, indexed: true, cardinality: 3, selectivity: 0.33 },
            created_at: { type: 'timestamp', nullable: false, primaryKey: false, indexed: true },
            updated_at: { type: 'timestamp', nullable: false, primaryKey: false, indexed: false }
          },
          indexes: [
            'inspections_pkey',
            'inspections_property_id_idx',
            'inspections_inspector_name_idx',
            'inspections_date_idx',
            'inspections_status_idx',
            'inspections_property_date_idx',
            'inspections_status_date_idx'
          ],
          rowCount: 150000,
          size: 28000,
          lastAnalyzed: new Date().toISOString()
        },
        inspection_items: {
          columns: {
            id: { type: 'uuid', nullable: false, primaryKey: true, indexed: true, cardinality: 2250000 },
            inspection_id: { 
              type: 'uuid', 
              nullable: false, 
              primaryKey: false, 
              indexed: true,
              foreignKey: { table: 'inspections', column: 'id' },
              cardinality: 150000,
              selectivity: 0.07
            },
            item_name: { type: 'varchar(255)', nullable: false, primaryKey: false, indexed: true, cardinality: 500 },
            category: { type: 'varchar(100)', nullable: false, primaryKey: false, indexed: true, cardinality: 25 },
            status: { type: 'enum', nullable: false, primaryKey: false, indexed: true, cardinality: 4, selectivity: 0.25 },
            severity: { type: 'enum', nullable: true, primaryKey: false, indexed: true, cardinality: 4, selectivity: 0.25 },
            created_at: { type: 'timestamp', nullable: false, primaryKey: false, indexed: true }
          },
          indexes: [
            'inspection_items_pkey',
            'inspection_items_inspection_id_idx',
            'inspection_items_category_idx',
            'inspection_items_status_idx',
            'inspection_items_severity_idx',
            'inspection_items_inspection_status_idx'
          ],
          rowCount: 2250000,
          size: 450000,
          lastAnalyzed: new Date().toISOString()
        }
      }
    };
  }

  // Create default indexes
  private createDefaultIndexes(): void {
    const defaultIndexes: Omit<DatabaseIndex, 'id'>[] = [
      // Communities indexes
      {
        name: 'communities_pkey',
        table: 'communities',
        columns: ['id'],
        type: 'btree',
        unique: true,
        partial: false,
        size: 25,
        usage: 95,
        lastUsed: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'active',
        performance: { avgQueryTime: 0.1, totalScans: 50000, totalReturns: 50000, selectivity: 1.0 }
      },
      {
        name: 'communities_status_idx',
        table: 'communities',
        columns: ['status'],
        type: 'btree',
        unique: false,
        partial: false,
        size: 15,
        usage: 78,
        lastUsed: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'active',
        performance: { avgQueryTime: 2.5, totalScans: 25000, totalReturns: 8333, selectivity: 0.33 }
      },
      // Properties indexes
      {
        name: 'properties_community_id_idx',
        table: 'properties',
        columns: ['community_id'],
        type: 'btree',
        unique: false,
        partial: false,
        size: 500,
        usage: 92,
        lastUsed: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'active',
        performance: { avgQueryTime: 1.2, totalScans: 15000, totalReturns: 25, selectivity: 0.04 }
      },
      {
        name: 'properties_community_status_idx',
        table: 'properties',
        columns: ['community_id', 'status'],
        type: 'composite',
        unique: false,
        partial: false,
        size: 750,
        usage: 87,
        lastUsed: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'active',
        performance: { avgQueryTime: 0.8, totalScans: 12000, totalReturns: 6, selectivity: 0.01 }
      },
      // Inspections indexes
      {
        name: 'inspections_property_date_idx',
        table: 'inspections',
        columns: ['property_id', 'inspection_date'],
        type: 'composite',
        unique: false,
        partial: false,
        size: 3500,
        usage: 89,
        lastUsed: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'active',
        performance: { avgQueryTime: 1.5, totalScans: 8000, totalReturns: 6, selectivity: 0.04 }
      },
      {
        name: 'inspections_status_date_idx',
        table: 'inspections',
        columns: ['status', 'scheduled_date'],
        type: 'composite',
        unique: false,
        partial: false,
        size: 2800,
        usage: 72,
        lastUsed: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'active',
        performance: { avgQueryTime: 2.1, totalScans: 5000, totalReturns: 25, selectivity: 0.17 }
      }
    ];

    defaultIndexes.forEach(index => {
      const id = `idx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.indexes.set(id, { id, ...index });
    });
  }

  // Initialize analytics
  private initializeAnalytics(): void {
    this.analytics = {
      totalQueries: 0,
      slowQueries: 0,
      avgQueryTime: 0,
      mostFrequentQueries: [],
      slowestQueries: [],
      indexUsage: {}
    };
  }

  // Create a new index
  createIndex(indexData: Omit<DatabaseIndex, 'id' | 'createdAt' | 'lastUsed' | 'performance'>): DatabaseIndex {
    const id = `idx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newIndex: DatabaseIndex = {
      id,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      performance: {
        avgQueryTime: 0,
        totalScans: 0,
        totalReturns: 0,
        selectivity: 1.0
      },
      ...indexData
    };

    this.indexes.set(id, newIndex);
    
    // Add to schema
    if (this.schema.tables[newIndex.table]) {
      this.schema.tables[newIndex.table].indexes.push(newIndex.name);
    }

    return newIndex;
  }

  // Drop an index
  dropIndex(indexId: string): boolean {
    const index = this.indexes.get(indexId);
    if (!index) return false;

    // Remove from schema
    if (this.schema.tables[index.table]) {
      const indexIndex = this.schema.tables[index.table].indexes.indexOf(index.name);
      if (indexIndex > -1) {
        this.schema.tables[index.table].indexes.splice(indexIndex, 1);
      }
    }

    return this.indexes.delete(indexId);
  }

  // Analyze query and create execution plan
  analyzeQuery(query: string): QueryPlan {
    // Validate input
    if (!query || typeof query !== 'string') {
      console.warn('Invalid query provided to analyzeQuery:', query);
      query = 'SELECT 1'; // Safe fallback query
    }
    
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate query analysis
    const operations = this.generateQueryOperations(query);
    const usedIndexes = this.identifyUsedIndexes(query, operations);
    const recommendations = this.generateIndexRecommendations(query, operations);
    
    const totalCost = operations.reduce((sum, op) => sum + op.cost, 0);
    const totalTime = operations.reduce((sum, op) => sum + op.time, 0);
    const totalRows = Math.max(...operations.map(op => op.rows));

    const queryPlan: QueryPlan = {
      id: planId,
      query,
      executionTime: totalTime,
      cost: totalCost,
      rows: totalRows,
      operations,
      indexes: usedIndexes,
      recommendations,
      timestamp: new Date().toISOString()
    };

    this.queryPlans.push(queryPlan);
    this.updateAnalytics(queryPlan);

    return queryPlan;
  }

  // Generate query operations (simplified simulation)
  private generateQueryOperations(query: string): QueryOperation[] {
    const operations: QueryOperation[] = [];
    
    // Validate input
    if (!query || typeof query !== 'string') {
      return operations;
    }
    
    const lowerQuery = query.toLowerCase();

    // Detect table scans
    if (lowerQuery.includes('select')) {
      if (lowerQuery.includes('communities')) {
        operations.push({
          type: lowerQuery.includes('where') ? 'index_scan' : 'seq_scan',
          table: 'communities',
          index: lowerQuery.includes('where') ? 'communities_status_idx' : undefined,
          cost: lowerQuery.includes('where') ? 15.5 : 45.2,
          rows: lowerQuery.includes('where') ? 333 : 1000,
          time: lowerQuery.includes('where') ? 2.1 : 8.7
        });
      }

      if (lowerQuery.includes('properties')) {
        operations.push({
          type: lowerQuery.includes('community_id') ? 'index_scan' : 'seq_scan',
          table: 'properties',
          index: lowerQuery.includes('community_id') ? 'properties_community_id_idx' : undefined,
          cost: lowerQuery.includes('community_id') ? 25.8 : 125.4,
          rows: lowerQuery.includes('community_id') ? 25 : 25000,
          time: lowerQuery.includes('community_id') ? 1.2 : 15.6
        });
      }

      if (lowerQuery.includes('inspections')) {
        const hasPropertyFilter = lowerQuery.includes('property_id');
        const hasDateFilter = lowerQuery.includes('inspection_date') || lowerQuery.includes('scheduled_date');
        
        let scanType: QueryOperation['type'] = 'seq_scan';
        let indexName: string | undefined;
        let cost = 350.7;
        let rows = 150000;
        let time = 45.3;

        if (hasPropertyFilter && hasDateFilter) {
          scanType = 'index_scan';
          indexName = 'inspections_property_date_idx';
          cost = 12.4;
          rows = 6;
          time = 1.5;
        } else if (hasPropertyFilter) {
          scanType = 'index_scan';
          indexName = 'inspections_property_id_idx';
          cost = 35.2;
          rows = 6;
          time = 3.8;
        } else if (hasDateFilter) {
          scanType = 'bitmap_scan';
          indexName = 'inspections_date_idx';
          cost = 85.1;
          rows = 205;
          time = 12.1;
        }

        operations.push({
          type: scanType,
          table: 'inspections',
          index: indexName,
          cost,
          rows,
          time
        });
      }
    }

    // Add join operations
    if (lowerQuery.includes('join') || (lowerQuery.includes('properties') && lowerQuery.includes('communities'))) {
      operations.push({
        type: 'nested_loop',
        cost: 15.2,
        rows: operations.reduce((min, op) => Math.min(min, op.rows), Infinity),
        time: 2.3
      });
    }

    // Add sorting if ORDER BY is present
    if (lowerQuery.includes('order by')) {
      operations.push({
        type: 'sort',
        cost: 25.8,
        rows: operations[operations.length - 1]?.rows || 1000,
        time: 4.1
      });
    }

    return operations;
  }

  // Identify which indexes would be used
  private identifyUsedIndexes(query: string, operations: QueryOperation[]): string[] {
    return operations
      .filter(op => op.index)
      .map(op => op.index!)
      .filter((index, i, arr) => arr.indexOf(index) === i);
  }

  // Generate index recommendations
  private generateIndexRecommendations(query: string, operations: QueryOperation[]): IndexRecommendation[] {
    const recommendations: IndexRecommendation[] = [];
    const lowerQuery = query.toLowerCase();

    // Recommend composite indexes for multi-column WHERE clauses
    if (lowerQuery.includes('where') && lowerQuery.includes('and')) {
      // Look for opportunities to create composite indexes
      if (lowerQuery.includes('status') && lowerQuery.includes('created_at')) {
        recommendations.push({
          id: `rec_${Date.now()}_1`,
          type: 'create',
          priority: 'medium',
          table: 'properties',
          columns: ['status', 'created_at'],
          indexType: 'composite',
          reason: 'Multi-column WHERE clause detected - composite index would improve performance',
          expectedImprovement: {
            queryTimeReduction: 65,
            storageImpact: 450,
            maintenanceOverhead: 15
          },
          queries: [query]
        });
      }
    }

    // Recommend indexes for slow sequential scans
    operations.forEach(op => {
      if (op.type === 'seq_scan' && op.time > 10) {
        recommendations.push({
          id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 3)}`,
          type: 'create',
          priority: op.time > 30 ? 'high' : 'medium',
          table: op.table!,
          columns: this.suggestIndexColumns(query, op.table!),
          indexType: 'btree',
          reason: `Slow sequential scan detected (${op.time.toFixed(1)}ms) - index would improve performance`,
          expectedImprovement: {
            queryTimeReduction: Math.min(85, Math.round(op.time * 2)),
            storageImpact: Math.round(op.rows * 0.02),
            maintenanceOverhead: 10
          },
          queries: [query]
        });
      }
    });

    return recommendations;
  }

  // Suggest columns for indexing based on query
  private suggestIndexColumns(query: string, table: string): string[] {
    const lowerQuery = query.toLowerCase();
    const columns: string[] = [];

    // Common filtering columns
    if (lowerQuery.includes('where')) {
      if (lowerQuery.includes('status')) columns.push('status');
      if (lowerQuery.includes('community_id')) columns.push('community_id');
      if (lowerQuery.includes('property_id')) columns.push('property_id');
      if (lowerQuery.includes('inspector_name')) columns.push('inspector_name');
      if (lowerQuery.includes('created_at') || lowerQuery.includes('date')) {
        columns.push(table === 'inspections' ? 'inspection_date' : 'created_at');
      }
    }

    // Default to common columns if none detected
    if (columns.length === 0) {
      switch (table) {
        case 'communities':
          columns.push('status');
          break;
        case 'properties':
          columns.push('community_id', 'status');
          break;
        case 'inspections':
          columns.push('property_id', 'status');
          break;
        default:
          columns.push('created_at');
      }
    }

    return columns.slice(0, 3); // Limit to 3 columns for practical composite indexes
  }

  // Update analytics with query plan
  private updateAnalytics(queryPlan: QueryPlan): void {
    this.analytics.totalQueries++;
    
    if (queryPlan.executionTime > 100) { // Consider >100ms as slow
      this.analytics.slowQueries++;
    }

    // Update average query time
    this.analytics.avgQueryTime = (
      (this.analytics.avgQueryTime * (this.analytics.totalQueries - 1) + queryPlan.executionTime) / 
      this.analytics.totalQueries
    );

    // Update index usage
    queryPlan.indexes.forEach(indexName => {
      if (!this.analytics.indexUsage[indexName]) {
        this.analytics.indexUsage[indexName] = {
          scans: 0,
          returns: 0,
          lastUsed: queryPlan.timestamp
        };
      }
      this.analytics.indexUsage[indexName].scans++;
      this.analytics.indexUsage[indexName].lastUsed = queryPlan.timestamp;
    });
  }

  // Get all indexes
  getAllIndexes(): DatabaseIndex[] {
    return Array.from(this.indexes.values());
  }

  // Get indexes for a specific table
  getTableIndexes(tableName: string): DatabaseIndex[] {
    return Array.from(this.indexes.values()).filter(index => index.table === tableName);
  }

  // Get index recommendations
  getRecommendations(): IndexRecommendation[] {
    return this.recommendations;
  }

  // Get database schema
  getSchema(): DatabaseSchema {
    return this.schema;
  }

  // Get query analytics
  getAnalytics(): QueryAnalytics {
    return this.analytics;
  }

  // Get recent query plans
  getRecentQueryPlans(limit: number = 50): QueryPlan[] {
    return this.queryPlans
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Optimize query suggestions
  suggestQueryOptimizations(query: string): string[] {
    const suggestions: string[] = [];
    
    // Validate input
    if (!query || typeof query !== 'string') {
      return suggestions;
    }
    
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('select *')) {
      suggestions.push('Consider selecting only needed columns instead of SELECT *');
    }

    if (lowerQuery.includes('like \'%') && lowerQuery.includes('%\'')) {
      suggestions.push('LIKE patterns starting with % cannot use indexes - consider full-text search');
    }

    if (lowerQuery.includes('order by') && !lowerQuery.includes('limit')) {
      suggestions.push('Consider adding LIMIT to ORDER BY queries to improve performance');
    }

    if (lowerQuery.includes('join') && !lowerQuery.includes('where')) {
      suggestions.push('Consider adding WHERE clauses to JOINs to reduce result set size');
    }

    if (lowerQuery.match(/where.*or.*or/)) {
      suggestions.push('Multiple OR conditions may not use indexes efficiently - consider UNION');
    }

    return suggestions;
  }

  // Index maintenance recommendations
  getMaintenanceRecommendations(): IndexRecommendation[] {
    const maintenance: IndexRecommendation[] = [];
    const now = new Date();

    this.getAllIndexes().forEach(index => {
      const daysSinceLastUsed = Math.floor(
        (now.getTime() - new Date(index.lastUsed).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Recommend dropping unused indexes
      if (daysSinceLastUsed > 30 && index.usage < 10) {
        maintenance.push({
          id: `maint_${Date.now()}_${index.id}`,
          type: 'drop',
          priority: 'medium',
          table: index.table,
          columns: index.columns,
          indexType: index.type,
          reason: `Index unused for ${daysSinceLastUsed} days with low usage (${index.usage}%)`,
          expectedImprovement: {
            queryTimeReduction: 0,
            storageImpact: -index.size,
            maintenanceOverhead: -10
          },
          queries: []
        });
      }

      // Recommend rebuilding fragmented indexes
      if (index.performance.selectivity > 0.8 && index.size > 1000) {
        maintenance.push({
          id: `maint_${Date.now()}_${index.id}`,
          type: 'rebuild',
          priority: 'low',
          table: index.table,
          columns: index.columns,
          indexType: index.type,
          reason: `Index may be fragmented (selectivity: ${(index.performance.selectivity * 100).toFixed(1)}%)`,
          expectedImprovement: {
            queryTimeReduction: 15,
            storageImpact: Math.round(-index.size * 0.2),
            maintenanceOverhead: 5
          },
          queries: []
        });
      }
    });

    return maintenance;
  }

  // Performance monitoring
  getPerformanceMetrics() {
    const indexes = this.getAllIndexes();
    const totalIndexSize = indexes.reduce((sum, idx) => sum + idx.size, 0);
    const activeIndexes = indexes.filter(idx => idx.status === 'active').length;
    const unusedIndexes = indexes.filter(idx => idx.usage < 10).length;

    return {
      totalIndexes: indexes.length,
      activeIndexes,
      unusedIndexes,
      totalIndexSize,
      avgQueryTime: this.analytics.avgQueryTime,
      slowQueryPercentage: (this.analytics.slowQueries / Math.max(this.analytics.totalQueries, 1)) * 100,
      indexHitRatio: this.calculateIndexHitRatio(),
      recommendationsCount: this.getRecommendations().length + this.getMaintenanceRecommendations().length
    };
  }

  // Calculate index hit ratio
  private calculateIndexHitRatio(): number {
    const recentPlans = this.getRecentQueryPlans(100);
    if (recentPlans.length === 0) return 0;

    const plansUsingIndexes = recentPlans.filter(plan => plan.indexes.length > 0).length;
    return (plansUsingIndexes / recentPlans.length) * 100;
  }
}

// Export singleton instance
export const databaseIndexingService = new DatabaseIndexingService();

// Export types and service
export { DatabaseIndexingService };
export default databaseIndexingService;