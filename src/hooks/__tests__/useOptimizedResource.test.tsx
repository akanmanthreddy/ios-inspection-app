import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useOptimizedResource } from '../useOptimizedResource'

interface TestItem {
  id: string
  name: string
  value: number
}

interface CreateTestItemData {
  name: string
  value: number
}

describe('useOptimizedResource', () => {
  const mockItems: TestItem[] = [
    { id: '1', name: 'Item 1', value: 10 },
    { id: '2', name: 'Item 2', value: 20 },
  ]

  const createMockOptions = (overrides = {}) => ({
    fetcher: vi.fn().mockResolvedValue(mockItems),
    creator: vi.fn().mockImplementation((data: CreateTestItemData) => 
      Promise.resolve({ id: '3', ...data })
    ),
    updater: vi.fn().mockImplementation((id: string, data: Partial<CreateTestItemData>) =>
      Promise.resolve({ id, name: 'Updated', value: 99, ...data })
    ),
    remover: vi.fn().mockResolvedValue(undefined),
    generateId: vi.fn().mockReturnValue('temp-id'),
    createOptimisticItem: vi.fn().mockImplementation((data: CreateTestItemData) => 
      ({ id: '', ...data })
    ),
    ...overrides
  })

  it('fetches data on mount', async () => {
    const options = createMockOptions()
    const { result } = renderHook(() => useOptimizedResource<TestItem, CreateTestItemData>(options))

    // Initially loading
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toEqual([])

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockItems)
    expect(options.fetcher).toHaveBeenCalledOnce()
  })

  it('handles fetch errors', async () => {
    const error = new Error('Fetch failed')
    const options = createMockOptions({
      fetcher: vi.fn().mockRejectedValue(error)
    })

    const { result } = renderHook(() => useOptimizedResource<TestItem, CreateTestItemData>(options))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Fetch failed')
    expect(result.current.data).toEqual([])
  })

  it('creates items with optimistic updates', async () => {
    const options = createMockOptions()
    const { result } = renderHook(() => useOptimizedResource<TestItem, CreateTestItemData>(options))

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const createData = { name: 'New Item', value: 30 }
    const createPromise = result.current.create(createData)

    // Check optimistic update
    expect(result.current.data).toHaveLength(3)
    expect(result.current.data[2]).toMatchObject({
      id: 'temp-id',
      ...createData
    })
    expect(result.current.isOptimistic).toBe(true)

    // Wait for completion
    await createPromise

    // Check final state
    expect(result.current.data).toHaveLength(3)
    expect(result.current.data[2]).toMatchObject({
      id: '3',
      ...createData
    })
    expect(result.current.isOptimistic).toBe(false)
    expect(options.creator).toHaveBeenCalledWith(createData)
  })

  it('rolls back failed creates', async () => {
    const error = new Error('Create failed')
    const options = createMockOptions({
      creator: vi.fn().mockRejectedValue(error)
    })

    const { result } = renderHook(() => useOptimizedResource<TestItem, CreateTestItemData>(options))

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const initialLength = result.current.data.length

    try {
      await result.current.create({ name: 'Failed Item', value: 99 })
    } catch (e) {
      // Expected to throw
    }

    // Check rollback
    expect(result.current.data).toHaveLength(initialLength)
    expect(result.current.error).toBe('Create failed')
    expect(result.current.isOptimistic).toBe(false)
  })

  it('updates items with optimistic updates', async () => {
    const options = createMockOptions()
    const { result } = renderHook(() => useOptimizedResource<TestItem, CreateTestItemData>(options))

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const updateData = { name: 'Updated Name' }
    const updatePromise = result.current.update('1', updateData)

    // Check optimistic update
    expect(result.current.data[0]).toMatchObject({
      id: '1',
      name: 'Updated Name',
      value: 10
    })
    expect(result.current.isOptimistic).toBe(true)

    // Wait for completion
    await updatePromise

    // Check final state
    expect(result.current.isOptimistic).toBe(false)
    expect(options.updater).toHaveBeenCalledWith('1', updateData)
  })

  it('rolls back failed updates', async () => {
    const error = new Error('Update failed')
    const options = createMockOptions({
      updater: vi.fn().mockRejectedValue(error)
    })

    const { result } = renderHook(() => useOptimizedResource<TestItem, CreateTestItemData>(options))

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const originalItem = result.current.data[0]

    try {
      await result.current.update('1', { name: 'Failed Update' })
    } catch (e) {
      // Expected to throw
    }

    // Check rollback
    expect(result.current.data[0]).toEqual(originalItem)
    expect(result.current.error).toBe('Update failed')
    expect(result.current.isOptimistic).toBe(false)
  })

  it('removes items with optimistic updates', async () => {
    const options = createMockOptions()
    const { result } = renderHook(() => useOptimizedResource<TestItem, CreateTestItemData>(options))

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const initialLength = result.current.data.length
    const removePromise = result.current.remove('1')

    // Check optimistic update
    expect(result.current.data).toHaveLength(initialLength - 1)
    expect(result.current.data.find(item => item.id === '1')).toBeUndefined()
    expect(result.current.isOptimistic).toBe(true)

    // Wait for completion
    await removePromise

    // Check final state
    expect(result.current.isOptimistic).toBe(false)
    expect(options.remover).toHaveBeenCalledWith('1')
  })

  it('rolls back failed removes', async () => {
    const error = new Error('Remove failed')
    const options = createMockOptions({
      remover: vi.fn().mockRejectedValue(error)
    })

    const { result } = renderHook(() => useOptimizedResource<TestItem, CreateTestItemData>(options))

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const originalData = [...result.current.data]

    try {
      await result.current.remove('1')
    } catch (e) {
      // Expected to throw
    }

    // Check rollback
    expect(result.current.data).toEqual(originalData)
    expect(result.current.error).toBe('Remove failed')
    expect(result.current.isOptimistic).toBe(false)
  })

  it('clears errors', () => {
    const options = createMockOptions({
      fetcher: vi.fn().mockRejectedValue(new Error('Test error'))
    })

    const { result } = renderHook(() => useOptimizedResource<TestItem, CreateTestItemData>(options))

    // Wait for error
    waitFor(() => {
      expect(result.current.error).toBe('Test error')
    })

    // Clear error
    result.current.clearError()
    expect(result.current.error).toBeNull()
  })

  it('refetches data', async () => {
    const options = createMockOptions()
    const { result } = renderHook(() => useOptimizedResource<TestItem, CreateTestItemData>(options))

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(options.fetcher).toHaveBeenCalledTimes(1)

    // Refetch
    await result.current.refetch()

    expect(options.fetcher).toHaveBeenCalledTimes(2)
  })
})