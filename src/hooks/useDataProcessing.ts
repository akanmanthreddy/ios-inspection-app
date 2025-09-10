import { useState, useMemo, useCallback } from 'react';
import { useCommunities } from './useCommunities';
import { useProperties } from './useProperties';
import { useInspections } from './useInspections';
import {
  DataProcessingService,
  DataExportService,
  AdvancedAnalyticsService,
  ReportConfig,
  ProcessedReportData
} from '../services/dataProcessing';

// Report Generation Hook
export function useReportGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [lastGeneratedReport, setLastGeneratedReport] = useState<ProcessedReportData | null>(null);

  const { communities } = useCommunities();
  const { properties } = useProperties();
  const { inspections } = useInspections();

  const generateReport = useCallback(async (config: ReportConfig): Promise<ProcessedReportData> => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      // Simulate processing time for realistic UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      const reportData = DataProcessingService.processInspectionData(
        inspections,
        properties,
        communities,
        config
      );

      setLastGeneratedReport(reportData);
      return reportData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate report';
      setGenerationError(errorMessage);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [inspections, properties, communities]);

  const exportReport = useCallback((
    reportData: ProcessedReportData,
    format: 'csv' | 'json',
    type: 'summary' | 'detailed' | 'trends' = 'summary'
  ) => {
    try {
      let content: string;
      let filename: string;

      if (format === 'csv') {
        content = DataExportService.generateCSV(reportData, type);
        filename = `inspection-report-${type}-${reportData.metadata.reportId}.csv`;
      } else {
        content = JSON.stringify(reportData, null, 2);
        filename = `inspection-report-${reportData.metadata.reportId}.json`;
      }

      const blob = DataExportService.createDownloadableFile(content, filename, format);
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Export failed' 
      };
    }
  }, []);

  const getQuickReportData = useMemo(() => {
    if (inspections.length === 0 || properties.length === 0) return null;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const quickConfig: ReportConfig = {
      type: 'system-wide',
      dateRange: {
        start: thirtyDaysAgo.toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      includeCharts: false,
      includeIssueDetails: false,
      format: 'json'
    };

    try {
      return DataProcessingService.processInspectionData(
        inspections,
        properties,
        communities,
        quickConfig
      );
    } catch (error) {
      console.error('Failed to generate quick report data:', error);
      return null;
    }
  }, [inspections, properties, communities]);

  return {
    generateReport,
    exportReport,
    isGenerating,
    generationError,
    lastGeneratedReport,
    quickReportData: getQuickReportData,
    clearError: () => setGenerationError(null)
  };
}

// Data Import/Export Hook
export function useDataImport() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<any[]>([]);

  const { createPropertiesBulk } = useProperties();

  const processCSVImport = useCallback(async (
    csvContent: string,
    communityId: string
  ): Promise<{
    success: boolean;
    processedCount: number;
    errorCount: number;
    errors: Array<{ row: number; errors: string[] }>;
  }> => {
    setIsProcessing(true);
    setProcessingError(null);

    try {
      const results = DataExportService.processBulkImport(csvContent);
      setImportResults(results);

      const validRows = results.filter(r => r.isValid);
      const errorRows = results.filter(r => !r.isValid);

      if (validRows.length > 0) {
        const propertiesToCreate = validRows.map(row => ({
          ...row.data!,
          communityId
        }));

        await createPropertiesBulk(communityId, propertiesToCreate);
      }

      return {
        success: true,
        processedCount: validRows.length,
        errorCount: errorRows.length,
        errors: errorRows.map(row => ({
          row: row.rowIndex,
          errors: row.errors
        }))
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      setProcessingError(errorMessage);
      return {
        success: false,
        processedCount: 0,
        errorCount: 0,
        errors: [{ row: 0, errors: [errorMessage] }]
      };
    } finally {
      setIsProcessing(false);
    }
  }, [createPropertiesBulk]);

  const generateImportTemplate = useCallback(() => {
    const templateContent = [
      'address,propertytype,status,bedrooms,bathrooms,squarefootage,rent',
      '123 Main St,apartment,active,2,1,850,1200',
      '456 Oak Ave,house,active,3,2,1200,1800',
      '789 Pine Dr,townhouse,under-construction,2,1.5,950,1400'
    ].join('\n');

    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'property-import-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return {
    processCSVImport,
    generateImportTemplate,
    isProcessing,
    processingError,
    importResults,
    clearError: () => setProcessingError(null)
  };
}

// Advanced Analytics Hook
export function useAdvancedAnalytics() {
  const { communities } = useCommunities();
  const { properties } = useProperties();
  const { inspections } = useInspections();

  const predictiveMaintenanceData = useMemo(() => {
    if (properties.length === 0 || inspections.length === 0) return [];
    
    return AdvancedAnalyticsService.analyzePredictiveMaintenance(properties, inspections);
  }, [properties, inspections]);

  const portfolioPerformanceData = useMemo(() => {
    if (communities.length === 0 || properties.length === 0) return null;
    
    return AdvancedAnalyticsService.analyzePortfolioPerformance(
      communities,
      properties,
      inspections
    );
  }, [communities, properties, inspections]);

  const getPropertyRiskAnalysis = useCallback((propertyId: string) => {
    return predictiveMaintenanceData.find(data => data.propertyId === propertyId);
  }, [predictiveMaintenanceData]);

  const getCommunityPerformance = useCallback((communityId: string) => {
    if (!portfolioPerformanceData) return null;
    return portfolioPerformanceData.portfolioMetrics.find(
      metrics => metrics.communityId === communityId
    );
  }, [portfolioPerformanceData]);

  const getTopRiskProperties = useCallback((limit: number = 5) => {
    return predictiveMaintenanceData
      .filter(data => data.riskLevel === 'high' || data.riskLevel === 'critical')
      .slice(0, limit);
  }, [predictiveMaintenanceData]);

  const getMaintenanceCostProjections = useMemo(() => {
    const totalEstimatedCosts = predictiveMaintenanceData.reduce(
      (sum, data) => sum + data.estimatedMaintenanceCost,
      0
    );

    const costByRiskLevel = predictiveMaintenanceData.reduce((acc, data) => {
      acc[data.riskLevel] = (acc[data.riskLevel] || 0) + data.estimatedMaintenanceCost;
      return acc;
    }, {} as Record<string, number>);

    const costByCommunity = communities.map(community => {
      const communityProperties = properties.filter(p => p.communityId === community.id);
      const communityMaintenanceData = predictiveMaintenanceData.filter(
        data => communityProperties.some(p => p.id === data.propertyId)
      );
      
      const totalCost = communityMaintenanceData.reduce(
        (sum, data) => sum + data.estimatedMaintenanceCost,
        0
      );

      return {
        communityId: community.id,
        communityName: community.name,
        estimatedCost: totalCost,
        propertyCount: communityProperties.length,
        avgCostPerProperty: communityProperties.length > 0 ? 
          Math.round(totalCost / communityProperties.length) : 0
      };
    });

    return {
      totalEstimatedCosts,
      costByRiskLevel,
      costByCommunity: costByCommunity.sort((a, b) => b.estimatedCost - a.estimatedCost)
    };
  }, [predictiveMaintenanceData, communities, properties]);

  return {
    predictiveMaintenanceData,
    portfolioPerformanceData,
    getPropertyRiskAnalysis,
    getCommunityPerformance,
    getTopRiskProperties,
    maintenanceCostProjections: getMaintenanceCostProjections,
    hasData: properties.length > 0 && inspections.length > 0
  };
}

// Dashboard Data Processing Hook
export function useDashboardDataProcessing() {
  const { quickReportData } = useReportGeneration();
  const { portfolioPerformanceData, getTopRiskProperties } = useAdvancedAnalytics();

  const processDashboardCharts = useMemo(() => {
    if (!quickReportData) return null;

    return {
      inspectionVolumeChart: {
        ...quickReportData.charts.inspectionVolumeChart,
        config: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Number of Inspections' }
            },
            x: {
              title: { display: true, text: 'Month' }
            }
          }
        }
      },
      issueSeverityChart: {
        ...quickReportData.charts.issueSeverityChart,
        config: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right' as const }
          }
        }
      },
      propertyHealthChart: {
        ...quickReportData.charts.propertyHealthChart,
        config: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y' as const,
          scales: {
            x: {
              beginAtZero: true,
              title: { display: true, text: 'Number of Properties' }
            }
          }
        }
      }
    };
  }, [quickReportData]);

  const processDashboardAlerts = useMemo(() => {
    const topRiskProperties = getTopRiskProperties(3);
    const portfolioAlerts = [];

    // Add high-risk property alerts
    topRiskProperties.forEach(property => {
      if (property.riskLevel === 'critical') {
        portfolioAlerts.push({
          type: 'critical' as const,
          title: 'Critical Maintenance Risk',
          message: `${property.address} requires immediate attention`,
          actionText: 'View Details',
          propertyId: property.propertyId
        });
      }
    });

    // Add portfolio performance alerts
    if (portfolioPerformanceData?.underPerformers.length) {
      const worstPerformer = portfolioPerformanceData.underPerformers[0];
      if (worstPerformer.maintenanceScore < 60) {
        portfolioAlerts.push({
          type: 'warning' as const,
          title: 'Community Performance Alert',
          message: `${worstPerformer.name} has low maintenance score (${worstPerformer.maintenanceScore})`,
          actionText: 'Review Community',
          communityId: worstPerformer.communityId
        });
      }
    }

    return portfolioAlerts;
  }, [getTopRiskProperties, portfolioPerformanceData]);

  return {
    dashboardCharts: processDashboardCharts,
    dashboardAlerts: processDashboardAlerts,
    quickMetrics: quickReportData?.summary,
    isReady: !!quickReportData && !!portfolioPerformanceData
  };
}