import { useState, useEffect, useMemo } from 'react';
import { useCommunities } from './useCommunities';
import { useProperties } from './useProperties';
import { useInspections } from './useInspections';
import {
  AnalyticsService,
  InspectionWorkflowService,
  PropertyStatusService,
  NotificationService,
  ValidationService,
  BUSINESS_RULES
} from '../services/businessLogic';
import { Property, Inspection, InspectionIssue } from '../services/api';

// Dashboard Analytics Hook
export function useDashboardAnalytics() {
  const { communities } = useCommunities();
  const { properties } = useProperties();
  const { inspections } = useInspections();

  const analytics = useMemo(() => {
    const totalProperties = properties.length;
    const totalCommunities = communities.length;
    const totalInspections = inspections.length;
    
    const overdueInspections = properties.filter(p => 
      AnalyticsService.isInspectionOverdue(p.nextInspection)
    ).length;

    const upcomingInspections = AnalyticsService.getUpcomingInspections(properties, 7).length;

    const criticalIssues = inspections.reduce((count, inspection) => 
      count + inspection.issues.filter(issue => 
        issue.severity === 'critical' && !issue.resolved
      ).length, 0
    );

    const completedThisMonth = inspections.filter(inspection => {
      const inspectionDate = new Date(inspection.date);
      const thisMonth = new Date();
      return inspectionDate.getMonth() === thisMonth.getMonth() &&
             inspectionDate.getFullYear() === thisMonth.getFullYear() &&
             inspection.status === 'completed';
    }).length;

    // Community-specific metrics
    const communityMetrics = communities.map(community => 
      AnalyticsService.calculateCommunityMetrics(community, properties, inspections)
    );

    // Overall system health score
    const overallHealthScore = Math.round(
      communityMetrics.reduce((sum, metrics) => sum + metrics.maintenanceScore, 0) / 
      Math.max(communityMetrics.length, 1)
    );

    return {
      totalProperties,
      totalCommunities,
      totalInspections,
      overdueInspections,
      upcomingInspections,
      criticalIssues,
      completedThisMonth,
      overallHealthScore,
      communityMetrics
    };
  }, [communities, properties, inspections]);

  return analytics;
}

// Property Health Monitoring Hook
export function usePropertyHealth(propertyId?: string) {
  const { properties } = useProperties();
  const { inspections } = useInspections();

  const propertyHealth = useMemo(() => {
    if (!propertyId) return null;

    const property = properties.find(p => p.id === propertyId);
    if (!property) return null;

    const propertyInspections = inspections.filter(i => i.propertyId === propertyId);
    const healthScore = AnalyticsService.getPropertyHealthScore(property, inspections);
    const urgency = InspectionWorkflowService.determineInspectionUrgency(property, inspections);

    const recentIssues = propertyInspections
      .flatMap(i => i.issues)
      .filter(issue => {
        const inspection = propertyInspections.find(i => i.issues.includes(issue));
        if (!inspection) return false;
        const inspectionDate = new Date(inspection.date);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return inspectionDate >= thirtyDaysAgo;
      });

    const criticalIssues = recentIssues.filter(issue => issue.severity === 'critical' && !issue.resolved);
    const highIssues = recentIssues.filter(issue => issue.severity === 'high' && !issue.resolved);

    return {
      property,
      healthScore,
      urgency,
      recentIssues: recentIssues.length,
      criticalIssues: criticalIssues.length,
      highIssues: highIssues.length,
      needsAttention: criticalIssues.length > 0 || highIssues.length >= 3,
      isOverdue: AnalyticsService.isInspectionOverdue(property.nextInspection),
      daysSinceLastInspection: property.lastInspection ? 
        Math.floor((Date.now() - new Date(property.lastInspection).getTime()) / (24 * 60 * 60 * 1000)) : 
        null
    };
  }, [propertyId, properties, inspections]);

  return propertyHealth;
}

// Smart Inspection Scheduling Hook
export function useInspectionScheduling() {
  const { properties } = useProperties();
  const { inspections, createInspection } = useInspections();

  const scheduleInspection = async (
    propertyId: string,
    inspectorName: string,
    scheduledDate: string,
    type: 'routine' | 'move-in' | 'move-out' | 'maintenance',
    notes?: string
  ) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    // Validate the inspection data
    const validation = ValidationService.validateInspectionData({
      propertyId,
      inspectorName,
      scheduledDate,
      type
    });

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Create the inspection
    const inspection = await createInspection({
      propertyId,
      inspectorName,
      scheduledDate,
      type,
      notes
    });

    // Return validation warnings if any
    return {
      inspection,
      warnings: validation.warnings
    };
  };

  const getSchedulingSuggestions = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return null;

    const shouldSchedule = InspectionWorkflowService.shouldScheduleInspection(property);
    const urgency = InspectionWorkflowService.determineInspectionUrgency(property, inspections);
    const suggestedDate = InspectionWorkflowService.calculateNextInspectionDate(property);

    return {
      shouldSchedule,
      urgency,
      suggestedDate,
      recommendedInspectors: ['John Smith', 'Sarah Johnson', 'Mike Davis'], // In production, this would be dynamic
      estimatedDuration: type => {
        const durations = { 'routine': 60, 'move-in': 90, 'move-out': 75, 'maintenance': 45 };
        return durations[type] || 60;
      }
    };
  };

  const propertiesNeedingScheduling = useMemo(() => {
    return properties.filter(property => 
      InspectionWorkflowService.shouldScheduleInspection(property)
    ).map(property => ({
      ...property,
      urgency: InspectionWorkflowService.determineInspectionUrgency(property, inspections),
      suggestedDate: InspectionWorkflowService.calculateNextInspectionDate(property)
    }));
  }, [properties, inspections]);

  return {
    scheduleInspection,
    getSchedulingSuggestions,
    propertiesNeedingScheduling
  };
}

// Inspection Workflow Hook
export function useInspectionWorkflow() {
  const { updateProperty } = useProperties();
  const { completeInspection } = useInspections();
  const [workflowState, setWorkflowState] = useState<{
    currentInspection?: Inspection;
    validationErrors: string[];
    validationWarnings: string[];
    followUpActions: any;
  }>({
    validationErrors: [],
    validationWarnings: [],
    followUpActions: null
  });

  const completeInspectionWorkflow = async (
    inspectionId: string,
    inspection: Inspection,
    issues: InspectionIssue[],
    notes?: string
  ) => {
    try {
      // Validate inspection completion
      const validation = InspectionWorkflowService.validateInspectionCompletion(inspection, issues);
      
      setWorkflowState(prev => ({
        ...prev,
        validationErrors: validation.errors,
        validationWarnings: validation.warnings
      }));

      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      // Complete the inspection
      const completedInspection = await completeInspection(inspectionId, issues, notes);

      // Generate follow-up actions
      const followUpActions = InspectionWorkflowService.generateFollowUpActions(completedInspection);
      
      setWorkflowState(prev => ({
        ...prev,
        followUpActions
      }));

      // Update property status based on inspection results
      const property = await updateProperty(
        completedInspection.propertyId,
        PropertyStatusService.updatePropertyStatusAfterInspection(
          { id: completedInspection.propertyId } as Property, // Simplified - in real app, get full property
          completedInspection
        )
      );

      return {
        success: true,
        inspection: completedInspection,
        followUpActions,
        updatedProperty: property,
        warnings: validation.warnings
      };

    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to complete inspection']
      };
    }
  };

  return {
    workflowState,
    completeInspectionWorkflow,
    clearWorkflowState: () => setWorkflowState({
      validationErrors: [],
      validationWarnings: [],
      followUpActions: null
    })
  };
}

// Alerts and Notifications Hook
export function useNotifications() {
  const { properties } = useProperties();
  const { inspections } = useInspections();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const alerts = useMemo(() => {
    const allAlerts = NotificationService.generateInspectionAlerts(properties, inspections);
    return allAlerts.filter(alert => 
      !dismissedAlerts.has(`${alert.type}-${alert.propertyId}`)
    );
  }, [properties, inspections, dismissedAlerts]);

  const dismissAlert = (alertType: string, propertyId: string) => {
    setDismissedAlerts(prev => new Set([...prev, `${alertType}-${propertyId}`]));
  };

  const clearAllAlerts = () => {
    setDismissedAlerts(new Set());
  };

  const criticalAlerts = alerts.filter(alert => alert.priority === 'critical');
  const highPriorityAlerts = alerts.filter(alert => alert.priority === 'high');

  return {
    alerts,
    criticalAlerts,
    highPriorityAlerts,
    dismissAlert,
    clearAllAlerts,
    hasUnreadCritical: criticalAlerts.length > 0,
    totalAlerts: alerts.length
  };
}

// Data Validation Hook
export function useValidation() {
  const validateCommunity = (data: any) => ValidationService.validateCommunityData(data);
  const validateProperty = (data: any) => ValidationService.validatePropertyData(data);
  const validateInspection = (data: any) => ValidationService.validateInspectionData(data);

  return {
    validateCommunity,
    validateProperty,
    validateInspection
  };
}

// Business Rules Hook
export function useBusinessRules() {
  return {
    rules: BUSINESS_RULES,
    canScheduleInspection: (property: Property) => 
      InspectionWorkflowService.shouldScheduleInspection(property),
    getInspectionInterval: (propertyType: string) => 
      BUSINESS_RULES.INSPECTION_INTERVALS[propertyType.toLowerCase()] || 
      BUSINESS_RULES.INSPECTION_INTERVALS['apartment'],
    calculateNextInspectionDate: (property: Property, completedDate?: string) =>
      InspectionWorkflowService.calculateNextInspectionDate(property, completedDate)
  };
}