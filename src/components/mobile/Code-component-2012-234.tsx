import { useState } from 'react';
import { Calendar, CheckCircle, Clock, AlertTriangle, Search, Filter } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';

interface MobileInspectionsOverviewPageProps {
  onViewInspection: (inspectionId: string, propertyAddress: string) => void;
}

export function MobileInspectionsOverviewPage({
  onViewInspection
}: MobileInspectionsOverviewPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'in-progress'>('all');

  // Mock data - in production this would come from props or hooks
  const allInspections = [
    {
      id: '1',
      propertyAddress: '1234 Oak Street, Unit A',
      community: 'Sunset Ridge',
      date: '2024-01-15',
      status: 'completed' as const,
      inspector: 'John Smith',
      issues: 2
    },
    {
      id: '2',
      propertyAddress: '1234 Oak Street, Unit B',
      community: 'Sunset Ridge',
      date: '2024-01-16',
      status: 'in-progress' as const,
      inspector: 'Current User',
      issues: 0
    },
    {
      id: '3',
      propertyAddress: '5678 Pine Avenue, Unit 12',
      community: 'Garden View',
      date: '2024-01-17',
      status: 'pending' as const,
      inspector: 'Current User',
      issues: 0
    },
    {
      id: '4',
      propertyAddress: '9012 Maple Drive, Unit C',
      community: 'Riverside',
      date: '2024-01-14',
      status: 'completed' as const,
      inspector: 'Jane Doe',
      issues: 5
    },
    {
      id: '5',
      propertyAddress: '3456 Cedar Lane, Unit 8',
      community: 'Hillside Manor',
      date: '2024-01-13',
      status: 'completed' as const,
      inspector: 'Current User',
      issues: 1
    }
  ];

  const filteredInspections = allInspections.filter(inspection => {
    const matchesSearch = !searchQuery || 
      inspection.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.community.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.inspector.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || inspection.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const statusCounts = {
    all: allInspections.length,
    completed: allInspections.filter(i => i.status === 'completed').length,
    'in-progress': allInspections.filter(i => i.status === 'in-progress').length,
    pending: allInspections.filter(i => i.status === 'pending').length
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 pt-12 pb-6">
        <div className="text-center">
          <h1 className="text-xl font-medium mb-2">All Inspections</h1>
          <p className="text-primary-foreground/80 text-sm">
            {allInspections.length} total inspections
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 py-4 bg-background border-b border-border/30">
        <div className="grid grid-cols-4 gap-2">
          <Card 
            className={`p-3 text-center cursor-pointer transition-colors ${
              filterStatus === 'all' ? 'bg-primary/10 border-primary/20' : ''
            }`}
            onClick={() => setFilterStatus('all')}
          >
            <div className="text-lg font-medium text-primary mb-1">{statusCounts.all}</div>
            <div className="text-xs text-muted">All</div>
          </Card>
          <Card 
            className={`p-3 text-center cursor-pointer transition-colors ${
              filterStatus === 'completed' ? 'bg-green-50 border-green-200' : ''
            }`}
            onClick={() => setFilterStatus('completed')}
          >
            <div className="text-lg font-medium text-green-600 mb-1">{statusCounts.completed}</div>
            <div className="text-xs text-muted">Done</div>
          </Card>
          <Card 
            className={`p-3 text-center cursor-pointer transition-colors ${
              filterStatus === 'in-progress' ? 'bg-blue-50 border-blue-200' : ''
            }`}
            onClick={() => setFilterStatus('in-progress')}
          >
            <div className="text-lg font-medium text-blue-600 mb-1">{statusCounts['in-progress']}</div>
            <div className="text-xs text-muted">Active</div>
          </Card>
          <Card 
            className={`p-3 text-center cursor-pointer transition-colors ${
              filterStatus === 'pending' ? 'bg-yellow-50 border-yellow-200' : ''
            }`}
            onClick={() => setFilterStatus('pending')}
          >
            <div className="text-lg font-medium text-yellow-600 mb-1">{statusCounts.pending}</div>
            <div className="text-xs text-muted">Pending</div>
          </Card>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-4 bg-background border-b border-border/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
          <Input
            type="text"
            placeholder="Search inspections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input-background border-border/50 focus:border-primary"
          />
        </div>
      </div>

      {/* Inspections List */}
      <div className="px-6 py-6">
        {filteredInspections.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">No inspections found</h3>
            <p className="text-sm text-muted mb-4">
              Try adjusting your search or filter criteria.
            </p>
            <Button 
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
              }} 
              variant="outline" 
              size="sm"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInspections.map((inspection) => (
              <Card
                key={inspection.id}
                className="p-4 border border-border/50 cursor-pointer transition-all duration-200 active:scale-95"
                onClick={() => onViewInspection(inspection.id, inspection.propertyAddress)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-base mb-1">{inspection.propertyAddress}</h3>
                    <p className="text-sm text-muted mb-2">{inspection.community}</p>
                  </div>
                  <Badge className={getStatusColor(inspection.status)}>
                    <div className="flex items-center">
                      {getStatusIcon(inspection.status)}
                      <span className="ml-1 capitalize">{inspection.status.replace('-', ' ')}</span>
                    </div>
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm text-muted">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(inspection.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div>Inspector: {inspection.inspector}</div>
                </div>

                {inspection.issues > 0 && (
                  <div className="mt-2 text-sm">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                      {inspection.issues} issue{inspection.issues !== 1 ? 's' : ''} found
                    </span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}