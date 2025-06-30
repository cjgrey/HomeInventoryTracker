# Replit.md - Vault Home Inventory Tracker

## Overview

Vault is a comprehensive home inventory tracking application designed as a Progressive Web App (PWA). The application allows users to catalog their belongings with barcode scanning capabilities, organize items by location, track warranties and values, and generate reports. Built with a modern tech stack featuring React on the frontend and Express with Drizzle ORM on the backend.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **PWA Features**: Service worker for offline functionality, manifest for app installation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **File Uploads**: Multer for handling images and receipts
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

### Mobile-First Design
- Progressive Web App with offline capabilities
- Touch-optimized interface with bottom navigation
- Camera integration for barcode scanning
- Responsive design targeting mobile devices primarily

## Key Components

### Database Schema
- **Locations**: Hierarchical location structure with path-based organization
- **Items**: Comprehensive item tracking with photos, receipts, warranties, and custom fields
- **Achievements**: Gamification system to encourage user engagement

### Authentication & Authorization
- Currently using in-memory storage for development
- Session-based authentication infrastructure in place
- Ready for database-backed user management

### File Management
- Local file uploads to `/uploads` directory
- Support for images (JPEG, PNG, GIF) and PDF receipts
- 10MB file size limit with type validation

### PWA Features
- Service worker for offline functionality
- App manifest for installation prompts
- Responsive design with mobile-first approach
- Cache strategies for essential resources

## Data Flow

### Item Management Flow
1. User adds items via manual entry or barcode scanning
2. Items are associated with hierarchical locations
3. Photos and receipts are uploaded and stored locally
4. Item data is validated using Zod schemas
5. Database operations handled through Drizzle ORM

### Offline Functionality
1. Service worker caches essential app resources
2. Local storage maintains offline database copy
3. Background sync for data when connection restored
4. Fallback UI for offline scenarios

### Camera Integration
1. QuaggaJS library for barcode scanning
2. Camera permissions managed through browser APIs
3. Flash control for better scanning in low light
4. Fallback manual entry when camera unavailable

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL
- **ORM**: drizzle-orm with drizzle-kit for migrations
- **UI**: @radix-ui components for accessibility
- **Camera**: quagga for barcode scanning
- **Charts**: recharts for analytics visualization
- **Validation**: zod for schema validation

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **ESLint/Prettier**: Code quality and formatting
- **Vite**: Development server and build optimization

## Deployment Strategy

### Build Process
1. Frontend built with Vite to `/dist/public`
2. Backend compiled with esbuild to `/dist`
3. Database migrations applied via `drizzle-kit push`

### Environment Configuration
- **Development**: Uses tsx for hot reloading
- **Production**: Compiled JavaScript with optimized builds
- **Database**: PostgreSQL connection via DATABASE_URL environment variable

### PWA Deployment
- Static assets served from Express
- Service worker enables offline functionality
- Manifest enables app installation

## Changelog

Changelog:
- June 30, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.