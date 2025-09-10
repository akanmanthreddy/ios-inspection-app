# Comprehensive iOS App Cleanup

## Current Situation
The iOS app has evolved from a full web application and contains significant unused code. After analyzing `App.tsx` and all mobile components, here's what's actually used vs unused.

## USED UI COMPONENTS (Keep These)
Based on imports from mobile components:
- `/components/ui/card.tsx` - Used in all mobile pages
- `/components/ui/button.tsx` - Used in all mobile pages  
- `/components/ui/badge.tsx` - Used in communities, properties, inspections, reports
- `/components/ui/input.tsx` - Used in properties page (search)
- `/components/ui/textarea.tsx` - Used in inspection form
- `/components/ui/progress.tsx` - Used in inspection form and property reports
- `/components/ui/collapsible.tsx` - Used in inspection form
- `/components/ui/sonner.tsx` - Used in App.tsx for toast notifications

## UNUSED UI COMPONENTS (Remove These - 37 files)
- `/components/ui/accordion.tsx`
- `/components/ui/alert-dialog.tsx`
- `/components/ui/alert.tsx`
- `/components/ui/aspect-ratio.tsx`
- `/components/ui/avatar.tsx`
- `/components/ui/breadcrumb.tsx`
- `/components/ui/calendar.tsx`
- `/components/ui/carousel.tsx`
- `/components/ui/chart.tsx`
- `/components/ui/checkbox.tsx`
- `/components/ui/command.tsx`
- `/components/ui/context-menu.tsx`
- `/components/ui/dialog.tsx`
- `/components/ui/drawer.tsx`
- `/components/ui/dropdown-menu.tsx`
- `/components/ui/form.tsx`
- `/components/ui/hover-card.tsx`
- `/components/ui/input-otp.tsx`
- `/components/ui/label.tsx`
- `/components/ui/menubar.tsx`
- `/components/ui/navigation-menu.tsx`
- `/components/ui/pagination.tsx`
- `/components/ui/popover.tsx`
- `/components/ui/radio-group.tsx`
- `/components/ui/resizable.tsx`
- `/components/ui/scroll-area.tsx`
- `/components/ui/select.tsx`
- `/components/ui/separator.tsx`
- `/components/ui/sheet.tsx`
- `/components/ui/sidebar.tsx`
- `/components/ui/skeleton.tsx`
- `/components/ui/slider.tsx`
- `/components/ui/switch.tsx`
- `/components/ui/table.tsx`
- `/components/ui/tabs.tsx`
- `/components/ui/toggle-group.tsx`
- `/components/ui/toggle.tsx`
- `/components/ui/tooltip.tsx`
- `/components/ui/use-mobile.ts`
- `/components/ui/utils.ts`

## UNUSED DESKTOP COMPONENTS (Remove These - 22 files)
- `/components/AddCommunityPage.tsx`
- `/components/AddUnitsPage.tsx`
- `/components/AdminPage.tsx`
- `/components/AdvancedAnalytics.tsx`
- `/components/CommunitiesPage.tsx`
- `/components/DatabaseIndexingDashboard.tsx`
- `/components/DevelopmentNotice.tsx`
- `/components/InspectionFormPage.tsx`
- `/components/InspectionWorkflowDialog.tsx`
- `/components/InspectionsPage.tsx`
- `/components/IntegrationDashboard.tsx`
- `/components/LandingPage.tsx`
- `/components/LiveInspectionTracker.tsx`
- `/components/LiveMessaging.tsx`
- `/components/PropertiesPage.tsx`
- `/components/PropertyReportsPage.tsx`
- `/components/RealTimeDashboard.tsx`
- `/components/RealTimeNotifications.tsx`
- `/components/ReportsPage.tsx`
- `/components/SmartDashboard.tsx`
- `/components/TemplatesPage.tsx`
- `/components/WebSocketDashboard.tsx`

## UNUSED MOBILE COMPONENTS (Remove These - 4 files)
Admin functionality was removed from iOS app:
- `/components/mobile/MobileAddCommunityPage.tsx`
- `/components/mobile/MobileAddUnitsPage.tsx`
- `/components/mobile/MobileAdminPage.tsx`
- `/components/mobile/MobileTemplatesPage.tsx`

## UNUSED HOOKS (Remove These - 7 files)
- `/hooks/useBusinessLogic.ts`
- `/hooks/useDataProcessing.ts`
- `/hooks/useDatabaseIndexing.ts`
- `/hooks/useIntegration.ts`
- `/hooks/useRealTime.ts`
- `/hooks/useTemplates.ts`
- `/hooks/useWebSocket.ts`

## UNUSED SERVICES (Remove These - 7 files)
- `/services/businessLogic.ts`
- `/services/dataProcessing.ts`
- `/services/databaseIndexing.ts`
- `/services/integrationService.ts`
- `/services/realTimeService.ts`
- `/services/templatesService.ts`
- `/services/websocketService.ts`
- `/services/supabase.ts` (not used by current hooks)

## UNUSED CONFIG/DOCS (Remove These - 5 files)
- `/.env`
- `/API_INTEGRATION_README.md`
- `/SUPABASE_SETUP.md`
- `/_env_example.tsx`
- `/config/env.ts`

## WHAT TO KEEP (16 files total)

### Core App (2 files)
- `/App.tsx`
- `/styles/globals.css`

### Mobile Components (7 files)
- `/components/mobile/MobileLandingPage.tsx`
- `/components/mobile/MobileCommunitiesPage.tsx`
- `/components/mobile/MobilePropertiesPage.tsx`
- `/components/mobile/MobileInspectionsPage.tsx`
- `/components/mobile/MobileInspectionFormPage.tsx`
- `/components/mobile/MobileReportsPage.tsx`
- `/components/mobile/MobilePropertyReportsPage.tsx`

### Shared Components (3 files)
- `/components/LoadingSpinner.tsx`
- `/components/ErrorMessage.tsx`
- `/components/figma/ImageWithFallback.tsx` (protected)

### Hooks (3 files)
- `/hooks/useCommunities.ts`
- `/hooks/useProperties.ts`
- `/hooks/useInspections.ts`

### Services (1 file)
- `/services/api.ts`

### Contexts (1 file)
- `/contexts/AuthContext.tsx`

### UI Components (8 files - only the used ones)
- `/components/ui/card.tsx`
- `/components/ui/button.tsx`
- `/components/ui/badge.tsx`
- `/components/ui/input.tsx`
- `/components/ui/textarea.tsx`
- `/components/ui/progress.tsx`
- `/components/ui/collapsible.tsx`
- `/components/ui/sonner.tsx`

## SUMMARY
- **Total files in project**: ~95 files
- **Files to keep**: 25 files (26% of codebase)
- **Files to remove**: ~70 files (74% of codebase)

This represents a massive cleanup that will reduce the codebase by ~74% and eliminate all unused legacy web application code, unused admin functionality, and unnecessary UI components that add bloat to the iOS app bundle.