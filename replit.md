# Financial Dashboard Application

## Overview

This is a modern financial dashboard application built with React and Express.js that provides real-time stock market data visualization. The application allows users to search for stock symbols, view current stock information, interactive charts, and historical data tables with export functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds
- **Charts**: Recharts for interactive data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints for stock data
- **Data Fetching**: Yahoo Finance API integration
- **Storage**: In-memory storage with interface for future database integration

### Data Storage Solutions
- **Current**: In-memory storage using Map data structures
- **Schema**: Drizzle ORM with PostgreSQL schema definitions
- **Future Ready**: Database abstraction layer prepared for PostgreSQL integration

## Key Components

### Frontend Components
1. **Dashboard** - Main application layout and state management
2. **StockSearch** - Input component for stock symbol search with validation
3. **StockOverview** - Card-based display of key stock metrics
4. **InteractiveChart** - Time-series chart with multiple timeframe options
5. **DataTable** - Sortable table with CSV export functionality

### Backend Components
1. **Express Server** - HTTP server with middleware for logging and error handling
2. **Stock Routes** - API endpoints for fetching stock data
3. **Storage Interface** - Abstracted storage layer supporting multiple implementations
4. **Yahoo Finance Integration** - External API client for real-time stock data

### UI Components
- Comprehensive shadcn/ui component library
- Dark theme optimized for financial data
- Responsive design with mobile support
- Toast notifications for user feedback

## Data Flow

1. **Stock Search**: User enters symbol → Frontend validates → API call to backend
2. **Data Fetching**: Backend calls Yahoo Finance API → Processes and formats data → Stores in memory
3. **Data Display**: Frontend receives structured data → Updates UI components → Caches with React Query
4. **Real-time Updates**: Components refetch data based on query invalidation
5. **Export**: Historical data formatted and downloaded as CSV

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver (prepared for future use)
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **recharts**: Chart visualization library
- **wouter**: Lightweight routing
- **zod**: Runtime type validation and schema definition

### UI Dependencies
- **@radix-ui**: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for managing CSS class variants
- **lucide-react**: Icon library

### External APIs
- **Yahoo Finance API**: Real-time and historical stock market data

## Deployment Strategy

### Development
- **Server**: Node.js with tsx for TypeScript execution
- **Client**: Vite dev server with HMR
- **Environment**: Development mode with runtime error overlay

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Deployment**: Single Node.js process serving both API and static files

### Database Integration
- **Migration Ready**: Drizzle migrations configured for PostgreSQL
- **Environment Variables**: DATABASE_URL required for production deployment
- **Storage Abstraction**: Easy switch from in-memory to PostgreSQL storage

### Key Architectural Decisions

1. **Monorepo Structure**: Frontend and backend in single repository for simplified development
2. **TypeScript Throughout**: Type safety across the entire stack
3. **Storage Abstraction**: Interface-based storage allows easy database switching
4. **React Query**: Chosen for efficient server state management and caching
5. **shadcn/ui**: Provides consistent, accessible components with Tailwind integration
6. **Yahoo Finance API**: Free, reliable source for stock market data
7. **Dark Theme**: Optimized for financial data consumption and professional appearance