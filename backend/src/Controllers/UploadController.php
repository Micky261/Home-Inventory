<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class UploadController
{
    private $config;

    public function __construct($config)
    {
        $this->config = $config;
    }

    public function uploadImage(Request $request, Response $response)
    {
        $uploadedFiles = $request->getUploadedFiles();

        if (!isset($uploadedFiles['file'])) {
            $response->getBody()->write(json_encode(['error' => 'No file uploaded']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $uploadedFile = $uploadedFiles['file'];

        if ($uploadedFile->getError() !== UPLOAD_ERR_OK) {
            $response->getBody()->write(json_encode(['error' => 'Upload error']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $fileType = $uploadedFile->getClientMediaType();
        if (!in_array($fileType, $this->config['uploads']['allowed_image_types'])) {
            $response->getBody()->write(json_encode(['error' => 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        if ($uploadedFile->getSize() > $this->config['uploads']['max_size']) {
            $response->getBody()->write(json_encode(['error' => 'File too large. Max: 10MB']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $filename = $this->generateUniqueFilename($uploadedFile->getClientFilename());
        $targetPath = $this->config['uploads']['images'] . $filename;

        $uploadedFile->moveTo($targetPath);

        // Generate thumbnail
        $this->generateThumbnail($targetPath, $filename);

        $response->getBody()->write(json_encode(['filename' => $filename]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function uploadDatasheet(Request $request, Response $response)
    {
        $uploadedFiles = $request->getUploadedFiles();

        if (!isset($uploadedFiles['file'])) {
            $response->getBody()->write(json_encode(['error' => 'No file uploaded']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $uploadedFile = $uploadedFiles['file'];

        if ($uploadedFile->getError() !== UPLOAD_ERR_OK) {
            $response->getBody()->write(json_encode(['error' => 'Upload error']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $fileType = $uploadedFile->getClientMediaType();
        if (!in_array($fileType, $this->config['uploads']['allowed_datasheet_types'])) {
            $response->getBody()->write(json_encode(['error' => 'Invalid file type. Allowed: PDF, DOC, DOCX']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        if ($uploadedFile->getSize() > $this->config['uploads']['max_size']) {
            $response->getBody()->write(json_encode(['error' => 'File too large. Max: 10MB']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $filename = $this->generateUniqueFilename($uploadedFile->getClientFilename());
        $targetPath = $this->config['uploads']['datasheets'] . $filename;

        $uploadedFile->moveTo($targetPath);

        $response->getBody()->write(json_encode(['filename' => $filename]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function deleteFile(Request $request, Response $response)
    {
        $data = json_decode($request->getBody(), true);

        if (!isset($data['filename']) || !isset($data['type'])) {
            $response->getBody()->write(json_encode(['error' => 'Filename and type required']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $type = $data['type']; // 'image' or 'datasheet'
        $filename = basename($data['filename']); // Security: prevent path traversal

        if ($type === 'image') {
            $filePath = $this->config['uploads']['images'] . $filename;
        } elseif ($type === 'datasheet') {
            $filePath = $this->config['uploads']['datasheets'] . $filename;
        } else {
            $response->getBody()->write(json_encode(['error' => 'Invalid type']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        if (file_exists($filePath)) {
            unlink($filePath);
            $response->getBody()->write(json_encode(['message' => 'File deleted']));
            return $response->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['error' => 'File not found']));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }

    public function downloadDatasheetFromUrl(Request $request, Response $response)
    {
        $data = json_decode($request->getBody(), true);

        if (!isset($data['url']) || empty($data['url'])) {
            $response->getBody()->write(json_encode(['error' => 'No URL provided']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $url = $data['url'];

        // Validate URL
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            $response->getBody()->write(json_encode(['error' => 'Invalid URL']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        try {
            // Download file content
            $fileContent = @file_get_contents($url);

            if ($fileContent === false) {
                $response->getBody()->write(json_encode(['error' => 'Failed to download file from URL']));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            // Get file extension from URL
            $urlPath = parse_url($url, PHP_URL_PATH);
            $extension = pathinfo($urlPath, PATHINFO_EXTENSION);

            // Default to pdf if no extension found
            if (empty($extension)) {
                $extension = 'pdf';
            }

            // Validate extension
            if (!in_array(strtolower($extension), ['pdf', 'doc', 'docx'])) {
                $response->getBody()->write(json_encode(['error' => 'Invalid file type. Allowed: PDF, DOC, DOCX']));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            // Generate unique filename
            $filename = uniqid() . '_' . time() . '.' . $extension;
            $targetPath = $this->config['uploads']['datasheets'] . $filename;

            // Save file
            if (file_put_contents($targetPath, $fileContent) === false) {
                $response->getBody()->write(json_encode(['error' => 'Failed to save file']));
                return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
            }

            $response->getBody()->write(json_encode(['filename' => $filename]));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Error downloading file: ' . $e->getMessage()]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    private function generateThumbnail($sourcePath, $filename)
    {
        // Check if GD extension is available
        if (!extension_loaded('gd')) {
            // Fallback: copy original image as thumbnail
            $thumbnailPath = $this->config['uploads']['thumbnails'] . $filename;
            copy($sourcePath, $thumbnailPath);
            return true;
        }

        $thumbnailPath = $this->config['uploads']['thumbnails'] . $filename;
        $maxWidth = $this->config['uploads']['thumbnail_width'];
        $maxHeight = $this->config['uploads']['thumbnail_height'];

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

    private function generateUniqueFilename($originalFilename)
    {
        $extension = pathinfo($originalFilename, PATHINFO_EXTENSION);
        return uniqid() . '_' . time() . '.' . $extension;
    }
}
