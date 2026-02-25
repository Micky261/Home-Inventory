<?php

return [
    'database' => [
        'path' => '/var/www/html/data/inventory.db'
    ],
    'uploads' => [
        'images' => '/var/www/html/uploads/images/',
        'thumbnails' => '/var/www/html/uploads/thumbnails/',
        'datasheets' => '/var/www/html/uploads/datasheets/',
        'max_size' => 10485760, // 10MB
        'thumbnail_width' => 400,
        'thumbnail_height' => 400,
        'allowed_image_types' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        'allowed_datasheet_types' => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    ],
    'auth' => [
        'username' => getenv('AUTH_USERNAME') ?: 'admin',
        'password' => getenv('AUTH_PASSWORD') ?: 'changeme'
    ],
    'cors' => [
        'origin' => getenv('CORS_ORIGIN') ?: '*'
    ]
];
