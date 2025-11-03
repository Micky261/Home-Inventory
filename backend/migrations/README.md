# Database Migrations

This directory contains database migration files for the Home Inventory System.

## How It Works

- Each migration is a `.sql` file with a numbered prefix (e.g., `001_description.sql`)
- Migrations are executed in order based on their filename
- The system tracks which migrations have been executed in a `migrations` table
- Already executed migrations are skipped automatically

## Running Migrations

### Windows
Simply double-click `migrate.bat` in the project root directory.

### Command Line
```bash
# From the project root
cd backend
php migrate.php
```

### Linux/Mac
```bash
cd backend
php migrate.php
```

## Creating New Migrations

1. Create a new `.sql` file in this directory
2. Use a numbered prefix (e.g., `002_my_new_feature.sql`)
3. Write your SQL statements
4. Run the migration script

### Migration File Template

```sql
-- Migration: [Description]
-- Date: [YYYY-MM-DD]
-- Description: [Detailed description of what this migration does]

-- Your SQL statements here
CREATE TABLE IF NOT EXISTS example (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

-- Add more statements as needed
```

## Important Notes

- **Always test migrations on a backup database first**
- Migrations are executed in a transaction - if one fails, all changes are rolled back
- Once a migration is executed, it won't run again
- Never modify a migration file after it has been executed
- Use `CREATE TABLE IF NOT EXISTS` and similar patterns for safety

## Migration History

| Migration | Description | Date |
|-----------|-------------|------|
| 001 | Add categories, tags, and hierarchical locations | 2025-01-03 |

## Troubleshooting

If a migration fails:
1. Check the error message
2. Fix the SQL in the migration file
3. Remove the failed migration from the `migrations` table:
   ```sql
   DELETE FROM migrations WHERE migration = 'xxx_failed_migration.sql';
   ```
4. Run the migration again
