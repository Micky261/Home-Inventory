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
                $this->createInitialSchema();
            }
        } catch (PDOException $e) {
            throw new \Exception('Database connection failed: ' . $e->getMessage());
        }
    }

    /**
     * Create initial schema for new databases
     * For existing databases, use migrations (run migrate.php)
     */
    private function createInitialSchema()
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

        // Items table
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
                datenblatt_type TEXT,
                datenblatt_value TEXT,
                bild TEXT,
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

        // Create indexes
        $this->pdo->exec('
            CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
            CREATE INDEX IF NOT EXISTS idx_items_kategorie ON items(kategorie_id);
            CREATE INDEX IF NOT EXISTS idx_items_ort ON items(ort_id);
            CREATE INDEX IF NOT EXISTS idx_locations_parent ON locations(parent_id);
            CREATE INDEX IF NOT EXISTS idx_item_tags_item ON item_tags(item_id);
            CREATE INDEX IF NOT EXISTS idx_item_tags_tag ON item_tags(tag_id);
        ');

        // Create migrations table
        $this->pdo->exec('
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                migration TEXT NOT NULL UNIQUE,
                executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ');
    }

    public function getConnection()
    {
        return $this->pdo;
    }
}
