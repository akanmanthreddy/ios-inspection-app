import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '..//../test/utils/test-utils'
import ErrorBoundary, { withErrorBoundary, useThrowError } from '../ErrorBoundary'

// Test component that throws an error
const ThrowError = ({ shouldThrow = false, message = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(message)
  }
  return <div>No error</div>
}

// Test component using the hook
const ComponentWithHook = ({ shouldThrow = false }) => {
  const throwError = useThrowError()
  
  if (shouldThrow) {
    throwError('Hook error')
  }
  
  return <div>Component with hook</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for cleaner test output
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('renders error UI when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} message="Test error message" />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('calls onError callback when provided', () => {
    const onError = vi.fn()
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} message="Callback test" />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('shows action buttons when enabled', () => {
    render(
      <ErrorBoundary showReload={true} showHome={true}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Try Again')).toBeInTheDocument()
    expect(screen.getByText('Reload Page')).toBeInTheDocument()
    expect(screen.getByText('Go Home')).toBeInTheDocument()
  })

  it('hides action buttons when disabled', () => {
    render(
      <ErrorBoundary showReload={false} showHome={false}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Try Again')).toBeInTheDocument() // Always shown
    expect(screen.queryByText('Reload Page')).not.toBeInTheDocument()
    expect(screen.queryByText('Go Home')).not.toBeInTheDocument()
  })

  it('recovers from error when Try Again is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Click Try Again
    screen.getByText('Try Again').click()

    // Rerender without error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })
})

describe('withErrorBoundary HOC', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('wraps component with error boundary', () => {
    const WrappedComponent = withErrorBoundary(ThrowError)
    
    render(<WrappedComponent shouldThrow={false} />)
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('catches errors from wrapped component', () => {
    const WrappedComponent = withErrorBoundary(ThrowError)
    
    render(<WrappedComponent shouldThrow={true} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('passes error boundary props correctly', () => {
    const onError = vi.fn()
    const WrappedComponent = withErrorBoundary(ThrowError, { onError })
    
    render(<WrappedComponent shouldThrow={true} />)
    expect(onError).toHaveBeenCalled()
  })
})

describe('useThrowError hook', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('throws string errors', () => {
    render(
      <ErrorBoundary>
        <ComponentWithHook shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Hook error')).toBeInTheDocument()
  })
})