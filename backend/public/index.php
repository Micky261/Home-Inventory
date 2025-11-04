<?php

require __DIR__ . '/../vendor/autoload.php';

use Slim\Factory\AppFactory;
use App\Models\Database;
use App\Controllers\AuthController;
use App\Controllers\ItemController;
use App\Controllers\LocationController;
use App\Controllers\CategoryController;
use App\Controllers\TagController;
use App\Controllers\UploadController;
use App\Middleware\AuthMiddleware;
use App\Middleware\CorsMiddleware;

// Load configuration
$config = require __DIR__ . '/../config/config.php';

// Create Slim app
$app = AppFactory::create();

// Add error middleware
$app->addErrorMiddleware(true, true, true);

// Add CORS middleware
$app->add(new CorsMiddleware($config));

// Handle OPTIONS requests
$app->options('/{routes:.+}', function ($request, $response) {
    return $response;
});

// Initialize database
$database = new Database($config);
$db = $database->getConnection();

// Controllers
$authController = new AuthController($config);
$itemController = new ItemController($db, $config);
$locationController = new LocationController($db);
$categoryController = new CategoryController($db);
$tagController = new TagController($db);
$uploadController = new UploadController($config);

// Auth routes (no auth required)
$app->post('/api/auth/login', [$authController, 'login']);

// Protected routes
$app->group('/api', function ($group) use ($itemController, $locationController, $categoryController, $tagController, $uploadController) {
    // Items
    $group->get('/items', [$itemController, 'index']);
    $group->get('/items/{id}', [$itemController, 'show']);
    $group->post('/items', [$itemController, 'create']);
    $group->put('/items/{id}', [$itemController, 'update']);
    $group->delete('/items/{id}', [$itemController, 'delete']);
    $group->get('/items/autocomplete/names', [$itemController, 'autocomplete']);

    // Locations
    $group->get('/locations', [$locationController, 'index']);
    $group->get('/locations/tree', [$locationController, 'tree']);
    $group->post('/locations', [$locationController, 'create']);
    $group->put('/locations/{id}', [$locationController, 'update']);
    $group->delete('/locations/{id}', [$locationController, 'delete']);

    // Categories
    $group->get('/categories', [$categoryController, 'index']);
    $group->post('/categories', [$categoryController, 'create']);
    $group->put('/categories/{id}', [$categoryController, 'update']);
    $group->delete('/categories/{id}', [$categoryController, 'delete']);

    // Tags
    $group->get('/tags', [$tagController, 'index']);
    $group->post('/tags', [$tagController, 'create']);
    $group->put('/tags/{id}', [$tagController, 'update']);
    $group->delete('/tags/{id}', [$tagController, 'delete']);

    // Uploads
    $group->post('/upload/image', [$uploadController, 'uploadImage']);
    $group->post('/upload/datasheet', [$uploadController, 'uploadDatasheet']);
    $group->post('/upload/datasheet-from-url', [$uploadController, 'downloadDatasheetFromUrl']);
    $group->post('/upload/delete', [$uploadController, 'deleteFile']);
})->add(new AuthMiddleware($config));

// Serve uploaded files
$app->get('/uploads/{type}/{filename}', function ($request, $response, $args) use ($config) {
    $type = $args['type'];
    $filename = basename($args['filename']); // Security: prevent path traversal

    if ($type === 'images') {
        $filePath = $config['uploads']['images'] . $filename;
    } elseif ($type === 'datasheets') {
        $filePath = $config['uploads']['datasheets'] . $filename;
    } else {
        return $response->withStatus(404);
    }

    if (!file_exists($filePath)) {
        return $response->withStatus(404);
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $filePath);
    finfo_close($finfo);

    $response = $response->withHeader('Content-Type', $mimeType);
    $response->getBody()->write(file_get_contents($filePath));

    return $response;
});

$app->run();
