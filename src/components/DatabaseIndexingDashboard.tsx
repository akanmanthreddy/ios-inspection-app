import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  useDatabaseIndexes, 
  useQueryAnalysis, 
  useIndexRecommendations,
  useDatabaseSchema,
  useDatabasePerformance
} from '../hooks/useDatabaseIndexing';
import { DatabaseIndex, IndexRecommendation } from '../services/databaseIndexing';
import {
  Database,
  Search,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  Settings,
  Play,
  Trash2,
  Plus,
  ArrowLeft,
  FileText,
  Activity,
  Target,
  Layers,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface DatabaseIndexingDashboardProps {
  onBack?: () => void;
}

export function DatabaseIndexingDashboard({ onBack }: DatabaseIndexingDashboardProps) {
  const { indexes, loading: indexesLoading, createIndex, dropIndex, getTableIndexes } = useDatabaseIndexes();
  const { analyzeQuery, analyzing, currentPlan, getOptimizationSuggestions } = useQueryAnalysis();
  const { 
    recommendations, 
    maintenanceRecommendations, 
    applyRecommendation, 
    dismissRecommendation,
    getRecommendationsByPriority 
  } = useIndexRecommendations();
  const { schema, getTableInfo } = useDatabaseSchema();
  const { analytics, performanceMetrics, getPerformanceTrends } = useDatabasePerformance();

  const [selectedTab, setSelectedTab] = useState('overview');
  const [queryToAnalyze, setQueryToAnalyze] = useState('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [showCreateIndexDialog, setShowCreateIndexDialog] = useState(false);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusColor = (status: DatabaseIndex['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'unused': return 'bg-yellow-100 text-yellow-800';
      case 'rebuilding': return 'bg-blue-100 text-blue-800';
      case 'invalid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: IndexRecommendation['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAnalyzeQuery = async () => {
    if (!queryToAnalyze.trim()) return;
    try {
      await analyzeQuery(queryToAnalyze);
    } catch (error) {
      console.error('Query analysis failed:', error);
    }
  };

  const handleApplyRecommendation = async (recommendationId: string) => {
    try {
      const success = await applyRecommendation(recommendationId);
      if (success) {
        // Show success message or update UI
        console.log('Recommendation applied successfully');
      }
    } catch (error) {
      console.error('Failed to apply recommendation:', error);
    }
  };

  const criticalRecommendations = getRecommendationsByPriority('critical');
  const highPriorityRecommendations = getRecommendationsByPriority('high');
  const performanceTrends = getPerformanceTrends();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-3xl" style={{ color: '#1b365d', fontWeight: '600' }}>
                Database Indexing & Optimization
              </h1>
              <p className="text-muted" style={{ color: '#768692' }}>
                Monitor, analyze, and optimize database performance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Critical Alerts */}
        {criticalRecommendations.length > 0 && (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{criticalRecommendations.length} Critical Performance Issue{criticalRecommendations.length > 1 ? 's' : ''}</strong>
              {criticalRecommendations.length === 1 && `: ${criticalRecommendations[0].reason}`}
              {criticalRecommendations.length > 1 && ` require immediate attention`}
            </AlertDescription>
          </Alert>
        )}

        {/* Performance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Indexes</p>
                  <p className="text-2xl font-semibold">{performanceMetrics?.totalIndexes || 0}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Active</span>
                  <span>{performanceMetrics?.activeIndexes || 0}</span>
                </div>
                <Progress 
                  value={performanceMetrics ? (performanceMetrics.activeIndexes / performanceMetrics.totalIndexes) * 100 : 0} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Query Time</p>
                  <p className="text-2xl font-semibold">
                    {formatDuration(performanceMetrics?.avgQueryTime || 0)}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Target: &lt;50ms</span>
                  <span className={performanceMetrics?.avgQueryTime > 50 ? 'text-red-600' : 'text-green-600'}>
                    {performanceMetrics?.avgQueryTime > 50 ? 'Above' : 'Within'} target
                  </span>
                </div>
                <Progress 
                  value={Math.min(100, ((performanceMetrics?.avgQueryTime || 0) / 100) * 100)} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Index Hit Ratio</p>
                  <p className="text-2xl font-semibold">
                    {performanceMetrics?.indexHitRatio?.toFixed(1) || 0}%
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Target: &gt;90%</span>
                  <span className={(performanceMetrics?.indexHitRatio || 0) > 90 ? 'text-green-600' : 'text-orange-600'}>
                    {(performanceMetrics?.indexHitRatio || 0) > 90 ? 'Good' : 'Needs improvement'}
                  </span>
                </div>
                <Progress 
                  value={performanceMetrics?.indexHitRatio || 0} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Recommendations</p>
                  <p className="text-2xl font-semibold">
                    {recommendations.length + maintenanceRecommendations.length}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>High Priority</span>
                  <span>{highPriorityRecommendations.length}</span>
                </div>
                <Progress 
                  value={recommendations.length > 0 ? (highPriorityRecommendations.length / recommendations.length) * 100 : 0} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="indexes" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Indexes
            </TabsTrigger>
            <TabsTrigger value="query-analysis" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Query Analysis
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="schema" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Schema
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Trends (24h)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceTrends.slice(0, 6).map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">
                            {new Date(trend.timestamp).toLocaleTimeString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {trend.totalQueries} queries
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatDuration(trend.avgQueryTime)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {trend.slowQueries} slow
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Top Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...recommendations, ...maintenanceRecommendations]
                      .sort((a, b) => {
                        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                        return priorityOrder[b.priority] - priorityOrder[a.priority];
                      })
                      .slice(0, 5)
                      .map((rec) => (
                        <div key={rec.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={getPriorityColor(rec.priority)}>
                                  {rec.priority}
                                </Badge>
                                <Badge variant="outline">
                                  {rec.type}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium mb-1">
                                {rec.table}.{rec.columns.join(', ')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {rec.reason}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApplyRecommendation(rec.id)}
                              >
                                Apply
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => dismissRecommendation(rec.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Expected improvement: {rec.expectedImprovement.queryTimeReduction}% faster queries
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Index Usage Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Index Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-semibold text-green-600">
                      {performanceMetrics?.activeIndexes || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Active Indexes</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-semibold text-yellow-600">
                      {performanceMetrics?.unusedIndexes || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Unused Indexes</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-semibold text-blue-600">
                      {formatBytes((performanceMetrics?.totalIndexSize || 0) * 1024)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Size</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Indexes Tab */}
          <TabsContent value="indexes" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">Database Indexes</h2>
                <Badge variant="secondary">{indexes.length} total</Badge>
              </div>
              <Button onClick={() => setShowCreateIndexDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Index
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Columns</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {indexes.map((index) => (
                      <TableRow key={index.id}>
                        <TableCell className="font-medium">{index.name}</TableCell>
                        <TableCell>{index.table}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {index.columns.map(col => (
                              <Badge key={col} variant="outline" className="text-xs">
                                {col}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{index.type}</Badge>
                        </TableCell>
                        <TableCell>{formatBytes(index.size * 1024)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={index.usage} className="h-2 w-16" />
                            <span className="text-sm">{index.usage}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(index.status)}>
                            {index.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => dropIndex(index.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Query Analysis Tab */}
          <TabsContent value="query-analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Query Analyzer
                </CardTitle>
                <CardDescription>
                  Analyze SQL queries for performance optimization opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">SQL Query</label>
                    <Textarea
                      value={queryToAnalyze}
                      onChange={(e) => setQueryToAnalyze(e.target.value)}
                      placeholder="Enter your SQL query here..."
                      className="font-mono text-sm"
                      rows={6}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAnalyzeQuery}
                      disabled={analyzing || !queryToAnalyze.trim()}
                      style={{ backgroundColor: '#1b365d' }}
                    >
                      {analyzing ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Analyze Query
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setQueryToAnalyze('')}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Query Plan Results */}
            {currentPlan && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Execution Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-semibold">{formatDuration(currentPlan.executionTime)}</p>
                      <p className="text-sm text-muted-foreground">Execution Time</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-semibold">{currentPlan.cost.toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">Cost</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-semibold">{currentPlan.rows.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Rows</p>
                    </div>
                  </div>

                  {/* Operations */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Operations</h4>
                    {currentPlan.operations.map((op, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{op.type.replace('_', ' ')}</Badge>
                            {op.table && <span className="text-sm text-muted-foreground">{op.table}</span>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Cost: {op.cost.toFixed(1)} | Time: {formatDuration(op.time)}
                          </div>
                        </div>
                        {op.index && (
                          <p className="text-xs text-muted-foreground">Using index: {op.index}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Optimization Suggestions */}
                  {currentPlan.recommendations.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Optimization Suggestions</h4>
                      <div className="space-y-2">
                        {currentPlan.recommendations.map((rec, index) => (
                          <Alert key={index}>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{rec.reason}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Performance Recommendations</h2>
              <Badge variant="secondary">
                {recommendations.length + maintenanceRecommendations.length} recommendations
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Index Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Index Recommendations
                  </CardTitle>
                  <CardDescription>
                    Suggested indexes to improve query performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendations.map((rec) => (
                      <div key={rec.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(rec.priority)}>
                              {rec.priority}
                            </Badge>
                            <Badge variant="outline">{rec.type}</Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleApplyRecommendation(rec.id)}
                              style={{ backgroundColor: '#1b365d' }}
                            >
                              Apply
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => dismissRecommendation(rec.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="font-medium">{rec.table}.{rec.columns.join(', ')}</p>
                          <p className="text-sm text-muted-foreground">{rec.reason}</p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Speed: </span>
                              <span className="text-green-600">+{rec.expectedImprovement.queryTimeReduction}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Size: </span>
                              <span>{formatBytes(rec.expectedImprovement.storageImpact * 1024)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Overhead: </span>
                              <span>{rec.expectedImprovement.maintenanceOverhead}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Maintenance Recommendations
                  </CardTitle>
                  <CardDescription>
                    Index maintenance and cleanup suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {maintenanceRecommendations.map((rec) => (
                      <div key={rec.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(rec.priority)}>
                              {rec.priority}
                            </Badge>
                            <Badge variant="outline">{rec.type}</Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleApplyRecommendation(rec.id)}
                              variant="outline"
                            >
                              Apply
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => dismissRecommendation(rec.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="font-medium">{rec.table}.{rec.columns.join(', ')}</p>
                          <p className="text-sm text-muted-foreground">{rec.reason}</p>
                          <div className="text-xs text-muted-foreground">
                            {rec.type === 'drop' && 'Will free up '}
                            {rec.type === 'rebuild' && 'Will optimize '}
                            {Math.abs(rec.expectedImprovement.storageImpact)} KB
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Schema Tab */}
          <TabsContent value="schema" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Database Schema Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {schema && (
                  <div className="space-y-6">
                    {Object.entries(schema.tables).map(([tableName, tableInfo]) => (
                      <div key={tableName} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium">{tableName}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{Object.keys(tableInfo.columns).length} columns</span>
                            <span>{tableInfo.indexes.length} indexes</span>
                            <span>{tableInfo.rowCount.toLocaleString()} rows</span>
                            <span>{formatBytes(tableInfo.size * 1024)}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Columns */}
                          <div>
                            <h4 className="font-medium mb-2">Columns</h4>
                            <div className="space-y-1">
                              {Object.entries(tableInfo.columns).map(([columnName, columnInfo]) => (
                                <div key={columnName} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{columnName}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {columnInfo.type}
                                    </Badge>
                                    {columnInfo.primaryKey && (
                                      <Badge className="text-xs bg-blue-100 text-blue-800">PK</Badge>
                                    )}
                                    {columnInfo.foreignKey && (
                                      <Badge className="text-xs bg-purple-100 text-purple-800">FK</Badge>
                                    )}
                                    {columnInfo.indexed && (
                                      <Badge className="text-xs bg-green-100 text-green-800">IDX</Badge>
                                    )}
                                  </div>
                                  {columnInfo.cardinality && (
                                    <span className="text-muted-foreground">
                                      {columnInfo.cardinality.toLocaleString()} unique
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Indexes */}
                          <div>
                            <h4 className="font-medium mb-2">Indexes</h4>
                            <div className="space-y-1">
                              {getTableIndexes(tableName).map((index) => (
                                <div key={index.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{index.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {index.type}
                                    </Badge>
                                  </div>
                                  <div className="text-muted-foreground">
                                    {formatBytes(index.size * 1024)} | {index.usage}%
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}