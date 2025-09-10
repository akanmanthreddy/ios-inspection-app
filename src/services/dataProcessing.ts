import { Community, Property, Inspection, InspectionIssue } from './api';
import { AnalyticsService } from './businessLogic';

// Report Generation Types
export interface ReportConfig {
  type: 'property' | 'community' | 'inspector' | 'system-wide';
  dateRange: {
    start: string;
    end: string;
  };
  includeCharts: boolean;
  includeIssueDetails: boolean;
  format: 'pdf' | 'excel' | 'csv';
  filters?: {
    status?: string[];
    propertyTypes?: string[];
    inspectors?: string[];
    severityLevels?: string[];
  };
}

export interface ProcessedReportData {
  metadata: {
    reportId: string;
    generatedAt: string;
    period: string;
    totalRecords: number;
  };
  summary: {
    totalInspections: number;
    completedInspections: number;
    pendingInspections: number;
    overdueInspections: number;
    totalIssues: number;
    resolvedIssues: number;
    criticalIssues: number;
    averageInspectionTime: number;
  };
  trends: {
    inspectionTrends: Array<{ month: string; completed: number; issues: number }>;
    issueCategories: Array<{ category: string; count: number; severity: string }>;
    propertyHealth: Array<{ propertyId: string; address: string; score: number }>;
    inspectorPerformance: Array<{ inspector: string; completed: number; avgTime: number; issuesFound: number }>;
  };
  charts: {
    inspectionVolumeChart: any;
    issueSeverityChart: any;
    propertyHealthChart: any;
    maintenanceScoreChart: any;
  };
  detailedData?: any[];
}

// Data Processing Service
export class DataProcessingService {
  // Process inspection data into report format
  static processInspectionData(
    inspections: Inspection[],
    properties: Property[],
    communities: Community[],
    config: ReportConfig
  ): ProcessedReportData {
    // Filter data based on config
    const filteredInspections = this.filterInspections(inspections, config);
    const relevantProperties = properties.filter(p => 
      filteredInspections.some(i => i.propertyId === p.id)
    );

    // Calculate summary metrics
    const summary = this.calculateSummaryMetrics(filteredInspections, relevantProperties);

    // Generate trend data
    const trends = this.calculateTrendData(filteredInspections, relevantProperties);

    // Generate chart data
    const charts = this.generateChartData(filteredInspections, relevantProperties);

    return {
      metadata: {
        reportId: `RPT-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        period: `${config.dateRange.start} to ${config.dateRange.end}`,
        totalRecords: filteredInspections.length
      },
      summary,
      trends,
      charts,
      detailedData: config.includeIssueDetails ? filteredInspections : undefined
    };
  }

  // Filter inspections based on report configuration
  private static filterInspections(inspections: Inspection[], config: ReportConfig): Inspection[] {
    let filtered = inspections.filter(inspection => {
      const inspectionDate = new Date(inspection.date);
      const startDate = new Date(config.dateRange.start);
      const endDate = new Date(config.dateRange.end);
      
      return inspectionDate >= startDate && inspectionDate <= endDate;
    });

    if (config.filters) {
      const { status, inspectors, severityLevels } = config.filters;
      
      if (status?.length) {
        filtered = filtered.filter(i => status.includes(i.status));
      }
      
      if (inspectors?.length) {
        filtered = filtered.filter(i => inspectors.includes(i.inspectorName));
      }
      
      if (severityLevels?.length) {
        filtered = filtered.filter(i => 
          i.issues.some(issue => severityLevels.includes(issue.severity))
        );
      }
    }

    return filtered;
  }

  // Calculate summary metrics
  private static calculateSummaryMetrics(inspections: Inspection[], properties: Property[]) {
    const completed = inspections.filter(i => i.status === 'completed').length;
    const pending = inspections.filter(i => i.status === 'scheduled').length;
    const overdue = properties.filter(p => 
      AnalyticsService.isInspectionOverdue(p.nextInspection)
    ).length;

    const allIssues = inspections.flatMap(i => i.issues);
    const resolvedIssues = allIssues.filter(issue => issue.resolved).length;
    const criticalIssues = allIssues.filter(issue => 
      issue.severity === 'critical' && !issue.resolved
    ).length;

    // Mock average inspection time calculation (in production, track actual times)
    const avgInspectionTime = completed > 0 ? 
      Math.round((completed * 75 + pending * 60) / (completed + pending)) : 0;

    return {
      totalInspections: inspections.length,
      completedInspections: completed,
      pendingInspections: pending,
      overdueInspections: overdue,
      totalIssues: allIssues.length,
      resolvedIssues,
      criticalIssues,
      averageInspectionTime: avgInspectionTime
    };
  }

  // Calculate trend data for charts and analysis
  private static calculateTrendData(inspections: Inspection[], properties: Property[]) {
    // Group inspections by month
    const monthlyData = inspections.reduce((acc, inspection) => {
      const month = new Date(inspection.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!acc[month]) {
        acc[month] = { completed: 0, issues: 0 };
      }
      
      if (inspection.status === 'completed') {
        acc[month].completed++;
      }
      acc[month].issues += inspection.issues.length;
      
      return acc;
    }, {} as Record<string, { completed: number; issues: number }>);

    const inspectionTrends = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      completed: data.completed,
      issues: data.issues
    }));

    // Issue category analysis
    const categoryCount = inspections
      .flatMap(i => i.issues)
      .reduce((acc, issue) => {
        const key = `${issue.category}-${issue.severity}`;
        if (!acc[key]) {
          acc[key] = { category: issue.category, count: 0, severity: issue.severity };
        }
        acc[key].count++;
        return acc;
      }, {} as Record<string, { category: string; count: number; severity: string }>);

    const issueCategories = Object.values(categoryCount);

    // Property health scores
    const propertyHealth = properties.map(property => ({
      propertyId: property.id,
      address: property.address,
      score: AnalyticsService.getPropertyHealthScore(property, inspections)
    }));

    // Inspector performance analysis
    const inspectorStats = inspections.reduce((acc, inspection) => {
      const inspector = inspection.inspectorName;
      if (!acc[inspector]) {
        acc[inspector] = { completed: 0, totalTime: 0, issuesFound: 0 };
      }
      
      if (inspection.status === 'completed') {
        acc[inspector].completed++;
        acc[inspector].totalTime += 75; // Mock time
      }
      acc[inspector].issuesFound += inspection.issues.length;
      
      return acc;
    }, {} as Record<string, { completed: number; totalTime: number; issuesFound: number }>);

    const inspectorPerformance = Object.entries(inspectorStats).map(([inspector, stats]) => ({
      inspector,
      completed: stats.completed,
      avgTime: stats.completed > 0 ? Math.round(stats.totalTime / stats.completed) : 0,
      issuesFound: stats.issuesFound
    }));

    return {
      inspectionTrends,
      issueCategories,
      propertyHealth: propertyHealth.sort((a, b) => a.score - b.score),
      inspectorPerformance
    };
  }

  // Generate chart-ready data
  private static generateChartData(inspections: Inspection[], properties: Property[]) {
    const completedByMonth = inspections
      .filter(i => i.status === 'completed')
      .reduce((acc, inspection) => {
        const month = new Date(inspection.date).toLocaleDateString('en-US', { 
          month: 'short',
          year: 'numeric'
        });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const inspectionVolumeChart = {
      data: Object.entries(completedByMonth).map(([month, count]) => ({
        month,
        inspections: count
      })),
      type: 'line',
      title: 'Inspection Volume Over Time'
    };

    // Issue severity distribution
    const severityCount = inspections
      .flatMap(i => i.issues)
      .reduce((acc, issue) => {
        acc[issue.severity] = (acc[issue.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const issueSeverityChart = {
      data: Object.entries(severityCount).map(([severity, count]) => ({
        severity: severity.charAt(0).toUpperCase() + severity.slice(1),
        count,
        fill: this.getSeverityColor(severity)
      })),
      type: 'pie',
      title: 'Issue Severity Distribution'
    };

    // Property health distribution
    const healthScores = properties.map(p => 
      AnalyticsService.getPropertyHealthScore(p, inspections)
    );
    
    const healthRanges = {
      'Excellent (80-100)': healthScores.filter(s => s >= 80).length,
      'Good (60-79)': healthScores.filter(s => s >= 60 && s < 80).length,
      'Fair (40-59)': healthScores.filter(s => s >= 40 && s < 60).length,
      'Poor (0-39)': healthScores.filter(s => s < 40).length
    };

    const propertyHealthChart = {
      data: Object.entries(healthRanges).map(([range, count]) => ({
        range,
        count
      })),
      type: 'bar',
      title: 'Property Health Score Distribution'
    };

    // Maintenance score trends
    const maintenanceScores = properties.map(property => ({
      address: property.address.split(' ')[0] + '...', // Abbreviated for chart
      score: AnalyticsService.getPropertyHealthScore(property, inspections)
    }));

    const maintenanceScoreChart = {
      data: maintenanceScores.slice(0, 10), // Top 10 for readability
      type: 'bar',
      title: 'Property Maintenance Scores (Top 10)'
    };

    return {
      inspectionVolumeChart,
      issueSeverityChart,
      propertyHealthChart,
      maintenanceScoreChart
    };
  }

  private static getSeverityColor(severity: string): string {
    const colors = {
      'critical': '#ef4444',
      'high': '#f97316',
      'medium': '#eab308',
      'low': '#22c55e'
    };
    return colors[severity as keyof typeof colors] || '#6b7280';
  }
}

// Data Export Service
export class DataExportService {
  // Generate CSV data from processed report
  static generateCSV(reportData: ProcessedReportData, type: 'summary' | 'detailed' | 'trends'): string {
    if (type === 'summary') {
      const headers = ['Metric', 'Value'];
      const rows = [
        ['Total Inspections', reportData.summary.totalInspections.toString()],
        ['Completed Inspections', reportData.summary.completedInspections.toString()],
        ['Pending Inspections', reportData.summary.pendingInspections.toString()],
        ['Overdue Inspections', reportData.summary.overdueInspections.toString()],
        ['Total Issues', reportData.summary.totalIssues.toString()],
        ['Resolved Issues', reportData.summary.resolvedIssues.toString()],
        ['Critical Issues', reportData.summary.criticalIssues.toString()],
        ['Average Inspection Time (min)', reportData.summary.averageInspectionTime.toString()]
      ];
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    if (type === 'trends') {
      const headers = ['Month', 'Completed Inspections', 'Issues Found'];
      const rows = reportData.trends.inspectionTrends.map(trend => [
        trend.month,
        trend.completed.toString(),
        trend.issues.toString()
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    // Detailed export would include full inspection data
    if (reportData.detailedData) {
      const headers = ['Inspection ID', 'Property Address', 'Inspector', 'Date', 'Status', 'Issues Count', 'Critical Issues'];
      const rows = reportData.detailedData.map((inspection: Inspection) => [
        inspection.id,
        inspection.propertyId, // In production, resolve to address
        inspection.inspectorName,
        inspection.date,
        inspection.status,
        inspection.issues.length.toString(),
        inspection.issues.filter(i => i.severity === 'critical').length.toString()
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return '';
  }

  // Generate downloadable blob
  static createDownloadableFile(content: string, filename: string, type: 'csv' | 'json'): Blob {
    const mimeType = type === 'csv' ? 'text/csv' : 'application/json';
    return new Blob([content], { type: mimeType });
  }

  // Process bulk property import data
  static processBulkImport(csvData: string): Array<{
    isValid: boolean;
    data?: Partial<Property>;
    errors: string[];
    rowIndex: number;
  }> {
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const requiredHeaders = ['address', 'propertytype', 'status'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return [{
        isValid: false,
        errors: [`Missing required headers: ${missingHeaders.join(', ')}`],
        rowIndex: 0
      }];
    }
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const rowData: Record<string, string> = {};
      
      headers.forEach((header, i) => {
        rowData[header] = values[i] || '';
      });
      
      const errors: string[] = [];
      
      if (!rowData.address) errors.push('Address is required');
      if (!rowData.propertytype) errors.push('Property type is required');
      if (!rowData.status) errors.push('Status is required');
      
      // Validate property type
      const validTypes = ['apartment', 'house', 'townhouse', 'condo', 'commercial'];
      if (rowData.propertytype && typeof rowData.propertytype === 'string' && !validTypes.includes(rowData.propertytype.toLowerCase())) {
        errors.push(`Invalid property type: ${rowData.propertytype}`);
      }
      
      // Validate status
      const validStatuses = ['active', 'under-construction', 'sold'];
      if (rowData.status && typeof rowData.status === 'string' && !validStatuses.includes(rowData.status.toLowerCase())) {
        errors.push(`Invalid status: ${rowData.status}`);
      }
      
      return {
        isValid: errors.length === 0,
        data: errors.length === 0 ? {
          address: rowData.address,
          propertyType: rowData.propertytype,
          status: rowData.status as 'active' | 'under-construction' | 'sold',
          bedrooms: parseInt(rowData.bedrooms) || 1,
          bathrooms: parseFloat(rowData.bathrooms) || 1,
          squareFootage: parseInt(rowData.squarefootage) || 0,
          rentAmount: parseFloat(rowData.rent) || 0
        } : undefined,
        errors,
        rowIndex: index + 2 // +2 because we start from line 1 (after header) and want 1-based indexing
      };
    });
  }
}

// Advanced Analytics Service
export class AdvancedAnalyticsService {
  // Predictive maintenance analysis
  static analyzePredictiveMaintenance(
    properties: Property[], 
    inspections: Inspection[]
  ): Array<{
    propertyId: string;
    address: string;
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendedActions: string[];
    estimatedMaintenanceCost: number;
  }> {
    return properties.map(property => {
      const propertyInspections = inspections.filter(i => i.propertyId === property.id);
      const recentIssues = propertyInspections
        .flatMap(i => i.issues)
        .filter(issue => {
          const inspection = propertyInspections.find(i => i.issues.includes(issue));
          if (!inspection) return false;
          const inspectionDate = new Date(inspection.date);
          const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
          return inspectionDate >= sixMonthsAgo;
        });

      // Calculate risk score based on multiple factors
      let riskScore = 0;
      
      // Issue frequency and severity
      const criticalIssues = recentIssues.filter(i => i.severity === 'critical').length;
      const highIssues = recentIssues.filter(i => i.severity === 'high').length;
      riskScore += criticalIssues * 25 + highIssues * 15;
      
      // Age of property (mock calculation based on property ID patterns)
      const propertyAge = this.estimatePropertyAge(property);
      if (propertyAge > 15) riskScore += 20;
      else if (propertyAge > 10) riskScore += 10;
      
      // Inspection history gaps
      const daysSinceLastInspection = property.lastInspection ? 
        Math.floor((Date.now() - new Date(property.lastInspection).getTime()) / (24 * 60 * 60 * 1000)) : 
        365;
      
      if (daysSinceLastInspection > 180) riskScore += 15;
      else if (daysSinceLastInspection > 120) riskScore += 10;
      
      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'critical';
      if (riskScore >= 70) riskLevel = 'critical';
      else if (riskScore >= 50) riskLevel = 'high';
      else if (riskScore >= 30) riskLevel = 'medium';
      else riskLevel = 'low';
      
      // Generate recommendations
      const recommendedActions = this.generateMaintenanceRecommendations(
        property, 
        recentIssues, 
        riskLevel
      );
      
      // Estimate maintenance costs
      const estimatedCost = this.estimateMaintenanceCost(recentIssues, riskLevel);
      
      return {
        propertyId: property.id,
        address: property.address,
        riskScore,
        riskLevel,
        recommendedActions,
        estimatedMaintenanceCost: estimatedCost
      };
    }).sort((a, b) => b.riskScore - a.riskScore);
  }
  
  // Portfolio performance analysis
  static analyzePortfolioPerformance(
    communities: Community[],
    properties: Property[],
    inspections: Inspection[]
  ) {
    const communityMetrics = communities.map(community => {
      const metrics = AnalyticsService.calculateCommunityMetrics(community, properties, inspections);
      const communityProperties = properties.filter(p => p.communityId === community.id);
      
      // Calculate financial metrics (mock data for demo)
      const totalRentRoll = communityProperties.reduce((sum, p) => sum + (p.rentAmount || 0), 0);
      const occupancyRevenue = totalRentRoll * metrics.occupancyRate;
      
      // Calculate maintenance efficiency
      const maintenanceEfficiency = this.calculateMaintenanceEfficiency(
        communityProperties, 
        inspections
      );
      
      return {
        communityId: community.id,
        name: community.name,
        location: community.location,
        totalProperties: metrics.totalProperties,
        occupancyRate: metrics.occupancyRate,
        maintenanceScore: metrics.maintenanceScore,
        totalRentRoll,
        occupancyRevenue,
        maintenanceEfficiency,
        roi: this.calculateROI(occupancyRevenue, communityProperties.length)
      };
    });
    
    return {
      portfolioMetrics: communityMetrics,
      topPerformers: communityMetrics
        .sort((a, b) => b.roi - a.roi)
        .slice(0, 3),
      underPerformers: communityMetrics
        .sort((a, b) => a.maintenanceScore - b.maintenanceScore)
        .slice(0, 3),
      portfolioSummary: {
        totalProperties: properties.length,
        totalCommunities: communities.length,
        avgOccupancyRate: communityMetrics.reduce((sum, c) => sum + c.occupancyRate, 0) / communities.length,
        totalRentRoll: communityMetrics.reduce((sum, c) => sum + c.totalRentRoll, 0),
        avgMaintenanceScore: communityMetrics.reduce((sum, c) => sum + c.maintenanceScore, 0) / communities.length
      }
    };
  }
  
  // Helper methods
  private static estimatePropertyAge(property: Property): number {
    // Mock age estimation - in production, this would be based on actual construction date
    const hashCode = property.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return 5 + (hashCode % 20); // Random age between 5-25 years
  }
  
  private static generateMaintenanceRecommendations(
    property: Property,
    issues: InspectionIssue[],
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
  ): string[] {
    const recommendations: string[] = [];
    
    if (riskLevel === 'critical') {
      recommendations.push('Schedule emergency inspection within 24 hours');
      recommendations.push('Prioritize all critical issues for immediate resolution');
    }
    
    const categories = [...new Set(issues.map(i => i.category))];
    
    if (categories.includes('Electrical')) {
      recommendations.push('Schedule electrical system inspection');
    }
    if (categories.includes('Plumbing')) {
      recommendations.push('Review plumbing maintenance schedule');
    }
    if (categories.includes('HVAC')) {
      recommendations.push('Check HVAC system and filters');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Continue regular maintenance schedule');
    }
    
    return recommendations;
  }
  
  private static estimateMaintenanceCost(
    issues: InspectionIssue[],
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
  ): number {
    const baseCosts = {
      'critical': 1500,
      'high': 800,
      'medium': 400,
      'low': 150
    };
    
    let totalCost = 0;
    
    issues.forEach(issue => {
      totalCost += baseCosts[issue.severity];
    });
    
    // Add risk level multiplier
    const riskMultipliers = {
      'critical': 1.5,
      'high': 1.3,
      'medium': 1.1,
      'low': 1.0
    };
    
    return Math.round(totalCost * riskMultipliers[riskLevel]);
  }
  
  private static calculateMaintenanceEfficiency(
    properties: Property[],
    inspections: Inspection[]
  ): number {
    const propertyInspections = inspections.filter(i => 
      properties.some(p => p.id === i.propertyId)
    );
    
    if (propertyInspections.length === 0) return 100;
    
    const totalIssues = propertyInspections.reduce((sum, i) => sum + i.issues.length, 0);
    const resolvedIssues = propertyInspections.reduce((sum, i) => 
      sum + i.issues.filter(issue => issue.resolved).length, 0
    );
    
    return Math.round((resolvedIssues / Math.max(totalIssues, 1)) * 100);
  }
  
  private static calculateROI(revenue: number, propertyCount: number): number {
    // Simplified ROI calculation - in production, factor in actual costs, investments
    const avgPropertyValue = 200000; // Mock average property value
    const totalInvestment = propertyCount * avgPropertyValue;
    const annualRevenue = revenue * 12;
    
    return totalInvestment > 0 ? Math.round((annualRevenue / totalInvestment) * 100) : 0;
  }
}