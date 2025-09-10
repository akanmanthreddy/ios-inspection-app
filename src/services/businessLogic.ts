import { Community, Property, Inspection, InspectionIssue } from './api';

// Business Rules Configuration
export const BUSINESS_RULES = {
  // Inspection Scheduling Rules
  INSPECTION_INTERVALS: {
    'apartment': 90, // days
    'house': 120,
    'townhouse': 90,
    'condo': 90,
    'commercial': 180
  },
  
  // Issue Severity Rules
  CRITICAL_ISSUE_AUTO_FOLLOWUP: true,
  HIGH_ISSUE_FOLLOWUP_DAYS: 7,
  MEDIUM_ISSUE_FOLLOWUP_DAYS: 30,
  
  // Property Status Rules
  MAX_ISSUES_BEFORE_ATTENTION: 3,
  CRITICAL_ISSUES_REQUIRE_IMMEDIATE_ACTION: true,
  
  // Scheduling Rules
  ADVANCE_SCHEDULING_DAYS: 14, // Schedule inspections 2 weeks in advance
  MAX_INSPECTIONS_PER_DAY: 8,
  
  // Community Status Rules
  COMMUNITY_ACTIVE_MIN_OCCUPANCY: 0.8, // 80% occupancy required for "active" status
};

// Analytics and KPI Calculations
export class AnalyticsService {
  static calculateCommunityMetrics(community: Community, properties: Property[], inspections: Inspection[]) {
    const communityProperties = properties.filter(p => p.communityId === community.id);
    const communityInspections = inspections.filter(i => 
      communityProperties.some(p => p.id === i.propertyId)
    );

    const totalIssues = communityInspections.reduce((sum, inspection) => 
      sum + inspection.issues.length, 0
    );

    const criticalIssues = communityInspections.reduce((sum, inspection) => 
      sum + inspection.issues.filter(issue => issue.severity === 'critical').length, 0
    );

    const completedInspections = communityInspections.filter(i => i.status === 'completed').length;
    const overdueInspections = communityProperties.filter(p => 
      this.isInspectionOverdue(p.nextInspection)
    ).length;

    const occupancyRate = communityProperties.filter(p => p.status === 'active').length / 
                         Math.max(communityProperties.length, 1);

    return {
      totalProperties: communityProperties.length,
      totalInspections: communityInspections.length,
      completedInspections,
      overdueInspections,
      totalIssues,
      criticalIssues,
      occupancyRate,
      averageIssuesPerProperty: totalIssues / Math.max(communityProperties.length, 1),
      maintenanceScore: this.calculateMaintenanceScore(communityInspections),
      nextInspectionsDue: this.getUpcomingInspections(communityProperties, 7).length
    };
  }

  static calculateMaintenanceScore(inspections: Inspection[]): number {
    if (inspections.length === 0) return 100;

    const completedInspections = inspections.filter(i => i.status === 'completed');
    if (completedInspections.length === 0) return 50;

    const totalIssues = completedInspections.reduce((sum, inspection) => 
      sum + inspection.issues.length, 0
    );

    const resolvedIssues = completedInspections.reduce((sum, inspection) => 
      sum + inspection.issues.filter(issue => issue.resolved).length, 0
    );

    const resolutionRate = resolvedIssues / Math.max(totalIssues, 1);
    const issueFrequency = totalIssues / completedInspections.length;

    // Score based on resolution rate (60%) and issue frequency (40%)
    const score = (resolutionRate * 60) + (Math.max(0, 1 - (issueFrequency / 5)) * 40);
    return Math.round(score);
  }

  static isInspectionOverdue(nextInspectionDate: string): boolean {
    const today = new Date();
    const nextInspection = new Date(nextInspectionDate);
    return nextInspection < today;
  }

  static getUpcomingInspections(properties: Property[], daysAhead: number = 30): Property[] {
    const today = new Date();
    const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    return properties.filter(property => {
      const nextInspection = new Date(property.nextInspection);
      return nextInspection >= today && nextInspection <= futureDate;
    });
  }

  static getPropertyHealthScore(property: Property, inspections: Inspection[]): number {
    const propertyInspections = inspections.filter(i => i.propertyId === property.id);
    const recentInspections = propertyInspections
      .filter(i => {
        const inspectionDate = new Date(i.date);
        const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
        return inspectionDate >= sixMonthsAgo;
      });

    if (recentInspections.length === 0) return 50; // Neutral score if no recent data

    const totalIssues = recentInspections.reduce((sum, inspection) => 
      sum + inspection.issues.length, 0
    );

    const criticalIssues = recentInspections.reduce((sum, inspection) => 
      sum + inspection.issues.filter(issue => issue.severity === 'critical').length, 0
    );

    const highIssues = recentInspections.reduce((sum, inspection) => 
      sum + inspection.issues.filter(issue => issue.severity === 'high').length, 0
    );

    // Health score calculation (higher issues = lower score)
    let score = 100;
    score -= criticalIssues * 20; // Critical issues heavily impact score
    score -= highIssues * 10;     // High issues moderately impact score
    score -= (totalIssues - criticalIssues - highIssues) * 2; // Other issues minor impact

    return Math.max(0, Math.min(100, score));
  }
}

// Inspection Workflow Management
export class InspectionWorkflowService {
  static shouldScheduleInspection(property: Property): boolean {
    const nextInspection = new Date(property.nextInspection);
    const today = new Date();
    const advanceSchedulingDate = new Date(
      nextInspection.getTime() - BUSINESS_RULES.ADVANCE_SCHEDULING_DAYS * 24 * 60 * 60 * 1000
    );

    return today >= advanceSchedulingDate;
  }

  static calculateNextInspectionDate(property: Property, completedInspectionDate?: string): string {
    const propertyType = property.propertyType.toLowerCase();
    const intervalDays = BUSINESS_RULES.INSPECTION_INTERVALS[propertyType] || 
                        BUSINESS_RULES.INSPECTION_INTERVALS['apartment'];

    const baseDate = completedInspectionDate ? 
      new Date(completedInspectionDate) : 
      new Date();

    const nextDate = new Date(baseDate.getTime() + intervalDays * 24 * 60 * 60 * 1000);
    return nextDate.toISOString().split('T')[0];
  }

  static determineInspectionUrgency(property: Property, inspections: Inspection[]): 'low' | 'medium' | 'high' | 'critical' {
    const isOverdue = AnalyticsService.isInspectionOverdue(property.nextInspection);
    const daysSinceLastInspection = property.lastInspection ? 
      Math.floor((Date.now() - new Date(property.lastInspection).getTime()) / (24 * 60 * 60 * 1000)) : 
      999;

    const recentCriticalIssues = inspections
      .filter(i => i.propertyId === property.id)
      .some(i => i.issues.some(issue => issue.severity === 'critical' && !issue.resolved));

    if (recentCriticalIssues) return 'critical';
    if (isOverdue) return 'high';
    if (daysSinceLastInspection > 180) return 'high';
    if (daysSinceLastInspection > 120) return 'medium';
    return 'low';
  }

  static validateInspectionCompletion(inspection: Inspection, issues: InspectionIssue[]): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Business rule validations
    if (issues.length === 0 && !inspection.notes?.trim()) {
      warnings.push('Consider adding notes when no issues are found to document the inspection thoroughness.');
    }

    const criticalIssues = issues.filter(issue => issue.severity === 'critical');
    if (criticalIssues.length > 0 && !inspection.notes?.includes('immediate')) {
      warnings.push('Critical issues detected. Consider adding notes about immediate actions taken.');
    }

    const unresolved = issues.filter(issue => !issue.resolved);
    if (unresolved.length > BUSINESS_RULES.MAX_ISSUES_BEFORE_ATTENTION) {
      warnings.push(`${unresolved.length} unresolved issues detected. Property may require additional attention.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static generateFollowUpActions(inspection: Inspection): {
    immediateActions: string[];
    scheduledActions: Array<{ action: string; dueDate: string; priority: 'low' | 'medium' | 'high' | 'critical' }>;
  } {
    const immediateActions: string[] = [];
    const scheduledActions: Array<{ action: string; dueDate: string; priority: 'low' | 'medium' | 'high' | 'critical' }> = [];

    inspection.issues.forEach(issue => {
      if (issue.severity === 'critical' && !issue.resolved) {
        immediateActions.push(`Address critical ${issue.category.toLowerCase()}: ${issue.description}`);
      } else if (issue.severity === 'high' && !issue.resolved) {
        const dueDate = new Date(Date.now() + BUSINESS_RULES.HIGH_ISSUE_FOLLOWUP_DAYS * 24 * 60 * 60 * 1000);
        scheduledActions.push({
          action: `Resolve ${issue.category.toLowerCase()}: ${issue.description}`,
          dueDate: dueDate.toISOString().split('T')[0],
          priority: 'high'
        });
      } else if (issue.severity === 'medium' && !issue.resolved) {
        const dueDate = new Date(Date.now() + BUSINESS_RULES.MEDIUM_ISSUE_FOLLOWUP_DAYS * 24 * 60 * 60 * 1000);
        scheduledActions.push({
          action: `Address ${issue.category.toLowerCase()}: ${issue.description}`,
          dueDate: dueDate.toISOString().split('T')[0],
          priority: 'medium'
        });
      }
    });

    return { immediateActions, scheduledActions };
  }
}

// Property Status Management
export class PropertyStatusService {
  static updatePropertyStatusAfterInspection(
    property: Property, 
    inspection: Inspection
  ): Partial<Property> {
    const updates: Partial<Property> = {
      lastInspection: inspection.date,
      nextInspection: InspectionWorkflowService.calculateNextInspectionDate(property, inspection.date),
      issues: inspection.issues.filter(issue => !issue.resolved).length
    };

    // Update inspector if different
    if (property.inspector !== inspection.inspectorName) {
      updates.inspector = inspection.inspectorName;
    }

    return updates;
  }

  static determinePropertyStatus(property: Property, inspections: Inspection[]): 'active' | 'under-construction' | 'sold' {
    // This is a simplified logic - in reality, this would involve more complex business rules
    const recentInspections = inspections
      .filter(i => i.propertyId === property.id)
      .filter(i => {
        const inspectionDate = new Date(i.date);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return inspectionDate >= thirtyDaysAgo;
      });

    const hasCriticalIssues = recentInspections.some(i => 
      i.issues.some(issue => issue.severity === 'critical' && !issue.resolved)
    );

    // Business logic: properties with unresolved critical issues might need status review
    if (hasCriticalIssues && property.status === 'active') {
      // In a real system, this might trigger a workflow for manual review
      return property.status; // Keep current status but flag for review
    }

    return property.status;
  }
}

// Notification and Alert System
export class NotificationService {
  static generateInspectionAlerts(properties: Property[], inspections: Inspection[]): Array<{
    type: 'overdue' | 'upcoming' | 'critical_issue' | 'follow_up_required';
    propertyId: string;
    propertyAddress: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    actionRequired?: string;
  }> {
    const alerts: Array<{
      type: 'overdue' | 'upcoming' | 'critical_issue' | 'follow_up_required';
      propertyId: string;
      propertyAddress: string;
      message: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
      actionRequired?: string;
    }> = [];

    properties.forEach(property => {
      // Overdue inspections
      if (AnalyticsService.isInspectionOverdue(property.nextInspection)) {
        const daysOverdue = Math.floor(
          (Date.now() - new Date(property.nextInspection).getTime()) / (24 * 60 * 60 * 1000)
        );
        
        alerts.push({
          type: 'overdue',
          propertyId: property.id,
          propertyAddress: property.address,
          message: `Inspection overdue by ${daysOverdue} days`,
          priority: daysOverdue > 30 ? 'critical' : daysOverdue > 14 ? 'high' : 'medium',
          actionRequired: 'Schedule inspection immediately'
        });
      }

      // Upcoming inspections
      const upcomingInspections = AnalyticsService.getUpcomingInspections([property], 7);
      if (upcomingInspections.length > 0) {
        const daysUntil = Math.floor(
          (new Date(property.nextInspection).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
        );

        alerts.push({
          type: 'upcoming',
          propertyId: property.id,
          propertyAddress: property.address,
          message: `Inspection due in ${daysUntil} days`,
          priority: daysUntil <= 2 ? 'high' : 'medium',
          actionRequired: 'Confirm inspection scheduling'
        });
      }

      // Critical issues
      const propertyInspections = inspections.filter(i => i.propertyId === property.id);
      const criticalIssues = propertyInspections
        .flatMap(i => i.issues)
        .filter(issue => issue.severity === 'critical' && !issue.resolved);

      if (criticalIssues.length > 0) {
        alerts.push({
          type: 'critical_issue',
          propertyId: property.id,
          propertyAddress: property.address,
          message: `${criticalIssues.length} unresolved critical issue(s)`,
          priority: 'critical',
          actionRequired: 'Address critical issues immediately'
        });
      }
    });

    // Sort by priority (critical first)
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return alerts.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  }

  static shouldSendReminder(lastReminderDate: string | null, reminderType: 'inspection_due' | 'follow_up'): boolean {
    if (!lastReminderDate) return true;

    const daysSinceReminder = Math.floor(
      (Date.now() - new Date(lastReminderDate).getTime()) / (24 * 60 * 60 * 1000)
    );

    switch (reminderType) {
      case 'inspection_due':
        return daysSinceReminder >= 3; // Remind every 3 days for overdue inspections
      case 'follow_up':
        return daysSinceReminder >= 7; // Remind weekly for follow-ups
      default:
        return false;
    }
  }
}

// Validation Service
export class ValidationService {
  static validateCommunityData(data: {
    name: string;
    location: string;
    status: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name?.trim()) {
      errors.push('Community name is required');
    } else if (data.name.length < 3) {
      errors.push('Community name must be at least 3 characters long');
    }

    if (!data.location?.trim()) {
      errors.push('Community location is required');
    }

    if (!['active', 'under-construction', 'sold'].includes(data.status)) {
      errors.push('Invalid community status');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validatePropertyData(data: {
    address: string;
    propertyType: string;
    communityId: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.address?.trim()) {
      errors.push('Property address is required');
    }

    if (!data.propertyType?.trim()) {
      errors.push('Property type is required');
    }

    if (!data.communityId?.trim()) {
      errors.push('Community selection is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateInspectionData(data: {
    propertyId: string;
    inspectorName: string;
    scheduledDate: string;
    type: string;
  }): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.propertyId?.trim()) {
      errors.push('Property selection is required');
    }

    if (!data.inspectorName?.trim()) {
      errors.push('Inspector name is required');
    }

    if (!data.scheduledDate) {
      errors.push('Inspection date is required');
    } else {
      const inspectionDate = new Date(data.scheduledDate);
      const today = new Date();
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      if (inspectionDate < today) {
        warnings.push('Inspection date is in the past');
      }

      if (inspectionDate > thirtyDaysFromNow) {
        warnings.push('Inspection scheduled more than 30 days in advance');
      }
    }

    if (!['routine', 'move-in', 'move-out', 'maintenance'].includes(data.type)) {
      errors.push('Invalid inspection type');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

