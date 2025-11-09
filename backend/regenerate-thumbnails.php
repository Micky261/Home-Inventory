#!/usr/bin/env php
<?php

/**
 * Thumbnail Regeneration Script
 *
 * This script regenerates all thumbnails for existing images.
 * Use this after changing thumbnail_width or thumbnail_height in config.
 *
 * Usage: php regenerate-thumbnails.php
 */

require __DIR__ . '/vendor/autoload.php';

$config = require __DIR__ . '/config/config.php';

$imagesDir = $config['uploads']['images'];
$thumbnailsDir = $config['uploads']['thumbnails'];
$maxWidth = $config['uploads']['thumbnail_width'];
$maxHeight = $config['uploads']['thumbnail_height'];

echo "Starting thumbnail regeneration...\n";
echo "Thumbnail size: {$maxWidth}x{$maxHeight}\n";
echo "Images directory: {$imagesDir}\n";
echo "Thumbnails directory: {$thumbnailsDir}\n\n";

// Check if GD extension is available
if (!extension_loaded('gd')) {
    echo "Error: GD extension is not loaded. Cannot regenerate thumbnails.\n";
    exit(1);
}

// Ensure thumbnails directory exists
if (!is_dir($thumbnailsDir)) {
    mkdir($thumbnailsDir, 0755, true);
}

// Get all image files
$imageFiles = glob($imagesDir . '*.{jpg,jpeg,png,gif,webp}', GLOB_BRACE);

if (empty($imageFiles)) {
    echo "No image files found.\n";
    exit(0);
}

echo "Found " . count($imageFiles) . " images.\n\n";

$successCount = 0;
$failCount = 0;

foreach ($imageFiles as $sourcePath) {
    $filename = basename($sourcePath);
    echo "Processing: {$filename}... ";

    $result = generateThumbnail($sourcePath, $filename, $thumbnailsDir, $maxWidth, $maxHeight);

    if ($result) {
        echo "✓ Success\n";
        $successCount++;
    } else {
        echo "✗ Failed\n";
        $failCount++;
    }
}

echo "\n";
echo "Regeneration complete!\n";
echo "Success: {$successCount}\n";
echo "Failed: {$failCount}\n";

/**
 * Generate thumbnail for an image
 */
function generateThumbnail($sourcePath, $filename, $thumbnailsDir, $maxWidth, $maxHeight)
{
    $thumbnailPath = $thumbnailsDir . $filename;

    // Get image info
    $imageInfo = @getimagesize($sourcePath);
    if (!$imageInfo) {
        // Fallback: copy original
        copy($sourcePath, $thumbnailPath);
        return false;
    }

    list($width, $height, $type) = $imageInfo;

    // Create image resource from source
    try {
        switch ($type) {
            case IMAGETYPE_JPEG:
                $sourceImage = @imagecreatefromjpeg($sourcePath);
                break;
            case IMAGETYPE_PNG:
                $sourceImage = @imagecreatefrompng($sourcePath);
                break;
            case IMAGETYPE_GIF:
                $sourceImage = @imagecreatefromgif($sourcePath);
                break;
            case IMAGETYPE_WEBP:
                $sourceImage = @imagecreatefromwebp($sourcePath);
                break;
            default:
                copy($sourcePath, $thumbnailPath);
                return false;
        }

        if ($sourceImage === false) {
            // Fallback: copy original
            copy($sourcePath, $thumbnailPath);
            return false;
        }
    } catch (\Exception $e) {
        // Fallback: copy original
        copy($sourcePath, $thumbnailPath);
        return false;
    }

    // Calculate new dimensions (maintain aspect ratio)
    $ratio = min($maxWidth / $width, $maxHeight / $height);
    $newWidth = round($width * $ratio);
    $newHeight = round($height * $ratio);

    // Create thumbnail
    $thumbnail = imagecreatetruecolor($newWidth, $newHeight);

    // Preserve transparency for PNG and GIF
    if ($type == IMAGETYPE_PNG || $type == IMAGETYPE_GIF) {
        imagealphablending($thumbnail, false);
        imagesavealpha($thumbnail, true);
        $transparent = imagecolorallocatealpha($thumbnail, 255, 255, 255, 127);
        imagefilledrectangle($thumbnail, 0, 0, $newWidth, $newHeight, $transparent);
    }

    // Resize
    imagecopyresampled($thumbnail, $sourceImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

    // Save thumbnail
    switch ($type) {
        case IMAGETYPE_JPEG:
            imagejpeg($thumbnail, $thumbnailPath, 85);
            break;
        case IMAGETYPE_PNG:
            imagepng($thumbnail, $thumbnailPath, 8);
            break;
        case IMAGETYPE_GIF:
            imagegif($thumbnail, $thumbnailPath);
            break;
        case IMAGETYPE_WEBP:
            imagewebp($thumbnail, $thumbnailPath, 85);
            break;
    }

    // Free memory
    imagedestroy($sourceImage);
    imagedestroy($thumbnail);

    return true;
}
