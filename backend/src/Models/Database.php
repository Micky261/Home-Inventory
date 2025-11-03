<?php

namespace App\Models;

use PDO;
use PDOException;

class Database
{
    private $pdo;

    public function __construct($config)
    {
        $dbPath = $config['database']['path'];
        $dbDir = dirname($dbPath);

        if (!file_exists($dbDir)) {
            mkdir($dbDir, 0755, true);
        }

        $isNewDb = !file_exists($dbPath);

        try {
            $this->pdo = new PDO('sqlite:' . $dbPath);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

            if ($isNewDb) {
                $this->createTables();
            }
        } catch (PDOException $e) {
            throw new \Exception('Database connection failed: ' . $e->getMessage());
        }
    }

    private function createTables()
    {
        // Locations table with hierarchical support
        $this->pdo->exec('
            CREATE TABLE IF NOT EXISTS locations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                parent_id INTEGER,
                path TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_id) REFERENCES locations(id) ON DELETE CASCADE
            )
        ');

        // Categories table
        $this->pdo->exec('
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ');

        // Tags table
        $this->pdo->exec('
            CREATE TABLE IF NOT EXISTS tags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                color TEXT DEFAULT "#3498db",
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ');

        // Items table (kategorie_id now references categories table)
        $this->pdo->exec('
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                kategorie_id INTEGER,
                ort_id INTEGER,
                menge REAL,
                einheit TEXT,
                haendler TEXT,
                preis REAL,
                link TEXT,
                datenblatt_type TEXT, -- "file" or "url"
                datenblatt_value TEXT, -- filename or URL
                bild TEXT, -- filename
                notizen TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (kategorie_id) REFERENCES categories(id) ON DELETE SET NULL,
                FOREIGN KEY (ort_id) REFERENCES locations(id) ON DELETE SET NULL
            )
        ');

        // Many-to-many relationship for items and tags
        $this->pdo->exec('
            CREATE TABLE IF NOT EXISTS item_tags (
                item_id INTEGER NOT NULL,
                tag_id INTEGER NOT NULL,
                PRIMARY KEY (item_id, tag_id),
                FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
                FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
            )
        ');

        $this->pdo->exec('
            CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
            CREATE INDEX IF NOT EXISTS idx_items_kategorie ON items(kategorie_id);
            CREATE INDEX IF NOT EXISTS idx_items_ort ON items(ort_id);
            CREATE INDEX IF NOT EXISTS idx_locations_parent ON locations(parent_id);
            CREATE INDEX IF NOT EXISTS idx_item_tags_item ON item_tags(item_id);
            CREATE INDEX IF NOT EXISTS idx_item_tags_tag ON item_tags(tag_id);
        ');

        $this->migrateExistingData();
    }

    private function migrateExistingData()
    {
        // Check if we need to migrate from old schema (kategorie as TEXT)
        try {
            $stmt = $this->pdo->query("PRAGMA table_info(items)");
            $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $hasKategorieText = false;
            foreach ($columns as $column) {
                if ($column['name'] === 'kategorie' && strpos(strtolower($column['type']), 'text') !== false) {
                    $hasKategorieText = true;
                    break;
                }
            }

            if ($hasKategorieText) {
                // Migrate existing categories to categories table
                $stmt = $this->pdo->query("SELECT DISTINCT kategorie FROM items WHERE kategorie IS NOT NULL AND kategorie != ''");
                $categories = $stmt->fetchAll(PDO::FETCH_COLUMN);

                $insertStmt = $this->pdo->prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)");
                foreach ($categories as $category) {
                    $insertStmt->execute([$category]);
                }

                // Note: Full migration would require recreating the table
                // For now, we'll keep both columns and handle it in the model
            }
        } catch (\Exception $e) {
            // Migration not needed or already done
        }
    }

    public function getConnection()
    {
        return $this->pdo;
    }
}
