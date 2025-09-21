// Unit Turn API Types - Simplified to avoid duplication
// Extends existing app API patterns

import type { ApiResponse } from '../../../types';
import type {
  UnitTurnInstance,
  UnitTurnLineItem,
  AccountingCostCode,
  UnitTurnSummary,
  UnitTurnStatus,
  UpdateUnitTurnLineItemRequest
} from './unitTurn';

// Query parameters for listing unit turns
export interface GetUnitTurnInstancesParams {
  property_id?: string;
  community_id?: string;
  status?: UnitTurnStatus[];
  created_by?: string;
  date_from?: string; // ISO date
  date_to?: string; // ISO date
  search?: string;
  sort_by?: 'saved_at' | 'last_modified_at' | 'total_project_cost' | 'status';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface GetUnitTurnLineItemsParams {
  unit_turn_instance_id: string;
  section_name?: string;
  cost_code?: number;
  sort_by?: 'order_index' | 'cost_code' | 'line_total';
  sort_order?: 'asc' | 'desc';
}

// Export functionality
export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface ExportUnitTurnRequest {
  instance_id: string;
  format: ExportFormat;
  include_photos?: boolean;
  include_notes?: boolean;
}

export interface ExportUnitTurnResult {
  download_url: string;
  expires_at: string;
  format: ExportFormat;
}

// Bulk operations
export interface BulkUpdateLineItemsRequest {
  line_item_ids: string[];
  updates: Partial<UpdateUnitTurnLineItemRequest>;
}

export interface BulkUpdateResult {
  successful_ids: string[];
  failed_updates: Array<{
    line_item_id: string;
    error: string;
  }>;
}

// Template management (for creating new instances)
export interface UnitTurnTemplate {
  name: string;
  sections: TemplateSection[];
}

export interface TemplateSection {
  name: string;
  items: TemplateLineItem[];
}

export interface TemplateLineItem {
  cost_code: number;
  description: string;
  area_context?: string;
  default_quantity: number;
  default_units: string;
  default_cost_per_unit: number;
  order_index: number;
}

export interface CreateFromTemplateRequest {
  property_id: string;
  community_id: string;
  template_name: string;
  notes?: string;
}

// Response types using existing ApiResponse wrapper
export type UnitTurnInstanceResponse = ApiResponse<UnitTurnInstance>;
export type UnitTurnInstanceListResponse = ApiResponse<UnitTurnInstance[]>;
export type UnitTurnLineItemResponse = ApiResponse<UnitTurnLineItem>;
export type UnitTurnLineItemListResponse = ApiResponse<UnitTurnLineItem[]>;
export type AccountingCostCodeListResponse = ApiResponse<AccountingCostCode[]>;
export type UnitTurnSummaryResponse = ApiResponse<UnitTurnSummary>;
export type ExportUnitTurnResponse = ApiResponse<ExportUnitTurnResult>;
export type BulkUpdateResponse = ApiResponse<BulkUpdateResult>;

// Photo upload (integrates with existing files table)
export interface UnitTurnPhotoUploadRequest {
  unit_turn_instance_id?: string;
  line_item_id?: string;
  file: File | Blob;
  caption?: string;
}

export interface UnitTurnPhotoUploadResult {
  file_id: string;
  file_path: string;
  entity_type: 'unit_turn_instance' | 'unit_turn_line_item';
  entity_id: string;
}

export type UnitTurnPhotoUploadResponse = ApiResponse<UnitTurnPhotoUploadResult>;