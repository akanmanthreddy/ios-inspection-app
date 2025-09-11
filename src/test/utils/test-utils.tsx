import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {/* Add any global providers here when they're implemented, e.g.:
      <AuthProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthProvider>
      */}
      {children}
    </div>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Helper to create mock functions
export const createMockFunction = <T extends (...args: any[]) => any>(
  implementation?: T
) => vi.fn(implementation)

// Helper to wait for async operations
export const waitForAsync = (ms = 0) => 
  new Promise(resolve => setTimeout(resolve, ms))

// Mock data generators
export const mockCommunity = (overrides = {}) => ({
  id: '1',
  name: 'Test Community',
  status: 'active' as const,
  location: 'Test Location',
  totalUnits: 10,
  description: 'Test Description',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides
})

export const mockProperty = (overrides = {}) => ({
  id: '1',
  communityId: '1',
  address: 'Test Address',
  propertyType: 'Apartment',
  status: 'active' as const,
  lastInspection: '2024-01-01',
  nextInspection: '2024-04-01',
  inspector: 'Test Inspector',
  issues: 0,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides
})

export const mockInspection = (overrides = {}) => ({
  id: '1',
  propertyId: '1',
  inspectorName: 'Test Inspector',
  date: '2024-01-01',
  status: 'scheduled' as const,
  type: 'routine' as const,
  issues: [],
  notes: 'Test notes',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides
})