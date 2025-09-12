import { useState, useMemo } from 'react';
import { ChevronLeft, Calendar, User, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Inspection } from '../../services/api';

interface MobileInspectionsPageProps {
  propertyId: string;
  propertyAddress: string;
  inspections: Inspection[];
  loading?: boolean;
  onBack: () => void;
  onInspectionClick?: (inspection: Inspection) => void;
}

export function MobileInspectionsPage({
  propertyId,
  propertyAddress,
  inspections,
  loading = false,
  onBack,
  onInspectionClick
}: MobileInspectionsPageProps) {
  type FilterStatus = 'all' | 'completed' | 'scheduled' | 'in-progress' | 'requires-follow-up';
  type FilterType = 'all' | Inspection['type'];
  
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'scheduled':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'requires-follow-up':
        return 'bg-red-500/10 text-red-700 border-red-200';
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
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'requires-follow-up':
        return <XCircle className="w-4 h-4 text-red-600" />;
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

  // Memoize unique types calculation with null handling
  const availableTypes = useMemo(() => {
    return Array.from(new Set(
      inspections
        .map(i => i.type)
        .filter(type => type != null) // Remove null/undefined values
    ));
  }, [inspections]);

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


        {/* Dynamic Type Filter Dropdown */}
        <div>
          <p className="text-primary-foreground/80 text-sm mb-2">Filter by Type</p>
          <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
            <SelectTrigger className="w-full min-h-[44px] bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground focus:ring-primary-foreground/30">
              <SelectValue placeholder="Select inspection type" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border">
              <SelectItem value="all" className="focus:bg-accent focus:text-accent-foreground">
                All Types
              </SelectItem>
              {availableTypes.length > 0 ? (
                availableTypes.map(type => (
                  <SelectItem 
                    key={type} 
                    value={type}
                    className="focus:bg-accent focus:text-accent-foreground"
                  >
                    {getTypeLabel(type)}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled className="text-muted-foreground">
                  No inspection types available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clickable Summary Stats Filters */}
      <div className="px-6 py-4 bg-card border-b">
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all ${
              filterStatus === 'all' 
                ? 'bg-primary/10 border-2 border-primary' 
                : 'bg-background border-2 border-border/30 hover:border-border/50'
            }`}
          >
            <div className="text-lg font-medium text-slate-700">
              {inspections.length}
            </div>
            <div className="text-xs text-slate-600 font-medium">All</div>
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all ${
              filterStatus === 'completed' 
                ? 'bg-green-50 border-2 border-green-500' 
                : 'bg-background border-2 border-border/30 hover:border-border/50'
            }`}
          >
            <div className="text-lg font-medium text-green-600">
              {inspections.filter(i => i.status === 'completed').length}
            </div>
            <div className="text-xs text-slate-600 font-medium">Completed</div>
          </button>
          <button
            onClick={() => setFilterStatus('in-progress')}
            className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all ${
              filterStatus === 'in-progress' 
                ? 'bg-yellow-50 border-2 border-yellow-500' 
                : 'bg-background border-2 border-border/30 hover:border-border/50'
            }`}
          >
            <div className="text-lg font-medium text-yellow-600">
              {inspections.filter(i => i.status === 'in-progress').length}
            </div>
            <div className="text-xs text-slate-600 font-medium">In Progress</div>
          </button>
          <button
            onClick={() => setFilterStatus('scheduled')}
            className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all ${
              filterStatus === 'scheduled' 
                ? 'bg-blue-50 border-2 border-blue-500' 
                : 'bg-background border-2 border-border/30 hover:border-border/50'
            }`}
          >
            <div className="text-lg font-medium text-blue-600">
              {inspections.filter(i => i.status === 'scheduled').length}
            </div>
            <div className="text-xs text-slate-600 font-medium">Scheduled</div>
          </button>
        </div>
      </div>

      {/* Inspections List */}
      <div className="px-6 py-6">
        {filteredInspections.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-600 font-medium mb-2">No inspections found</div>
            <div className="text-sm text-slate-500">Try adjusting your filter</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInspections.map((inspection) => (
              <Card
                key={inspection.id}
                className={`p-4 border border-border/50 transition-all duration-200 active:scale-95 ${
                  inspection.status === 'completed' && onInspectionClick 
                    ? 'cursor-pointer hover:shadow-md hover:border-primary/20' 
                    : 'cursor-default'
                }`}
                onClick={() => {
                  if (inspection.status === 'completed' && onInspectionClick) {
                    onInspectionClick(inspection);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    {getStatusIcon(inspection.status)}
                    <div className="ml-3">
                      <div className="font-medium text-sm">
                        {getTypeLabel(inspection.type)} Inspection
                      </div>
                      <div className="flex items-center text-xs text-slate-600 mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {inspection.date ? new Date(inspection.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(inspection.status)}>
                    {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1).replace('-', ' ')}
                  </Badge>
                </div>

                <div className="flex items-center text-sm text-slate-600 mb-3">
                  <User className="w-4 h-4 mr-1" />
                  {inspection.inspectorName}
                </div>

                {inspection.status === 'completed' && (
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/30">
                    <div className="text-center">
                      <div className="text-lg font-medium text-red-600">{inspection.issues?.length || 0}</div>
                      <div className="text-xs text-slate-600 font-medium">Issues</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">
                        {inspection.updatedAt ? new Date(inspection.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        }) : 'N/A'}
                      </div>
                      <div className="text-xs text-slate-600 font-medium">Completed</div>
                    </div>
                  </div>
                )}

                {inspection.status !== 'completed' && (
                  <div className="pt-3 border-t border-border/30">
                    <div className="text-sm text-slate-600 font-medium text-center">
                      {inspection.status === 'scheduled' ? 'Scheduled' : 
                       inspection.status === 'in-progress' ? 'In Progress' :
                       inspection.status === 'requires-follow-up' ? 'Requires Follow-up' : 
                       inspection.status}
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