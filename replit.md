# DetailPro - Auto Detailing Business Management System

## Overview

DetailPro is a comprehensive business management system designed for auto detailing businesses. It provides functionality for managing customers, vehicles, scheduling jobs, invoicing, payments, and generating reports. The application follows a modern full-stack architecture with a React frontend and a Node.js/Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

DetailPro is built using the following architecture:

1. **Frontend**: React-based SPA (Single Page Application) using Vite as the build tool. The UI is built with Shadcn UI components, which are based on Radix UI primitives.

2. **Backend**: Node.js server using Express.js for API routes. The server handles authentication, data validation, and business logic.

3. **Database**: PostgreSQL database with Drizzle ORM for type-safe database access and schema management.

4. **API**: RESTful API design with endpoints for all main entities (users, customers, vehicles, services, jobs, invoices, etc.).

5. **Authentication**: Simple username/password authentication with session-based auth.

The application follows a layered architecture:
- UI Layer: React components
- API Layer: Express routes
- Service Layer: Business logic 
- Data Access Layer: Drizzle ORM

## Key Components

### Frontend Components

1. **UI Framework**: 
   - Uses Shadcn UI, a collection of reusable components built on Radix UI primitives
   - Styled with Tailwind CSS for consistent design
   - Supports light and dark mode

2. **State Management**:
   - React Context API for authentication and theme
   - React Query for server state management, data fetching, and caching

3. **Pages**:
   - Dashboard: Overview of business metrics and daily tasks
   - Customers: Customer management
   - Calendar: Job scheduling with day/week/month views
   - Jobs: Service job management
   - Invoices: Invoice creation and management
   - Reports: Business analytics and reporting

4. **Components**:
   - Layout components for consistent page structure
   - Form components for data entry
   - Table components for data display
   - Modal dialogs for actions
   - Charts for data visualization

### Backend Components

1. **API Routes**:
   - Authentication endpoints
   - CRUD operations for all entities
   - Business logic for scheduling, invoicing, etc.

2. **Database Schema**:
   - Users: System users (admins, technicians)
   - Customers: Client information
   - Vehicles: Customer vehicles
   - Services: Service offerings
   - Jobs: Scheduled work
   - Invoices & Payments: Billing information
   - Reviews: Customer feedback

3. **Middleware**:
   - Authentication
   - Logging
   - Error handling
   - Request validation using Zod

## Data Flow

1. **Authentication Flow**:
   - User submits credentials
   - Server validates credentials
   - Server returns user data and sets session
   - Client stores user in local storage
   - Protected routes check for authenticated user

2. **CRUD Operations Flow**:
   - Client sends request to API
   - Server validates request data using Zod schemas
   - Server processes request and updates database
   - Server returns response data
   - Client updates UI state with React Query

3. **Job Scheduling Flow**:
   - User selects date/time, customer, vehicle, and services
   - System validates availability
   - Job is created with "scheduled" status
   - Job appears on calendar and jobs list
   - Job status can be updated through workflow (scheduled → in-progress → completed)

4. **Invoicing Flow**:
   - Completed job triggers invoice creation
   - Invoice calculates totals based on services performed
   - Invoice can be sent to customer
   - Payments can be recorded against invoices

## External Dependencies

### Frontend Dependencies

1. **UI Framework**:
   - Radix UI components (various primitives)
   - Tailwind CSS for styling
   - class-variance-authority for component variants
   - cmdk for command menus
   - date-fns for date manipulation
   - lucide-react for icons

2. **State Management**:
   - @tanstack/react-query for server state
   - React Context API for client state

3. **Forms and Validation**:
   - react-hook-form for form handling
   - zod for schema validation
   - @hookform/resolvers for connecting react-hook-form with zod

4. **Routing**:
   - wouter for client-side routing

### Backend Dependencies

1. **Server Framework**:
   - express for HTTP server and routing

2. **Database**:
   - drizzle-orm for database ORM
   - @neondatabase/serverless for PostgreSQL client
   - drizzle-zod for connecting schemas

3. **Validation**:
   - zod for schema validation
   - zod-validation-error for improved error messages

4. **Development**:
   - TypeScript for type checking
   - Vite for frontend development server and building
   - esbuild for server bundling

## Deployment Strategy

The application is configured for deployment on Replit with:

1. **Build Process**:
   - Frontend: Vite builds static assets
   - Backend: esbuild bundles server code
   - Combined into a single deployment package

2. **Runtime Configuration**:
   - Node.js server serves both API and static frontend assets
   - Environment variables for configuration
   - Production vs. development modes

3. **Database**:
   - PostgreSQL database (via Replit's PostgreSQL module)
   - Database migrations using Drizzle Kit

4. **Scaling Considerations**:
   - Stateless API design for horizontal scaling
   - Database connection pooling

## Getting Started

To begin development:

1. Ensure the PostgreSQL database is provisioned in your Replit
2. Set the DATABASE_URL environment variable
3. Run `npm run dev` for development mode
4. Run `npm run db:push` to sync database schema

To build for production:
1. Run `npm run build`
2. Run `npm run start` to start the production server