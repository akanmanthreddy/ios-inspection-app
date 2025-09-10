import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useRealTimeNotifications, useLiveAlerts } from '../hooks/useRealTime';
import { RealTimeEvent } from '../services/realTimeService';
import {
  Bell,
  BellOff,
  X,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Activity,
  Clock,
  MapPin,
  Shield,
  Zap,
  Settings
} from 'lucide-react';

interface RealTimeNotificationsProps {
  className?: string;
}

export function RealTimeNotifications({ className }: RealTimeNotificationsProps) {
  const { 
    notifications, 
    showNotifications, 
    dismissNotification, 
    toggleNotifications 
  } = useRealTimeNotifications();
  
  const { 
    alerts, 
    criticalAlerts, 
    unacknowledgedCount, 
    acknowledgeAlert 
  } = useLiveAlerts();

  const [isExpanded, setIsExpanded] = useState(false);

  const getNotificationIcon = (event: RealTimeEvent) => {
    switch (event.type) {
      case 'inspection_started':
      case 'inspection_completed':
        return <Activity className="h-4 w-4" />;
      case 'issue_found':
        return <AlertTriangle className="h-4 w-4" />;
      case 'message_received':
        return <MessageSquare className="h-4 w-4" />;
      case 'urgent_alert':
        return <Shield className="h-4 w-4" />;
      case 'inspector_location':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (event: RealTimeEvent) => {
    switch (event.priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical_issue':
      case 'emergency':
        return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance_required':
        return <Settings className="h-4 w-4" />;
      case 'inspection_overdue':
        return <Clock className="h-4 w-4" />;
      case 'system_alert':
        return <Zap className="h-4 w-4" />;
      case 'security_alert':
        return <Shield className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatNotificationMessage = (event: RealTimeEvent) => {
    switch (event.type) {
      case 'inspection_started':
        return `${event.data.inspection?.inspectorName || 'Inspector'} started inspection at ${event.data.inspection?.propertyAddress || 'property'}`;
      case 'inspection_completed':
        return `Inspection completed at ${event.data.inspection?.propertyAddress || 'property'} - ${event.data.summary?.issuesFound || 0} issues found`;
      case 'issue_found':
        return `${event.data.severity === 'critical' ? 'Critical' : 'New'} issue found: ${event.data.issue}`;
      case 'message_received':
        return `${event.data.message?.senderName}: ${event.data.message?.message}`;
      case 'urgent_alert':
        return event.data.alert?.message || 'Urgent alert received';
      case 'inspector_location':
        return `${event.data.inspectorName} location updated`;
      case 'data_sync':
        return `${event.data.count} ${event.data.type} synchronized`;
      default:
        return 'New notification received';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative p-2"
        >
          {showNotifications ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5" />
          )}
          
          {/* Notification Badge */}
          {(notifications.length > 0 || unacknowledgedCount > 0) && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notifications.length + unacknowledgedCount}
            </span>
          )}

          {/* Pulse Animation for Critical Alerts */}
          {criticalAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-5 w-5 animate-ping" />
          )}
        </Button>

        {/* Quick Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleNotifications}
          className="ml-1 p-2"
        >
          {showNotifications ? (
            <BellOff className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Notifications Panel */}
      {isExpanded && (
        <Card className="absolute right-0 top-12 w-96 max-h-96 overflow-y-auto shadow-2xl z-50 border-2">
          <CardContent className="p-0">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Notifications</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleNotifications}
                    className="text-xs"
                  >
                    {showNotifications ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Critical Alerts Section */}
            {alerts.length > 0 && (
              <div className="border-b">
                <div className="p-3 bg-red-50">
                  <h4 className="font-medium text-red-800 text-sm mb-2">Critical Alerts</h4>
                  <div className="space-y-2">
                    {alerts.slice(0, 3).map((alert) => (
                      <Alert 
                        key={alert.id} 
                        className={`border-l-4 ${
                          alert.severity === 'critical' ? 'border-l-red-500 bg-red-50' :
                          alert.severity === 'error' ? 'border-l-orange-500 bg-orange-50' :
                          'border-l-yellow-500 bg-yellow-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2 flex-1">
                            {getAlertIcon(alert.type)}
                            <div className="flex-1">
                              <h5 className="font-medium text-sm">{alert.title}</h5>
                              <p className="text-xs text-muted-foreground">{alert.message}</p>
                              {alert.propertyAddress && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {alert.propertyAddress}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(alert.timestamp)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="h-6 w-6 p-0"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Notifications */}
            <div className="max-h-64 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getNotificationColor(notification)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`mt-1 ${notification.priority === 'urgent' ? 'text-red-600' : 
                                         notification.priority === 'high' ? 'text-orange-600' : 
                                         'text-blue-600'}`}>
                            {getNotificationIcon(notification)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {formatNotificationMessage(notification)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant="secondary" 
                                className="text-xs"
                              >
                                {notification.type.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissNotification(notification.id)}
                          className="h-6 w-6 p-0 ml-2"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent notifications</p>
                  <p className="text-xs">You're all caught up!</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {(notifications.length > 0 || alerts.length > 0) && (
              <div className="p-3 border-t bg-gray-50">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {notifications.length} notifications, {unacknowledgedCount} alerts
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6"
                    onClick={() => {
                      notifications.forEach(n => dismissNotification(n.id));
                      alerts.forEach(a => acknowledgeAlert(a.id));
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Toast-style Notifications */}
      {showNotifications && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {notifications.slice(0, 3).map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all duration-300 shadow-lg border-l-4 ${getNotificationColor(notification)} animate-in slide-in-from-right`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`mt-1 ${notification.priority === 'urgent' ? 'text-red-600' : 
                                   notification.priority === 'high' ? 'text-orange-600' : 
                                   'text-blue-600'}`}>
                      {getNotificationIcon(notification)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {formatNotificationMessage(notification)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissNotification(notification.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}