# ChefMate - Recipe Generation and Management Application

## Overview

ChefMate is a modern full-stack web application that helps users generate healthy recipes based on their available ingredients. The application features AI-powered recipe generation using Google's Gemini API, ingredient management, recipe favoriting, and shopping list functionality.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints
- **Development**: Hot reload with Vite middleware integration

### Data Storage Solutions
- **Database**: PostgreSQL (via Neon serverless)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Migrations**: Drizzle Kit for database schema management
- **Connection**: Connection pooling with @neondatabase/serverless

### Authentication and Authorization
- Currently implements basic session-based approach (no complex auth system implemented yet)
- Ready for extension with user authentication

## Key Components

### Database Schema
The application uses four main tables:
- **recipes**: Stores recipe information including ingredients, instructions, metadata
- **userIngredients**: Manages user's available ingredients
- **favoriteRecipes**: Tracks user's favorite recipes
- **shoppingListItems**: Manages shopping list items with purchase status

### AI Integration
- **Provider**: Google Gemini 2.5 Flash model
- **Functionality**: Generates healthy recipes based on user ingredients
- **Features**: Supports cuisine preferences, difficulty levels, cooking time constraints, and dietary restrictions

### Frontend Components
- **Header**: Navigation with section switching and shopping cart indicator
- **IngredientInput**: Ingredient management with quick-add suggestions
- **RecipeCard**: Recipe display with availability indicators
- **RecipeModal**: Detailed recipe view with full instructions
- **ShoppingList**: Shopping list management with progress tracking
- **MobileNav**: Mobile-friendly bottom navigation

### API Endpoints
- `GET /api/recipes` - Fetch all recipes
- `GET /api/recipes/:id` - Fetch specific recipe
- `POST /api/recipes/search` - Search recipes by ingredients
- `POST /api/recipes/generate` - AI-powered recipe generation
- `GET /api/ingredients` - Fetch user ingredients
- `POST /api/ingredients` - Add ingredient
- `DELETE /api/ingredients/:id` - Remove ingredient
- `GET /api/favorites` - Fetch favorite recipes
- `POST /api/favorites` - Add recipe to favorites
- `DELETE /api/favorites/:recipeId` - Remove from favorites
- `GET /api/shopping` - Fetch shopping list
- `POST /api/shopping` - Add item to shopping list
- `PATCH /api/shopping/:id` - Update item status
- `DELETE /api/shopping/:id` - Remove item from shopping list

## Data Flow

1. **Ingredient Management**: Users add ingredients to their virtual pantry
2. **Recipe Discovery**: System searches existing recipes or generates new ones using AI
3. **Recipe Interaction**: Users can view detailed recipes, save favorites, and add missing ingredients to shopping list
4. **Shopping List**: Tracks needed ingredients with purchase status and progress indicators

## External Dependencies

### Core Dependencies
- **@google/genai**: Google Gemini AI integration
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **express**: Web server framework

### UI Dependencies
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe CSS variants
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **tsx**: TypeScript execution for server
- **esbuild**: Production server bundling

## Deployment Strategy

### Development
- **Command**: `npm run dev`
- **Features**: Hot reload, Vite dev server, TypeScript compilation
- **Port**: 5000 (configurable)

### Production Build
- **Client Build**: Vite builds React app to `dist/public`
- **Server Build**: esbuild bundles server to `dist/index.js`
- **Command**: `npm run build`

### Production Deployment
- **Platform**: Replit with autoscale deployment target
- **Start Command**: `npm run start`
- **Database**: Requires DATABASE_URL environment variable
- **AI**: Requires GEMINI_API_KEY environment variable

### Environment Requirements
- **Node.js**: Version 20+
- **PostgreSQL**: Via Neon serverless (configurable via DATABASE_URL)
- **API Keys**: Google Gemini API key for recipe generation

## Changelog
- June 23, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.