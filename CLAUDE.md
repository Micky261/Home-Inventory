# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Home Inventory System - A full-stack web application for managing household inventory items with search, filtering, file uploads, and multi-language support. Built for single-user, local deployment (XAMPP/Docker).

**Tech Stack:**
- Backend: PHP 7.4+ with Slim Framework 4, SQLite database
- Frontend: Angular 17 with standalone components, i18n support (German/English)
- Package Managers: Composer (backend), Yarn Berry 4.x (frontend)

## Development Commands

### Backend

```bash
# Install dependencies
cd backend
composer install

# Run database migrations (for existing installations)
cd backend
php migrate.php
# Or on Windows: migrate.bat (from project root)

# Start PHP development server (from backend/public/)
php -S localhost:9000 router.php
# Or on Windows: start-backend.bat (from project root)

# Test database initialization
cd backend
php test-db-init.php
```

**Backend runs at:** `http://localhost:9000`

### Frontend

```bash
# Install dependencies (requires Corepack enabled)
cd frontend
yarn install

# Start development server
yarn start  # Runs on http://localhost:4200

# Build for production (both languages)
yarn build

# Build specific language only
yarn ng build --configuration production --locale de
yarn ng build --configuration production --locale en

# Extract i18n translations
yarn ng extract-i18n --output-path src/locale

# Watch mode for development
yarn watch
```

**Frontend runs at:** `http://localhost:4200`

### Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

**Access at:** `http://localhost` (Nginx serves both frontend and backend)

## Architecture

### Backend Architecture

**Entry Point:** `backend/public/index.php`
- Initializes Slim app, loads config, adds CORS middleware
- Defines API routes with AuthMiddleware for protected endpoints
- All routes prefixed with `/api`

**Request Flow:**
1. HTTP Request → `index.php`
2. CORS Middleware (handles OPTIONS preflight)
3. AuthMiddleware (validates token for protected routes)
4. Route → Controller → Model → Database
5. JSON Response

**Directory Structure:**
```
backend/
├── config/
│   └── config.php          # Database path, uploads config, auth credentials, CORS origin
├── public/
│   ├── index.php           # Slim app entry point and route definitions
│   └── router.php          # PHP dev server router script
├── src/
│   ├── Controllers/        # Handle HTTP requests, return JSON responses
│   │   ├── AuthController.php
│   │   ├── ItemController.php
│   │   ├── LocationController.php
│   │   ├── CategoryController.php
│   │   ├── TagController.php
│   │   └── UploadController.php
│   ├── Middleware/
│   │   ├── AuthMiddleware.php   # Token validation (base64 encoded credentials)
│   │   └── CorsMiddleware.php   # Handles CORS headers
│   └── Models/             # Database operations (PDO)
│       ├── Database.php    # Connection, initial schema creation
│       ├── Item.php        # Item CRUD, search with fuzzy matching
│       ├── Location.php    # Hierarchical location management
│       ├── Category.php
│       └── Tag.php
└── migrations/
    └── *.sql              # Numbered migration files (e.g., 003_add_article_number.sql)
```

**Key Backend Concepts:**

1. **Database Initialization:**
   - `Database.php` automatically creates schema on first run if DB doesn't exist
   - For updates to existing installations: use numbered SQL migrations in `backend/migrations/`
   - Migration system tracks executed migrations in `migrations` table

2. **Authentication:**
   - Simple token-based auth (base64 encoded username:password)
   - Token sent in `Authorization: Bearer <token>` header
   - Credentials stored in `config.php` (plaintext - local use only)
   - `/api/auth/login` is the only unprotected endpoint

3. **File Upload System:**
   - `UploadController.php` handles image and datasheet uploads
   - Images: Auto-generates thumbnails (150x150) using GD library with fallback
   - Datasheets: Can upload file OR provide URL (backend downloads URL to local file)
   - Storage locations configured in `config.php`

4. **Search Implementation:**
   - Multi-term fuzzy search: splits search query by spaces
   - Searches across: name, artikelnummer, farbe, hersteller, haendler, notizen, category name, location name/path
   - All search terms must match (AND logic) in at least one field
   - Implemented in `Item.php::getAll()`

5. **Tag System:**
   - Many-to-many relationship via `item_tags` junction table
   - Tags have customizable colors (hex values)
   - Items can have multiple tags, displayed as colored badges in UI

6. **Location Hierarchy:**
   - Locations can have parent locations (parent_id foreign key)
   - Path computed and stored for efficient display (e.g., "Closet > Box")
   - Managed in `Location.php` with tree building methods

### Frontend Architecture

**Entry Point:** `frontend/src/main.ts` → bootstraps `AppComponent`

**App Configuration:** `frontend/src/app/app.config.ts`
- Defines routes: `/login`, `/items`, `/settings`
- Provides HttpClient and Router
- Uses Angular 17 standalone components (no NgModule)

**Component Structure:**
```
frontend/src/app/
├── components/
│   ├── login/              # Simple auth form
│   ├── item-list/          # Main view: table/cards, search, filters, sorting
│   ├── item-form/          # Add/edit modal with file uploads
│   ├── item-detail/        # View-only detail modal
│   └── settings/           # Manage categories, locations, tags
├── services/
│   └── api.service.ts      # HTTP requests to backend API
└── models/
    └── item.model.ts       # TypeScript interfaces
```

**Key Frontend Concepts:**

1. **Standalone Components:**
   - All components are standalone (no NgModule)
   - Import dependencies directly in component decorator
   - Use `CommonModule`, `FormsModule` as needed

2. **API Service Pattern:**
   - `ApiService` centralizes all HTTP calls
   - Methods return RxJS Observables
   - Automatically includes auth token from localStorage
   - Helper methods: `getImageUrl()`, `getThumbnailUrl()`, `getDatasheetUrl()`

3. **Modal System:**
   - Item form and detail views are modals overlaying the list
   - Click outside modal does NOT close it (prevents accidental loss)
   - File upload dialogs use `stopPropagation()` to prevent modal close on cancel

4. **File Upload Handling:**
   - Image upload: auto-uploads on selection, stores filename in formData
   - Datasheet: can upload file OR enter URL (URL triggers download on blur)
   - Delete buttons positioned absolutely over file previews
   - Download status messages (not alerts) for URL datasheets

5. **Search and Filtering:**
   - Search bar sends query to backend (searches multiple fields)
   - Filter dropdowns: categories, locations, tags (multi-select)
   - Filters support union (OR) and intersect (AND) modes
   - Sorting: clickable table headers with multi-level default (location → category → name)

6. **Internationalization (i18n):**
   - Uses Angular's built-in i18n system
   - Translation files: `frontend/src/locale/messages.de.xlf`, `messages.xlf` (EN)
   - Markup uses `i18n` attribute with unique IDs (e.g., `i18n="@@items.name"`)
   - Build system generates language-specific bundles

7. **Item Copy Function:**
   - Copies all fields EXCEPT id and timestamps
   - Preserves tags via `tag_ids` array
   - Does NOT add "Kopie von " prefix to name
   - Opens form modal with pre-filled data for editing before save

## Common Development Patterns

### Adding a New Item Field

1. **Database Migration:**
   ```sql
   -- backend/migrations/00X_add_field_name.sql
   ALTER TABLE items ADD COLUMN field_name TEXT;
   ```
   Run: `cd backend && php migrate.php`

2. **Update Model:**
   - Add field to `Database.php::createInitialSchema()` (for new installations)
   - Add field to `Item.php::create()` and `Item.php::update()` SQL queries
   - Add to search query if field should be searchable

3. **Update TypeScript Interface:**
   ```typescript
   // frontend/src/app/models/item.model.ts
   export interface Item {
     // ...
     field_name?: string;
   }
   ```

4. **Update Form Component:**
   - Add to `formData` initialization in `item-form.component.ts`
   - Add form field to template
   - Add i18n translation key

5. **Update Display:**
   - Add to table/card view in `item-list.component.ts`
   - Add to detail modal in `item-detail.component.ts`

6. **Update Translations:**
   - Extract: `cd frontend && yarn ng extract-i18n --output-path src/locale`
   - Edit `messages.de.xlf` to add German translations

### Adding Event Propagation Stops

Modal overlays require careful event handling to prevent unwanted closes:

```typescript
// Template
<div class="modal-overlay" (click)="$event.stopPropagation()">
  <div class="modal" (click)="$event.stopPropagation()">
    <input type="file"
      (click)="$event.stopPropagation()"
      (cancel)="$event.stopPropagation()">
  </div>
</div>
```

### Thumbnail Generation Pattern

When adding image upload features:
- `UploadController::uploadImage()` automatically calls `generateThumbnail()`
- Thumbnail generation has GD library fallback (copies original if GD unavailable)
- Use `@` error suppression on GD functions + try/catch + fallback to copy

## File Locations

**Config Files:**
- Backend API URL: `frontend/src/app/services/api.service.ts` (lines 11-12)
- Backend config: `backend/config/config.php` (database path, uploads, auth, CORS)
- Routes: `backend/public/index.php` (lines 45-80)
- Frontend routes: `frontend/src/app/app.config.ts` (lines 10-14)

**Database:**
- SQLite file: `database/inventory.db` (auto-created)
- Schema: `backend/src/Models/Database.php::createInitialSchema()`
- Migrations: `backend/migrations/*.sql`

**Uploads:**
- Images: `uploads/images/`
- Thumbnails: `uploads/thumbnails/`
- Datasheets: `uploads/datasheets/`

**Translations:**
- Source (EN): `frontend/src/locale/messages.xlf`
- German: `frontend/src/locale/messages.de.xlf`

## Important Notes

### Event Propagation in Modals
Modal components prevent background clicks from closing the modal. File input cancel events also use `stopPropagation()` to prevent modal close. This required multi-layer propagation stopping on modal-overlay, modal content, and file inputs.

### Tag Copying Fix
When copying items, tags are passed via `tag_ids` array. The form's `ngOnInit()` must check for pre-existing `tag_ids` first before extracting from `tags` array:
```typescript
tag_ids: this.item.tag_ids || this.item.tags?.map(t => t.id) || []
```

### GD Extension Handling
The thumbnail generator checks if GD is loaded (`extension_loaded('gd')`) and falls back to copying the original image if GD is unavailable. All GD function calls use `@` suppression and try/catch.

### XAMPP Deployment
When running on XAMPP (Windows):
- Place project in `C:\xampp\htdocs\HomeInventoryClaude\`
- Access backend at `http://localhost/HomeInventoryClaude/backend/public/`
- Update API URLs in `api.service.ts` to match XAMPP path
- Ensure `mod_rewrite` is enabled in Apache config

### Authentication Security
This system uses simple base64 token auth suitable ONLY for local, trusted environments. Not production-ready. For production: implement bcrypt/Argon2 password hashing, JWT tokens, HTTPS, rate limiting, CSRF protection.

### Multi-level Sorting
Default sort order: Location (ascending) → Category (ascending) → Name (ascending). Uses chained `localeCompare()` for proper locale-aware string sorting. User can click table headers to sort by individual columns.
