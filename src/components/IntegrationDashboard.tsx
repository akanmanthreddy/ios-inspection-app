import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Switch } from './ui/switch';
import { 
  useIntegration,
  useSystemStatus,
  useIntegrationMetrics,
  useIntegrationEvents,
  useDataFlowManagement,
  useSystemOperations
} from '../hooks/useIntegration';
import { SystemStatus, IntegrationEvent, DataFlowMapping } from '../services/integrationService';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  GitBranch,
  Globe,
  RefreshCw,
  Settings,
  Shield,
  TrendingUp,
  Zap,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Download,
  Bell,
  Users,
  BarChart3,
  Network,
  Server,
  Wifi,
  WifiOff,
  AlertCircle,
  Info,
  XCircle
} from 'lucide-react';

interface IntegrationDashboardProps {
  onBack?: () => void;
}

export function IntegrationDashboard({ onBack }: IntegrationDashboardProps) {
  const { 
    systemStatus, 
    metrics, 
    events, 
    dataFlows, 
    operations,
    isSystemHealthy,
    getOverallStatus,
    getCriticalIssues
  } = useIntegration();

  const [selectedTab, setSelectedTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const overallStatus = getOverallStatus();
  const criticalIssues = getCriticalIssues();
  const systemHealth = systemStatus.getSystemHealth();
  const performanceScore = metrics.getPerformanceScore();
  const eventSuccessRate = metrics.getEventSuccessRate();
  const dataSyncStatus = metrics.getDataSyncStatus();

  const getStatusColor = (status: SystemStatus['status']) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 border-green-200';
      case 'offline': return 'bg-red-100 text-red-800 border-red-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'initializing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: SystemStatus['status']) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'offline': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'initializing': return <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getOverallStatusColor = () => {
    switch (overallStatus) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getEventTypeIcon = (type: IntegrationEvent['type']) => {
    switch (type) {
      case 'inspection_created': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'property_updated': return <Database className="h-4 w-4 text-green-600" />;
      case 'community_added': return <Users className="h-4 w-4 text-purple-600" />;
      case 'report_generated': return <BarChart3 className="h-4 w-4 text-orange-600" />;
      case 'alert_triggered': return <Bell className="h-4 w-4 text-yellow-600" />;
      case 'system_error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getSyncFrequencyBadge = (frequency: DataFlowMapping['syncFrequency']) => {
    switch (frequency) {
      case 'real-time': return <Badge className="bg-green-100 text-green-800">Real-time</Badge>;
      case 'hourly': return <Badge className="bg-blue-100 text-blue-800">Hourly</Badge>;
      case 'daily': return <Badge className="bg-purple-100 text-purple-800">Daily</Badge>;
      case 'manual': return <Badge className="bg-gray-100 text-gray-800">Manual</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      systemStatus.refreshSystemStatus();
      metrics.refreshMetrics();
      events.refreshEvents();
      dataFlows.refreshDataFlows();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, systemStatus, metrics, events, dataFlows]);

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
                System Integration Dashboard
              </h1>
              <p className="text-muted" style={{ color: '#768692' }}>
                Monitor and manage all system integrations and data flows
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Auto-refresh</span>
              <Switch 
                checked={autoRefresh} 
                onCheckedChange={setAutoRefresh}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={operations.triggerManualSync}
              disabled={operations.isSyncing}
            >
              {operations.isSyncing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync All
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Critical Issues Alert */}
        {criticalIssues.length > 0 && (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{criticalIssues.length} Critical Issue{criticalIssues.length > 1 ? 's' : ''}</strong>
              <div className="mt-1">
                {criticalIssues.map((issue, index) => (
                  <div key={index}>• {issue}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">System Health</p>
                  <p className={`text-2xl font-semibold ${getOverallStatusColor()}`}>
                    {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Performance Score</span>
                  <span>{performanceScore}/100</span>
                </div>
                <Progress value={performanceScore} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Server className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Systems Online</p>
                  <p className="text-2xl font-semibold">
                    {systemHealth.healthy}/{systemHealth.total}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Availability</span>
                  <span>{Math.round((systemHealth.healthy / systemHealth.total) * 100)}%</span>
                </div>
                <Progress 
                  value={(systemHealth.healthy / systemHealth.total) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Event Success</p>
                  <p className="text-2xl font-semibold">{eventSuccessRate}%</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Target: &gt;95%</span>
                  <span className={eventSuccessRate > 95 ? 'text-green-600' : 'text-orange-600'}>
                    {eventSuccessRate > 95 ? 'Good' : 'Needs attention'}
                  </span>
                </div>
                <Progress value={eventSuccessRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Network className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Data Flows</p>
                  <p className="text-2xl font-semibold">
                    {dataFlows.getEnabledDataFlows().length}/{dataFlows.dataFlows.length}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Active Flows</span>
                  <span>{Math.round((dataFlows.getEnabledDataFlows().length / dataFlows.dataFlows.length) * 100)}%</span>
                </div>
                <Progress 
                  value={(dataFlows.getEnabledDataFlows().length / dataFlows.dataFlows.length) * 100} 
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
            <TabsTrigger value="systems" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Systems
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="data-flows" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Data Flows
            </TabsTrigger>
            <TabsTrigger value="operations" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Operations
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Status Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    System Status Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemStatus.systemStatuses.slice(0, 6).map((system) => (
                      <div key={system.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(system.status)}
                          <div>
                            <p className="font-medium">{system.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {system.responseTime}ms • {formatTimestamp(system.lastHealthCheck)}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(system.status)}>
                          {system.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Data Synchronization Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Data Synchronization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Communities</span>
                        <span>{dataSyncStatus.communities}%</span>
                      </div>
                      <Progress value={dataSyncStatus.communities} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Properties</span>
                        <span>{dataSyncStatus.properties}%</span>
                      </div>
                      <Progress value={dataSyncStatus.properties} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Inspections</span>
                        <span>{dataSyncStatus.inspections}%</span>
                      </div>
                      <Progress value={dataSyncStatus.inspections} className="h-2" />
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Last sync: {formatTimestamp(metrics.metrics?.dataSync.communities.lastSync || new Date().toISOString())}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Integration Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.recentEvents.slice(0, 10).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getEventTypeIcon(event.type)}
                        <div>
                          <p className="font-medium">{event.type.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            From: {event.source} {event.target && `→ ${event.target}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={event.processed ? 'default' : 'secondary'}>
                          {event.processed ? 'Processed' : 'Pending'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimestamp(event.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Systems Tab */}
          <TabsContent value="systems" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">System Status Monitor</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={systemStatus.refreshSystemStatus}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={operations.emergencyRestart}
                  disabled={operations.isRestarting}
                >
                  {operations.isRestarting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4 mr-2" />
                  )}
                  Emergency Restart
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>System</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Uptime</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Last Check</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemStatus.systemStatuses.map((system) => (
                      <TableRow key={system.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(system.status)}
                            <span className="font-medium">{system.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(system.status)}>
                            {system.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={system.responseTime && system.responseTime > 100 ? 'text-red-600' : 'text-green-600'}>
                            {system.responseTime || 0}ms
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-green-600">
                            {system.uptime?.toFixed(1) || 0}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{system.version || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatTimestamp(system.lastHealthCheck)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost">
                              <Settings className="h-3 w-3" />
                            </Button>
                            {system.status === 'error' && (
                              <Button size="sm" variant="ghost">
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Integration Events</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={events.refreshEvents}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Event Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-semibold text-blue-600">{events.events.length}</p>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-semibold text-green-600">
                    {events.events.filter(e => e.processed).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Processed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-semibold text-yellow-600">
                    {events.getPendingEvents().length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-semibold text-red-600">
                    {events.getFailedEvents().length}
                  </p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </CardContent>
              </Card>
            </div>

            {/* Events Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Retries</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.recentEvents.slice(0, 20).map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEventTypeIcon(event.type)}
                            <span>{event.type.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{event.source}</Badge>
                        </TableCell>
                        <TableCell>
                          {event.target ? (
                            <Badge variant="outline">{event.target}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={event.processed ? 'default' : 'secondary'}>
                            {event.processed ? 'Processed' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatTimestamp(event.timestamp)}
                        </TableCell>
                        <TableCell>
                          {event.retryCount ? (
                            <Badge variant="destructive">{event.retryCount}</Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Flows Tab */}
          <TabsContent value="data-flows" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Data Flow Management</h2>
              <Badge variant="secondary">
                {dataFlows.getEnabledDataFlows().length} of {dataFlows.dataFlows.length} active
              </Badge>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Data Type</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Sync</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dataFlows.dataFlows.map((flow, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant="outline">{flow.source}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{flow.target}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{flow.dataType.replace('_', ' ')}</span>
                        </TableCell>
                        <TableCell>
                          {getSyncFrequencyBadge(flow.syncFrequency)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {flow.enabled ? (
                              <Wifi className="h-4 w-4 text-green-600" />
                            ) : (
                              <WifiOff className="h-4 w-4 text-red-600" />
                            )}
                            <Badge variant={flow.enabled ? 'default' : 'secondary'}>
                              {flow.enabled ? 'Active' : 'Disabled'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {flow.lastSync ? formatTimestamp(flow.lastSync) : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={flow.enabled}
                            onCheckedChange={(enabled) => 
                              dataFlows.toggleDataFlow(flow.source, flow.target, enabled)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Operations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Operations
                  </CardTitle>
                  <CardDescription>
                    Manage system-wide operations and maintenance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={operations.triggerManualSync}
                    disabled={operations.isSyncing}
                    className="w-full"
                    style={{ backgroundColor: '#1b365d' }}
                  >
                    {operations.isSyncing ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Trigger Full Synchronization
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={systemStatus.refreshSystemStatus}
                    className="w-full"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Refresh System Status
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={operations.emergencyRestart}
                    disabled={operations.isRestarting}
                    className="w-full"
                  >
                    {operations.isRestarting ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    Emergency System Restart
                  </Button>
                </CardContent>
              </Card>

              {/* System Health Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    System Health Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-semibold text-green-600">
                        {systemHealth.healthy}
                      </p>
                      <p className="text-sm text-muted-foreground">Systems Online</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-semibold text-blue-600">
                        {performanceScore}
                      </p>
                      <p className="text-sm text-muted-foreground">Performance Score</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>System Uptime</span>
                      <span>{metrics.getSystemUptime()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Event Success Rate</span>
                      <span>{eventSuccessRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Active Data Flows</span>
                      <span>{dataFlows.getEnabledDataFlows().length}/{dataFlows.dataFlows.length}</span>
                    </div>
                  </div>
                  
                  {criticalIssues.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {criticalIssues.length} critical issue{criticalIssues.length > 1 ? 's' : ''} require attention
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}