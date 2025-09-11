// Central type definitions for the Property Inspection App
export * from '../services/api'

// UI State Types
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
  hasNext: boolean
  hasPrev: boolean
}

export interface FilterState<T = Record<string, any>> {
  filters: T
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

// Form Types
export interface FormState<T = Record<string, any>> {
  data: T
  errors: Record<keyof T, string>
  touched: Record<keyof T, boolean>
  isSubmitting: boolean
  isValid: boolean
}

export interface FormFieldProps<T = any> {
  name: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  value?: T
  onChange?: (value: T) => void
  error?: string
  helperText?: string
}

// Navigation Types
export type NavigationPage = 
  | 'landing'
  | 'communities' 
  | 'properties'
  | 'inspections'
  | 'inspections-overview'
  | 'start-inspection'
  | 'inspection-form'
  | 'completion-options'
  | 'report-template-selection'
  | 'report-preview'
  | 'property-reports'

export interface NavigationState {
  currentPage: NavigationPage
  previousPage?: NavigationPage
  navigationStack: NavigationPage[]
  params?: Record<string, string | number>
}

// Mobile App Types
export interface MobileAppState {
  isOnline: boolean
  deviceInfo: {
    platform: 'ios' | 'android' | 'web'
    version: string
    model?: string
  }
  permissions: {
    camera: boolean
    storage: boolean
    location: boolean
  }
  preferences: {
    theme: 'light' | 'dark' | 'system'
    notifications: boolean
    offlineMode: boolean
  }
}

// Camera and Media Types
export interface PhotoData {
  id: string
  uri: string
  base64?: string | undefined
  timestamp: number
  metadata?: {
    location?: {
      latitude: number
      longitude: number
    }
    orientation?: number | undefined
    width?: number | undefined
    height?: number | undefined
  }
}

export interface CameraOptions {
  quality?: number // 0-100
  allowEditing?: boolean
  resultType?: 'uri' | 'base64' | 'dataUrl'
  source?: 'camera' | 'photos' | 'prompt'
}

// Report Types
export interface ReportTemplate {
  id: string
  name: string
  description: string
  sections: ReportSection[]
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface ReportSection {
  id: string
  title: string
  description?: string
  fields: ReportField[]
  order: number
  required: boolean
}

export interface ReportField {
  id: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date' | 'photo' | 'signature'
  label: string
  description?: string
  required: boolean
  order: number
  options?: string[] // for select fields
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface GeneratedReport {
  id: string
  inspectionId: string
  templateId: string
  title: string
  content: ReportContent
  format: 'pdf' | 'excel' | 'json'
  url?: string
  generatedAt: string
  expiresAt?: string
}

export interface ReportContent {
  sections: {
    [sectionId: string]: {
      [fieldId: string]: any
    }
  }
  summary: {
    totalIssues: number
    criticalIssues: number
    completionPercentage: number
    estimatedCompletionTime?: string
  }
  attachments: PhotoData[]
}

// Event Types for Analytics/Tracking
export interface AppEvent {
  type: string
  timestamp: number
  data?: Record<string, any>
  userId?: string
  sessionId?: string
}

export interface InspectionEvent extends AppEvent {
  type: 'inspection_started' | 'inspection_completed' | 'inspection_paused' | 'issue_added' | 'photo_taken'
  inspectionId: string
  propertyId: string
}

// API Response Wrapper Types
export interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
  errors?: string[]
  meta?: {
    total?: number
    page?: number
    pageSize?: number
    hasNext?: boolean
    hasPrev?: boolean
  }
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: Record<string, any>
}

// Utility Types
export type Partial<T> = {
  [P in keyof T]?: T[P]
}

export type Required<T> = {
  [P in keyof T]-?: T[P]
}

export type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Hook return types
export interface AsyncState<T = any> {
  data: T | null
  loading: boolean
  error: string | null
  isOptimistic?: boolean
}

export interface MutationState<T = any> {
  data: T | null
  loading: boolean
  error: string | null
  mutate: (...args: any[]) => Promise<T>
  reset: () => void
}

// Environment and Configuration Types
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test'
  API_BASE_URL?: string
  SUPABASE_URL?: string
  SUPABASE_ANON_KEY?: string
  DEBUG?: boolean
  VERSION: string
}

// Storage Types
export interface StorageItem<T = any> {
  key: string
  value: T
  timestamp: number
  expiresAt?: number
}

export interface StorageOptions {
  encrypt?: boolean
  expiry?: number // in seconds
  group?: string
}

// Validation Types
export interface ValidationRule<T = any> {
  required?: boolean | string
  min?: number | string
  max?: number | string
  pattern?: RegExp | string
  custom?: (value: T) => boolean | string
  message?: string
}

export type ValidationSchema<T = Record<string, any>> = {
  [K in keyof T]?: ValidationRule<T[K]> | ValidationRule<T[K]>[];
};

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

// Component Prop Types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
  testId?: string
}

export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  text?: string
}

export interface ErrorProps extends BaseComponentProps {
  error: string | Error
  onRetry?: () => void
  showDetails?: boolean
}