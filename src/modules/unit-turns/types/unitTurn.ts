// Unit Turn Types - Database Schema Aligned
// Matches existing PostgreSQL database structure and app patterns

import type { Property, PhotoData, ApiResponse, Community } from '../../../types';

// Re-export existing types that we'll use
export type { Property, PhotoData, ApiResponse, Community };

// Database-aligned enums (matching CHECK constraints)
export type UnitTurnStatus = 'draft' | 'in_progress' | 'completed' | 'exported';

export type UserRole = 'admin' | 'property_manager' | 'inspector' | 'viewer';

// Backend response structure (snake_case as stored in database)
export interface UnitTurnInstanceBackend {
  id: string; // UUID
  property_id: string; // UUID, foreign key to properties
  community_id: string; // UUID, foreign key to communities
  template_name: string;
  total_project_cost: number; // numeric/decimal in DB
  total_damage_charges: number; // numeric/decimal in DB
  status: UnitTurnStatus;
  created_by: string | null; // UUID, foreign key to users
  saved_at: string; // timestamp with time zone
  last_modified_at: string; // timestamp with time zone
  exported_at: string | null; // timestamp with time zone
  notes: string | null;
  version: number; // integer with CHECK > 0
}

export interface UnitTurnLineItemBackend {
  id: string; // UUID
  unit_turn_instance_id: string; // UUID, foreign key
  cost_code: number; // integer, foreign key to accounting_cost_codes
  section_name: string;
  description: string;
  area_context: string | null;
  quantity: number; // numeric with CHECK >= 0
  units: string; // default 'ls'
  cost_per_unit: number; // numeric with CHECK >= 0
  line_total: number | null; // computed: quantity * cost_per_unit
  damage_amount: number; // numeric with CHECK >= 0, default 0.00
  item_notes: string | null;
  order_index: number; // integer with CHECK >= 0
  created_at: string; // timestamp with time zone
  updated_at: string; // timestamp with time zone
  version: number; // integer with CHECK > 0
}

export interface AccountingCostCodeBackend {
  id: string; // UUID
  code: number; // integer, unique
  gl_account_number: string;
  description: string;
  gl_classification: 'UT' | 'R&M' | 'Cap Ex'; // CHECK constraint
  is_active: boolean;
  effective_date: string; // date
  created_at: string; // timestamp with time zone
  updated_at: string; // timestamp with time zone
}

// User from existing database (frontend-safe, no sensitive fields)
export interface UserBackend {
  id: string; // UUID
  email: string; // unique
  first_name: string;
  last_name: string;
  role: UserRole;
  phone: string | null;
  created_at: string; // timestamp with time zone
  updated_at: string; // timestamp with time zone
}

// Frontend types (camelCase for app usage)
export interface UnitTurnInstance {
  id: string;
  propertyId: string;
  communityId: string;
  templateName: string;
  totalProjectCost: number;
  totalDamageCharges: number;
  status: UnitTurnStatus;
  createdBy: string | null;
  savedAt: string;
  lastModifiedAt: string;
  exportedAt: string | null;
  notes: string | null;
  version: number;

  // Populated fields
  property?: Property;
  community?: Community;
  createdByUser?: User;
  lineItems?: UnitTurnLineItem[];
}

export interface UnitTurnLineItem {
  id: string;
  unitTurnInstanceId: string;
  costCode: number;
  sectionName: string;
  description: string;
  areaContext: string | null;
  quantity: number;
  units: string;
  costPerUnit: number;
  lineTotal: number | null;
  damageAmount: number;
  itemNotes: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  version: number;

  // Populated fields
  costCodeInfo?: AccountingCostCode;
}

export interface AccountingCostCode {
  id: string;
  code: number;
  glAccountNumber: string;
  description: string;
  glClassification: 'UT' | 'R&M' | 'Cap Ex';
  isActive: boolean;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone: string | null;
  createdAt: string;
  updatedAt: string;

  // Computed fields
  fullName: string;
}

// Note: Community type imported from existing app types

// Photo integration with existing files table
export interface UnitTurnPhoto extends PhotoData {
  // Additional fields for unit turn context
  unitTurnInstanceId: string;
  lineItemId?: string;
  caption?: string;

  // Files table integration
  fileId?: string; // Links to files.id
  entityType: 'unit_turn_instance' | 'unit_turn_line_item';
  entityId: string;
}

// API request/response types
export interface CreateUnitTurnInstanceRequest {
  property_id: string;
  community_id: string;
  template_name?: string;
  notes?: string;
}

export interface UpdateUnitTurnInstanceRequest {
  template_name?: string;
  total_project_cost?: number;
  total_damage_charges?: number;
  status?: UnitTurnStatus;
  notes?: string;
}

export interface CreateUnitTurnLineItemRequest {
  unit_turn_instance_id: string;
  cost_code: number;
  section_name: string;
  description: string;
  area_context?: string;
  quantity: number;
  units?: string;
  cost_per_unit: number;
  damage_amount?: number;
  item_notes?: string;
  order_index: number;
}

export interface UpdateUnitTurnLineItemRequest {
  cost_code?: number;
  section_name?: string;
  description?: string;
  area_context?: string;
  quantity?: number;
  units?: string;
  cost_per_unit?: number;
  damage_amount?: number;
  item_notes?: string;
  order_index?: number;
}

// Response types
export type UnitTurnInstanceResponse = ApiResponse<UnitTurnInstance>;
export type UnitTurnInstanceListResponse = ApiResponse<UnitTurnInstance[]>;
export type UnitTurnLineItemResponse = ApiResponse<UnitTurnLineItem>;
export type AccountingCostCodeListResponse = ApiResponse<AccountingCostCode[]>;

// Summary/calculated types
export interface UnitTurnSummary {
  instanceId: string;
  totalLineItems: number;
  totalProjectCost: number;
  totalDamageCharges: number;
  grandTotal: number;
  sectionSummaries: SectionSummary[];
  lastModified: string;
}

export interface SectionSummary {
  sectionName: string;
  itemCount: number;
  totalCost: number;
  totalDamage: number;
  sectionTotal: number;
}