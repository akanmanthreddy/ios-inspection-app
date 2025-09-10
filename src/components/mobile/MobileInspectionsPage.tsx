import { useState } from 'react';
import { ChevronLeft, Calendar, User, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface MobileInspectionsPageProps {
  propertyId: string;
  propertyAddress: string;
  onBack: () => void;
}

export function MobileInspectionsPage({
  propertyId,
  propertyAddress,
  onBack
}: MobileInspectionsPageProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'in-progress'>('all');
  const [filterType, setFilterType] = useState<'all' | 'routine' | 'maintenance' | 'move-out' | 'move-in' | 'annual'>('all');

  // Mock data - in production this would come from props or hooks
  const inspections = [
    {
      id: '1',
      date: '2024-01-15',
      inspector: 'John Smith',
      type: 'routine',
      status: 'completed' as const,
      score: 95,
      issues: 2,
      duration: '45 min'
    },
    {
      id: '2',
      date: '2024-01-12',
      inspector: 'Sarah Johnson',
      type: 'maintenance',
      status: 'completed' as const,
      score: 88,
      issues: 5,
      duration: '60 min'
    },
    {
      id: '3',
      date: '2024-01-10',
      inspector: 'Mike Wilson',
      type: 'move-out',
      status: 'in-progress' as const,
      score: null,
      issues: null,
      duration: 'In progress'
    },
    {
      id: '4',
      date: '2024-01-08',
      inspector: 'Lisa Davis',
      type: 'routine',
      status: 'pending' as const,
      score: null,
      issues: null,
      duration: 'Scheduled'
    },
    {
      id: '5',
      date: '2024-01-05',
      inspector: 'John Smith',
      type: 'move-in',
      status: 'completed' as const,
      score: 92,
      issues: 1,
      duration: '35 min'
    },
    {
      id: '6',
      date: '2024-01-01',
      inspector: 'Sarah Johnson',
      type: 'annual',
      status: 'completed' as const,
      score: 89,
      issues: 3,
      duration: '90 min'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'pending':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'routine':
        return 'Routine';
      case 'maintenance':
        return 'Maintenance';
      case 'move-out':
        return 'Move-out';
      case 'move-in':
        return 'Move-in';
      case 'annual':
        return 'Annual';
      default:
        return type;
    }
  };

  const filteredInspections = inspections.filter(inspection => {
    const matchesStatus = filterStatus === 'all' || inspection.status === filterStatus;
    const matchesType = filterType === 'all' || inspection.type === filterType;
    return matchesStatus && matchesType;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 pt-12 pb-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 mr-2 hover:bg-primary-foreground/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-medium">Inspections</h1>
            <p className="text-primary-foreground/80 text-sm line-clamp-1">{propertyAddress}</p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-3">
          <p className="text-primary-foreground/80 text-sm mb-2">Filter by Status</p>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'completed', label: 'Completed' },
              { key: 'in-progress', label: 'In Progress' },
              { key: 'pending', label: 'Pending' }
            ].map((filter) => (
              <Button
                key={filter.key}
                size="sm"
                variant={filterStatus === filter.key ? "secondary" : "ghost"}
                onClick={() => setFilterStatus(filter.key as any)}
                className={`whitespace-nowrap ${
                  filterStatus === filter.key 
                    ? "bg-primary-foreground/20 text-primary-foreground" 
                    : "hover:bg-primary-foreground/10 text-primary-foreground/70"
                }`}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Type Filter Tabs */}
        <div>
          <p className="text-primary-foreground/80 text-sm mb-2">Filter by Type</p>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {[
              { key: 'all', label: 'All Types' },
              { key: 'routine', label: 'Routine' },
              { key: 'maintenance', label: 'Maintenance' },
              { key: 'move-in', label: 'Move-in' },
              { key: 'move-out', label: 'Move-out' },
              { key: 'annual', label: 'Annual' }
            ].map((filter) => (
              <Button
                key={filter.key}
                size="sm"
                variant={filterType === filter.key ? "secondary" : "ghost"}
                onClick={() => setFilterType(filter.key as any)}
                className={`whitespace-nowrap ${
                  filterType === filter.key 
                    ? "bg-primary-foreground/20 text-primary-foreground" 
                    : "hover:bg-primary-foreground/10 text-primary-foreground/70"
                }`}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="px-6 py-4 bg-card border-b">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-medium text-primary">
              {inspections.filter(i => i.status === 'completed').length}
            </div>
            <div className="text-xs text-muted">Completed</div>
          </div>
          <div>
            <div className="text-xl font-medium text-secondary">
              {inspections.filter(i => i.status === 'in-progress').length}
            </div>
            <div className="text-xs text-muted">In Progress</div>
          </div>
          <div>
            <div className="text-xl font-medium text-muted">
              {inspections.filter(i => i.status === 'pending').length}
            </div>
            <div className="text-xs text-muted">Pending</div>
          </div>
        </div>
      </div>

      {/* Inspections List */}
      <div className="px-6 py-6">
        {filteredInspections.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted mb-2">No inspections found</div>
            <div className="text-sm text-muted">Try adjusting your filter</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInspections.map((inspection) => (
              <Card
                key={inspection.id}
                className="p-4 border border-border/50 cursor-pointer transition-all duration-200 active:scale-95"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    {getStatusIcon(inspection.status)}
                    <div className="ml-3">
                      <div className="font-medium text-sm">
                        {getTypeLabel(inspection.type)} Inspection
                      </div>
                      <div className="flex items-center text-xs text-muted mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(inspection.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(inspection.status)}>
                    {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1).replace('-', ' ')}
                  </Badge>
                </div>

                <div className="flex items-center text-sm text-muted mb-3">
                  <User className="w-4 h-4 mr-1" />
                  {inspection.inspector}
                </div>

                {inspection.status === 'completed' && (
                  <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border/30">
                    <div className="text-center">
                      <div className="text-lg font-medium text-green-600">{inspection.score}%</div>
                      <div className="text-xs text-muted">Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-medium text-red-600">{inspection.issues}</div>
                      <div className="text-xs text-muted">Issues</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{inspection.duration}</div>
                      <div className="text-xs text-muted">Duration</div>
                    </div>
                  </div>
                )}

                {inspection.status !== 'completed' && (
                  <div className="pt-3 border-t border-border/30">
                    <div className="text-sm text-muted text-center">
                      {inspection.duration}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Safe Area */}
      <div className="h-8"></div>
    </div>
  );
}