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
        $this->pdo->exec('
            CREATE TABLE IF NOT EXISTS locations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ');

        $this->pdo->exec('
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                kategorie TEXT,
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
                FOREIGN KEY (ort_id) REFERENCES locations(id)
            )
        ');

        $this->pdo->exec('
            CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
            CREATE INDEX IF NOT EXISTS idx_items_kategorie ON items(kategorie);
            CREATE INDEX IF NOT EXISTS idx_items_ort ON items(ort_id);
        ');
    }

    public function getConnection()
    {
        return $this->pdo;
    }
}
