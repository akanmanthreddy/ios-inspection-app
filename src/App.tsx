import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { MobileLandingPage } from './components/mobile/MobileLandingPage';
import { MobileCommunitiesPage } from './components/mobile/MobileCommunitiesPage';
import { MobilePropertiesPage } from './components/mobile/MobilePropertiesPage';
import { MobileInspectionsPage } from './components/mobile/MobileInspectionsPage';
import { MobileInspectionFormPage } from './components/mobile/MobileInspectionFormPage';
import { MobileCompletionOptionsPage } from './components/mobile/MobileCompletionOptionsPage';
import { MobileReportTemplateSelectionPage } from './components/mobile/MobileReportTemplateSelectionPage';
import { MobileReportPreviewPage } from './components/mobile/MobileReportPreviewPage';
import { MobilePropertyReportsPage } from './components/mobile/MobilePropertyReportsPage';
import { MobileInspectionsOverviewPage } from './components/mobile/MobileInspectionsOverviewPage';
import { MobileStartInspectionPage } from './components/mobile/MobileStartInspectionPage';
import { MobileBottomNav } from './components/mobile/MobileBottomNav';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { Toaster } from './components/ui/sonner';
import { useCommunities } from './hooks/useCommunities';
import { useProperties } from './hooks/useProperties';
import { useInspections } from './hooks/useInspections';
import { CreateInspectionData } from './services/api';

type AppState = 'landing' | 'communities' | 'properties' | 'inspections' | 'inspections-overview' | 'inspection-form' | 'completion-options' | 'template-selection' | 'report-preview' | 'property-reports' | 'start-inspection';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<AppState>('landing');
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<{ id: string; address: string } | null>(null);
  const [selectedPropertyForReports, setSelectedPropertyForReports] = useState<{ id: string; address: string } | null>(null);
  const [currentInspectionId, setCurrentInspectionId] = useState<string | null>(null);
  const [selectedCommunityForInspection, setSelectedCommunityForInspection] = useState<string | null>(null);
  const [inspectionFormData, setInspectionFormData] = useState<any>(null);
  const [selectedReportTemplate, setSelectedReportTemplate] = useState<string>('default');
  const [selectedInspectionTemplate, setSelectedInspectionTemplate] = useState<string | number | null>(null);
  const [navigationStack, setNavigationStack] = useState<AppState[]>(['landing']);

  // API Integration Hooks - always call hooks (rules of hooks)
  const { 
    communities, 
    loading: communitiesLoading, 
    error: communitiesError
  } = useCommunities();
  
  const { 
    properties, 
    loading: propertiesLoading, 
    error: propertiesError
  } = useProperties(selectedCommunity || selectedCommunityForInspection || undefined);
  
  const { 
    inspections, 
    loading: inspectionsLoading, 
    error: inspectionsError,
    createInspection 
  } = useInspections(selectedProperty?.id);

  const navigateToPage = (page: AppState) => {
    setNavigationStack(prev => [...prev, page]);
    setCurrentPage(page);
  };

  const navigateBack = () => {
    if (navigationStack.length > 1) {
      const newStack = navigationStack.slice(0, -1);
      setNavigationStack(newStack);
      setCurrentPage(newStack[newStack.length - 1]);
    }
  };

  const resetToRoot = () => {
    setNavigationStack(['landing']);
    setCurrentPage('landing');
    setSelectedCommunity(null);
    setSelectedProperty(null);
    setSelectedPropertyForReports(null);
    setCurrentInspectionId(null);
    setSelectedCommunityForInspection(null);
  };

  const handleSelectCommunity = (communityId: string) => {
    setSelectedCommunity(communityId);
    navigateToPage('properties');
  };

  const handleSelectProperty = (propertyId: string, propertyAddress: string) => {
    setSelectedProperty({ id: propertyId, address: propertyAddress });
    navigateToPage('inspections');
  };

  const handleViewReports = (propertyId: string, propertyAddress: string) => {
    setSelectedPropertyForReports({ id: propertyId, address: propertyAddress });
    navigateToPage('property-reports');
  };

  const handleStartInspection = async (propertyId: string, propertyAddress: string) => {
    // Pre-fill the community and property for the start inspection page
    setSelectedCommunityForInspection(selectedCommunity);
    setSelectedProperty({ id: propertyId, address: propertyAddress });
    navigateToPage('start-inspection');
  };

  const handleInspectionFormComplete = async (inspectionData: any) => {
    try {
      setInspectionFormData(inspectionData);
      navigateToPage('completion-options');
    } catch (error) {
      console.error('Error completing inspection:', error);
      throw error;
    }
  };

  const handlePreviewReport = () => {
    navigateToPage('template-selection');
  };

  const handleFinalizeWithoutSigning = async () => {
    try {
      console.log('Finalizing inspection without report:', inspectionFormData);
      // Navigate back to the community they were in
      resetToRoot();
      navigateToPage('communities');
      if (selectedCommunity) {
        setSelectedCommunity(selectedCommunity);
      }
    } catch (error) {
      console.error('Error finalizing inspection:', error);
    }
  };

  const handleTemplateSelection = (templateId: string) => {
    setSelectedReportTemplate(templateId);
    navigateToPage('report-preview');
  };

  const handleFinalizeReport = async () => {
    try {
      console.log('Finalizing report with template:', selectedReportTemplate, inspectionFormData);
      // Navigate back to community
      resetToRoot();
      navigateToPage('communities');
      if (selectedCommunity) {
        setSelectedCommunity(selectedCommunity);
      }
    } catch (error) {
      console.error('Error finalizing report:', error);
    }
  };

  const handleShareReport = async (email: string) => {
    try {
      console.log('Sharing report to email:', email, 'with template:', selectedReportTemplate);
      // Navigate back to community
      resetToRoot();
      navigateToPage('communities');
      if (selectedCommunity) {
        setSelectedCommunity(selectedCommunity);
      }
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };

  const handleViewInspection = (inspectionId: string, propertyAddress: string) => {
    // For now, this could navigate to a detailed inspection view
    // In a real app, you might have a dedicated inspection details page
    console.log('Viewing inspection:', inspectionId, propertyAddress);
  };

  const handleStartNewInspection = () => {
    // Clear pre-selections when starting fresh from FAB
    setSelectedCommunityForInspection(null);
    setSelectedProperty(null);
    navigateToPage('start-inspection');
  };

  const handleCommunityChangeForInspection = (communityId: string) => {
    setSelectedCommunityForInspection(communityId);
  };

  const handleCreateInspectionFromStartPage = async (communityId: string, propertyId: string, templateId: string | number) => {
    try {
      // Find the property details
      const property = properties.find(p => p.id === propertyId);
      if (!property) {
        throw new Error('Property not found');
      }

      // Store the selected template ID for the inspection form
      setSelectedInspectionTemplate(templateId);
      
      const inspectionData: CreateInspectionData = {
        propertyId,
        inspectorName: 'Current User',
        scheduledDate: new Date().toISOString().split('T')[0],
        type: 'routine', // Use generic type, actual template data comes from templateId
        notes: `Inspection started for ${property.address} using template ID: ${templateId}`
      };
      
      const newInspection = await createInspection(inspectionData);
      
      setSelectedProperty({ id: propertyId, address: property.address });
      setCurrentInspectionId(newInspection.id);
      navigateToPage('inspection-form');
    } catch (error) {
      console.error('Error starting inspection:', error);
      alert('Failed to start inspection. Please try again.');
    }
  };

  const handleBottomNavCommunities = () => {
    // Clear selections when navigating to communities from bottom nav
    setSelectedCommunity(null);
    setSelectedProperty(null);
    setSelectedPropertyForReports(null);
    setCurrentInspectionId(null);
    setSelectedCommunityForInspection(null);
    setCurrentPage('communities');
    setNavigationStack(['landing', 'communities']);
  };

  const handleBottomNavInspections = () => {
    // Navigate to inspections overview from bottom nav
    setCurrentPage('inspections-overview');
    setNavigationStack(['landing', 'inspections-overview']);
  };

  // Loading and error states - only show loading for active page
  const showLoading = (currentPage === 'communities' && communitiesLoading) ||
                     (currentPage === 'properties' && propertiesLoading) ||
                     (currentPage === 'inspections' && inspectionsLoading);

  if (showLoading) {
    return (
      <>
        <LoadingSpinner message="Loading..." />
        <Toaster />
      </>
    );
  }

  if ((currentPage === 'communities' && communitiesError) ||
      (currentPage === 'properties' && propertiesError) ||
      (currentPage === 'inspections' && inspectionsError)) {
    return (
      <>
        <ErrorMessage 
          message={communitiesError || propertiesError || inspectionsError || 'An error occurred'} 
          onRetry={() => window.location.reload()} 
        />
        <Toaster />
      </>
    );
  }

  // Page routing
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <MobileLandingPage 
            onNavigateToCommunities={() => navigateToPage('communities')}
          />
        );

      case 'communities':
        return (
          <MobileCommunitiesPage 
            onBack={navigateBack}
            onSelectCommunity={handleSelectCommunity}
          />
        );

      case 'properties':
        return selectedCommunity ? (
          <MobilePropertiesPage 
            communityId={selectedCommunity}
            onBack={navigateBack}
            onSelectProperty={handleSelectProperty}
            onViewReports={handleViewReports}
            onStartInspection={handleStartInspection}
          />
        ) : null;

      case 'inspections':
        return selectedProperty ? (
          <MobileInspectionsPage 
            propertyId={selectedProperty.id}
            propertyAddress={selectedProperty.address}
            onBack={navigateBack}
          />
        ) : null;

      case 'inspection-form':
        return selectedProperty && currentInspectionId ? (
          <MobileInspectionFormPage
            propertyId={selectedProperty.id}
            propertyAddress={selectedProperty.address}
            inspectionId={currentInspectionId}
            templateId={selectedInspectionTemplate || undefined}
            onBack={navigateBack}
            onComplete={handleInspectionFormComplete}
          />
        ) : null;

      case 'completion-options':
        return selectedProperty ? (
          <MobileCompletionOptionsPage
            propertyAddress={selectedProperty.address}
            onBack={navigateBack}
            onPreviewReport={handlePreviewReport}
            onFinalizeWithoutSigning={handleFinalizeWithoutSigning}
          />
        ) : null;

      case 'template-selection':
        return selectedProperty ? (
          <MobileReportTemplateSelectionPage
            propertyAddress={selectedProperty.address}
            onBack={navigateBack}
            onSelectTemplate={handleTemplateSelection}
          />
        ) : null;

      case 'report-preview':
        return selectedProperty && inspectionFormData ? (
          <MobileReportPreviewPage
            propertyAddress={selectedProperty.address}
            inspectionData={inspectionFormData}
            selectedTemplate={selectedReportTemplate}
            onBack={navigateBack}
            onFinalize={handleFinalizeReport}
            onShare={handleShareReport}
          />
        ) : null;



      case 'inspections-overview':
        return (
          <MobileInspectionsOverviewPage 
            onViewInspection={handleViewInspection}
            onBack={() => {
              setCurrentPage('landing');
              setNavigationStack(['landing']);
            }}
            onStartNewInspection={handleStartNewInspection}
          />
        );

      case 'start-inspection':
        return (
          <MobileStartInspectionPage
            onBack={navigateBack}
            onStartInspection={handleCreateInspectionFromStartPage}
            communities={communities || []}
            properties={selectedCommunityForInspection ? (properties || []) : []}
            onCommunityChange={handleCommunityChangeForInspection}
            preSelectedCommunity={selectedCommunityForInspection || ''}
            preSelectedProperty={selectedProperty || { id: '', address: '' }}
          />
        );

      case 'property-reports':
        return selectedPropertyForReports ? (
          <MobilePropertyReportsPage 
            propertyId={selectedPropertyForReports.id}
            propertyAddress={selectedPropertyForReports.address}
            onBack={navigateBack}
          />
        ) : null;

      default:
        return (
          <MobileLandingPage 
            onNavigateToCommunities={() => navigateToPage('communities')}
          />
        );
    }
  };

  // Determine if bottom nav should be shown - hide on inspection form and related completion pages
  const shouldShowBottomNav = !['inspection-form', 'completion-options', 'template-selection', 'report-preview', 'start-inspection'].includes(currentPage);

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center">
      <div className="w-full max-w-sm bg-background min-h-screen shadow-xl">
        {renderCurrentPage()}
        {shouldShowBottomNav && (
          <MobileBottomNav
            currentPage={currentPage}
            onNavigateToCommunities={handleBottomNavCommunities}
            onNavigateToInspections={handleBottomNavInspections}
          />
        )}
        <Toaster />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}