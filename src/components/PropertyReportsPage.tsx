import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { 
  FileText, 
  Download, 
  Calendar, 
  Eye, 
  Filter,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import logo from 'figma:asset/a9104ca5d97d973d81bd09faef4cc958aca2b5ac.png';

interface Report {
  id: string;
  title: string;
  type: 'inspection' | 'maintenance' | 'compliance' | 'financial' | 'tenant';
  dateGenerated: string;
  generatedBy: string;
  status: 'completed' | 'draft' | 'pending-review';
  summary: string;
  fileSize: string;
  inspectionCount?: number;
  issuesFound?: number;
  priority?: 'high' | 'medium' | 'low';
}

interface PropertyReportsPageProps {
  propertyId: string;
  propertyAddress: string;
  onBack: () => void;
}

export function PropertyReportsPage({ propertyId, propertyAddress, onBack }: PropertyReportsPageProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Mock data - in real app this would come from your backend based on propertyId
  const reports: Report[] = [
    {
      id: 'RPT-001',
      title: 'Monthly Inspection Summary',
      type: 'inspection',
      dateGenerated: '2024-01-15',
      generatedBy: 'Sarah Johnson',
      status: 'completed',
      summary: 'Comprehensive inspection report covering all unit areas with 3 minor issues identified.',
      fileSize: '2.4 MB',
      inspectionCount: 4,
      issuesFound: 3,
      priority: 'medium'
    },
    {
      id: 'RPT-002',
      title: 'Maintenance Request Log',
      type: 'maintenance',
      dateGenerated: '2024-01-10',
      generatedBy: 'System Generated',
      status: 'completed',
      summary: 'Complete maintenance history and outstanding work orders for the property.',
      fileSize: '1.8 MB',
      priority: 'low'
    },
    {
      id: 'RPT-003',
      title: 'Compliance Certification',
      type: 'compliance',
      dateGenerated: '2024-01-08',
      generatedBy: 'Mike Chen',
      status: 'completed',
      summary: 'Safety and regulatory compliance report with fire safety and building code verification.',
      fileSize: '3.1 MB',
      priority: 'high'
    },
    {
      id: 'RPT-004',
      title: 'Quarterly Financial Analysis',
      type: 'financial',
      dateGenerated: '2024-01-05',
      generatedBy: 'Emily Rodriguez',
      status: 'pending-review',
      summary: 'Property financial performance including maintenance costs and revenue analysis.',
      fileSize: '1.2 MB',
      priority: 'medium'
    },
    {
      id: 'RPT-005',
      title: 'Tenant Satisfaction Survey',
      type: 'tenant',
      dateGenerated: '2024-01-03',
      generatedBy: 'System Generated',
      status: 'draft',
      summary: 'Annual tenant feedback compilation and satisfaction metrics report.',
      fileSize: '950 KB',
      priority: 'low'
    }
  ];

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'inspection': return '#4698cb';
      case 'maintenance': return '#768692';
      case 'compliance': return '#1b365d';
      case 'financial': return '#4ade80';
      case 'tenant': return '#f59e0b';
      default: return '#768692';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending-review': return '#f59e0b';
      case 'draft': return '#6b7280';
      default: return '#768692';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#768692';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending-review': return <Clock className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredReports = selectedFilter === 'all' 
    ? reports 
    : reports.filter(report => report.type === selectedFilter);

  const reportTypes = [
    { key: 'all', label: 'All Reports', count: reports.length },
    { key: 'inspection', label: 'Inspection', count: reports.filter(r => r.type === 'inspection').length },
    { key: 'maintenance', label: 'Maintenance', count: reports.filter(r => r.type === 'maintenance').length },
    { key: 'compliance', label: 'Compliance', count: reports.filter(r => r.type === 'compliance').length },
    { key: 'financial', label: 'Financial', count: reports.filter(r => r.type === 'financial').length },
    { key: 'tenant', label: 'Tenant', count: reports.filter(r => r.type === 'tenant').length }
  ];

  const handleDownloadReport = (reportId: string, title: string) => {
    // Mock download functionality
    alert(`Downloading report: ${title}`);
  };

  const handleViewReport = (reportId: string, title: string) => {
    // Mock view functionality
    alert(`Opening report: ${title}`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
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
                Property Reports
              </h1>
              <p style={{ color: '#768692' }}>{propertyAddress}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              style={{ backgroundColor: '#4698cb', color: '#ffffff' }}
            >
              + Generate Report
            </Button>
            <Button 
              variant="outline" 
              onClick={onBack}
              style={{ color: '#1b365d', borderColor: '#1b365d' }}
            >
              ← Back to Properties
            </Button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
            <div style={{ color: '#1b365d', fontSize: '1.5rem', fontWeight: '600' }}>
              {reports.length}
            </div>
            <div style={{ color: '#768692', fontSize: '0.875rem' }}>Total Reports</div>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
            <div style={{ color: '#4698cb', fontSize: '1.5rem', fontWeight: '600' }}>
              {reports.filter(r => r.status === 'completed').length}
            </div>
            <div style={{ color: '#768692', fontSize: '0.875rem' }}>Completed</div>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
            <div style={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: '600' }}>
              {reports.filter(r => r.status === 'pending-review').length}
            </div>
            <div style={{ color: '#768692', fontSize: '0.875rem' }}>Pending Review</div>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
            <div style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: '600' }}>
              {reports.filter(r => r.priority === 'high').length}
            </div>
            <div style={{ color: '#768692', fontSize: '0.875rem' }}>High Priority</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {reportTypes.map((type) => (
            <Button
              key={type.key}
              variant={selectedFilter === type.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(type.key)}
              className="flex items-center gap-2"
              style={selectedFilter === type.key ? { 
                backgroundColor: '#4698cb', 
                color: '#ffffff' 
              } : { 
                color: '#1b365d', 
                borderColor: '#1b365d' 
              }}
            >
              <Filter className="h-4 w-4" />
              {type.label} ({type.count})
            </Button>
          ))}
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card 
              key={report.id}
              className="transition-all hover:shadow-lg border-2"
              style={{ borderColor: '#e5e7eb' }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle style={{ color: '#1b365d' }}>
                        {report.title}
                      </CardTitle>
                      <Badge 
                        style={{ 
                          backgroundColor: getReportTypeColor(report.type),
                          color: '#ffffff',
                          textTransform: 'capitalize'
                        }}
                      >
                        {report.type}
                      </Badge>
                      <Badge 
                        variant="outline"
                        className="flex items-center gap-1"
                        style={{ 
                          color: getStatusColor(report.status),
                          borderColor: getStatusColor(report.status)
                        }}
                      >
                        {getStatusIcon(report.status)}
                        {report.status.replace('-', ' ')}
                      </Badge>
                      {report.priority && (
                        <Badge 
                          variant="outline"
                          style={{ 
                            color: getPriorityColor(report.priority),
                            borderColor: getPriorityColor(report.priority)
                          }}
                        >
                          {report.priority} priority
                        </Badge>
                      )}
                    </div>
                    <CardDescription style={{ color: '#768692' }}>
                      {report.summary}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span style={{ color: '#768692', fontSize: '0.875rem' }}>Generated:</span>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="h-4 w-4" style={{ color: '#768692' }} />
                      <span style={{ color: '#1b365d', fontWeight: '600' }}>
                        {new Date(report.dateGenerated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#768692', fontSize: '0.875rem' }}>Generated By:</span>
                    <p style={{ color: '#1b365d', fontWeight: '600' }}>
                      {report.generatedBy}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: '#768692', fontSize: '0.875rem' }}>File Size:</span>
                    <p style={{ color: '#1b365d', fontWeight: '600' }}>
                      {report.fileSize}
                    </p>
                  </div>
                  {report.inspectionCount && (
                    <div>
                      <span style={{ color: '#768692', fontSize: '0.875rem' }}>Inspections:</span>
                      <p style={{ color: '#1b365d', fontWeight: '600' }}>
                        {report.inspectionCount} completed
                      </p>
                    </div>
                  )}
                </div>

                {report.issuesFound !== undefined && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span style={{ color: '#768692', fontSize: '0.875rem' }}>Issues Found:</span>
                        <span style={{ color: '#1b365d', fontWeight: '600' }}>
                          {report.issuesFound}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <Separator className="my-4" />
                <div className="flex items-center justify-between">
                  <span style={{ color: '#768692', fontSize: '0.875rem' }}>
                    Report ID: {report.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReport(report.id, report.title)}
                      className="flex items-center gap-2"
                      style={{ color: '#4698cb', borderColor: '#4698cb' }}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDownloadReport(report.id, report.title)}
                      className="flex items-center gap-2"
                      style={{ backgroundColor: '#4698cb', color: '#ffffff' }}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <Card className="text-center p-12">
            <CardContent>
              <FileText className="h-12 w-12 mx-auto mb-4" style={{ color: '#768692' }} />
              <h3 style={{ color: '#1b365d', marginBottom: '0.5rem' }}>
                No Reports Found
              </h3>
              <p style={{ color: '#768692' }}>
                No reports match the selected filter. Try selecting a different category or generate a new report.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}