# Haven Realty Inspection App - AI Development Context

## 🏠 Application Overview

**Haven Realty Inspection App** is a mobile-first web application built for property inspections in real estate communities. Despite the repository name "ios-inspection-app", this is actually a React/TypeScript web application optimized for mobile devices, not a native iOS app.

### Core Purpose
- **Primary Function**: Property inspection management for real estate communities
- **Target Users**: Property inspectors, real estate professionals
- **Platform**: Mobile-optimized web application (React/TypeScript)
- **Deployment**: Vite-based build system with potential for PWA capabilities

## 📱 Technology Stack

### Frontend Framework
- **React 18.2.0** with TypeScript
- **Vite** for build tooling and development server
- **Tailwind CSS v4.0.0-alpha.25** for styling
- **Radix UI** components for accessible UI primitives

### Key Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "lucide-react": "latest", // Icons
  "recharts": "latest", // Charts/data visualization
  "react-hook-form": "7.55.0", // Form handling
  "sonner": "2.0.3", // Toast notifications
  "motion": "latest", // Animations
  "@radix-ui/*": "latest" // UI components
}
```

### Development Tools
- **TypeScript 5.2.2**
- **ESLint** with React-specific rules
- **PostCSS** with Autoprefixer
- **Vite** with React plugin

## 🏗️ Application Architecture

### State Management Pattern
- **No global state management** (Redux/Zustand)
- **React Context** for authentication (`AuthContext`)
- **Custom hooks** for data fetching and business logic
- **Local component state** for UI interactions

### Data Flow Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mobile UI     │───▶│   Custom Hooks   │───▶│   API Service   │
│   Components    │    │   (useCommunities│    │   (Mock Data)   │
│                 │    │    useProperties │    │                 │
│                 │    │   useInspections)│    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   AuthContext    │
                       │   (Supabase)     │
                       └──────────────────┘
```

## 📂 Project Structure

### Root Level Files
```
/
├── App.tsx                 # Main application component & routing
├── package.json           # Dependencies and scripts
├── COMPREHENSIVE_CLEANUP.md # Cleanup documentation
└── src/
    ├── components/        # React components
    ├── contexts/         # React contexts
    ├── hooks/           # Custom React hooks
    ├── services/        # API and external services
    ├── styles/          # Global styles
    └── assets/          # Static assets
```

### Component Architecture
```
src/components/
├── mobile/              # Mobile-optimized components (CORE)
│   ├── MobileLandingPage.tsx
│   ├── MobileCommunitiesPage.tsx
│   ├── MobilePropertiesPage.tsx
│   ├── MobileInspectionsPage.tsx
│   ├── MobileInspectionFormPage.tsx (451 lines - core feature)
│   ├── MobilePropertyReportsPage.tsx
│   ├── MobileBottomNav.tsx
│   └── [8 other mobile components]
├── ui/                  # Reusable UI components (Radix-based)
│   ├── card.tsx
│   ├── button.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   └── [5 other UI components]
├── figma/              # Design system components
├── LoadingSpinner.tsx  # Shared loading component
└── ErrorMessage.tsx    # Shared error component
```

## 🔍 Core Features & User Flow

### Primary User Journey
1. **Landing Page** → Choose to browse communities
2. **Communities** → Select a community to view properties
3. **Properties** → Select a property to start inspection
4. **Inspection Form** → Complete detailed property inspection
5. **Reports** → View and manage completed inspection reports

### Key Features

#### 1. Community Management
- View list of real estate communities
- Filter by status: `active`, `under-construction`, `sold`
- Create new communities (admin functionality)

#### 2. Property Management  
- Browse properties within selected community
- View property details (address, type, status)
- Search and filter properties
- Property status tracking

#### 3. Inspection System (Core Feature)
- **Detailed inspection forms** with 11 major sections:
  - Kitchen (Appliances, Fixtures, Plumbing)
  - Bathrooms (Multiple bathroom support)
  - Living Areas (Living Room, Dining Room, Bedrooms)
  - Utilities (HVAC, Electrical, Plumbing)
  - Exterior (Roof, Foundation, Landscaping)
- **Three-tier rating system**: `Good`, `Fair`, `Needs Repair`
- **Photo attachments** for each inspection item
- **Notes and comments** for detailed observations
- **Progress tracking** with completion percentage
- **Sticky section navigation** for long forms

#### 4. Reporting & Analytics
- Generate inspection reports
- View historical inspections
- Export capabilities (planned)
- Data visualization with charts

## 💾 Data Models

### Core Entity Types
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

interface Property {
  id: string;
  communityId: string;
  address: string;
  type: string;
  status: 'available' | 'sold' | 'under-contract';
  // Additional property fields...
}

interface Inspection {
  id: string;
  propertyId: string;
  communityId: string;
  status: 'draft' | 'in-progress' | 'completed';
  // Inspection data structure...
}
```

## 🔧 Development Patterns

### Custom Hooks Pattern
The app heavily uses custom hooks for data management:

```typescript
// Pattern: Custom hooks for API integration
const { communities, loading, error, createCommunity } = useCommunities();
const { properties, loading, error } = useProperties(communityId);
const { inspections, loading, error } = useInspections(propertyId);
```

### Component Props Pattern
Mobile components follow consistent prop patterns:
```typescript
interface MobilePageProps {
  onNavigateToX: () => void;
  onBack: () => void;
  selectedItem?: ItemType;
  // Additional page-specific props
}
```

### State Management Pattern
App uses single-component state management via `App.tsx`:
```typescript
// Navigation state
const [currentPage, setCurrentPage] = useState<AppState>('landing');
const [navigationStack, setNavigationStack] = useState<AppState[]>(['landing']);

// Entity selection state  
const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
const [selectedProperty, setSelectedProperty] = useState<{id: string, address: string} | null>(null);
```

## 🌐 API Integration & Mock Data

### Current State: Mock Data Implementation
- **All API calls currently use mock data** (no real backend)
- Mock data simulates realistic delays (200-500ms)
- Fallback system: API call → Error → Mock data
- Ready for backend integration when available

### Planned Backend: Supabase
- Authentication context prepared for Supabase
- Database schema ready for communities, properties, inspections
- Configuration exists but not activated (`isSupabaseConfigured()`)

## 📱 Mobile-First Design Philosophy

### UI/UX Principles
- **Touch-optimized interactions**: Large buttons, appropriate spacing
- **Single-hand navigation**: Bottom navigation bar
- **Progressive disclosure**: Collapsible sections in forms
- **Visual feedback**: Loading states, active states, animations
- **Accessibility**: Radix UI ensures keyboard navigation and screen reader support

### Responsive Strategy
- **Primary target**: Mobile devices (smartphones)
- **Secondary support**: Tablets
- **No desktop optimization**: This is intentionally mobile-only

## 🧹 Code Quality & Maintenance

### Recent Cleanup (74% codebase reduction)
The app recently underwent major cleanup removing:
- 37 unused UI components  
- 22 unused desktop components
- 7 unused hooks and services
- Legacy web application code

### Current Codebase Health
- **Lean and focused**: Only essential code remains
- **Consistent patterns**: Clear component and hook patterns
- **Type safety**: Full TypeScript implementation
- **Modern React**: Hooks-based, functional components

## 🚀 Build & Development

### Available Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production (TypeScript + Vite)
npm run preview    # Preview production build
npm run lint       # ESLint with TypeScript rules
npm run type-check # TypeScript type checking
```

### Development Environment
- **Hot reload**: Vite provides fast refresh
- **Type checking**: Real-time TypeScript validation
- **Linting**: ESLint with React and TypeScript rules

## 🎯 Key Files for AI Development

### Critical Files to Understand First
1. **`App.tsx`** (324 lines) - Main app routing and state
2. **`src/components/mobile/MobileInspectionFormPage.tsx`** (451 lines) - Core inspection functionality
3. **`src/hooks/useCommunities.ts`** - Data fetching pattern example
4. **`src/services/api.ts`** - API layer and mock data
5. **`src/contexts/AuthContext.tsx`** - Authentication management

### Development Guidelines
- **Follow existing patterns**: Study the mobile components for consistency
- **Use custom hooks**: Don't inline API calls in components
- **Mock data first**: Implement features with mock data, then integrate real APIs
- **Mobile-first**: Always design and test on mobile viewports
- **TypeScript strict**: Maintain full type safety

## 🔮 Future Considerations

### Planned Enhancements
- **PWA capabilities**: Offline inspection support
- **Photo capture**: Camera integration for inspection photos
- **PDF generation**: Printable inspection reports
- **Real-time sync**: Multi-inspector collaboration
- **Advanced analytics**: Trend analysis and insights

### Technical Debt
- **Backend integration**: Replace mock data with real API
- **Photo upload**: Implement file handling system
- **Offline support**: Add service worker and caching
- **Performance optimization**: Code splitting and lazy loading

---

## 🤖 For AI Assistants: Key Reminders

1. **This is NOT a native iOS app** - it's a React web app optimized for mobile
2. **Always use mock data patterns** when adding new features
3. **Follow the custom hooks pattern** for data fetching
4. **Mobile-first mindset** - design for touch interfaces
5. **Maintain TypeScript strict typing** throughout
6. **Use existing UI components** from the `/ui` directory
7. **Follow the established navigation patterns** in `App.tsx`
8. **Test on mobile viewports** - this app is not intended for desktop

This codebase is well-structured, modern, and ready for continued development. The cleanup has left a focused, maintainable application with clear patterns for expansion.