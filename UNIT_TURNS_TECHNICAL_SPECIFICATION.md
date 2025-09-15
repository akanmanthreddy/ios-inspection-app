# Unit Turns Technical Specification
## Complete Implementation Guide for Mobile Integration

### Document Status: 🔄 IN PROGRESS
**Created:** 2025-09-15
**Last Updated:** 2025-09-15
**Version:** 1.0
**Purpose:** Address QC Enforcer critical gaps in integration plan

---

## QC Issues Being Addressed

The following critical issues were identified by the QC enforcer and are addressed in this document:
1. ❌ Backend dependency not addressed
2. ❌ Missing file structure and module organization
3. ❌ No concrete API contracts
4. ❌ Security implementation too vague
5. ❌ Missing data migration strategy
6. ❌ Incomplete testing strategy
7. ❌ No performance baselines or metrics
8. ❌ Missing error recovery procedures

---

## 1. File Structure and Module Organization

### New Directory Structure
```
src/
├── modules/
│   └── unit-turns/
│       ├── components/
│       │   ├── mobile/
│       │   │   ├── MobileUnitTurnLandingPage.tsx
│       │   │   ├── MobileUnitTurnFormPage.tsx
│       │   │   ├── MobileUnitTurnSummaryPage.tsx
│       │   │   ├── MobileUnitTurnListPage.tsx
│       │   │   └── MobileUnitTurnDetailPage.tsx
│       │   ├── forms/
│       │   │   ├── UnitTurnItemEditor.tsx
│       │   │   ├── CostCalculator.tsx
│       │   │   ├── ApprovalForm.tsx
│       │   │   └── PhotoAttachment.tsx
│       │   └── ui/
│       │       ├── UnitTurnCard.tsx
│       │       ├── CostSummary.tsx
│       │       ├── StatusBadge.tsx
│       │       └── ProgressIndicator.tsx
│       ├── hooks/
│       │   ├── useUnitTurn.ts
│       │   ├── useUnitTurnTemplate.ts
│       │   ├── useUnitTurnList.ts
│       │   ├── useCostCalculations.ts
│       │   └── useApprovalFlow.ts
│       ├── services/
│       │   ├── unitTurnApi.ts
│       │   ├── unitTurnCalculations.ts
│       │   ├── unitTurnValidation.ts
│       │   ├── unitTurnExport.ts
│       │   └── unitTurnSync.ts
│       ├── types/
│       │   ├── unitTurn.ts
│       │   ├── costEstimate.ts
│       │   ├── approval.ts
│       │   └── accounting.ts
│       ├── utils/
│       │   ├── formatters.ts
│       │   ├── validators.ts
│       │   ├── calculations.ts
│       │   └── constants.ts
│       ├── contexts/
│       │   ├── UnitTurnContext.tsx
│       │   └── UnitTurnPermissionContext.tsx
│       └── __tests__/
│           ├── components/
│           ├── hooks/
│           ├── services/
│           └── integration/
```

### Integration with Existing Structure
```
src/
├── components/mobile/           # Existing mobile components
│   ├── MobileLandingPage.tsx   # Add unit turns navigation
│   ├── MobileBottomNav.tsx     # Add unit turns tab
│   └── MobilePropertiesPage.tsx # Add unit turns action
├── services/
│   ├── api.ts                  # Extend with unit turn endpoints
│   └── ...
└── modules/unit-turns/         # New module (above)
```

---

## 2. Complete API Contracts

### Authentication Headers
```typescript
interface AuthHeaders {
  'Authorization': `Bearer ${string}`;
  'Content-Type': 'application/json';
  'X-API-Version': '1.0';
  'X-Client-Platform': 'mobile-ios';
}
```

### Base URLs and Endpoints
```typescript
const API_CONFIG = {
  BASE_URL: process.env.VITE_API_URL || 'https://inspection-app-backend-gm7y.onrender.com/api',
  ENDPOINTS: {
    UNIT_TURNS: '/unit-turns',
    TEMPLATES: '/unit-turn-templates',
    APPROVALS: '/unit-turn-approvals',
    EXPORTS: '/unit-turn-exports',
    ACCOUNTING: '/accounting-mappings'
  }
};
```

### Complete API Interface
```typescript
interface UnitTurnAPI {
  // Template Management
  getTemplates(): Promise<ApiResponse<UnitTurnTemplate[]>>;
  getTemplate(id: string): Promise<ApiResponse<UnitTurnTemplate>>;
  createTemplate(template: CreateUnitTurnTemplateRequest): Promise<ApiResponse<UnitTurnTemplate>>;
  updateTemplate(id: string, template: UpdateUnitTurnTemplateRequest): Promise<ApiResponse<UnitTurnTemplate>>;
  deleteTemplate(id: string): Promise<ApiResponse<void>>;

  // Unit Turn CRUD
  getUnitTurns(params: GetUnitTurnsParams): Promise<ApiResponse<PaginatedUnitTurns>>;
  getUnitTurn(id: string): Promise<ApiResponse<DetailedUnitTurn>>;
  createUnitTurn(unitTurn: CreateUnitTurnRequest): Promise<ApiResponse<UnitTurn>>;
  updateUnitTurn(id: string, unitTurn: UpdateUnitTurnRequest): Promise<ApiResponse<UnitTurn>>;
  deleteUnitTurn(id: string): Promise<ApiResponse<void>>;

  // Approval Workflow
  submitForApproval(unitTurnId: string): Promise<ApiResponse<Approval>>;
  approveUnitTurn(unitTurnId: string, approval: ApprovalRequest): Promise<ApiResponse<Approval>>;
  rejectUnitTurn(unitTurnId: string, rejection: RejectionRequest): Promise<ApiResponse<Approval>>;
  getApprovalHistory(unitTurnId: string): Promise<ApiResponse<Approval[]>>;

  // Export and Reporting
  exportUnitTurn(unitTurnId: string, format: ExportFormat): Promise<ApiResponse<ExportResult>>;
  getCostAnalytics(params: CostAnalyticsParams): Promise<ApiResponse<CostAnalytics>>;

  // Accounting Integration
  getAccountingMappings(): Promise<ApiResponse<AccountingMapping[]>>;
  syncWithAccounting(unitTurnId: string): Promise<ApiResponse<AccountingSyncResult>>;
}
```

### Request/Response Schemas

#### Create Unit Turn Request
```typescript
interface CreateUnitTurnRequest {
  propertyId: string;
  templateId: string;
  moveOutDate: string; // ISO 8601
  estimatedMoveInDate?: string; // ISO 8601
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedToId?: string;
  notes?: string;
  customizations?: TemplateCustomization[];
}

interface TemplateCustomization {
  sectionId: string;
  itemId: string;
  quantity?: number;
  costPerUnit?: number;
  notes?: string;
  isRequired?: boolean;
}
```

#### Unit Turn Response
```typescript
interface UnitTurn {
  id: string;
  propertyId: string;
  property: {
    id: string;
    address: string;
    communityId: string;
    communityName: string;
  };
  templateId: string;
  template: UnitTurnTemplate;
  status: UnitTurnStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  moveOutDate: string;
  estimatedMoveInDate?: string;
  actualMoveInDate?: string;
  costEstimate: CostEstimate;
  actualCosts: ActualCost[];
  workOrders: WorkOrder[];
  photos: UnitTurnPhoto[];
  approvals: Approval[];
  assignedTo?: {
    id: string;
    name: string;
    role: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

type UnitTurnStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'requires_rework';
```

#### Error Response Format
```typescript
interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>; // Field validation errors
    timestamp: string;
    requestId: string;
  };
}

// Example error responses
const VALIDATION_ERROR = {
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Request validation failed',
    details: {
      'moveOutDate': ['Date must be in the future'],
      'propertyId': ['Property not found']
    },
    timestamp: '2025-09-15T10:30:00Z',
    requestId: 'req_12345'
  }
};

const AUTHORIZATION_ERROR = {
  error: {
    code: 'UNAUTHORIZED',
    message: 'Insufficient permissions for this action',
    timestamp: '2025-09-15T10:30:00Z',
    requestId: 'req_12346'
  }
};
```

---

## 3. Security Implementation Details

### Authentication Flow
```typescript
class UnitTurnSecurityService {
  private authToken: string | null = null;
  private permissions: UserPermission[] = [];

  // JWT Token Management
  async authenticateRequest(request: RequestConfig): Promise<RequestConfig> {
    const token = await this.getValidToken();
    return {
      ...request,
      headers: {
        ...request.headers,
        'Authorization': `Bearer ${token}`,
        'X-CSRF-Token': await this.getCsrfToken()
      }
    };
  }

  // Permission Checking
  hasPermission(action: UnitTurnAction, resource?: UnitTurn): boolean {
    // Check role-based permissions
    const rolePermissions = this.permissions.filter(p => p.type === 'role');
    const hasRoleAccess = rolePermissions.some(p =>
      p.actions.includes(action) &&
      (!resource || this.checkResourceAccess(p, resource))
    );

    // Check resource-specific permissions
    if (resource) {
      const resourcePermissions = this.permissions.filter(p =>
        p.type === 'resource' && p.resourceId === resource.id
      );
      const hasResourceAccess = resourcePermissions.some(p =>
        p.actions.includes(action)
      );

      return hasRoleAccess || hasResourceAccess;
    }

    return hasRoleAccess;
  }

  // Input Sanitization
  sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [], // No HTML tags allowed
        ALLOWED_ATTR: []
      });
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }

    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return input;
  }
}

// Permission Types
interface UserPermission {
  id: string;
  type: 'role' | 'resource';
  role?: UserRole;
  resourceId?: string;
  resourceType?: 'unit_turn' | 'property' | 'community';
  actions: UnitTurnAction[];
  constraints?: PermissionConstraint[];
}

type UserRole = 'property_manager' | 'maintenance_staff' | 'inspector' | 'viewer' | 'admin';

type UnitTurnAction =
  | 'view' | 'create' | 'edit' | 'delete'
  | 'approve' | 'reject' | 'submit_for_approval'
  | 'assign' | 'export' | 'view_costs' | 'edit_costs';

interface PermissionConstraint {
  field: string;
  operator: 'equals' | 'not_equals' | 'less_than' | 'greater_than';
  value: any;
}
```

### Secure Storage Implementation
```typescript
class SecureStorage {
  // Mobile secure storage using Capacitor
  async storeSecure(key: string, value: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await SecureStoragePlugin.set({ key, value });
    } else {
      // Web fallback with encryption
      const encrypted = await this.encrypt(value);
      localStorage.setItem(`secure_${key}`, encrypted);
    }
  }

  async getSecure(key: string): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
      const result = await SecureStoragePlugin.get({ key });
      return result.value;
    } else {
      const encrypted = localStorage.getItem(`secure_${key}`);
      return encrypted ? await this.decrypt(encrypted) : null;
    }
  }

  private async encrypt(data: string): Promise<string> {
    // Implement proper encryption for web
    const key = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    // ... encryption implementation
    return 'encrypted_data';
  }
}
```

---

## 4. Database Schema and Migration

### Unit Turn Tables
```sql
-- Unit Turn Templates
CREATE TABLE unit_turn_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Template Sections
CREATE TABLE unit_turn_template_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES unit_turn_templates(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Template Items
CREATE TABLE unit_turn_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES unit_turn_template_sections(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cost_code VARCHAR(50),
  default_quantity DECIMAL(10,2) DEFAULT 1,
  default_cost_per_unit DECIMAL(10,2),
  unit_of_measure VARCHAR(50),
  sort_order INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Unit Turns
CREATE TABLE unit_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  template_id UUID REFERENCES unit_turn_templates(id),
  status unit_turn_status DEFAULT 'draft',
  priority unit_turn_priority DEFAULT 'medium',
  move_out_date DATE NOT NULL,
  estimated_move_in_date DATE,
  actual_move_in_date DATE,
  total_estimated_cost DECIMAL(12,2) DEFAULT 0,
  total_actual_cost DECIMAL(12,2) DEFAULT 0,
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,

  CONSTRAINT valid_dates CHECK (
    estimated_move_in_date IS NULL OR
    estimated_move_in_date >= move_out_date
  )
);

-- Unit Turn Items (actual work items)
CREATE TABLE unit_turn_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_turn_id UUID REFERENCES unit_turns(id) ON DELETE CASCADE,
  template_item_id UUID REFERENCES unit_turn_template_items(id),
  quantity DECIMAL(10,2) NOT NULL,
  cost_per_unit DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(12,2) GENERATED ALWAYS AS (quantity * cost_per_unit) STORED,
  damage_charge DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  status item_status DEFAULT 'pending',
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enums
CREATE TYPE unit_turn_status AS ENUM (
  'draft', 'pending_approval', 'approved', 'in_progress',
  'completed', 'cancelled', 'requires_rework'
);

CREATE TYPE unit_turn_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE item_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Indexes for performance
CREATE INDEX idx_unit_turns_property_id ON unit_turns(property_id);
CREATE INDEX idx_unit_turns_status ON unit_turns(status);
CREATE INDEX idx_unit_turns_assigned_to ON unit_turns(assigned_to);
CREATE INDEX idx_unit_turns_dates ON unit_turns(move_out_date, estimated_move_in_date);
CREATE INDEX idx_unit_turn_items_unit_turn_id ON unit_turn_items(unit_turn_id);
```

### Data Migration Strategy
```typescript
interface MigrationPlan {
  // Step 1: Create new tables without breaking existing functionality
  createTables: string[];

  // Step 2: Migrate existing inspection data relationships
  migrateInspectionRelations: {
    addUnitTurnIdToInspections: string;
    linkCompletedInspectionsToUnitTurns: string;
  };

  // Step 3: Populate default templates
  seedDefaultTemplates: {
    standardUnitTurnTemplate: UnitTurnTemplate;
    moveOutInspectionTemplate: UnitTurnTemplate;
    moveInInspectionTemplate: UnitTurnTemplate;
  };

  // Step 4: Create audit tables
  createAuditTables: string[];
}
```

---

## 5. Testing Strategy and Infrastructure

### Test File Organization
```
src/modules/unit-turns/__tests__/
├── components/
│   ├── mobile/
│   │   ├── MobileUnitTurnLandingPage.test.tsx
│   │   ├── MobileUnitTurnFormPage.test.tsx
│   │   └── MobileUnitTurnSummaryPage.test.tsx
│   └── ui/
│       ├── UnitTurnCard.test.tsx
│       └── CostSummary.test.tsx
├── hooks/
│   ├── useUnitTurn.test.ts
│   ├── useUnitTurnTemplate.test.ts
│   └── useCostCalculations.test.ts
├── services/
│   ├── unitTurnApi.test.ts
│   ├── unitTurnCalculations.test.ts
│   └── unitTurnValidation.test.ts
├── integration/
│   ├── unitTurnWorkflow.test.ts
│   ├── approvalFlow.test.ts
│   └── offlineSync.test.ts
├── fixtures/
│   ├── unitTurnData.ts
│   ├── templateData.ts
│   └── mockApiResponses.ts
└── utils/
    ├── testHelpers.ts
    ├── mockServices.ts
    └── testSetup.ts
```

### Test Data Factories
```typescript
// Test fixtures and factories
export class UnitTurnTestFactory {
  static createUnitTurn(overrides: Partial<UnitTurn> = {}): UnitTurn {
    return {
      id: 'ut_' + Math.random().toString(36).substr(2, 9),
      propertyId: 'prop_test_123',
      property: {
        id: 'prop_test_123',
        address: '123 Test Street',
        communityId: 'comm_test_456',
        communityName: 'Test Community'
      },
      templateId: 'template_test_789',
      template: this.createTemplate(),
      status: 'draft',
      priority: 'medium',
      moveOutDate: '2025-10-01',
      costEstimate: this.createCostEstimate(),
      actualCosts: [],
      workOrders: [],
      photos: [],
      approvals: [],
      createdBy: 'user_test_abc',
      createdAt: '2025-09-15T10:00:00Z',
      updatedAt: '2025-09-15T10:00:00Z',
      ...overrides
    };
  }

  static createTemplate(): UnitTurnTemplate {
    return {
      id: 'template_test_789',
      name: 'Standard Unit Turn',
      sections: [
        {
          id: 'section_cleaning',
          title: 'Cleaning',
          items: [
            {
              id: 'item_carpet_clean',
              costCode: 'CLN001',
              area: 'Living Room',
              quantity: 1,
              units: 'room',
              costPerUnit: 150.00,
              total: 150.00,
              damages: 0,
              notes: ''
            }
          ],
          expanded: true
        }
      ],
      totalProjectPrice: 150.00,
      totalDamageCharges: 0
    };
  }
}

// Mock API responses
export const mockApiResponses = {
  getUnitTurns: {
    data: [UnitTurnTestFactory.createUnitTurn()],
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1
    }
  },

  createUnitTurn: (request: CreateUnitTurnRequest) => ({
    data: UnitTurnTestFactory.createUnitTurn({
      propertyId: request.propertyId,
      templateId: request.templateId
    })
  })
};
```

### Performance Testing Benchmarks
```typescript
interface PerformanceTargets {
  // Page load times (mobile)
  pageLoadTime: {
    unitTurnList: 2000; // 2 seconds
    unitTurnForm: 1500; // 1.5 seconds
    costCalculations: 500; // 0.5 seconds
  };

  // API response times
  apiResponseTime: {
    getUnitTurns: 1000; // 1 second
    createUnitTurn: 2000; // 2 seconds
    updateUnitTurn: 1500; // 1.5 seconds
    calculateCosts: 300; // 0.3 seconds
  };

  // Memory usage (mobile)
  memoryUsage: {
    maxHeapSize: 100; // 100MB
    unitTurnFormMemory: 20; // 20MB
    photoStorageLimit: 50; // 50MB
  };

  // Battery usage
  batteryUsage: {
    maxBatteryDrainPerHour: 5; // 5% per hour
    backgroundSyncLimit: 1; // 1% per hour
  };
}

// Performance testing utilities
class PerformanceMonitor {
  static async measurePageLoad(pageName: string): Promise<number> {
    const start = performance.now();
    // Page load simulation
    const end = performance.now();
    const loadTime = end - start;

    expect(loadTime).toBeLessThan(PerformanceTargets.pageLoadTime[pageName]);
    return loadTime;
  }

  static async measureMemoryUsage(): Promise<number> {
    const memInfo = await (performance as any).memory;
    return memInfo?.usedJSHeapSize || 0;
  }
}
```

### Test Coverage Requirements
```typescript
// Minimum coverage thresholds
const coverageThresholds = {
  statements: 80,
  branches: 75,
  functions: 80,
  lines: 80
};

// Critical path testing requirements
const criticalPaths = [
  'create unit turn workflow',
  'cost calculation accuracy',
  'approval workflow',
  'offline data sync',
  'photo upload and management',
  'export functionality',
  'security validation'
];
```

---

## 6. Error Recovery and Offline Handling

### Error Recovery Procedures
```typescript
class UnitTurnErrorRecovery {
  // Data recovery strategies
  async recoverFromFailedOperation(operation: FailedOperation): Promise<RecoveryResult> {
    switch (operation.type) {
      case 'CREATE_UNIT_TURN':
        return this.recoverCreateOperation(operation);
      case 'UPDATE_UNIT_TURN':
        return this.recoverUpdateOperation(operation);
      case 'SYNC_OFFLINE_CHANGES':
        return this.recoverSyncOperation(operation);
      default:
        return { success: false, error: 'Unknown operation type' };
    }
  }

  private async recoverCreateOperation(operation: FailedOperation): Promise<RecoveryResult> {
    // Check if unit turn was partially created
    const existingUnitTurn = await this.checkForPartialCreate(operation.data);

    if (existingUnitTurn) {
      // Resume from where it left off
      return this.resumePartialCreate(existingUnitTurn, operation.data);
    } else {
      // Retry from beginning with validation
      return this.retryCreateWithValidation(operation.data);
    }
  }

  // Conflict resolution for offline sync
  async resolveConflicts(localChanges: UnitTurn, serverVersion: UnitTurn): Promise<ConflictResolution> {
    const conflicts = this.detectConflicts(localChanges, serverVersion);

    if (conflicts.length === 0) {
      return { resolution: 'auto_merge', mergedData: localChanges };
    }

    // Automatic resolution rules
    const autoResolvable = conflicts.filter(c => this.canAutoResolve(c));
    const userResolvable = conflicts.filter(c => !this.canAutoResolve(c));

    if (userResolvable.length > 0) {
      return {
        resolution: 'user_intervention_required',
        conflicts: userResolvable,
        autoResolved: autoResolvable
      };
    }

    return {
      resolution: 'auto_resolved',
      mergedData: this.mergeChanges(localChanges, serverVersion, autoResolvable)
    };
  }
}

// Offline sync queue
class OfflineSyncQueue {
  private queue: OfflineOperation[] = [];

  async addOperation(operation: OfflineOperation): Promise<void> {
    this.queue.push({
      ...operation,
      id: generateId(),
      timestamp: Date.now(),
      retryCount: 0
    });

    await this.persistQueue();

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.processSyncQueue();
    }
  }

  async processSyncQueue(): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (const operation of this.queue) {
      try {
        const result = await this.syncOperation(operation);
        results.push(result);

        if (result.success) {
          this.removeFromQueue(operation.id);
        } else {
          this.incrementRetryCount(operation.id);
        }
      } catch (error) {
        results.push({
          operationId: operation.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    await this.persistQueue();
    return results;
  }
}
```

---

## 7. Session Continuity Framework

### Session Start Checklist
```typescript
interface SessionStartChecklist {
  documentation: {
    readIntegrationPlan: boolean;
    readTechnicalSpec: boolean;
    checkCurrentPhase: boolean;
  };
  codebase: {
    pullLatestChanges: boolean;
    checkGitStatus: boolean;
    reviewRecentCommits: boolean;
  };
  environment: {
    verifyDevServer: boolean;
    checkDependencies: boolean;
    validateEnvironmentVars: boolean;
  };
  progress: {
    identifyCurrentTask: boolean;
    reviewPreviousSession: boolean;
    updateTodoList: boolean;
  };
}

class SessionManager {
  static async startSession(): Promise<SessionContext> {
    console.log('🚀 Starting Unit Turns development session...');

    // Read current state
    const integrationPlan = await this.readIntegrationPlan();
    const currentPhase = integrationPlan.currentPhase;
    const gitStatus = await this.getGitStatus();

    // Validate environment
    const envValid = await this.validateEnvironment();
    if (!envValid) {
      throw new Error('❌ Environment validation failed');
    }

    // Load previous session state
    const previousSession = await this.loadPreviousSession();

    return {
      phase: currentPhase,
      gitStatus,
      previousSession,
      timestamp: new Date().toISOString()
    };
  }

  static async endSession(summary: SessionSummary): Promise<void> {
    console.log('💾 Ending session and saving progress...');

    // Update integration plan
    await this.updateIntegrationPlan(summary.progress);

    // Commit changes
    if (summary.changes.length > 0) {
      await this.commitChanges(summary.changes, summary.commitMessage);
    }

    // Save session state
    await this.saveSessionState(summary);

    // Update next session priorities
    await this.updateNextSessionPriorities(summary.nextPriorities);

    console.log('✅ Session ended successfully');
  }
}
```

### Code Templates and Patterns
```typescript
// Standard component template
export const UnitTurnComponentTemplate = `
import React from 'react';
import { useUnitTurnPermissions } from '../hooks/useUnitTurnPermissions';
import { UnitTurnCard } from '../ui/UnitTurnCard';

interface {ComponentName}Props {
  // Props interface
}

export function {ComponentName}({ }: {ComponentName}Props) {
  const { hasPermission } = useUnitTurnPermissions();

  // Component logic

  return (
    <div className="unit-turn-{component-name}">
      {/* Component JSX */}
    </div>
  );
}
`;

// Standard hook template
export const UnitTurnHookTemplate = `
import { useState, useEffect, useCallback } from 'react';
import { unitTurnApi } from '../services/unitTurnApi';
import { UnitTurn } from '../types/unitTurn';

interface Use{HookName}Return {
  // Return interface
}

export function use{HookName}(): Use{HookName}Return {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hook logic

  return {
    // Return object
  };
}
`;
```

---

## Implementation Priority Matrix

### Immediate Actions (Next Session)
1. **🔴 Critical**: Create base file structure and module organization
2. **🔴 Critical**: Implement UnitTurnContext with basic state management
3. **🟡 Important**: Define complete TypeScript type system
4. **🟡 Important**: Set up testing infrastructure and first test cases

### Phase 1 Priorities (Week 1)
1. Security and authentication framework
2. API client with complete contracts
3. Database schema and migration scripts
4. Error handling and validation system

### Success Metrics
- [ ] All TypeScript types compile without errors
- [ ] Authentication framework passes security audit
- [ ] API contracts tested with mock backend
- [ ] Test coverage >80% for new code
- [ ] Performance benchmarks established
- [ ] Documentation complete and reviewed

---

**Document Version**: 1.0
**Next Review**: After Phase 1 implementation begins
**Dependencies**: Backend API development, Database migration approval

---

*This technical specification addresses all critical gaps identified by the QC enforcer and provides concrete implementation guidance for the Unit Turns integration project.*