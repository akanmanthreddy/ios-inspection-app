# Inspection App Backend API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Currently no authentication is implemented. All endpoints are publicly accessible.

## Error Responses
All endpoints return appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Database Connection Test

### GET /api/test-db
Test database connectivity.

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

---

## Communities API

### GET /api/communities
Get all communities with property counts.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Sunset Gardens",
    "status": "active",
    "location": "123 Main St",
    "description": "Luxury community",
    "planned_units": 100,
    "active_units": 85,
    "created_at": "2025-01-01T12:00:00.000Z",
    "updated_at": "2025-01-01T12:00:00.000Z",
    "created_by": "user123"
  }
]
```

### GET /api/communities/:id
Get a single community by ID.

**Parameters:**
- `id` (path) - Community ID

**Response:**
```json
{
  "id": 1,
  "name": "Sunset Gardens",
  "status": "active",
  "location": "123 Main St",
  "description": "Luxury community",
  "total_units": 100,
  "created_at": "2025-01-01T12:00:00.000Z",
  "updated_at": "2025-01-01T12:00:00.000Z",
  "created_by": "user123"
}
```

### POST /api/communities
Create a new community.

**Request Body:**
```json
{
  "name": "Sunset Gardens",
  "status": "active",
  "location": "123 Main St",
  "description": "Luxury community"
}
```

**Required Fields:** `name`, `status`, `location`

**Response:** `201` - Created community object

### PUT /api/communities/:id
Update a community.

**Parameters:**
- `id` (path) - Community ID

**Request Body:**
```json
{
  "name": "Updated Name",
  "status": "active",
  "location": "456 Oak Ave",
  "description": "Updated description"
}
```

**Response:** `200` - Updated community object

### DELETE /api/communities/:id
Delete a community.

**Parameters:**
- `id` (path) - Community ID

**Response:** `204` - No Content

---

## Properties API

### GET /api/properties
Get properties for a specific community.

**Query Parameters:**
- `communityId` (required) - Community ID

**Response:**
```json
[
  {
    "id": 1,
    "community_id": 1,
    "address": "Unit 101",
    "property_type": "apartment",
    "status": "occupied",
    "created_at": "2025-01-01T12:00:00.000Z",
    "updated_at": "2025-01-01T12:00:00.000Z"
  }
]
```

### GET /api/properties/:id
Get a single property by ID.

**Parameters:**
- `id` (path) - Property ID

**Response:**
```json
{
  "id": 1,
  "community_id": 1,
  "address": "Unit 101",
  "property_type": "apartment",
  "status": "occupied",
  "created_at": "2025-01-01T12:00:00.000Z",
  "updated_at": "2025-01-01T12:00:00.000Z"
}
```

### POST /api/properties
Create a new property.

**Request Body:**
```json
{
  "communityId": 1,
  "address": "Unit 101",
  "propertyType": "apartment",
  "status": "vacant"
}
```

**Response:** `201` - Created property object

### POST /api/properties/bulk
Create multiple properties in bulk.

**Request Body:**
```json
{
  "communityId": 1,
  "properties": [
    {
      "address": "Unit 101",
      "propertyType": "apartment",
      "status": "vacant"
    },
    {
      "address": "Unit 102",
      "propertyType": "apartment",
      "status": "occupied"
    }
  ]
}
```

**Response:** `201` - Array of created property objects

### PUT /api/properties/:id
Update a property.

**Parameters:**
- `id` (path) - Property ID

**Request Body:**
```json
{
  "communityId": 1,
  "address": "Unit 101A",
  "propertyType": "apartment",
  "status": "occupied"
}
```

**Response:** `200` - Updated property object

### DELETE /api/properties/:id
Delete a property.

**Parameters:**
- `id` (path) - Property ID

**Response:** `204` - No Content

---

## Inspections API

### GET /api/inspections
Get inspections for a specific property.

**Query Parameters:**
- `propertyId` (required) - Property ID

**Response:**
```json
[
  {
    "id": 1,
    "property_id": 1,
    "inspector_id": "inspector123",
    "scheduled_date": "2025-01-15T10:00:00.000Z",
    "type": "move-in",
    "status": "scheduled",
    "completed_at": null,
    "notes": "Initial inspection",
    "created_at": "2025-01-01T12:00:00.000Z",
    "updated_at": "2025-01-01T12:00:00.000Z"
  }
]
```

### GET /api/inspections/:id
Get a single inspection by ID.

**Parameters:**
- `id` (path) - Inspection ID

**Response:**
```json
{
  "id": 1,
  "property_id": 1,
  "inspector_id": "inspector123",
  "scheduled_date": "2025-01-15T10:00:00.000Z",
  "type": "move-in",
  "status": "scheduled",
  "completed_at": null,
  "notes": "Initial inspection",
  "created_at": "2025-01-01T12:00:00.000Z",
  "updated_at": "2025-01-01T12:00:00.000Z"
}
```

### POST /api/inspections
Create a new inspection.

**Request Body:**
```json
{
  "propertyId": 1,
  "inspectorId": "inspector123",
  "scheduledDate": "2025-01-15T10:00:00.000Z",
  "type": "move-in"
}
```

**Response:** `201` - Created inspection object (status automatically set to "scheduled")

### PUT /api/inspections/:id
Update an inspection.

**Parameters:**
- `id` (path) - Inspection ID

**Request Body:**
```json
{
  "inspectorId": "inspector456",
  "scheduledDate": "2025-01-16T14:00:00.000Z",
  "type": "move-out",
  "notes": "Updated notes"
}
```

**Response:** `200` - Updated inspection object

### POST /api/inspections/:id/complete
Complete an inspection with issues.

**Parameters:**
- `id` (path) - Inspection ID

**Request Body:**
```json
{
  "notes": "Inspection completed successfully",
  "issues": [
    {
      "category": "plumbing",
      "description": "Leaky faucet in kitchen",
      "severity": "medium",
      "resolved": false
    },
    {
      "category": "electrical",
      "description": "Outlet not working in bedroom",
      "severity": "high",
      "resolved": false
    }
  ]
}
```

**Response:** `200` - Updated inspection object (status set to "completed", completed_at timestamp added)

### DELETE /api/inspections/:id
Delete an inspection.

**Parameters:**
- `id` (path) - Inspection ID

**Response:** `204` - No Content

---

## Templates API

### GET /api/templates
Get all inspection templates with sections and items.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Standard Move-In Inspection",
    "description": "Default template for move-in inspections",
    "type": "cofo-property",
    "is_default": true,
    "created_by": "admin",
    "created_at": "2025-01-01T12:00:00.000Z",
    "updated_at": "2025-01-01T12:00:00.000Z",
    "sections": [
      {
        "id": 1,
        "template_id": 1,
        "name": "Kitchen",
        "order_index": 1,
        "description": "Kitchen inspection items",
        "created_at": "2025-01-01T12:00:00.000Z",
        "updated_at": "2025-01-01T12:00:00.000Z",
        "items": [
          {
            "id": 1,
            "section_id": 1,
            "name": "Sink Condition",
            "type": "select",
            "required": true,
            "order_index": 1,
            "options": ["good", "fair", "poor"],
            "created_at": "2025-01-01T12:00:00.000Z",
            "updated_at": "2025-01-01T12:00:00.000Z"
          }
        ]
      }
    ]
  }
]
```

### GET /api/templates/:id
Get a single template with sections and items.

**Parameters:**
- `id` (path) - Template ID

**Response:**
```json
{
  "id": 1,
  "name": "Standard Move-In Inspection",
  "description": "Default template for move-in inspections",
  "type": "cofo-property",
  "is_default": true,
  "created_by": "admin",
  "created_at": "2025-01-01T12:00:00.000Z",
  "updated_at": "2025-01-01T12:00:00.000Z",
  "sections": [
    {
      "id": 1,
      "template_id": 1,
      "name": "Kitchen",
      "order_index": 1,
      "description": "Kitchen inspection items",
      "created_at": "2025-01-01T12:00:00.000Z",
      "updated_at": "2025-01-01T12:00:00.000Z",
      "items": [
        {
          "id": 1,
          "section_id": 1,
          "name": "Sink Condition",
          "type": "select",
          "required": true,
          "order_index": 1,
          "options": ["good", "fair", "poor"],
          "created_at": "2025-01-01T12:00:00.000Z",
          "updated_at": "2025-01-01T12:00:00.000Z"
        }
      ]
    }
  ]
}
```

### POST /api/templates
Create a new template with sections and items.

**Request Body:**
```json
{
  "name": "Custom Inspection Template",
  "description": "Template for special inspections",
  "type": "community-level",
  "isDefault": false,
  "created_by": "user123",
  "sections": [
    {
      "name": "Living Room",
      "order_index": 1,
      "description": "Living room items",
      "items": [
        {
          "name": "Carpet Condition",
          "type": "select",
          "required": true,
          "order_index": 1,
          "options": ["excellent", "good", "fair", "poor"]
        }
      ]
    }
  ]
}
```

**Template Types:**
The `type` field accepts the following values:
- `cofo-property` (default)
- `community-level`
- `construction-progress`
- `move-in-move-out`
- `pre-move-out`
- `sale-ready`
- `sparkle-final`

If no type is provided, it defaults to `cofo-property`. Invalid types will return a 400 error.

**Response:** `201` - Created template object

### PUT /api/templates/:id
Update a template (replaces sections and items if provided).

**Parameters:**
- `id` (path) - Template ID

**Request Body:**
```json
{
  "name": "Updated Template Name",
  "description": "Updated description",
  "type": "sale-ready",
  "isDefault": false,
  "sections": [
    {
      "name": "Bathroom",
      "order_index": 1,
      "description": "Bathroom inspection items",
      "items": [
        {
          "name": "Shower Condition",
          "type": "text",
          "required": true,
          "order_index": 1,
          "options": null
        }
      ]
    }
  ]
}
```

**Response:** `200` - Updated template object

### DELETE /api/templates/:id
Delete a template.

**Parameters:**
- `id` (path) - Template ID

**Response:** `204` - No Content

---

## Template Sections API

### POST /api/templates/:templateId/sections
Add a section to a template.

**Parameters:**
- `templateId` (path) - Template ID

**Request Body:**
```json
{
  "name": "Bedroom",
  "order_index": 2,
  "description": "Bedroom inspection items"
}
```

**Response:** `201` - Created section object

### PUT /api/templates/sections/:id
Update a template section.

**Parameters:**
- `id` (path) - Section ID

**Request Body:**
```json
{
  "name": "Master Bedroom",
  "order_index": 1,
  "description": "Master bedroom inspection"
}
```

**Response:** `200` - Updated section object

### DELETE /api/templates/sections/:id
Delete a template section.

**Parameters:**
- `id` (path) - Section ID

**Response:** `204` - No Content

---

## Template Items API

### POST /api/templates/sections/:sectionId/items
Add an item to a template section.

**Parameters:**
- `sectionId` (path) - Section ID

**Request Body:**
```json
{
  "name": "Window Condition",
  "type": "select",
  "required": true,
  "order_index": 1,
  "options": ["good", "needs_repair", "broken"]
}
```

**Item Types:**
- `text` - Free text input
- `select` - Dropdown selection
- `checkbox` - Boolean checkbox
- `number` - Numeric input

**Response:** `201` - Created item object

### PUT /api/templates/items/:id
Update a template item.

**Parameters:**
- `id` (path) - Item ID

**Request Body:**
```json
{
  "name": "Door Condition",
  "type": "select",
  "required": false,
  "order_index": 2,
  "options": ["excellent", "good", "needs_repair"]
}
```

**Response:** `200` - Updated item object

### DELETE /api/templates/items/:id
Delete a template item.

**Parameters:**
- `id` (path) - Item ID

**Response:** `204` - No Content

---

## File Upload API

### POST /api/upload
Upload a file to Supabase storage.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` - File to upload

**Response:**
```json
{
  "url": "https://supabase-url/storage/v1/object/public/inspection-photos/filename.jpg",
  "filename": "1640995200000-original-filename.jpg"
}
```

---

## Reports API (Placeholder)

### GET /api/reports/property/:id
Generate a property report.

**Parameters:**
- `id` (path) - Property ID

**Query Parameters:**
- `format` (optional) - Report format (`pdf` default)

**Response:**
```json
{
  "url": "https://your-report-service.com/reports/property-1.pdf"
}
```

### GET /api/reports/community/:id
Generate a community report.

**Parameters:**
- `id` (path) - Community ID

**Query Parameters:**
- `format` (optional) - Report format (`pdf` default)

**Response:**
```json
{
  "url": "https://your-report-service.com/reports/community-1.pdf"
}
```

---

## WebSocket API

### Connection
Connect to WebSocket server at `ws://localhost:3001`

### Messages

**Connection Established:**
```json
{
  "type": "connection_established",
  "payload": "Welcome to the real-time service!"
}
```

**Inspection Update (Client → Server):**
```json
{
  "type": "inspection_update",
  "payload": {
    "inspectionId": 1,
    "status": "in_progress",
    "data": {}
  }
}
```

**Inspection Started (Client → Server):**
```json
{
  "type": "inspection_started",
  "payload": {
    "inspectionId": 1,
    "inspectorId": "inspector123",
    "propertyId": 1
  }
}
```

All messages sent to the WebSocket server are broadcast to all other connected clients.

---

## Database Schema

The application uses the following main tables:

- `communities` - Housing communities/developments
- `properties` - Individual properties within communities  
- `inspections` - Scheduled and completed inspections
- `inspection_issues` - Issues found during inspections
- `inspection_templates` - Customizable inspection form templates
- `template_sections` - Sections within templates
- `template_items` - Individual form fields within sections

All tables include `created_at` and `updated_at` timestamp fields for auditing.