import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  Users,
  Database,
  Globe,
  Shield,
  TrendingUp,
  Bell,
  BellRing
} from 'lucide-react';
import logo from 'figma:asset/a9104ca5d97d973d81bd09faef4cc958aca2b5ac.png';

interface Community {
  id: string;
  name: string;
  location: string;
  propertyCount: number;
  lastInspection: string;
  status: 'active' | 'pending' | 'complete';
}

interface CommunitiesPageProps {
  onBack: () => void;
  onSelectCommunity: (communityId: string) => void;
  onAddCommunity?: () => void;
}

export function CommunitiesPage({ onBack, onSelectCommunity, onAddCommunity }: CommunitiesPageProps) {
  // Mock data - in real app this would come from your backend
  const communities: Community[] = [
    {
      id: '1',
      name: 'Oakwood Manor',
      location: 'Austin, TX',
      propertyCount: 45,
      lastInspection: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Riverside Gardens',
      location: 'Dallas, TX',
      propertyCount: 32,
      lastInspection: '2024-01-10',
      status: 'pending'
    },
    {
      id: '3',
      name: 'Sunset Hills',
      location: 'Houston, TX',
      propertyCount: 28,
      lastInspection: '2024-01-12',
      status: 'complete'
    },
    {
      id: '4',
      name: 'Pine Valley Estates',
      location: 'San Antonio, TX',
      propertyCount: 67,
      lastInspection: '2024-01-08',
      status: 'active'
    },
    {
      id: '5',
      name: 'Meadowbrook Commons',
      location: 'Fort Worth, TX',
      propertyCount: 23,
      lastInspection: '2024-01-14',
      status: 'pending'
    },
    {
      id: '6',
      name: 'Crystal Lake',
      location: 'Plano, TX',
      propertyCount: 54,
      lastInspection: '2024-01-11',
      status: 'active'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4698cb';
      case 'pending':
        return '#768692';
      case 'complete':
        return '#1b365d';
      default:
        return '#768692';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <img 
              src={logo} 
              alt="Haven Realty Capital" 
              className="h-12 w-auto"
            />
            <div>
              <h1 style={{ color: '#1b365d', fontSize: '1.5rem', fontWeight: '600' }}>
                Property Inspections
              </h1>
              <p style={{ color: '#768692' }}>Select a community to view properties</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {onAddCommunity && (
              <Button 
                onClick={onAddCommunity}
                style={{ backgroundColor: '#4698cb', color: '#ffffff' }}
              >
                + Add Community
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={onBack}
              style={{ color: '#1b365d', borderColor: '#1b365d' }}
            >
              ← Back to Dashboard
            </Button>
          </div>
        </header>

        {/* Real-Time Features Section */}
        <div className="mb-8 space-y-6">
          {/* Real-Time Status Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h2 style={{ color: '#1b365d', fontSize: '1.25rem', fontWeight: '600' }}>
                Live Inspection Tracking
              </h2>
              <p style={{ color: '#768692', fontSize: '0.875rem' }}>
                Real-time monitoring and collaboration features
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <BellRing className="h-4 w-4 text-orange-600" />
                <span className="text-sm">3 alerts</span>
              </Button>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-green-600 bg-green-50">
                <Wifi className="h-4 w-4" />
                <span className="text-sm font-medium">Connected</span>
              </div>
            </div>
          </div>

          {/* System Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Connection</p>
                    <p className="font-semibold">Connected</p>
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
                    <p className="font-semibold">2s ago</p>
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
                    <p className="font-semibold">24</p>
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
                    <p className="font-semibold">3</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Critical Alerts */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>2 Critical Alerts</strong> require immediate attention
            </AlertDescription>
          </Alert>

          {/* Performance Metrics & Live Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Real-Time Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Latency</label>
                    <p className="text-xl font-semibold">45ms</p>
                    <Progress value={85} className="h-2 mt-2" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Events</label>
                    <p className="text-xl font-semibold">24</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Activity Summary */}
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
                    <Badge variant="secondary">2</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      Critical Alerts
                    </span>
                    <Badge variant="destructive">2</Badge>
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
                    <Badge variant="secondary">0</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Inspection Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Active Inspection in Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm text-muted-foreground">Property</label>
                  <p className="font-medium">Building A - Unit 205</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Inspector</label>
                  <p className="font-medium">Sarah Johnson</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Progress</label>
                  <p className="font-medium">65%</p>
                </div>
              </div>
              <Progress value={65} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                Current Section: Kitchen & Appliances
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
            <div style={{ color: '#1b365d', fontSize: '1.5rem', fontWeight: '600' }}>
              {communities.length}
            </div>
            <div style={{ color: '#768692', fontSize: '0.875rem' }}>Total Communities</div>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
            <div style={{ color: '#1b365d', fontSize: '1.5rem', fontWeight: '600' }}>
              {communities.reduce((sum, c) => sum + c.propertyCount, 0)}
            </div>
            <div style={{ color: '#768692', fontSize: '0.875rem' }}>Total Properties</div>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
            <div style={{ color: '#4698cb', fontSize: '1.5rem', fontWeight: '600' }}>
              {communities.filter(c => c.status === 'active').length}
            </div>
            <div style={{ color: '#768692', fontSize: '0.875rem' }}>Active</div>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
            <div style={{ color: '#768692', fontSize: '1.5rem', fontWeight: '600' }}>
              {communities.filter(c => c.status === 'pending').length}
            </div>
            <div style={{ color: '#768692', fontSize: '0.875rem' }}>Pending</div>
          </div>
        </div>

        {/* Communities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <Card 
              key={community.id}
              className="cursor-pointer transition-all hover:shadow-lg border-2 hover:border-[#4698cb]"
              onClick={() => onSelectCommunity(community.id)}
              style={{ borderColor: '#e5e7eb' }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle style={{ color: '#1b365d', marginBottom: '0.5rem' }}>
                      {community.name}
                    </CardTitle>
                    <CardDescription style={{ color: '#768692' }}>
                      {community.location}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="secondary"
                    style={{ 
                      backgroundColor: getStatusColor(community.status),
                      color: '#ffffff',
                      textTransform: 'capitalize'
                    }}
                  >
                    {community.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#768692', fontSize: '0.875rem' }}>Units:</span>
                    <span style={{ color: '#1b365d', fontWeight: '600' }}>
                      {community.propertyCount}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span style={{ color: '#4698cb' }}>View Units</span>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4698cb' }}>
                    <span className="text-white text-sm">→</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}