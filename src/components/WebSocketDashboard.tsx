import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  useWebSocketIntegration,
  useDatabaseWebSocketMonitoring,
  useInspectionWebSocket,
  useAlertWebSocket,
  useSystemHealthWebSocket
} from '../hooks/useWebSocket';
import {
  Wifi,
  WifiOff,
  Activity,
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  Signal,
  MessageSquare,
  Zap,
  Server,
  Users,
  ArrowLeft,
  RefreshCw,
  Settings,
  Play,
  Pause,
  X,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';

interface WebSocketDashboardProps {
  onBack?: () => void;
}

export function WebSocketDashboard({ onBack }: WebSocketDashboardProps) {
  const webSocket = useWebSocketIntegration();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [autoConnect, setAutoConnect] = useState(true);

  useEffect(() => {
    if (autoConnect && !webSocket.connection.isConnected) {
      webSocket.connectAll().catch(console.error);
    }

    return () => {
      if (!autoConnect) {
        webSocket.disconnectAll();
      }
    };
  }, [autoConnect, webSocket]);

  const formatLatency = (ms: number) => {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getConnectionStatusColor = (state: string) => {
    switch (state) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'connecting': return 'bg-yellow-100 text-yellow-800';
      case 'reconnecting': return 'bg-orange-100 text-orange-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const connectionSummary = webSocket.getConnectionSummary();

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
                WebSocket Monitoring
              </h1>
              <p className="text-muted" style={{ color: '#768692' }}>
                Real-time connection monitoring and message analytics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoConnect(!autoConnect)}
            >
              {autoConnect ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {autoConnect ? 'Pause' : 'Resume'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Connection Status Alert */}
        {!connectionSummary.isConnected && autoConnect && (
          <Alert variant="destructive" className="mb-8">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              <strong>WebSocket Disconnected</strong> - Real-time features may be limited. 
              Connection state: {connectionSummary.connectionState}
            </AlertDescription>
          </Alert>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                {connectionSummary.isConnected ? (
                  <Wifi className="h-8 w-8 text-green-600" />
                ) : (
                  <WifiOff className="h-8 w-8 text-red-600" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Connection</p>
                  <Badge className={getConnectionStatusColor(connectionSummary.connectionState)}>
                    {connectionSummary.connectionState}
                  </Badge>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Quality</span>
                  <span className={getQualityColor(connectionSummary.stats.connectionQuality)}>
                    {connectionSummary.stats.connectionQuality}
                  </span>
                </div>
                <Progress 
                  value={
                    connectionSummary.stats.connectionQuality === 'excellent' ? 100 :
                    connectionSummary.stats.connectionQuality === 'good' ? 75 :
                    connectionSummary.stats.connectionQuality === 'fair' ? 50 : 25
                  } 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Latency</p>
                  <p className="text-2xl font-semibold">
                    {formatLatency(connectionSummary.stats.latency)}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Target: <100ms</span>
                  <span className={connectionSummary.stats.latency < 100 ? 'text-green-600' : 'text-red-600'}>
                    {connectionSummary.stats.latency < 100 ? 'Good' : 'High'}
                  </span>
                </div>
                <Progress 
                  value={Math.min(100, (connectionSummary.stats.latency / 200) * 100)} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Messages</p>
                  <p className="text-2xl font-semibold">
                    {connectionSummary.stats.messagesSent + connectionSummary.stats.messagesReceived}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Sent: {connectionSummary.stats.messagesSent}</span>
                  <span>Received: {connectionSummary.stats.messagesReceived}</span>
                </div>
                <div className="flex gap-1">
                  <div className="flex-1 bg-blue-200 h-2 rounded"></div>
                  <div className="flex-1 bg-green-200 h-2 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Server className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Queue Size</p>
                  <p className="text-2xl font-semibold">
                    {connectionSummary.queueSize}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Bandwidth</span>
                  <span>
                    ↑{formatBytes(connectionSummary.stats.bandwidth.upstream)}/s
                    ↓{formatBytes(connectionSummary.stats.bandwidth.downstream)}/s
                  </span>
                </div>
                <Progress 
                  value={Math.min(100, (connectionSummary.queueSize / 100) * 100)} 
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
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="inspections" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Inspections
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Connection Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Signal className="h-5 w-5" />
                    Connection Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">Client ID</span>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {webSocket.connection.clientId}
                      </code>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">Connection Time</span>
                      <span className="text-sm">
                        {connectionSummary.stats.connectionTime ? 
                          new Date(connectionSummary.stats.connectionTime).toLocaleString() : 
                          'Not connected'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">Reconnect Attempts</span>
                      <span className="text-sm">{connectionSummary.stats.reconnectAttempts}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">Last Message</span>
                      <span className="text-sm">
                        {connectionSummary.stats.lastMessageTime ? 
                          new Date(connectionSummary.stats.lastMessageTime).toLocaleString() : 
                          'No messages'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Message Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Message Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Database</span>
                      </div>
                      <Badge variant="secondary">
                        {connectionSummary.totalMessages.database}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Inspections</span>
                      </div>
                      <Badge variant="secondary">
                        {connectionSummary.totalMessages.inspections}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="font-medium">Alerts</span>
                      </div>
                      <Badge variant="secondary">
                        {connectionSummary.totalMessages.alerts}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">Data Sync</span>
                      </div>
                      <Badge variant="secondary">
                        {connectionSummary.totalMessages.dataSync}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">System Health</span>
                      </div>
                      <Badge variant="secondary">
                        {connectionSummary.totalMessages.systemHealth}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            <DatabaseWebSocketTab />
          </TabsContent>

          {/* Inspections Tab */}
          <TabsContent value="inspections" className="space-y-6">
            <InspectionsWebSocketTab />
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <AlertsWebSocketTab />
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <SystemWebSocketTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Database WebSocket Tab Component
function DatabaseWebSocketTab() {
  const { indexUpdates, slowQueries, performanceAlerts, isConnected, sendDatabaseMetrics } = useDatabaseWebSocketMonitoring();

  const handleSendTestMetrics = async () => {
    const testMetrics = {
      indexHitRatio: Math.random() * 100,
      queryTime: Math.random() * 100,
      activeConnections: Math.floor(Math.random() * 50),
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100
    };

    try {
      await sendDatabaseMetrics(testMetrics);
    } catch (error) {
      console.error('Failed to send test metrics:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Database Performance Messages</h2>
        <Button onClick={handleSendTestMetrics} disabled={!isConnected}>
          <Database className="h-4 w-4 mr-2" />
          Send Test Metrics
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Index Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Index Usage Updates</CardTitle>
            <CardDescription>
              Real-time index performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {indexUpdates.slice(0, 10).map((message) => (
                <div key={message.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm font-mono">{message.payload.indexName}</code>
                    <Badge variant="outline">{message.payload.usage}%</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Performance: {message.payload.performance}ms
                  </div>
                </div>
              ))}
              {indexUpdates.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No index updates received yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Slow Queries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Slow Query Alerts</CardTitle>
            <CardDescription>
              Queries exceeding performance thresholds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {slowQueries.slice(0, 10).map((message) => (
                <div key={message.id} className="p-3 border rounded-lg">
                  <code className="text-xs font-mono mb-2 block">
                    {message.payload.query}
                  </code>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-600">
                      {message.payload.executionTime}ms
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      Slow
                    </Badge>
                  </div>
                </div>
              ))}
              {slowQueries.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No slow queries detected
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Alerts</CardTitle>
            <CardDescription>
              System performance notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {performanceAlerts.slice(0, 10).map((message) => (
                <div key={message.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{message.payload.type}</span>
                    <Badge 
                      variant={message.payload.severity === 'warning' ? 'destructive' : 'secondary'}
                    >
                      {message.payload.severity}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    {message.payload.value}% (threshold: {message.payload.threshold}%)
                  </div>
                </div>
              ))}
              {performanceAlerts.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No performance alerts
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Inspections WebSocket Tab Component
function InspectionsWebSocketTab() {
  const { inspectionUpdates, inspectionStarted, inspectionCompleted, isConnected, sendInspectionUpdate } = useInspectionWebSocket();

  const handleSendTestUpdate = async () => {
    const testUpdate = {
      progress: Math.floor(Math.random() * 100),
      currentRoom: ['Kitchen', 'Living Room', 'Bedroom', 'Bathroom'][Math.floor(Math.random() * 4)],
      issuesFound: Math.floor(Math.random() * 5),
      status: ['in-progress', 'paused', 'completed'][Math.floor(Math.random() * 3)]
    };

    try {
      await sendInspectionUpdate(`test-inspection-${Date.now()}`, testUpdate);
    } catch (error) {
      console.error('Failed to send test update:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Inspection Updates</h2>
        <Button onClick={handleSendTestUpdate} disabled={!isConnected}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Send Test Update
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {inspectionUpdates.slice(0, 10).map((message) => (
                <div key={message.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge>{message.payload.update.status}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm">
                    Progress: {message.payload.update.progress}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Room: {message.payload.update.currentRoom}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {inspectionStarted.slice(0, 10).map((message) => (
                <div key={message.id} className="p-3 border rounded-lg">
                  <div className="font-medium mb-1">
                    Inspection Started
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(message.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {inspectionCompleted.slice(0, 10).map((message) => (
                <div key={message.id} className="p-3 border rounded-lg">
                  <div className="font-medium mb-1">
                    Inspection Completed
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(message.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Alerts WebSocket Tab Component
function AlertsWebSocketTab() {
  const { criticalAlerts, systemAlerts, maintenanceAlerts, acknowledgeAlert, dismissAlert, isConnected } = useAlertWebSocket();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Real-time Alerts</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {criticalAlerts.slice(0, 10).map((message) => (
                <div key={message.id} className="p-3 border border-red-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="destructive">Critical</Badge>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeAlert(message.id)}
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissAlert(message.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm">
                    {message.payload.alert?.message || 'Critical system alert'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-orange-600">System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {systemAlerts.slice(0, 10).map((message) => (
                <div key={message.id} className="p-3 border rounded-lg">
                  <Badge variant="secondary">System</Badge>
                  <div className="text-sm mt-2">
                    System notification received
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-blue-600">Maintenance Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {maintenanceAlerts.slice(0, 10).map((message) => (
                <div key={message.id} className="p-3 border rounded-lg">
                  <Badge variant="outline">Maintenance</Badge>
                  <div className="text-sm mt-2">
                    Maintenance notification received
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// System WebSocket Tab Component
function SystemWebSocketTab() {
  const { healthChecks, performanceMetrics, requestHealthCheck, systemStatus, isConnected } = useSystemHealthWebSocket();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">System Health Monitoring</h2>
        <Button onClick={requestHealthCheck} disabled={!isConnected}>
          <Activity className="h-4 w-4 mr-2" />
          Request Health Check
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Health Checks</CardTitle>
            <CardDescription>
              System status: <Badge variant={systemStatus === 'healthy' ? 'default' : 'destructive'}>
                {systemStatus}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {healthChecks.slice(0, 10).map((message) => (
                <div key={message.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={message.payload.status === 'healthy' ? 'default' : 'destructive'}>
                      {message.payload.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm grid grid-cols-2 gap-2">
                    <div>Memory: {message.payload.memoryUsage}%</div>
                    <div>Disk: {message.payload.diskUsage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {performanceMetrics.slice(0, 10).map((message) => (
                <div key={message.id} className="p-3 border rounded-lg">
                  <div className="text-sm">
                    Performance data received
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}