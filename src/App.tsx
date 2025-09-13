import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { MobileLandingPage } from './components/mobile/MobileLandingPage';
import { MobileCommunitiesPage } from './components/mobile/MobileCommunitiesPage';
import { MobilePropertiesPage } from './components/mobile/MobilePropertiesPage';
import { MobileInspectionsPage } from './components/mobile/MobileInspectionsPage';
import { MobileInspectionDetailPage } from './components/mobile/MobileInspectionDetailPage';
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
import { useTemplates } from './hooks/useTemplates';
import { CreateInspectionData, CreateInspectionItemResponse, apiClient } from './services/api';
import { PhotoUploadService } from './services/photoUpload';
import { PhotoData } from './types';

type AppState = 'landing' | 'communities' | 'properties' | 'inspections' | 'inspection-detail' | 'inspections-overview' | 'inspection-form' | 'completion-options' | 'template-selection' | 'report-preview' | 'property-reports' | 'start-inspection';

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
  const [selectedInspectionForDetail, setSelectedInspectionForDetail] = useState<any>(null);
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
    createInspection,
    completeInspection 
  } = useInspections(selectedProperty?.id);

  const { 
    templates,
    loading: templatesLoading,
    error: templatesError
  } = useTemplates();

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

  // Helper function to upload photos for inspection items
  const uploadInspectionPhotos = async (inspectionFormData: any, currentInspectionId: string): Promise<Record<string, string[]>> => {
    const uploadedPhotoUrls: Record<string, string[]> = {};
    
    // Get photos from form data
    const photosData = inspectionFormData.photos as Record<string, PhotoData[]>;
    if (!photosData || Object.keys(photosData).length === 0) {
      console.log('📷 No photos to upload');
      return uploadedPhotoUrls;
    }
    
    console.log(`📤 Starting photo upload for ${Object.keys(photosData).length} items`);
    
    // Upload photos for each item
    for (const [itemId, photos] of Object.entries(photosData)) {
      if (photos && photos.length > 0) {
        try {
          console.log(`📸 Uploading ${photos.length} photos for item ${itemId}`);
          
          const uploadResults = await PhotoUploadService.uploadPhotos(photos, {
            inspectionId: currentInspectionId,
            itemId: itemId,
            quality: 80
          });
          
          uploadedPhotoUrls[itemId] = uploadResults.map(result => result.url);
          console.log(`✅ Uploaded ${uploadResults.length} photos for item ${itemId}`);
        } catch (error) {
          console.error(`❌ Failed to upload photos for item ${itemId}:`, error);
          // Continue with other items even if one fails
        }
      }
    }
    
    console.log('📤 Photo upload complete. Total items with photos:', Object.keys(uploadedPhotoUrls).length);
    return uploadedPhotoUrls;
  };

  const handleFinalizeWithoutSigning = async () => {
    try {
      console.log('Finalizing inspection without report:', inspectionFormData);
      
      // Save inspection data to database if we have form data and inspection ID
      if (inspectionFormData && currentInspectionId) {
        // Step 1: Upload photos to Supabase Storage
        const uploadedPhotoUrls = await uploadInspectionPhotos(inspectionFormData, currentInspectionId);
        
        // Step 2: Convert form data to inspection issues format
        const issues = [];
        const itemResponses: CreateInspectionItemResponse[] = [];
        
        // Get section mapping for proper issue categorization
        const sectionMapping = (inspectionFormData._sectionMapping || {}) as Record<string, string>;
        
        for (const [itemId, itemData] of Object.entries(inspectionFormData)) {
          if (itemData && typeof itemData === 'object') {
            const data = itemData as any; // Type assertion for form data structure
            
            // Skip photos metadata and section mapping - we only want actual template item responses
            if (itemId === 'photos' || itemId === '_sectionMapping') continue;
            
            // Only include items that need repair as issues
            if (data.status === 'repair') {
              issues.push({
                id: itemId,
                category: sectionMapping[itemId] || 'General', // Use section title as category
                description: data.comment || `Item requires repair: ${itemId}`,
                severity: 'medium' as const, // Default to medium severity
                resolved: false,
                photos: uploadedPhotoUrls[itemId] || []
              });
            }
            
            // Collect ALL item responses (not just repair items)
            if (data.status) {
              // Extract actual template item UUID from the itemId
              // itemId format is 'item-{uuid}' from the form
              const actualTemplateItemId = itemId.startsWith('item-') ? itemId.substring(5) : itemId;
              
              // Validate and map status to ensure only valid values are sent
              const mapFormStatusToValidStatus = (formStatus: string): string => {
                switch (formStatus) {
                  case 'good':
                    return 'good';
                  case 'fair':
                    return 'fair';
                  case 'repair':
                    return 'repair';
                  // Handle any legacy or unexpected values
                  case 'excellent':
                    return 'good';
                  case 'poor':
                    return 'repair';
                  default:
                    console.warn(`Unexpected status value: ${formStatus}, defaulting to 'fair'`);
                    return 'fair';
                }
              };
              
              const validStatus = mapFormStatusToValidStatus(data.status);
              
              const response: CreateInspectionItemResponse = {
                templateItemId: actualTemplateItemId,
                status: validStatus, // Ensures only 'good', 'fair', 'repair'
              };
              
              // Add optional fields only if they have values
              if (data.comment && data.comment.trim()) {
                response.notes = data.comment.trim();
              }
              
              if (data.hasPhoto && data.photoCount > 0) {
                response.photos = uploadedPhotoUrls[itemId] || [];
              }
              
              itemResponses.push(response);
            }
            
            // NOTE: Individual item comments should NOT be included in general inspection notes
            // They are already properly stored in itemResponses[].notes
            // General inspection notes should only contain inspection-level observations
          }
        }
        
        // General inspection notes should only contain inspection-level observations
        // Individual item responses are stored separately in itemResponses[].notes
        const inspectionNotes = 'Inspection completed successfully';
        
        console.log('🔍 Raw inspection form data:', inspectionFormData);
        console.log('💾 Saving inspection with issues:', issues);
        console.log('💾 Saving inspection with item responses:', itemResponses);
        console.log('💾 Photo URLs uploaded:', uploadedPhotoUrls);
        console.log('💾 Inspection notes:', inspectionNotes);
        
        // Validate item responses before sending
        const validateItemResponses = (responses: CreateInspectionItemResponse[]) => {
          const validStatuses = ['good', 'fair', 'repair'];
          
          for (const response of responses) {
            if (!response.templateItemId) {
              throw new Error('Missing templateItemId in response');
            }
            
            if (!response.status || !validStatuses.includes(response.status)) {
              throw new Error(`Invalid status "${response.status}". Must be one of: ${validStatuses.join(', ')}`);
            }
          }
          
          return true;
        };
        
        // Validate before sending
        validateItemResponses(itemResponses);
        console.log('✅ Item responses validation passed');
        
        // Complete the inspection in the database with item responses
        const result = await completeInspection(currentInspectionId, issues, inspectionNotes, itemResponses);
        console.log('✅ Backend completion result:', result);
        
        console.log('✅ Inspection saved successfully to database');
      }
      
      // Navigate back to the properties page of the community they were in
      const communityId = selectedCommunity;
      if (communityId) {
        // Clear inspection-specific state but keep community selection
        setSelectedProperty(null);
        setCurrentInspectionId(null);
        setInspectionFormData(null);
        setSelectedInspectionTemplate(null);
        
        // Navigate to properties page
        setCurrentPage('properties');
        setNavigationStack(['landing', 'communities', 'properties']);
      } else {
        // Fallback to communities if no community selected
        resetToRoot();
        navigateToPage('communities');
      }
    } catch (error) {
      console.error('❌ Error finalizing inspection:', error);
      // Even if saving fails, still navigate away but show error
      const communityId = selectedCommunity;
      if (communityId) {
        setCurrentPage('properties');
        setNavigationStack(['landing', 'communities', 'properties']);
      } else {
        resetToRoot();
        navigateToPage('communities');
      }
    }
  };

  const handleTemplateSelection = (templateId: string) => {
    setSelectedReportTemplate(templateId);
    navigateToPage('report-preview');
  };

  const handleFinalizeReport = async () => {
    try {
      console.log('Finalizing report with template:', selectedReportTemplate, inspectionFormData);
      // Navigate back to the properties page of the community they were in
      const communityId = selectedCommunity;
      if (communityId) {
        // Clear inspection-specific state but keep community selection
        setSelectedProperty(null);
        setCurrentInspectionId(null);
        setInspectionFormData(null);
        setSelectedInspectionTemplate(null);
        setSelectedReportTemplate('default');
        
        // Navigate to properties page
        setCurrentPage('properties');
        setNavigationStack(['landing', 'communities', 'properties']);
      } else {
        // Fallback to communities if no community selected
        resetToRoot();
        navigateToPage('communities');
      }
    } catch (error) {
      console.error('Error finalizing report:', error);
    }
  };

  const handleShareReport = async (email: string) => {
    try {
      console.log('Sharing report to email:', email, 'with template:', selectedReportTemplate);
      // Navigate back to the properties page of the community they were in
      if (selectedCommunity) {
        // Clear inspection-specific state but keep community selection
        setSelectedProperty(null);
        setCurrentInspectionId(null);
        setInspectionFormData(null);
        setSelectedInspectionTemplate(null);
        setSelectedReportTemplate('default');
        
        // Navigate to properties page
        setCurrentPage('properties');
        setNavigationStack(['landing', 'communities', 'properties']);
      } else {
        // Fallback to communities if no community selected
        resetToRoot();
        navigateToPage('communities');
      }
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };

  const handleViewInspection = async (inspectionId: string, propertyAddress: string) => {
    try {
      console.log('🔍 Fetching detailed inspection data for:', inspectionId);
      // Try to fetch detailed inspection data
      const detailedInspection = await apiClient.getDetailedInspection(inspectionId);
      console.log('✅ Got detailed inspection data:', detailedInspection);
      setSelectedInspectionForDetail(detailedInspection);
    } catch (error) {
      console.log('⚠️ Failed to fetch detailed data, creating fallback inspection object:', error);
      // Fallback to basic inspection data if detailed fetch fails
      const fallbackInspection = {
        id: inspectionId,
        propertyId: 'unknown',
        inspectorId: 'unknown',
        inspectorName: 'Unknown Inspector',
        date: new Date().toISOString(),
        status: 'completed' as const,
        type: 'routine' as const,
        issues: [],
        notes: 'Inspection details not available'
      };
      setSelectedInspectionForDetail(fallbackInspection);
    }
    navigateToPage('inspection-detail');
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
      
      // Find the selected template to get its type
      const selectedTemplate = templates.find(t => t.id.toString() === templateId.toString());
      const inspectionType = selectedTemplate?.type || 'routine'; // fallback to 'routine' if template not found
      
      const inspectionData: CreateInspectionData = {
        propertyId,
        inspectorId: '6b5b7c7e-8c3e-4d43-9a3d-3b1a8f6d5e1b', // Use existing user ID from community created_by
        scheduledDate: new Date().toISOString(), // Full ISO timestamp as backend expects
        type: inspectionType, // Use the actual template type instead of hardcoded 'routine'
        templateId: templateId // Include template ID to satisfy database constraint
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
            inspections={inspections}
            loading={inspectionsLoading}
            onBack={navigateBack}
            onInspectionClick={async (inspection) => {
              try {
                console.log('🔍 Fetching detailed inspection data for:', inspection.id);
                // Try to fetch detailed inspection data
                const detailedInspection = await apiClient.getDetailedInspection(inspection.id);
                console.log('✅ Got detailed inspection data:', detailedInspection);
                setSelectedInspectionForDetail(detailedInspection);
              } catch (error) {
                console.log('⚠️ Failed to fetch detailed data, using basic data:', error);
                // Fallback to basic inspection data if detailed fetch fails
                setSelectedInspectionForDetail(inspection);
              }
              setCurrentPage('inspection-detail');
              setNavigationStack([...navigationStack, 'inspection-detail']);
            }}
          />
        ) : null;

      case 'inspection-detail':
        return selectedInspectionForDetail ? (
          <MobileInspectionDetailPage
            inspection={selectedInspectionForDetail}
            onBack={navigateBack}
          />
        ) : null;

      case 'inspection-form':
        return selectedProperty && currentInspectionId ? (
          <MobileInspectionFormPage
            propertyId={selectedProperty.id}
            propertyAddress={selectedProperty.address}
            inspectionId={currentInspectionId}
            templateId={selectedInspectionTemplate || 1}
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
            preSelectedProperty={selectedProperty || undefined}
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