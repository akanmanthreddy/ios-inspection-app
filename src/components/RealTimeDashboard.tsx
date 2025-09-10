import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LiveInspectionTracker } from './LiveInspectionTracker';
import { RealTimeNotifications } from './RealTimeNotifications';
import { LiveMessaging } from './LiveMessaging';
import { 
  useRealTimeConnection, 
  useRealTimeEvents, 
  useLiveInspections,
  useLiveAlerts,
  useRealTimeSync,
  useRealTimePerformance
} from '../hooks/useRealTime';
import { LiveInspection } from '../services/realTimeService';
import {
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  MessageSquare,
  Zap,
  Signal,
  Database,
  ArrowLeft,
  Globe,
  Shield,
  TrendingUp
} from 'lucide-react';

interface RealTimeDashboardProps {
  onBack?: () => void;
}

export function RealTimeDashboard({ onBack }: RealTimeDashboardProps) {
  const { connectionStatus, isConnecting, connect, disconnect } = useRealTimeConnection();
  const { events, latestEvent } = useRealTimeEvents();
  const { liveInspections, activeInspection } = useLiveInspections();
  const { alerts, criticalAlerts, unacknowledgedCount } = useLiveAlerts();
  const { lastSyncTime, syncStatus, pendingChanges, forcSync } = useRealTimeSync();
  const performance = useRealTimePerformance();

  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedInspection, setSelectedInspection] = useState<LiveInspection | null>(null);

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600 bg-green-50';
      case 'disconnected': return 'text-red-600 bg-red-50';
      case 'reconnecting': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Wifi className="h-4 w-4" />;
      case 'disconnected': return <WifiOff className="h-4 w-4" />;
      case 'reconnecting': return <RefreshCw className="h-4 w-4 animate-spin" />;
      default: return <Signal className="h-4 w-4" />;
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never';
    const diffMs = Date.now() - new Date(lastSyncTime).getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) return `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

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
                Real-Time Dashboard
              </h1>
              <p className="text-muted" style={{ color: '#768692' }}>
                Monitor live inspections, alerts, and system activity
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <RealTimeNotifications />
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getConnectionStatusColor()}`}>
              {getConnectionStatusIcon()}
              <span className="text-sm font-medium capitalize">{connectionStatus}</span>
            </div>
          </div>
        </div>

        {/* System Status Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Globe className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Connection</p>
                  <p className="font-semibold capitalize">{connectionStatus}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Sync</p>
                  <p className="font-semibold">{formatLastSync()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Events</p>
                  <p className="font-semibold">{performance.eventCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Alerts</p>
                  <p className="font-semibold">{unacknowledgedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''}</strong>
              {criticalAlerts.length === 1 && `: ${criticalAlerts[0].message}`}
              {criticalAlerts.length > 1 && ` require immediate attention`}
            </AlertDescription>
          </Alert>
        )}

        {/* Performance Metrics */}
        {connectionStatus === 'connected' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Real-Time Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Latency</label>
                  <p className="text-2xl font-semibold">{performance.latency}ms</p>
                  <Progress 
                    value={Math.max(0, 100 - (performance.latency / 10))} 
                    className="h-2 mt-2" 
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Events Processed</label>
                  <p className="text-2xl font-semibold">{performance.eventCount}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Errors</label>
                  <p className="text-2xl font-semibold text-red-600">{performance.errorCount}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Reconnects</label>
                  <p className="text-2xl font-semibold text-yellow-600">{performance.reconnectCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="inspections" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Live Inspections
            </TabsTrigger>
            <TabsTrigger value="messaging" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messaging
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Event Stream
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Live Activity Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-600" />
                        Active Inspections
                      </span>
                      <Badge variant="secondary">{liveInspections.filter(i => i.status === 'in-progress').length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        Critical Alerts
                      </span>
                      <Badge variant="destructive">{criticalAlerts.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        Online Users
                      </span>
                      <Badge variant="secondary">5</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-purple-600" />
                        Pending Sync
                      </span>
                      <Badge variant={pendingChanges > 0 ? 'destructive' : 'secondary'}>
                        {pendingChanges}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Events</CardTitle>
                  <CardDescription>Latest real-time activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {events.slice(0, 8).map((event) => (
                      <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        <div className={`w-2 h-2 rounded-full ${
                          event.priority === 'urgent' ? 'bg-red-500' :
                          event.priority === 'high' ? 'bg-orange-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {event.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {event.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Inspection Summary */}
            {activeInspection && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    Active Inspection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Property</label>
                      <p className="font-medium">{activeInspection.propertyAddress}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Inspector</label>
                      <p className="font-medium">{activeInspection.inspectorName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Progress</label>
                      <p className="font-medium">{activeInspection.progress.percentage}%</p>
                    </div>
                  </div>
                  <Progress value={activeInspection.progress.percentage} className="mt-4" />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Live Inspections Tab */}
          <TabsContent value="inspections">
            <LiveInspectionTracker onViewDetails={setSelectedInspection} />
          </TabsContent>

          {/* Messaging Tab */}
          <TabsContent value="messaging">
            <Card>
              <LiveMessaging channelId="general" className="h-96" />
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Real-Time Event Stream</CardTitle>
                    <CardDescription>Live feed of all system events</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={forcSync}
                      disabled={syncStatus === 'syncing'}
                    >
                      {syncStatus === 'syncing' ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Sync
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={connectionStatus === 'connected' ? disconnect : connect}
                    >
                      {connectionStatus === 'connected' ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {events.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No events yet</p>
                      <p className="text-sm">Events will appear here in real-time</p>
                    </div>
                  ) : (
                    events.map((event) => (
                      <div 
                        key={event.id} 
                        className={`p-3 rounded-lg border-l-4 ${
                          event.priority === 'urgent' ? 'border-l-red-500 bg-red-50' :
                          event.priority === 'high' ? 'border-l-orange-500 bg-orange-50' :
                          'border-l-blue-500 bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {event.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {JSON.stringify(event.data, null, 2).slice(0, 100)}...
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{event.priority}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}