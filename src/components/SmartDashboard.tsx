import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  useDashboardAnalytics, 
  useNotifications, 
  usePropertyHealth,
  useInspectionScheduling 
} from '../hooks/useBusinessLogic';
import { 
  Building2, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  Home,
  Users,
  FileText,
  Bell,
  X
} from 'lucide-react';

interface SmartDashboardProps {
  onNavigateToInspections: () => void;
  onBack: () => void;
}

export function SmartDashboard({ onNavigateToInspections, onBack }: SmartDashboardProps) {
  const analytics = useDashboardAnalytics();
  const { alerts, dismissAlert, hasUnreadCritical, criticalAlerts } = useNotifications();
  const { propertiesNeedingScheduling } = useInspectionScheduling();
  
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return '#4ade80'; // green-400
    if (score >= 60) return '#fbbf24'; // amber-400
    if (score >= 40) return '#fb923c'; // orange-400
    return '#f87171'; // red-400
  };

  const getHealthScoreStatus = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      {/* Header */}
      <div 
        className="px-6 py-4 border-b"
        style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ color: '#1b365d', fontSize: '1.5rem', fontWeight: '500' }}>
              Property Inspection Dashboard
            </h1>
            <p style={{ color: '#768692', fontSize: '0.875rem' }}>
              Real-time insights and intelligent workflow management
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                style={{
                  borderColor: hasUnreadCritical ? '#d4183d' : '#4698cb',
                  color: hasUnreadCritical ? '#d4183d' : '#4698cb'
                }}
                onClick={() => setShowAllAlerts(!showAllAlerts)}
              >
                <Bell className="w-4 h-4" />
                {alerts.length > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 px-1 py-0 text-xs"
                    style={{
                      backgroundColor: hasUnreadCritical ? '#d4183d' : '#4698cb',
                      color: '#ffffff'
                    }}
                  >
                    {alerts.length}
                  </Badge>
                )}
              </Button>
            </div>
            
            {/* Back Button */}
            <Button 
              variant="outline" 
              onClick={onBack}
              style={{ color: '#1b365d', borderColor: '#1b365d' }}
            >
              ← Back to Admin
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Critical Alerts Section */}
        {criticalAlerts.length > 0 && (
          <div className="space-y-2">
            {criticalAlerts.slice(0, showAllAlerts ? criticalAlerts.length : 2).map((alert, index) => (
              <Alert key={`critical-${alert.propertyId}-${index}`} className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-red-800">{alert.propertyAddress}</div>
                    <div className="text-red-700">{alert.message}</div>
                    {alert.actionRequired && (
                      <div className="text-sm text-red-600 mt-1">Action: {alert.actionRequired}</div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.type, alert.propertyId)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
            {criticalAlerts.length > 2 && !showAllAlerts && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAllAlerts(true)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Show {criticalAlerts.length - 2} more critical alerts
              </Button>
            )}
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: '#768692', fontSize: '0.875rem' }}>Total Properties</p>
                <p style={{ color: '#1b365d', fontSize: '2rem', fontWeight: '600' }}>
                  {analytics.totalProperties}
                </p>
              </div>
              <Building2 style={{ color: '#4698cb' }} className="w-8 h-8" />
            </div>
          </Card>

          <Card className="p-6 border" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: '#768692', fontSize: '0.875rem' }}>Communities</p>
                <p style={{ color: '#1b365d', fontSize: '2rem', fontWeight: '600' }}>
                  {analytics.totalCommunities}
                </p>
              </div>
              <Home style={{ color: '#4698cb' }} className="w-8 h-8" />
            </div>
          </Card>

          <Card className="p-6 border" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: '#768692', fontSize: '0.875rem' }}>This Month</p>
                <p style={{ color: '#1b365d', fontSize: '2rem', fontWeight: '600' }}>
                  {analytics.completedThisMonth}
                </p>
                <p style={{ color: '#768692', fontSize: '0.75rem' }}>Completed</p>
              </div>
              <CheckCircle2 style={{ color: '#10b981' }} className="w-8 h-8" />
            </div>
          </Card>

          <Card className="p-6 border" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: '#768692', fontSize: '0.875rem' }}>System Health</p>
                <p style={{ color: '#1b365d', fontSize: '2rem', fontWeight: '600' }}>
                  {analytics.overallHealthScore}%
                </p>
                <p style={{ color: getHealthScoreColor(analytics.overallHealthScore), fontSize: '0.75rem' }}>
                  {getHealthScoreStatus(analytics.overallHealthScore)}
                </p>
              </div>
              <TrendingUp style={{ color: getHealthScoreColor(analytics.overallHealthScore) }} className="w-8 h-8" />
            </div>
          </Card>
        </div>

        {/* Attention Required Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ color: '#1b365d', fontSize: '1.125rem', fontWeight: '500' }}>
                Requires Immediate Attention
              </h3>
              <AlertTriangle style={{ color: '#d4183d' }} className="w-5 h-5" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#fee2e2' }}>
                <div>
                  <p style={{ color: '#991b1b', fontSize: '0.875rem', fontWeight: '500' }}>
                    Critical Issues
                  </p>
                  <p style={{ color: '#7f1d1d', fontSize: '0.75rem' }}>
                    Require immediate resolution
                  </p>
                </div>
                <Badge style={{ backgroundColor: '#d4183d', color: '#ffffff' }}>
                  {analytics.criticalIssues}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#fef3c7' }}>
                <div>
                  <p style={{ color: '#92400e', fontSize: '0.875rem', fontWeight: '500' }}>
                    Overdue Inspections
                  </p>
                  <p style={{ color: '#78350f', fontSize: '0.75rem' }}>
                    Past scheduled date
                  </p>
                </div>
                <Badge style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}>
                  {analytics.overdueInspections}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#e0f2fe' }}>
                <div>
                  <p style={{ color: '#0c4a6e', fontSize: '0.875rem', fontWeight: '500' }}>
                    Upcoming (7 days)
                  </p>
                  <p style={{ color: '#0369a1', fontSize: '0.75rem' }}>
                    Schedule confirmation needed
                  </p>
                </div>
                <Badge style={{ backgroundColor: '#4698cb', color: '#ffffff' }}>
                  {analytics.upcomingInspections}
                </Badge>
              </div>
            </div>

            <Button 
              className="w-full mt-4"
              onClick={onNavigateToInspections}
              style={{ 
                backgroundColor: '#1b365d',
                borderColor: '#1b365d',
                color: '#ffffff'
              }}
            >
              Manage Inspections
            </Button>
          </Card>

          {/* Community Health Overview */}
          <Card className="p-6 border" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ color: '#1b365d', fontSize: '1.125rem', fontWeight: '500' }}>
                Community Health Overview
              </h3>
              <Building2 style={{ color: '#4698cb' }} className="w-5 h-5" />
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {analytics.communityMetrics.map((metrics, index) => (
                <div key={index} className="p-4 rounded-lg border" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 style={{ color: '#1b365d', fontSize: '0.875rem', fontWeight: '500' }}>
                      Community {index + 1}
                    </h4>
                    <Badge 
                      style={{
                        backgroundColor: getHealthScoreColor(metrics.maintenanceScore),
                        color: '#ffffff'
                      }}
                    >
                      {metrics.maintenanceScore}%
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={metrics.maintenanceScore} 
                    className="mb-3"
                    style={{ 
                      backgroundColor: '#f3f4f6',
                      '--progress-foreground': getHealthScoreColor(metrics.maintenanceScore)
                    } as React.CSSProperties}
                  />
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span style={{ color: '#768692' }}>Properties:</span>
                      <span style={{ color: '#1b365d' }}>{metrics.totalProperties}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: '#768692' }}>Overdue:</span>
                      <span style={{ color: metrics.overdueInspections > 0 ? '#d4183d' : '#1b365d' }}>
                        {metrics.overdueInspections}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: '#768692' }}>Critical:</span>
                      <span style={{ color: metrics.criticalIssues > 0 ? '#d4183d' : '#1b365d' }}>
                        {metrics.criticalIssues}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: '#768692' }}>Occupancy:</span>
                      <span style={{ color: '#1b365d' }}>
                        {Math.round(metrics.occupancyRate * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Smart Scheduling Recommendations */}
        {propertiesNeedingScheduling.length > 0 && (
          <Card className="p-6 border" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ color: '#1b365d', fontSize: '1.125rem', fontWeight: '500' }}>
                Smart Scheduling Recommendations
              </h3>
              <Calendar style={{ color: '#4698cb' }} className="w-5 h-5" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {propertiesNeedingScheduling.slice(0, 6).map(property => (
                <div 
                  key={property.id} 
                  className="p-4 rounded-lg border"
                  style={{ borderColor: 'rgba(0, 0, 0, 0.1)', backgroundColor: '#f9fafb' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p style={{ color: '#1b365d', fontSize: '0.875rem', fontWeight: '500' }}>
                        {property.address}
                      </p>
                      <p style={{ color: '#768692', fontSize: '0.75rem' }}>
                        {property.propertyType}
                      </p>
                    </div>
                    <Badge 
                      style={{
                        backgroundColor: property.urgency === 'critical' ? '#d4183d' : 
                                       property.urgency === 'high' ? '#f59e0b' : '#4698cb',
                        color: '#ffffff'
                      }}
                    >
                      {property.urgency}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm mb-3">
                    <Clock className="w-4 h-4" style={{ color: '#768692' }} />
                    <span style={{ color: '#768692' }}>
                      Suggested: {new Date(property.suggestedDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full"
                    style={{ 
                      backgroundColor: '#4698cb',
                      borderColor: '#4698cb',
                      color: '#ffffff'
                    }}
                  >
                    Schedule Now
                  </Button>
                </div>
              ))}
            </div>
            
            {propertiesNeedingScheduling.length > 6 && (
              <div className="text-center mt-4">
                <p style={{ color: '#768692', fontSize: '0.875rem' }}>
                  {propertiesNeedingScheduling.length - 6} more properties need scheduling
                </p>
              </div>
            )}
          </Card>
        )}

        {/* All Alerts Panel */}
        {showAllAlerts && alerts.length > 0 && (
          <Card className="p-6 border" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ color: '#1b365d', fontSize: '1.125rem', fontWeight: '500' }}>
                All Notifications
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllAlerts(false)}
                style={{ color: '#768692' }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {alerts.map((alert, index) => (
                <div 
                  key={`${alert.type}-${alert.propertyId}-${index}`}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  style={{ 
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    backgroundColor: alert.priority === 'critical' ? '#fef2f2' :
                                   alert.priority === 'high' ? '#fefbf2' : '#f9fafb'
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge 
                        style={{
                          backgroundColor: alert.priority === 'critical' ? '#d4183d' : 
                                         alert.priority === 'high' ? '#f59e0b' : '#4698cb',
                          color: '#ffffff'
                        }}
                      >
                        {alert.priority}
                      </Badge>
                      <span style={{ color: '#1b365d', fontSize: '0.875rem', fontWeight: '500' }}>
                        {alert.propertyAddress}
                      </span>
                    </div>
                    <p style={{ color: '#768692', fontSize: '0.875rem' }}>
                      {alert.message}
                    </p>
                    {alert.actionRequired && (
                      <p style={{ color: '#374151', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        Action: {alert.actionRequired}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.type, alert.propertyId)}
                    style={{ color: '#768692' }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}