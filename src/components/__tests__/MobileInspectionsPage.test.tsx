import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileInspectionsPage } from '../mobile/MobileInspectionsPage';
import { Inspection } from '../../services/api';

describe('MobileInspectionsPage - Select Component', () => {
  const mockInspections: Inspection[] = [
    {
      id: '1',
      propertyId: 'prop-1',
      templateId: 'template-1',
      inspectorId: 'inspector-1',
      inspectorName: 'John Doe',
      status: 'completed',
      type: 'routine',
      date: '2025-01-10',
      issues: [],
      updatedAt: '2025-01-10',
      createdAt: '2025-01-10'
    },
    {
      id: '2',
      propertyId: 'prop-1',
      templateId: 'template-1',
      inspectorId: 'inspector-2',
      inspectorName: 'Jane Smith',
      status: 'in-progress',
      type: 'maintenance',
      date: '2025-01-11',
      issues: [],
      updatedAt: '2025-01-11',
      createdAt: '2025-01-11'
    },
    {
      id: '3',
      propertyId: 'prop-1',
      templateId: 'template-2',
      inspectorId: 'inspector-1',
      inspectorName: 'John Doe',
      status: 'scheduled',
      type: 'move-out',
      date: '2025-01-12',
      issues: [],
      updatedAt: '2025-01-12',
      createdAt: '2025-01-12'
    }
  ];

  const defaultProps = {
    propertyId: 'prop-1',
    propertyAddress: '123 Main St',
    inspections: mockInspections,
    loading: false,
    onBack: vi.fn(),
    onInspectionClick: vi.fn()
  };

  it('should render Radix UI Select component with proper styling', () => {
    const { container } = render(<MobileInspectionsPage {...defaultProps} />);
    
    // Check for SelectTrigger with custom classes
    const selectTrigger = container.querySelector('[role="combobox"]');
    expect(selectTrigger).toBeTruthy();
    
    // Verify custom styling classes are applied
    expect(selectTrigger?.className).toContain('min-h-[44px]');
    expect(selectTrigger?.className).toContain('bg-primary-foreground/10');
    expect(selectTrigger?.className).toContain('border-primary-foreground/20');
    expect(selectTrigger?.className).toContain('text-primary-foreground');
  });

  it('should display all available inspection types', () => {
    const { container } = render(<MobileInspectionsPage {...defaultProps} />);
    
    // Click the select trigger to open dropdown
    const selectTrigger = container.querySelector('[role="combobox"]');
    if (selectTrigger) {
      fireEvent.click(selectTrigger as Element);
    }
    
    // Check for the options - they should be in the portal
    // Use getAllByText since Radix UI may render duplicates
    expect(screen.getAllByText('All Types').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Routine').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Maintenance').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Move-out').length).toBeGreaterThan(0);
  });

  it('should have accessible touch target size for mobile', () => {
    const { container } = render(<MobileInspectionsPage {...defaultProps} />);
    
    const selectTrigger = container.querySelector('[role="combobox"]');
    expect(selectTrigger?.className).toContain('min-h-[44px]');
  });

  it('should apply focus styles for accessibility', () => {
    const { container } = render(<MobileInspectionsPage {...defaultProps} />);
    
    const selectTrigger = container.querySelector('[role="combobox"]');
    expect(selectTrigger?.className).toContain('focus:ring-primary-foreground/30');
  });

  it('should use proper theme tokens for consistency', () => {
    const { container } = render(<MobileInspectionsPage {...defaultProps} />);
    
    // Check trigger uses theme tokens
    const selectTrigger = container.querySelector('[role="combobox"]');
    expect(selectTrigger?.className).toContain('text-primary-foreground');
    expect(selectTrigger?.className).toContain('bg-primary-foreground/10');
    expect(selectTrigger?.className).toContain('border-primary-foreground/20');
  });

  it('should handle empty inspection types gracefully', () => {
    const emptyProps = {
      ...defaultProps,
      inspections: []
    };
    
    const { container } = render(<MobileInspectionsPage {...emptyProps} />);
    
    // Should still render the select with just "All Types"
    const selectTrigger = container.querySelector('[role="combobox"]');
    expect(selectTrigger).toBeTruthy();
  });

  it('should filter inspections when type is selected', () => {
    const { container } = render(<MobileInspectionsPage {...defaultProps} />);
    
    // Open select
    const selectTrigger = container.querySelector('[role="combobox"]');
    if (selectTrigger) {
      fireEvent.click(selectTrigger as Element);
    }
    
    // Select "Routine" type
    const routineOption = screen.queryByText('Routine');
    if (routineOption) {
      fireEvent.click(routineOption);
    }
    
    // Check that only routine inspections are shown
    const cards = container.querySelectorAll('.p-4');
    expect(cards.length).toBe(1); // Only one routine inspection
  });
});