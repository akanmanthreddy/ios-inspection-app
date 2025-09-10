# Property Inspection App - API Integration

## Overview
This document outlines the API integration layer for the Property Inspection App, including service architecture, data models, and development/production configurations.

## Architecture

### 1. Service Layer (`/services/api.ts`)
- **ApiClient**: Core HTTP client with error handling
- **Type Definitions**: TypeScript interfaces for all data models
- **Mock Data**: Development-time mock data for testing
- **Endpoints**: Complete CRUD operations for Communities, Properties, and Inspections

### 2. Custom Hooks (`/hooks/`)
- **useCommunities**: Community management with loading/error states
- **useProperties**: Property management with community filtering
- **useInspections**: Inspection lifecycle management

### 3. UI Components
- **LoadingSpinner**: Consistent loading states across the app
- **ErrorMessage**: Unified error handling with retry functionality

## Data Models

### Community
```typescript
interface Community {
  id: string;
  name: string;
  status: 'active' | 'under-construction' | 'sold';
  location: string;
  totalUnits: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Property
```typescript
interface Property {
  id: string;
  communityId: string;
  address: string;
  propertyType: string;
  status: 'active' | 'under-construction' | 'sold';
  lastInspection: string | null;
  nextInspection: string;
  inspector: string;
  issues: number;
  createdAt: string;
  updatedAt: string;
}
```

### Inspection
```typescript
interface Inspection {
  id: string;
  propertyId: string;
  inspectorName: string;
  date: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'requires-follow-up';
  type: 'routine' | 'move-in' | 'move-out' | 'maintenance';
  issues: InspectionIssue[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

## API Endpoints

### Communities
- `GET /api/communities` - List all communities
- `GET /api/communities/:id` - Get single community
- `POST /api/communities` - Create new community
- `PUT /api/communities/:id` - Update community
- `DELETE /api/communities/:id` - Delete community

### Properties
- `GET /api/properties?communityId=:id` - List properties (filtered by community)
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create new property
- `POST /api/properties/bulk` - Bulk create properties
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Inspections
- `GET /api/inspections?propertyId=:id` - List inspections (filtered by property)
- `GET /api/inspections/:id` - Get single inspection
- `POST /api/inspections` - Create new inspection
- `PUT /api/inspections/:id` - Update inspection
- `POST /api/inspections/:id/complete` - Complete inspection with issues
- `DELETE /api/inspections/:id` - Delete inspection

### Additional Endpoints
- `POST /api/upload` - File upload (CSV, images, documents)
- `GET /api/reports/property/:id` - Generate property reports
- `GET /api/reports/community/:id` - Generate community reports

## Environment Configuration

### Development Mode
- Uses mock data from `services/api.ts`
- Simulates API delays (500ms)
- No real HTTP requests
- Perfect for UI development and testing

### Production Mode
- Connects to real backend API
- Requires `REACT_APP_API_URL` environment variable
- Full error handling and retry logic
- Authentication headers (when implemented)

## Environment Variables
```bash
# Backend API URL
REACT_APP_API_URL=https://your-api-domain.com/api

# Environment (development/production)
NODE_ENV=production
```

## Integration Examples

### Creating a Community
```typescript
const { createCommunity } = useCommunities();

const handleCreate = async () => {
  try {
    const newCommunity = await createCommunity({
      name: "New Community",
      status: "active",
      location: "123 Main St",
      description: "Modern residential community"
    });
    console.log('Created:', newCommunity);
  } catch (error) {
    console.error('Failed to create community:', error);
  }
};
```

### Starting an Inspection
```typescript
const { createInspection } = useInspections();

const handleStartInspection = async (propertyId: string) => {
  try {
    const inspection = await createInspection({
      propertyId,
      inspectorName: "John Doe",
      scheduledDate: new Date().toISOString(),
      type: "routine",
      notes: "Regular maintenance inspection"
    });
    console.log('Inspection started:', inspection);
  } catch (error) {
    console.error('Failed to start inspection:', error);
  }
};
```

## Error Handling
All hooks include comprehensive error handling:
- Network errors
- HTTP status errors
- JSON parsing errors
- Validation errors

Errors are exposed through the `error` state in each hook, and the UI displays user-friendly error messages with retry options.

## Loading States
All data fetching operations include loading states:
- Initial loading on mount
- Loading during create/update operations
- Shimmer/skeleton loading for better UX

## Next Steps for Production

1. **Backend Implementation**
   - Set up Express.js/Node.js API server
   - Implement database with PostgreSQL/MongoDB
   - Add authentication middleware
   - Set up file upload handling

2. **Authentication**
   - Add JWT token handling
   - Implement role-based access control
   - Add user context throughout app

3. **Real-time Features**
   - WebSocket connections for live updates
   - Push notifications for inspections
   - Collaborative inspection editing

4. **File Management**
   - Image upload for inspection photos
   - CSV processing for bulk property imports
   - Report generation (PDF/Excel)

5. **Performance Optimization**
   - API response caching
   - Pagination for large datasets
   - Image optimization and CDN integration

This API integration provides a solid foundation that can scale from development to production with minimal changes to the frontend code.