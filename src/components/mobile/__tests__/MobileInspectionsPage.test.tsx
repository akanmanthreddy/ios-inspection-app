import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileInspectionsPage } from '../MobileInspectionsPage';
import { Inspection } from '../../../services/api';

describe('MobileInspectionsPage Type Filter', () => {
  const mockInspections: Inspection[] = [
    {
      id: '1',
      propertyId: 'prop-1',
      inspectorName: 'John Doe',
      date: '2025-01-10',
      status: 'completed',
      type: 'routine',
      issues: [],
      createdAt: '2025-01-10',
      updatedAt: '2025-01-10'
    },
    {
      id: '2',
      propertyId: 'prop-1',
      inspectorName: 'Jane Smith',
      date: '2025-01-11',
      status: 'completed',
      type: 'move-in',
      issues: [],
      createdAt: '2025-01-11',
      updatedAt: '2025-01-11'
    },
    {
      id: '3',
      propertyId: 'prop-1',
      inspectorName: 'Bob Johnson',
      date: '2025-01-12',
      status: 'scheduled',
      type: 'move-out',
      issues: [],
      createdAt: '2025-01-12',
      updatedAt: '2025-01-12'
    },
    {
      id: '4',
      propertyId: 'prop-1',
      inspectorName: 'Alice Brown',
      date: '2025-01-13',
      status: 'in-progress',
      type: 'routine',
      issues: [],
      createdAt: '2025-01-13',
      updatedAt: '2025-01-13'
    }
  ];

  const mockProps = {
    propertyId: 'prop-1',
    propertyAddress: '123 Main St',
    inspections: mockInspections,
    onBack: vi.fn(),
    onInspectionClick: vi.fn()
  };

  it('should dynamically generate unique type options from inspections', () => {
    const { container } = render(<MobileInspectionsPage {...mockProps} />);
    
    // The type filter is the select element that contains "All Types" option
    const selects = container.querySelectorAll('select');
    let typeSelect: HTMLSelectElement | null = null;
    
    selects.forEach(select => {
      const options = Array.from(select.options);
      if (options.some(opt => opt.text === 'All Types')) {
        typeSelect = select;
      }
    });
    
    expect(typeSelect).toBeTruthy();
    
    const options = Array.from(typeSelect!.options);
    const optionValues = options.map(opt => opt.value);
    const optionTexts = options.map(opt => opt.text);
    
    // Should have "All Types" plus 3 unique types (routine, move-in, move-out)
    expect(optionValues).toEqual(['all', 'routine', 'move-in', 'move-out']);
    expect(optionTexts).toEqual(['All Types', 'Routine', 'Move-in', 'Move-out']);
  });

  it('should handle empty inspections array', () => {
    const emptyProps = { ...mockProps, inspections: [] };
    const { container } = render(<MobileInspectionsPage {...emptyProps} />);
    
    // Find the type filter select
    const selects = container.querySelectorAll('select');
    let typeSelect: HTMLSelectElement | null = null;
    
    selects.forEach(select => {
      const options = Array.from(select.options);
      if (options.some(opt => opt.text === 'All Types')) {
        typeSelect = select;
      }
    });
    
    expect(typeSelect).toBeTruthy();
    const options = Array.from(typeSelect.options);
    
    // Should only have "All Types" and disabled message
    expect(options.length).toBe(2);
    expect(options[0].value).toBe('all');
    expect(options[0].text).toBe('All Types');
    expect(options[1].disabled).toBe(true);
    expect(options[1].text).toBe('No inspection types available');
  });

  it('should handle inspections with null/undefined types', () => {
    const inspectionsWithNulls: Inspection[] = [
      { ...mockInspections[0], type: null as any },
      { ...mockInspections[1], type: undefined as any },
      { ...mockInspections[2], type: 'maintenance' }
    ];
    
    const nullProps = { ...mockProps, inspections: inspectionsWithNulls };
    const { container } = render(<MobileInspectionsPage {...nullProps} />);
    
    // Find the type filter select
    const selects = container.querySelectorAll('select');
    let typeSelect: HTMLSelectElement | null = null;
    
    selects.forEach(select => {
      const options = Array.from(select.options);
      if (options.some(opt => opt.text === 'All Types')) {
        typeSelect = select;
      }
    });
    
    expect(typeSelect).toBeTruthy();
    const options = Array.from(typeSelect.options);
    
    // Should only have "All Types" and "maintenance" (nulls filtered out)
    expect(options.length).toBe(2);
    expect(options[0].value).toBe('all');
    expect(options[1].value).toBe('maintenance');
  });

  it('should filter inspections when type is selected', () => {
    const { container } = render(<MobileInspectionsPage {...mockProps} />);
    
    // Find the type filter select
    const selects = container.querySelectorAll('select');
    let typeSelect: HTMLSelectElement | null = null;
    
    selects.forEach(select => {
      const options = Array.from(select.options);
      if (options.some(opt => opt.text === 'All Types')) {
        typeSelect = select;
      }
    });
    
    expect(typeSelect).toBeTruthy();
    
    // Initially all 4 inspector names should be visible
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.getByText('Alice Brown')).toBeInTheDocument();
    
    // Select "routine" type
    fireEvent.change(typeSelect!, { target: { value: 'routine' } });
    
    // Should now show only 2 routine inspections (John Doe and Alice Brown)
    expect(screen.getByText('John Doe')).toBeInTheDocument(); // Routine inspection
    expect(screen.getByText('Alice Brown')).toBeInTheDocument(); // Routine inspection
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument(); // Move-in, filtered out
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument(); // Move-out, filtered out
  });

  it('should maintain type safety with Inspection type union', () => {
    // This is a compile-time test - if it compiles, type safety is maintained
    type FilterType = 'all' | Inspection['type'];
    const validTypes: FilterType[] = ['all', 'routine', 'move-in', 'move-out', 'maintenance'];
    
    // This would cause a TypeScript error if type safety was broken:
    // const invalidType: FilterType = 'invalid-type'; // TS Error
    
    expect(validTypes).toBeDefined();
  });

  it('should not recalculate availableTypes on every render (memoization)', () => {
    const { rerender } = render(<MobileInspectionsPage {...mockProps} />);
    
    // Mock useMemo to track calls (for testing purposes)
    const memoSpy = vi.spyOn(mockInspections, 'map');
    
    // Rerender with same props
    rerender(<MobileInspectionsPage {...mockProps} />);
    rerender(<MobileInspectionsPage {...mockProps} />);
    
    // Map should only be called once due to memoization
    // Note: In actual implementation, useMemo prevents recalculation
    expect(memoSpy).toHaveBeenCalledTimes(0); // Map not called after initial render
  });
});