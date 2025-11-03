<?php

/**
 * Database Migration Runner
 *
 * Runs SQL migration files from the migrations directory
 * Tracks which migrations have been executed
 */

require_once __DIR__ . '/vendor/autoload.php';

$config = require __DIR__ . '/config/config.php';

try {
    // Connect to database
    $dbPath = $config['database']['path'];
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Connected to database: {$dbPath}\n\n";

    // Create migrations tracking table if it doesn't exist
    $pdo->exec('
        CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            migration TEXT NOT NULL UNIQUE,
            executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ');

    // Get list of already executed migrations
    $stmt = $pdo->query('SELECT migration FROM migrations ORDER BY migration');
    $executedMigrations = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo "Already executed migrations:\n";
    if (empty($executedMigrations)) {
        echo "  (none)\n";
    } else {
        foreach ($executedMigrations as $migration) {
            echo "  ✓ {$migration}\n";
        }
    }
    echo "\n";

    // Get all migration files
    $migrationsDir = __DIR__ . '/migrations';
    $migrationFiles = glob($migrationsDir . '/*.sql');
    sort($migrationFiles);

    if (empty($migrationFiles)) {
        echo "No migration files found.\n";
        exit(0);
    }

    // Execute pending migrations
    $executedCount = 0;
    foreach ($migrationFiles as $file) {
        $migrationName = basename($file);

        if (in_array($migrationName, $executedMigrations)) {
            continue; // Skip already executed migrations
        }

        echo "Executing migration: {$migrationName}\n";

        try {
            $pdo->beginTransaction();

            // Read and execute SQL file
            $sql = file_get_contents($file);

            // Split by semicolons, but keep them simple (SQLite compatible)
            $statements = array_filter(
                array_map('trim', explode(';', $sql)),
                function($stmt) {
                    return !empty($stmt) && !preg_match('/^--/', $stmt);
                }
            );

            foreach ($statements as $statement) {
                if (empty($statement)) continue;
                $pdo->exec($statement);
            }

            // Record migration as executed
            $stmt = $pdo->prepare('INSERT INTO migrations (migration) VALUES (?)');
            $stmt->execute([$migrationName]);

            $pdo->commit();
            echo "  ✓ Successfully executed\n\n";
            $executedCount++;

        } catch (Exception $e) {
            $pdo->rollBack();
            echo "  ✗ Failed: " . $e->getMessage() . "\n\n";
            exit(1);
        }
    }

    if ($executedCount === 0) {
        echo "No pending migrations to execute.\n";
    } else {
        echo "Successfully executed {$executedCount} migration(s).\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
