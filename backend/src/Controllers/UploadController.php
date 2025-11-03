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

    private function generateUniqueFilename($originalFilename)
    {
        $extension = pathinfo($originalFilename, PATHINFO_EXTENSION);
        return uniqid() . '_' . time() . '.' . $extension;
    }
}
