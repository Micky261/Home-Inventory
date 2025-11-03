<?php

return [
    'database' => [
        'path' => __DIR__ . '/../../database/inventory.db'
    ],
    'uploads' => [
        'images' => __DIR__ . '/../../uploads/images/',
        'datasheets' => __DIR__ . '/../../uploads/datasheets/',
        'max_size' => 10485760, // 10MB
        'allowed_image_types' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        'allowed_datasheet_types' => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    ],
    'auth' => [
        'username' => 'admin',
        'password' => 'changeme' // CHANGE THIS!
    ],
    'cors' => [
        'origin' => 'http://localhost:4200'
    ]
];
