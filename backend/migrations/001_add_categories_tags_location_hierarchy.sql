-- Migration: Add categories, tags, and hierarchical locations
-- Date: 2025-01-03
-- Description: Adds categories table, tags table, item_tags junction table, and path column to locations

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#3498db',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create item_tags junction table
CREATE TABLE IF NOT EXISTS item_tags (
    item_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (item_id, tag_id),
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Add path column to locations if it doesn't exist
-- Note: SQLite doesn't support ALTER COLUMN, so we check first
-- If column doesn't exist, we need to recreate the table

-- First, check if we need to migrate locations table
-- Create new locations table with all columns
CREATE TABLE IF NOT EXISTS locations_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_id INTEGER,
    path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES locations_new(id) ON DELETE CASCADE
);

-- Copy data from old locations table if it exists
INSERT OR IGNORE INTO locations_new (id, name, parent_id, created_at)
SELECT id, name, parent_id, created_at FROM locations;

-- Update paths for all locations
UPDATE locations_new SET path = name WHERE parent_id IS NULL;

-- Drop old table and rename new one
DROP TABLE IF EXISTS locations;
ALTER TABLE locations_new RENAME TO locations;

-- Check if items table has kategorie_id column
-- If not, we need to add it
CREATE TABLE IF NOT EXISTS items_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    kategorie_id INTEGER,
    ort_id INTEGER,
    menge REAL,
    einheit TEXT,
    haendler TEXT,
    preis REAL,
    link TEXT,
    datenblatt_type TEXT,
    datenblatt_value TEXT,
    bild TEXT,
    notizen TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kategorie_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (ort_id) REFERENCES locations(id) ON DELETE SET NULL
);

-- Copy data from old items table
INSERT OR IGNORE INTO items_new (id, name, ort_id, menge, einheit, haendler, preis, link, datenblatt_type, datenblatt_value, bild, notizen, created_at, updated_at)
SELECT id, name, ort_id, menge, einheit, haendler, preis, link, datenblatt_type, datenblatt_value, bild, notizen, created_at, updated_at FROM items;

-- Drop old items table and rename
DROP TABLE IF EXISTS items;
ALTER TABLE items_new RENAME TO items;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
CREATE INDEX IF NOT EXISTS idx_items_kategorie ON items(kategorie_id);
CREATE INDEX IF NOT EXISTS idx_items_ort ON items(ort_id);
CREATE INDEX IF NOT EXISTS idx_locations_parent ON locations(parent_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_item ON item_tags(item_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_tag ON item_tags(tag_id);
