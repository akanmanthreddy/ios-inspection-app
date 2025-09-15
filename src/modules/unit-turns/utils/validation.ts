// Unit Turn Validation Functions
// Runtime validation matching database constraints

import type {
  UnitTurnInstance,
  UnitTurnLineItem,
  CreateUnitTurnInstanceRequest,
  CreateUnitTurnLineItemRequest,
  UnitTurnStatus,
  UserRole
} from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Core validation utilities
export const validateUnitTurnStatus = (status: string): ValidationResult => {
  const validStatuses: UnitTurnStatus[] = ['draft', 'in_progress', 'completed', 'exported'];
  return {
    isValid: validStatuses.includes(status as UnitTurnStatus),
    errors: validStatuses.includes(status as UnitTurnStatus)
      ? []
      : [`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`]
  };
};

export const validateUserRole = (role: string): ValidationResult => {
  const validRoles: UserRole[] = ['admin', 'property_manager', 'inspector', 'viewer'];
  return {
    isValid: validRoles.includes(role as UserRole),
    errors: validRoles.includes(role as UserRole)
      ? []
      : [`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`]
  };
};

export const validateGLClassification = (classification: string): ValidationResult => {
  const validClassifications = ['UT', 'R&M', 'Cap Ex'];
  return {
    isValid: validClassifications.includes(classification),
    errors: validClassifications.includes(classification)
      ? []
      : [`Invalid GL classification: ${classification}. Must be one of: ${validClassifications.join(', ')}`]
  };
};

// Numeric validation (matching database CHECK constraints)
export const validateNonNegative = (value: number, fieldName: string): ValidationResult => {
  return {
    isValid: value >= 0,
    errors: value >= 0 ? [] : [`${fieldName} must be >= 0, got: ${value}`]
  };
};

export const validatePositive = (value: number, fieldName: string): ValidationResult => {
  return {
    isValid: value > 0,
    errors: value > 0 ? [] : [`${fieldName} must be > 0, got: ${value}`]
  };
};

export const validateUUID = (value: string, fieldName: string): ValidationResult => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return {
    isValid: uuidRegex.test(value),
    errors: uuidRegex.test(value) ? [] : [`${fieldName} must be a valid UUID, got: ${value}`]
  };
};

// Complex validation functions
export const validateCreateUnitTurnInstanceRequest = (request: CreateUnitTurnInstanceRequest): ValidationResult => {
  const errors: string[] = [];

  // Validate required UUIDs
  const propertyIdValidation = validateUUID(request.property_id, 'property_id');
  if (!propertyIdValidation.isValid) {
    errors.push(...propertyIdValidation.errors);
  }

  const communityIdValidation = validateUUID(request.community_id, 'community_id');
  if (!communityIdValidation.isValid) {
    errors.push(...communityIdValidation.errors);
  }

  // Validate template name if provided
  if (request.template_name && request.template_name.trim().length === 0) {
    errors.push('template_name cannot be empty string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateCreateUnitTurnLineItemRequest = (request: CreateUnitTurnLineItemRequest): ValidationResult => {
  const errors: string[] = [];

  // Validate UUID
  const instanceIdValidation = validateUUID(request.unit_turn_instance_id, 'unit_turn_instance_id');
  if (!instanceIdValidation.isValid) {
    errors.push(...instanceIdValidation.errors);
  }

  // Validate cost_code (must be positive integer)
  if (!Number.isInteger(request.cost_code) || request.cost_code <= 0) {
    errors.push(`cost_code must be a positive integer, got: ${request.cost_code}`);
  }

  // Validate required strings
  if (!request.section_name || request.section_name.trim().length === 0) {
    errors.push('section_name is required and cannot be empty');
  }

  if (!request.description || request.description.trim().length === 0) {
    errors.push('description is required and cannot be empty');
  }

  // Validate numeric constraints (matching database CHECK constraints)
  const quantityValidation = validateNonNegative(request.quantity, 'quantity');
  if (!quantityValidation.isValid) {
    errors.push(...quantityValidation.errors);
  }

  const costPerUnitValidation = validateNonNegative(request.cost_per_unit, 'cost_per_unit');
  if (!costPerUnitValidation.isValid) {
    errors.push(...costPerUnitValidation.errors);
  }

  if (request.damage_amount !== undefined) {
    const damageValidation = validateNonNegative(request.damage_amount, 'damage_amount');
    if (!damageValidation.isValid) {
      errors.push(...damageValidation.errors);
    }
  }

  // Validate order_index (must be non-negative integer)
  if (!Number.isInteger(request.order_index) || request.order_index < 0) {
    errors.push(`order_index must be a non-negative integer, got: ${request.order_index}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateUnitTurnInstance = (instance: UnitTurnInstance): ValidationResult => {
  const errors: string[] = [];

  // Validate UUIDs
  const idValidation = validateUUID(instance.id, 'id');
  if (!idValidation.isValid) {
    errors.push(...idValidation.errors);
  }

  const propertyIdValidation = validateUUID(instance.propertyId, 'propertyId');
  if (!propertyIdValidation.isValid) {
    errors.push(...propertyIdValidation.errors);
  }

  const communityIdValidation = validateUUID(instance.communityId, 'communityId');
  if (!communityIdValidation.isValid) {
    errors.push(...communityIdValidation.errors);
  }

  // Validate status
  const statusValidation = validateUnitTurnStatus(instance.status);
  if (!statusValidation.isValid) {
    errors.push(...statusValidation.errors);
  }

  // Validate financial constraints
  const projectCostValidation = validateNonNegative(instance.totalProjectCost, 'totalProjectCost');
  if (!projectCostValidation.isValid) {
    errors.push(...projectCostValidation.errors);
  }

  const damageChargesValidation = validateNonNegative(instance.totalDamageCharges, 'totalDamageCharges');
  if (!damageChargesValidation.isValid) {
    errors.push(...damageChargesValidation.errors);
  }

  // Validate version (must be positive)
  const versionValidation = validatePositive(instance.version, 'version');
  if (!versionValidation.isValid) {
    errors.push(...versionValidation.errors);
  }

  // Validate template name
  if (!instance.templateName || instance.templateName.trim().length === 0) {
    errors.push('templateName is required and cannot be empty');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateUnitTurnLineItem = (item: UnitTurnLineItem): ValidationResult => {
  const errors: string[] = [];

  // Validate UUIDs
  const idValidation = validateUUID(item.id, 'id');
  if (!idValidation.isValid) {
    errors.push(...idValidation.errors);
  }

  const instanceIdValidation = validateUUID(item.unitTurnInstanceId, 'unitTurnInstanceId');
  if (!instanceIdValidation.isValid) {
    errors.push(...instanceIdValidation.errors);
  }

  // Validate cost code
  if (!Number.isInteger(item.costCode) || item.costCode <= 0) {
    errors.push(`costCode must be a positive integer, got: ${item.costCode}`);
  }

  // Validate required strings
  if (!item.sectionName || item.sectionName.trim().length === 0) {
    errors.push('sectionName is required and cannot be empty');
  }

  if (!item.description || item.description.trim().length === 0) {
    errors.push('description is required and cannot be empty');
  }

  if (!item.units || item.units.trim().length === 0) {
    errors.push('units is required and cannot be empty');
  }

  // Validate numeric constraints
  const quantityValidation = validateNonNegative(item.quantity, 'quantity');
  if (!quantityValidation.isValid) {
    errors.push(...quantityValidation.errors);
  }

  const costPerUnitValidation = validateNonNegative(item.costPerUnit, 'costPerUnit');
  if (!costPerUnitValidation.isValid) {
    errors.push(...costPerUnitValidation.errors);
  }

  const damageValidation = validateNonNegative(item.damageAmount, 'damageAmount');
  if (!damageValidation.isValid) {
    errors.push(...damageValidation.errors);
  }

  // Validate version
  const versionValidation = validatePositive(item.version, 'version');
  if (!versionValidation.isValid) {
    errors.push(...versionValidation.errors);
  }

  // Validate order index
  if (!Number.isInteger(item.orderIndex) || item.orderIndex < 0) {
    errors.push(`orderIndex must be a non-negative integer, got: ${item.orderIndex}`);
  }

  // Validate line total calculation if present
  if (item.lineTotal !== null) {
    const expectedTotal = item.quantity * item.costPerUnit;
    if (Math.abs(item.lineTotal - expectedTotal) > 0.01) { // Allow for small floating point differences
      errors.push(`lineTotal mismatch: expected ${expectedTotal}, got ${item.lineTotal}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Utility function to combine multiple validation results
export const combineValidationResults = (results: ValidationResult[]): ValidationResult => {
  const allErrors = results.flatMap(result => result.errors);
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};