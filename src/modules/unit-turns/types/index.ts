// Unit Turns Module - Type Exports
// Database-aligned types that integrate with existing app architecture

// Core unit turn types
export type {
  UnitTurnInstance,
  UnitTurnLineItem,
  AccountingCostCode,
  User,
  Community,
  UnitTurnPhoto,
  UnitTurnSummary,
  SectionSummary,
  UnitTurnStatus,
  UserRole,

  // Backend/API request types
  UnitTurnInstanceBackend,
  UnitTurnLineItemBackend,
  AccountingCostCodeBackend,
  UserBackend,
  CreateUnitTurnInstanceRequest,
  UpdateUnitTurnInstanceRequest,
  CreateUnitTurnLineItemRequest,
  UpdateUnitTurnLineItemRequest
} from './unitTurn';

// API and query types
export type {
  GetUnitTurnInstancesParams,
  GetUnitTurnLineItemsParams,
  ExportFormat,
  ExportUnitTurnRequest,
  ExportUnitTurnResult,
  BulkUpdateLineItemsRequest,
  BulkUpdateResult,
  UnitTurnTemplate,
  TemplateSection,
  TemplateLineItem,
  CreateFromTemplateRequest,
  UnitTurnPhotoUploadRequest,
  UnitTurnPhotoUploadResult,

  // Response types
  UnitTurnInstanceResponse,
  UnitTurnInstanceListResponse,
  UnitTurnLineItemResponse,
  UnitTurnLineItemListResponse,
  AccountingCostCodeListResponse,
  UnitTurnSummaryResponse,
  ExportUnitTurnResponse,
  BulkUpdateResponse,
  UnitTurnPhotoUploadResponse
} from './api';

// Re-export existing app types for convenience
export type { Property, PhotoData, ApiResponse } from '../../../types';

// Import the types we need for utilities
import type {
  UnitTurnStatus,
  UserRole,
  UnitTurnInstanceBackend,
  UnitTurnInstance,
  UnitTurnLineItemBackend,
  UnitTurnLineItem,
  AccountingCostCodeBackend,
  AccountingCostCode,
  UserBackend,
  User
} from './unitTurn';

// Type guards aligned with database constraints
export const isUnitTurnStatus = (status: string): status is UnitTurnStatus => {
  return ['draft', 'in_progress', 'completed', 'exported'].includes(status);
};

export const isUserRole = (role: string): role is UserRole => {
  return ['admin', 'property_manager', 'inspector', 'viewer'].includes(role);
};

export const isGLClassification = (classification: string): classification is 'UT' | 'R&M' | 'Cap Ex' => {
  return ['UT', 'R&M', 'Cap Ex'].includes(classification);
};

// Constants matching database values
export const UNIT_TURN_STATUS_LABELS: Record<UnitTurnStatus, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  completed: 'Completed',
  exported: 'Exported'
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  property_manager: 'Property Manager',
  inspector: 'Inspector',
  viewer: 'Viewer'
};

export const GL_CLASSIFICATION_LABELS: Record<'UT' | 'R&M' | 'Cap Ex', string> = {
  'UT': 'Unit Turn',
  'R&M': 'Repair & Maintenance',
  'Cap Ex': 'Capital Expenditure'
};

// Utility functions for data transformation
export const transformBackendUnitTurnInstance = (backend: UnitTurnInstanceBackend): UnitTurnInstance => {

  return {
    id: backend.id,
    propertyId: backend.property_id,
    communityId: backend.community_id,
    templateName: backend.template_name,
    totalProjectCost: backend.total_project_cost,
    totalDamageCharges: backend.total_damage_charges,
    status: backend.status,
    createdBy: backend.created_by,
    savedAt: backend.saved_at,
    lastModifiedAt: backend.last_modified_at,
    exportedAt: backend.exported_at,
    notes: backend.notes,
    version: backend.version
  };
};

export const transformBackendUnitTurnLineItem = (backend: UnitTurnLineItemBackend): UnitTurnLineItem => ({
  id: backend.id,
  unitTurnInstanceId: backend.unit_turn_instance_id,
  costCode: backend.cost_code,
  sectionName: backend.section_name,
  description: backend.description,
  areaContext: backend.area_context,
  quantity: backend.quantity,
  units: backend.units,
  costPerUnit: backend.cost_per_unit,
  lineTotal: backend.line_total,
  damageAmount: backend.damage_amount,
  itemNotes: backend.item_notes,
  orderIndex: backend.order_index,
  createdAt: backend.created_at,
  updatedAt: backend.updated_at,
  version: backend.version
});

export const transformBackendAccountingCostCode = (backend: AccountingCostCodeBackend): AccountingCostCode => ({
  id: backend.id,
  code: backend.code,
  glAccountNumber: backend.gl_account_number,
  description: backend.description,
  glClassification: backend.gl_classification,
  isActive: backend.is_active,
  effectiveDate: backend.effective_date,
  createdAt: backend.created_at,
  updatedAt: backend.updated_at
});

export const transformBackendUser = (backend: UserBackend): User => ({
  id: backend.id,
  email: backend.email,
  firstName: backend.first_name,
  lastName: backend.last_name,
  role: backend.role,
  phone: backend.phone,
  createdAt: backend.created_at,
  updatedAt: backend.updated_at,
  fullName: `${backend.first_name} ${backend.last_name}`
});