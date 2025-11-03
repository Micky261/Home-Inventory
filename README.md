# Home Inventory System

A comprehensive home inventory management system built with PHP (Slim Framework), SQLite, and Angular.

## Features

- **Item Management**: Create, edit, delete, and view inventory items
- **Search & Filter**: Search by name, category, or location
- **Autocomplete**: Smart autocomplete for item names
- **File Uploads**: Upload images and datasheets (or use URLs)
- **Location Management**: Automatically manage storage locations
- **Multi-language**: German and English translations (i18n)
- **Simple Authentication**: Single-user authentication with configurable credentials

## Item Attributes

Each inventory item includes:
- **Name** (required, with autocomplete)
- **Kategorie** (Category)
- **Ort** (Location - dropdown with ability to create new)
- **Menge** (Quantity)
- **Einheit** (Unit)
- **Händler** (Retailer)
- **Preis** (Price)
- **Link** (URL)
- **Datenblatt** (Datasheet - file upload or URL)
- **Bild** (Image upload)
- **Notizen** (Notes)

## Tech Stack

### Backend
- PHP 7.4+
- Slim Framework 4
- SQLite database
- PSR-7/PSR-15 standards

### Frontend
- Angular 17
- Standalone components
- Angular i18n for translations
- Responsive CSS

## Installation

### Prerequisites

- PHP 7.4 or higher with PDO SQLite extension
- Composer
- Node.js 18+ and Yarn (Berry/v4)
- Apache/Nginx web server (or use XAMPP)

### Backend Setup

1. **Install PHP dependencies**:
   ```bash
   cd backend
   composer install
   ```

2. **Configure authentication**:
   - Copy `backend/config/config.example.php` to `backend/config/config.php` (if not exists)
   - Edit `backend/config/config.php` and change the default password:
     ```php
     'auth' => [
         'username' => 'admin',
         'password' => 'YOUR_SECURE_PASSWORD_HERE'
     ]
     ```

3. **Start the PHP development server**:

   **On Windows:**
   - Double-click `start-backend.bat` in the project root
   - Or run from CMD/PowerShell:
     ```cmd
     start-backend.bat
     ```
   - Server will start at `http://localhost:9000`

   **On Linux/Mac:**
   ```bash
   cd backend/public
   php -S localhost:9000 router.php
   ```

4. **Test the API**:
   - Visit `http://localhost:9000/api/items`
   - You should get a 401 Unauthorized response (this is expected without auth)

<details>
<summary><strong>Alternative: Apache/Nginx Setup (Optional)</strong></summary>

If you prefer using Apache or Nginx instead of PHP's built-in server:

**For XAMPP/Apache**:
- Place the project in your htdocs directory
- Access via: `http://localhost/HomeInventoryClaude/backend/public/`
- Make sure `mod_rewrite` is enabled
- The `.htaccess` file is already configured
- Update `frontend/src/app/services/api.service.ts` API URLs accordingly

**For Nginx**:
```nginx
server {
    listen 80;
    server_name localhost;
    root /path/to/HomeInventoryClaude/backend/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

**Set proper permissions**:
```bash
chmod -R 755 uploads/
chmod -R 755 database/
```
</details>

### Database Setup

The database is created automatically on first run with the complete schema.

For **future updates** to an existing installation, run migrations:

**On Windows:**
```cmd
migrate.bat
```

**On Linux/Mac:**
```bash
cd backend
php migrate.php
```

**Note**: Migrations are only needed when updating an existing installation. Fresh installations create the complete schema automatically.

**See**: `backend/migrations/README.md` for migration documentation.

### Frontend Setup

This project uses **Yarn Berry (v4)** via Corepack. See `frontend/SETUP.md` for detailed Yarn setup.

1. **Enable Corepack** (one-time, may require sudo):
   ```bash
   corepack enable
   ```

2. **Install dependencies**:
   ```bash
   cd frontend
   yarn install
   ```

   Corepack will automatically use Yarn 4.0.2 as specified in package.json

3. **Update API URL** (if needed):
   - Edit `frontend/src/app/services/api.service.ts`
   - Update `apiUrl` and `uploadUrl` to match your backend URL:
     ```typescript
     private apiUrl = 'http://localhost/HomeInventoryClaude/backend/public/api';
     private uploadUrl = 'http://localhost/HomeInventoryClaude/backend/public';
     ```

4. **Start development server**:
   ```bash
   yarn start
   ```
   The application will open at `http://localhost:4200`

5. **Build for production** (optional):
   ```bash
   yarn build
   ```
   Output will be in `frontend/dist/home-inventory/`

## Usage

### Starting the Application

1. **Start Backend** (in Windows CMD/PowerShell):
   ```cmd
   start-backend.bat
   ```
   Backend will run at `http://localhost:9000`

2. **Start Frontend** (in WSL2/terminal):
   ```bash
   cd frontend
   yarn start
   ```
   Frontend will run at `http://localhost:4200`

### Using the Application

1. **Login**:
   - Navigate to `http://localhost:4200`
   - Enter username: `admin`
   - Enter the password you configured in `backend/config/config.php` (default: `admin123`)

2. **Add Items**:
   - Click the "Add Item" button
   - Fill in the item details
   - Upload images or datasheets (optional)
   - Click "Save"

3. **Search & Filter**:
   - Use the search bar to find items by name, category, or location
   - Use the dropdown filters for category and location
   - Search updates automatically as you type

4. **Edit/Delete Items**:
   - Click the edit icon (✏️) to modify an item
   - Click the trash icon (🗑️) to delete an item
   - Click link icon (🔗) to open product URL
   - Click document icon (📄) to view datasheet

5. **Manage Locations**:
   - When adding/editing an item, select "+ New Location" from the location dropdown
   - Enter the new location name
   - The location will be created automatically when you save the item

## Language Support

The application supports German and English. To build with specific language:

```bash
# German version (default)
yarn ng build --configuration production --localize

# English version only
yarn ng build --configuration production --locale en

# German version only
yarn ng build --configuration production --locale de
```

For development, the app uses English by default. To extract new translations:

```bash
yarn ng extract-i18n --output-path src/locale
```

## Database

The SQLite database is created automatically on first run at `database/inventory.db`.

### Schema

**items table**:
- id, name, kategorie, ort_id, menge, einheit, haendler, preis
- link, datenblatt_type, datenblatt_value, bild, notizen
- created_at, updated_at

**locations table**:
- id, name, created_at

## File Uploads

- **Images**: Stored in `uploads/images/` (max 10MB, JPG/PNG/GIF/WebP)
- **Datasheets**: Stored in `uploads/datasheets/` (max 10MB, PDF/DOC/DOCX)
- Files are automatically deleted when items are removed

## Security Notes

This is a single-user, locally-hosted system with basic security:
- Simple token-based authentication (base64 encoded credentials)
- Password stored in config file (not hashed)
- Suitable for local, trusted environments only
- **NOT recommended for production/internet-facing deployments**

For production use, consider:
- Implementing proper password hashing (bcrypt/Argon2)
- Using JWT tokens with expiration
- Adding HTTPS/TLS
- Implementing rate limiting
- Adding CSRF protection

## Troubleshooting

### Backend Issues

1. **500 Internal Server Error**:
   - Check PHP error logs
   - Ensure SQLite extension is enabled: `php -m | grep pdo_sqlite`
   - Verify file permissions on `database/` and `uploads/` directories

2. **CORS errors**:
   - Update `backend/config/config.php` with correct frontend URL
   - Ensure Apache mod_headers is enabled

3. **Database not created**:
   - Check write permissions on `database/` directory
   - Manually create: `touch database/inventory.db && chmod 666 database/inventory.db`

### Frontend Issues

1. **API connection failed**:
   - Verify backend is running and accessible
   - Check API URLs in `api.service.ts`
   - Check browser console for CORS errors

2. **Build errors**:
   - Delete `node_modules` and `.yarn/cache` directories
   - Run `yarn install` again
   - Clear Angular cache: `rm -rf .angular`

3. **Yarn Berry issues**:
   - Ensure Corepack is enabled: `corepack enable`
   - Check Yarn version: `yarn --version` (should be 4.x)
   - If needed, update Yarn: `yarn set version stable`

## Project Structure

```
HomeInventoryClaude/
├── backend/
│   ├── config/
│   │   ├── config.php (create from config.example.php)
│   │   └── config.example.php
│   ├── public/
│   │   ├── .htaccess
│   │   └── index.php
│   ├── src/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   └── Models/
│   └── composer.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   ├── app.component.ts
│   │   │   └── app.config.ts
│   │   ├── locale/
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.css
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
├── database/
│   └── inventory.db (auto-created)
├── uploads/
│   ├── images/
│   └── datasheets/
└── README.md
```

## License

This project is provided as-is for personal use.

## Contributing

This is a personal inventory system. Feel free to fork and modify for your own needs.

## Support

For issues or questions, please check:
1. This README for setup instructions
2. PHP and Angular error logs
3. Browser console for frontend errors
