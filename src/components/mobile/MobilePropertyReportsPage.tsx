import { useState } from 'react';
import { ChevronLeft, Calendar, FileText, User, Clock, Check, AlertCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface MobilePropertyReportsPageProps {
  propertyId: string;
  propertyAddress: string;
  onBack: () => void;
}

export function MobilePropertyReportsPage({
  propertyId,
  propertyAddress,
  onBack
}: MobilePropertyReportsPageProps) {
  const [filterType, setFilterType] = useState<'all' | 'routine' | 'maintenance' | 'move-out' | 'move-in' | 'annual'>('all');

  // Mock completed inspection reports - sorted by most recent first
  const allCompletedReports = [
    {
      id: 'RPT-001',
      date: '2024-01-15',
      inspectionType: 'Move-out Inspection',
      type: 'move-out',
      inspector: 'John Smith',
      status: 'Completed',
      completedAt: '2024-01-15T14:30:00Z',
      issuesFound: 2,
      reportUrl: '/reports/RPT-001.pdf'
    },
    {
      id: 'RPT-002',
      date: '2024-01-12',
      inspectionType: 'Routine Inspection',
      type: 'routine',
      inspector: 'Sarah Johnson',
      status: 'Completed',
      completedAt: '2024-01-12T10:15:00Z',
      issuesFound: 0,
      reportUrl: '/reports/RPT-002.pdf'
    },
    {
      id: 'RPT-003',
      date: '2024-01-08',
      inspectionType: 'Maintenance Inspection',
      type: 'maintenance',
      inspector: 'Mike Wilson',
      status: 'Completed',
      completedAt: '2024-01-08T16:45:00Z',
      issuesFound: 4,
      reportUrl: '/reports/RPT-003.pdf'
    },
    {
      id: 'RPT-004',
      date: '2023-12-15',
      inspectionType: 'Move-in Inspection',
      type: 'move-in',
      inspector: 'Lisa Davis',
      status: 'Completed',
      completedAt: '2023-12-15T09:20:00Z',
      issuesFound: 1,
      reportUrl: '/reports/RPT-004.pdf'
    },
    {
      id: 'RPT-005',
      date: '2023-12-01',
      inspectionType: 'Routine Inspection',
      type: 'routine',
      inspector: 'John Smith',
      status: 'Completed',  
      completedAt: '2023-12-01T13:00:00Z',
      issuesFound: 3,
      reportUrl: '/reports/RPT-005.pdf'
    },
    {
      id: 'RPT-006',
      date: '2023-11-18',
      inspectionType: 'Annual Inspection',
      type: 'annual',
      inspector: 'Sarah Johnson',
      status: 'Completed',
      completedAt: '2023-11-18T11:30:00Z',
      issuesFound: 0,
      reportUrl: '/reports/RPT-006.pdf'
    }
  ];

  // Filter reports by type
  const completedReports = allCompletedReports.filter(report => {
    return filterType === 'all' || report.type === filterType;
  });

  const handleViewReport = (reportId: string) => {
    // In a real app, this would download or open the report
    console.log('Viewing report:', reportId);
    alert(`Opening report ${reportId}...`);
  };

  const getStatusBadge = (status: string, issuesFound: number) => {
    if (status === 'Completed') {
      if (issuesFound === 0) {
        return (
          <Badge className="bg-green-500/10 text-green-700 border-green-200">
            <Check className="w-3 h-3 mr-1" />
            No Issues
          </Badge>
        );
      } else {
        return (
          <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            {issuesFound} Issue{issuesFound > 1 ? 's' : ''}
          </Badge>
        );
      }
    }
    return (
      <Badge className="bg-gray-500/10 text-gray-700 border-gray-200">
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 pt-12 pb-6">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 mr-2 hover:bg-primary-foreground/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-medium">Inspection Reports</h1>
            <p className="text-primary-foreground/80 text-sm line-clamp-1">{propertyAddress}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center mb-3">
            <FileText className="w-4 h-4 mr-2 text-primary-foreground/80" />
            <p className="text-primary-foreground/80 text-sm">
              {completedReports.length} of {allCompletedReports.length} reports
            </p>
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
      </div>

      {/* Reports List */}
      <div className="px-6 py-6">
        {completedReports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">No Reports Found</h3>
            <p className="text-sm text-muted">
              No completed inspection reports are available for this property yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedReports.map((report) => (
              <Card key={report.id} className="p-4 border border-border/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="font-medium text-base mr-2">{report.id}</h3>
                      {getStatusBadge(report.status, report.issuesFound)}
                    </div>
                    <p className="text-sm text-muted mb-2">{report.inspectionType}</p>
                    
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {new Date(report.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-muted">
                        <User className="w-4 h-4 mr-2" />
                        <span>{report.inspector}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-muted">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>
                          Completed {new Date(report.completedAt).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* View Report Button */}
                <div className="pt-3 border-t border-border/30">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleViewReport(report.id)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Report
                  </Button>
                </div>
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