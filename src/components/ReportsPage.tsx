import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { LoadingSpinner } from './LoadingSpinner';
import { useReportGeneration, useDataImport } from '../hooks/useDataProcessing';
import { useCommunities } from '../hooks/useCommunities';
import { ReportConfig } from '../services/dataProcessing';
import {
  FileText,
  Download,
  Upload,
  Calendar,
  Filter,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  FileDown,
  ArrowLeft,
  FileSpreadsheet
} from 'lucide-react';

interface ReportsPageProps {
  onBack: () => void;
}

export function ReportsPage({ onBack }: ReportsPageProps) {
  const { communities } = useCommunities();
  const {
    generateReport,
    exportReport,
    isGenerating,
    generationError,
    lastGeneratedReport,
    quickReportData,
    clearError
  } = useReportGeneration();
  
  const {
    processCSVImport,
    generateImportTemplate,
    isProcessing,
    processingError,
    importResults,
    clearError: clearImportError
  } = useDataImport();

  const [activeTab, setActiveTab] = useState<'reports' | 'import'>('reports');
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: 'system-wide',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    includeCharts: true,
    includeIssueDetails: false,
    format: 'pdf'
  });
  
  const [selectedCommunityForImport, setSelectedCommunityForImport] = useState<string>('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [localImportResults, setLocalImportResults] = useState<any>(null);

  const handleGenerateReport = useCallback(async () => {
    try {
      clearError();
      await generateReport(reportConfig);
    } catch (error) {
      // Error is handled by the hook
    }
  }, [generateReport, reportConfig, clearError]);

  const handleExportReport = useCallback((format: 'csv' | 'json', type: 'summary' | 'detailed' | 'trends' = 'summary') => {
    if (!lastGeneratedReport) return;
    
    const result = exportReport(lastGeneratedReport, format, type);
    if (result.success) {
      alert(`Report exported successfully: ${result.filename}`);
    } else {
      alert(`Export failed: ${result.error}`);
    }
  }, [lastGeneratedReport, exportReport]);

  const handleFileImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedCommunityForImport) return;

    try {
      const content = await file.text();
      const results = await processCSVImport(content, selectedCommunityForImport);
      setLocalImportResults(results);
    } catch (error) {
      console.error('Import failed:', error);
    }
  }, [selectedCommunityForImport, processCSVImport]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl" style={{ color: '#1b365d', fontWeight: '600' }}>
                Reports & Analytics
              </h1>
              <p className="text-muted" style={{ color: '#768692' }}>
                Generate comprehensive reports and manage data imports
              </p>
            </div>
          </div>
        </div>

        {/* Quick Metrics Overview */}
        {quickReportData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Inspections</p>
                    <p className="text-2xl font-semibold">{formatNumber(quickReportData.summary.totalInspections)}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-semibold text-green-600">{formatNumber(quickReportData.summary.completedInspections)}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Critical Issues</p>
                    <p className="text-2xl font-semibold text-red-600">{formatNumber(quickReportData.summary.criticalIssues)}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Time</p>
                    <p className="text-2xl font-semibold">{quickReportData.summary.averageInspectionTime}min</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-8 w-fit">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'reports'
                ? 'bg-white shadow-sm text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Generate Reports
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'import'
                ? 'bg-white shadow-sm text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="h-4 w-4 inline mr-2" />
            Import Data
          </button>
        </div>

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Report Configuration */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Report Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your report parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="report-type">Report Type</Label>
                    <Select
                      value={reportConfig.type}
                      onValueChange={(value: any) =>
                        setReportConfig(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system-wide">System-wide</SelectItem>
                        <SelectItem value="community">By Community</SelectItem>
                        <SelectItem value="property">By Property</SelectItem>
                        <SelectItem value="inspector">By Inspector</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={reportConfig.dateRange.start}
                        onChange={(e) =>
                          setReportConfig(prev => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, start: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={reportConfig.dateRange.end}
                        onChange={(e) =>
                          setReportConfig(prev => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, end: e.target.value }
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Include Options</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-charts"
                          checked={reportConfig.includeCharts}
                          onCheckedChange={(checked) =>
                            setReportConfig(prev => ({ ...prev, includeCharts: !!checked }))
                          }
                        />
                        <Label htmlFor="include-charts" className="text-sm">
                          Include Charts & Visualizations
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-details"
                          checked={reportConfig.includeIssueDetails}
                          onCheckedChange={(checked) =>
                            setReportConfig(prev => ({ ...prev, includeIssueDetails: !!checked }))
                          }
                        />
                        <Label htmlFor="include-details" className="text-sm">
                          Include Detailed Issue Data
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    className="w-full"
                    style={{ backgroundColor: '#1b365d' }}
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Generate Report
                      </div>
                    )}
                  </Button>

                  {generationError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{generationError}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Report Results */}
            <div className="lg:col-span-2">
              {lastGeneratedReport ? (
                <div className="space-y-6">
                  {/* Report Summary */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Report Summary</CardTitle>
                          <CardDescription>
                            Generated: {new Date(lastGeneratedReport.metadata.generatedAt).toLocaleString()}
                          </CardDescription>
                        </div>
                        <Badge>{lastGeneratedReport.metadata.totalRecords} records</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-semibold text-green-600">
                            {formatNumber(lastGeneratedReport.summary.completedInspections)}
                          </p>
                          <p className="text-sm text-muted-foreground">Completed</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-semibold text-yellow-600">
                            {formatNumber(lastGeneratedReport.summary.pendingInspections)}
                          </p>
                          <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-semibold text-red-600">
                            {formatNumber(lastGeneratedReport.summary.overdueInspections)}
                          </p>
                          <p className="text-sm text-muted-foreground">Overdue</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-semibold text-purple-600">
                            {formatNumber(lastGeneratedReport.summary.totalIssues)}
                          </p>
                          <p className="text-sm text-muted-foreground">Total Issues</p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Issue Resolution Rate</span>
                          <span className="text-sm font-medium">
                            {Math.round((lastGeneratedReport.summary.resolvedIssues / Math.max(lastGeneratedReport.summary.totalIssues, 1)) * 100)}%
                          </span>
                        </div>
                        <Progress
                          value={(lastGeneratedReport.summary.resolvedIssues / Math.max(lastGeneratedReport.summary.totalIssues, 1)) * 100}
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Export Options */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Export Report
                      </CardTitle>
                      <CardDescription>
                        Download your report in various formats
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                          variant="outline"
                          onClick={() => handleExportReport('csv', 'summary')}
                          className="flex items-center gap-2"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                          CSV Summary
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleExportReport('csv', 'detailed')}
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          CSV Detailed
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleExportReport('json')}
                          className="flex items-center gap-2"
                        >
                          <FileDown className="h-4 w-4" />
                          JSON Data
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trends Overview */}
                  {lastGeneratedReport.trends.inspectionTrends.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="h-5 w-5" />
                          Trends & Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Monthly Inspection Volume</h4>
                            <div className="space-y-2">
                              {lastGeneratedReport.trends.inspectionTrends.slice(-6).map((trend, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <span className="text-sm">{trend.month}</span>
                                  <span className="text-sm font-medium">{trend.completed} completed</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Top Property Health Issues</h4>
                            <div className="space-y-1">
                              {lastGeneratedReport.trends.propertyHealth
                                .filter(p => p.score < 70)
                                .slice(0, 5)
                                .map((property, index) => (
                                  <div key={index} className="flex items-center justify-between text-sm">
                                    <span className="truncate">{property.address}</span>
                                    <Badge variant={property.score < 40 ? 'destructive' : 'secondary'}>
                                      {property.score}
                                    </Badge>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Report Generated Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Configure your report parameters and click "Generate Report" to get started.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div className="max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Import Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Import Properties
                  </CardTitle>
                  <CardDescription>
                    Bulk import properties from CSV file
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="community-select">Select Community</Label>
                    <Select
                      value={selectedCommunityForImport}
                      onValueChange={setSelectedCommunityForImport}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose community..." />
                      </SelectTrigger>
                      <SelectContent>
                        {communities.map(community => (
                          <SelectItem key={community.id} value={community.id}>
                            {community.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="csv-file">CSV File</Label>
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileImport}
                      disabled={!selectedCommunityForImport || isProcessing}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload a CSV file with property data
                    </p>
                  </div>

                  <Button
                    onClick={generateImportTemplate}
                    variant="outline"
                    className="w-full"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>

                  {processingError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{processingError}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Import Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Import Results</CardTitle>
                  <CardDescription>
                    {isProcessing ? 'Processing import...' : 'Import status and results'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isProcessing ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner message="Processing import..." />
                    </div>
                  ) : localImportResults ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-semibold text-green-600">
                            {localImportResults.processedCount}
                          </p>
                          <p className="text-sm text-muted-foreground">Successful</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-semibold text-red-600">
                            {localImportResults.errorCount}
                          </p>
                          <p className="text-sm text-muted-foreground">Errors</p>
                        </div>
                      </div>

                      {localImportResults.errors.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Import Errors</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {localImportResults.errors.map((error: any, index: number) => (
                              <div key={index} className="text-sm p-2 bg-red-50 rounded border-l-2 border-red-200">
                                <strong>Row {error.row}:</strong> {error.errors.join(', ')}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {localImportResults.processedCount > 0 && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            Successfully imported {localImportResults.processedCount} properties.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Upload className="h-16 w-16 mx-auto mb-4" />
                      <p>Upload a CSV file to see import results here.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}