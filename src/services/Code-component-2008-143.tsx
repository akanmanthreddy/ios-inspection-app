# Unused Services Removed

These service files were removed as they are not used by the iOS mobile app:

## Removed Files:
- businessLogic.ts
- dataProcessing.ts
- databaseIndexing.ts
- integrationService.ts
- realTimeService.ts
- supabase.ts (not used by current hooks)
- templatesService.ts
- websocketService.ts

## Kept Files (Actually Used):
- api.ts ✓ (contains mock data and interfaces used by hooks)

## Impact:
- Eliminated unused backend integrations
- Removed complex real-time features not needed for iOS
- Simplified service layer to essential API client only