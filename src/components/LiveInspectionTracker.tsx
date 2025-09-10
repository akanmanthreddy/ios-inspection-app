import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useLiveInspections } from '../hooks/useRealTime';
import { LiveInspection } from '../services/realTimeService';
import {
  Play,
  Pause,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Users,
  Activity,
  Timer,
  Target,
  ArrowRight
} from 'lucide-react';

interface LiveInspectionTrackerProps {
  onViewDetails?: (inspection: LiveInspection) => void;
}

export function LiveInspectionTracker({ onViewDetails }: LiveInspectionTrackerProps) {
  const { liveInspections, activeInspection, startInspection, updateInspection } = useLiveInspections();
  const [selectedInspection, setSelectedInspection] = useState<LiveInspection | null>(null);

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusColor = (status: LiveInspection['status']) => {
    switch (status) {
      case 'starting': return 'bg-blue-500';
      case 'in-progress': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completing': return 'bg-purple-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: LiveInspection['status']) => {
    switch (status) {
      case 'starting': return <Play className="h-4 w-4" />;
      case 'in-progress': return <Activity className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'completing': return <Timer className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handlePauseInspection = (inspection: LiveInspection) => {
    updateInspection(inspection.id, {
      status: inspection.status === 'paused' ? 'in-progress' : 'paused'
    });
  };

  const handleCompleteInspection = (inspection: LiveInspection) => {
    updateInspection(inspection.id, {
      status: 'completed',
      progress: { ...inspection.progress, completed: inspection.progress.total, percentage: 100 }
    });
  };

  const handleStartNewInspection = () => {
    const mockProperty = {
      id: `prop-${Date.now()}`,
      address: '456 Demo Street, Unit 5A'
    };
    
    startInspection(mockProperty.id, mockProperty.address, 'Current Inspector');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl" style={{ color: '#1b365d', fontWeight: '600' }}>
            Live Inspection Tracker
          </h2>
          <p className="text-muted" style={{ color: '#768692' }}>
            Monitor ongoing inspections in real-time
          </p>
        </div>
        <Button 
          onClick={handleStartNewInspection}
          className="flex items-center gap-2"
          style={{ backgroundColor: '#1b365d' }}
        >
          <Play className="h-4 w-4" />
          Start Demo Inspection
        </Button>
      </div>

      {/* Active Inspection Card */}
      {activeInspection && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(activeInspection.status)} animate-pulse`} />
                  Active Inspection
                </CardTitle>
                <CardDescription>{activeInspection.propertyAddress}</CardDescription>
              </div>
              <Badge 
                variant="secondary" 
                className="flex items-center gap-2 text-green-700 bg-green-100"
              >
                {getStatusIcon(activeInspection.status)}
                {activeInspection.status.replace('-', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback style={{ backgroundColor: '#4698cb', color: 'white' }}>
                    {activeInspection.inspectorName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{activeInspection.inspectorName}</p>
                  <p className="text-sm text-muted-foreground">Inspector</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{activeInspection.currentRoom}</p>
                  <p className="text-sm text-muted-foreground">Current Location</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{formatDuration(activeInspection.startedAt)}</p>
                  <p className="text-sm text-muted-foreground">Duration</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{activeInspection.progress.percentage}%</p>
                  <p className="text-sm text-muted-foreground">Complete</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{activeInspection.progress.completed} of {activeInspection.progress.total} items</span>
                </div>
                <Progress value={activeInspection.progress.percentage} className="h-2" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span>{activeInspection.issuesFound} Issues Found</span>
                  </div>
                  {activeInspection.criticalIssues > 0 && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{activeInspection.criticalIssues} Critical</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePauseInspection(activeInspection)}
                  >
                    {activeInspection.status === 'paused' ? (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails?.(activeInspection)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleCompleteInspection(activeInspection)}
                    style={{ backgroundColor: '#1b365d' }}
                  >
                    Complete
                  </Button>
                </div>
              </div>

              {activeInspection.currentTask && (
                <Alert>
                  <Activity className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Current Task:</strong> {activeInspection.currentTask}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Live Inspections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {liveInspections.map((inspection) => (
          <Card 
            key={inspection.id}
            className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${
              inspection.id === selectedInspection?.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedInspection(inspection)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{inspection.propertyAddress}</CardTitle>
                <Badge 
                  variant={inspection.status === 'completed' ? 'secondary' : 'default'}
                  className="flex items-center gap-2"
                >
                  {getStatusIcon(inspection.status)}
                  {inspection.status.replace('-', ' ')}
                </Badge>
              </div>
              <CardDescription>
                Inspector: {inspection.inspectorName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Started:</span>
                    <p className="font-medium">
                      {new Date(inspection.startedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">
                      {formatDuration(inspection.startedAt)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Room:</span>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {inspection.currentRoom || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Progress:</span>
                    <p className="font-medium">{inspection.progress.percentage}%</p>
                  </div>
                </div>

                <Progress value={inspection.progress.percentage} className="h-2" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      {inspection.issuesFound} issues
                    </span>
                    {inspection.criticalIssues > 0 && (
                      <span className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        {inspection.criticalIssues} critical
                      </span>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails?.(inspection);
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Inspections State */}
      {liveInspections.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Active Inspections</h3>
            <p className="text-muted-foreground mb-4">
              Start an inspection to see real-time tracking information here.
            </p>
            <Button 
              onClick={handleStartNewInspection}
              style={{ backgroundColor: '#1b365d' }}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Demo Inspection
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Inspection Details Modal */}
      {selectedInspection && (
        <Card className="fixed inset-4 z-50 overflow-y-auto bg-white shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Inspection Details</CardTitle>
                <CardDescription>{selectedInspection.propertyAddress}</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedInspection(null)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Inspector</label>
                  <p>{selectedInspection.inspectorName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <p className="flex items-center gap-2">
                    {getStatusIcon(selectedInspection.status)}
                    {selectedInspection.status.replace('-', ' ')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Started At</label>
                  <p>{new Date(selectedInspection.startedAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Duration</label>
                  <p>{formatDuration(selectedInspection.startedAt)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Progress</label>
                <Progress value={selectedInspection.progress.percentage} className="h-3" />
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedInspection.progress.completed} of {selectedInspection.progress.total} items completed
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-semibold">{selectedInspection.issuesFound}</p>
                    <p className="text-sm text-muted-foreground">Issues Found</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-semibold">{selectedInspection.criticalIssues}</p>
                    <p className="text-sm text-muted-foreground">Critical Issues</p>
                  </CardContent>
                </Card>
              </div>

              {selectedInspection.location && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Current Location</label>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedInspection.currentRoom}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      GPS: {selectedInspection.location.latitude.toFixed(6)}, {selectedInspection.location.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}