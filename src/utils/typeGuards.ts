// Type guards and validation utilities
import type { 
  Community, 
  Property, 
  Inspection, 
  InspectionIssue, 
  ApiResponse,
  FormState 
} from '../types'

// Type guard utilities
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value)
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null
}

export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0
}

export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime())
}

export function isValidDateString(value: unknown): value is string {
  if (!isString(value)) return false
  const date = new Date(value)
  return isValidDate(date)
}

// API Response type guards
export function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return (
    isObject(value) &&
    'success' in value &&
    isBoolean(value.success) &&
    'data' in value
  )
}

export function isSuccessfulApiResponse<T>(value: unknown): value is ApiResponse<T> & { success: true } {
  return isApiResponse<T>(value) && value.success === true
}

// Domain object type guards
export function isCommunity(value: unknown): value is Community {
  return (
    isObject(value) &&
    'id' in value && isString(value.id) &&
    'name' in value && isString(value.name) &&
    'status' in value && ['active', 'under-construction', 'sold'].includes(value.status as string) &&
    'location' in value && isString(value.location) &&
    'totalUnits' in value && isNumber(value.totalUnits) &&
    'createdAt' in value && isValidDateString(value.createdAt) &&
    'updatedAt' in value && isValidDateString(value.updatedAt)
  )
}

export function isProperty(value: unknown): value is Property {
  return (
    isObject(value) &&
    'id' in value && isString(value.id) &&
    'communityId' in value && isString(value.communityId) &&
    'address' in value && isString(value.address) &&
    'propertyType' in value && isString(value.propertyType) &&
    'status' in value && ['active', 'under-construction', 'sold'].includes(value.status as string) &&
    'inspector' in value && isString(value.inspector) &&
    'issues' in value && isNumber(value.issues) &&
    'createdAt' in value && isValidDateString(value.createdAt) &&
    'updatedAt' in value && isValidDateString(value.updatedAt)
  )
}

export function isInspectionIssue(value: unknown): value is InspectionIssue {
  return (
    isObject(value) &&
    'id' in value && isString(value.id) &&
    'category' in value && isString(value.category) &&
    'description' in value && isString(value.description) &&
    'severity' in value && ['low', 'medium', 'high', 'critical'].includes(value.severity as string) &&
    'resolved' in value && isBoolean(value.resolved)
  )
}

export function isInspection(value: unknown): value is Inspection {
  return (
    isObject(value) &&
    'id' in value && isString(value.id) &&
    'propertyId' in value && isString(value.propertyId) &&
    'inspectorName' in value && isString(value.inspectorName) &&
    'date' in value && isValidDateString(value.date) &&
    'status' in value && ['scheduled', 'in-progress', 'completed', 'requires-follow-up'].includes(value.status as string) &&
    'type' in value && ['routine', 'move-in', 'move-out', 'maintenance'].includes(value.type as string) &&
    'issues' in value && isArray(value.issues) && value.issues.every(isInspectionIssue) &&
    'createdAt' in value && isValidDateString(value.createdAt) &&
    'updatedAt' in value && isValidDateString(value.updatedAt)
  )
}

// Form validation type guards
export function isValidFormState<T extends Record<string, any>>(
  value: unknown
): value is FormState<T> {
  return (
    isObject(value) &&
    'data' in value && isObject(value.data) &&
    'errors' in value && isObject(value.errors) &&
    'touched' in value && isObject(value.touched) &&
    'isSubmitting' in value && isBoolean(value.isSubmitting) &&
    'isValid' in value && isBoolean(value.isValid)
  )
}

// Array type guards for collections
export function isCommunityArray(value: unknown): value is Community[] {
  return isArray(value) && value.every(isCommunity)
}

export function isPropertyArray(value: unknown): value is Property[] {
  return isArray(value) && value.every(isProperty)
}

export function isInspectionArray(value: unknown): value is Inspection[] {
  return isArray(value) && value.every(isInspection)
}

// Utility functions for type assertion
export function assertIsString(value: unknown, fieldName?: string): asserts value is string {
  if (!isString(value)) {
    throw new TypeError(`Expected string${fieldName ? ` for ${fieldName}` : ''}, got ${typeof value}`)
  }
}

export function assertIsNumber(value: unknown, fieldName?: string): asserts value is number {
  if (!isNumber(value)) {
    throw new TypeError(`Expected number${fieldName ? ` for ${fieldName}` : ''}, got ${typeof value}`)
  }
}

export function assertIsDefined<T>(value: T | undefined | null, fieldName?: string): asserts value is T {
  if (!isDefined(value)) {
    throw new Error(`Expected defined value${fieldName ? ` for ${fieldName}` : ''}, got ${value}`)
  }
}

export function assertIsCommunity(value: unknown): asserts value is Community {
  if (!isCommunity(value)) {
    throw new TypeError('Expected Community object')
  }
}

export function assertIsProperty(value: unknown): asserts value is Property {
  if (!isProperty(value)) {
    throw new TypeError('Expected Property object')
  }
}

export function assertIsInspection(value: unknown): asserts value is Inspection {
  if (!isInspection(value)) {
    throw new TypeError('Expected Inspection object')
  }
}

// Validation utilities
export function validateRequired<T>(value: T | undefined | null, fieldName: string): T {
  if (!isDefined(value)) {
    throw new Error(`${fieldName} is required`)
  }
  return value
}

export function validateStringLength(
  value: string, 
  min: number = 0, 
  max: number = Infinity, 
  fieldName: string = 'Value'
): string {
  if (value.length < min) {
    throw new Error(`${fieldName} must be at least ${min} characters long`)
  }
  if (value.length > max) {
    throw new Error(`${fieldName} must be no more than ${max} characters long`)
  }
  return value
}

export function validateNumberRange(
  value: number, 
  min: number = -Infinity, 
  max: number = Infinity, 
  fieldName: string = 'Value'
): number {
  if (value < min) {
    throw new Error(`${fieldName} must be at least ${min}`)
  }
  if (value > max) {
    throw new Error(`${fieldName} must be no more than ${max}`)
  }
  return value
}

export function validateEmail(value: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    throw new Error('Invalid email address')
  }
  return value
}

export function validateUrl(value: string): string {
  try {
    new URL(value)
    return value
  } catch {
    throw new Error('Invalid URL')
  }
}

// Safe parsing utilities
export function safeParseJson<T = unknown>(value: string): T | null {
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export function safeParseNumber(value: unknown): number | null {
  const num = Number(value)
  return isNaN(num) ? null : num
}

export function safeParseDate(value: unknown): Date | null {
  if (value instanceof Date) return value
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    return isValidDate(date) ? date : null
  }
  return null
}