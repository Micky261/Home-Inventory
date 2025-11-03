<?php

/**
 * Test script to verify database initialization
 * This script creates the database and shows all tables
 */

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\Database;

$config = require __DIR__ . '/config/config.php';

echo "===========================================\n";
echo "Database Initialization Test\n";
echo "===========================================\n\n";

try {
    // Create database instance
    $db = new Database($config);
    $pdo = $db->getConnection();

    echo "✓ Database connected successfully\n\n";

    // List all tables
    echo "Checking tables in database:\n";
    echo "-------------------------------------------\n";

    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (empty($tables)) {
        echo "✗ No tables found!\n";
        exit(1);
    }

    foreach ($tables as $table) {
        echo "  ✓ {$table}\n";

        // Show columns for each table
        $stmt = $pdo->query("PRAGMA table_info({$table})");
        $columns = $stmt->fetchAll();

        echo "    Columns: ";
        $columnNames = array_map(function($col) {
            return $col['name'] . ' (' . $col['type'] . ')';
        }, $columns);
        echo implode(', ', $columnNames) . "\n";
    }

    echo "\n";
    echo "Expected tables:\n";
    echo "-------------------------------------------\n";
    $expectedTables = ['categories', 'items', 'item_tags', 'locations', 'migrations', 'tags'];

    foreach ($expectedTables as $expected) {
        if (in_array($expected, $tables)) {
            echo "  ✓ {$expected}\n";
        } else {
            echo "  ✗ {$expected} MISSING!\n";
        }
    }

    echo "\n";
    echo "Database initialization complete!\n";

} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
