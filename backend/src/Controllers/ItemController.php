<?php

namespace App\Controllers;

use App\Models\Item;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ItemController
{
    private $itemModel;
    private $config;

    public function __construct($db, $config)
    {
        $this->itemModel = new Item($db);
        $this->config = $config;
    }

    public function index(Request $request, Response $response)
    {
        $params = $request->getQueryParams();
        $search = $params['search'] ?? null;

        // Support both single value and array for filters
        $kategorien = isset($params['kategorien']) ? (is_array($params['kategorien']) ? $params['kategorien'] : [$params['kategorien']]) : null;
        $orte = isset($params['orte']) ? (is_array($params['orte']) ? $params['orte'] : [$params['orte']]) : null;
        $tags = isset($params['tags']) ? (is_array($params['tags']) ? $params['tags'] : [$params['tags']]) : null;

        // Backward compatibility with old single-value parameters
        if (!$kategorien && isset($params['kategorie'])) {
            $kategorien = [$params['kategorie']];
        }
        if (!$orte && isset($params['ort'])) {
            $orte = [$params['ort']];
        }
        if (!$tags && isset($params['tag'])) {
            $tags = [$params['tag']];
        }

        $tagMode = $params['tagMode'] ?? 'union';

        $items = $this->itemModel->getAll($search, $kategorien, $orte, $tags, $tagMode);
        $response->getBody()->write(json_encode($items));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function show(Request $request, Response $response, $args)
    {
        $item = $this->itemModel->getById($args['id']);

        if (!$item) {
            $response->getBody()->write(json_encode(['error' => 'Item not found']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode($item));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function create(Request $request, Response $response)
    {
        $data = json_decode($request->getBody(), true);

        if (!isset($data['name']) || empty($data['name'])) {
            $response->getBody()->write(json_encode(['error' => 'Name is required']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $id = $this->itemModel->create($data);

        if ($id) {
            $item = $this->itemModel->getById($id);
            $response->getBody()->write(json_encode($item));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['error' => 'Failed to create item']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }

    public function update(Request $request, Response $response, $args)
    {
        $data = json_decode($request->getBody(), true);

        if (!isset($data['name']) || empty($data['name'])) {
            $response->getBody()->write(json_encode(['error' => 'Name is required']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $result = $this->itemModel->update($args['id'], $data);

        if ($result) {
            $item = $this->itemModel->getById($args['id']);
            $response->getBody()->write(json_encode($item));
            return $response->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['error' => 'Failed to update item']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }

    public function delete(Request $request, Response $response, $args)
    {
        $item = $this->itemModel->getById($args['id']);

        if (!$item) {
            $response->getBody()->write(json_encode(['error' => 'Item not found']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        // Delete associated files
        if ($item['bild']) {
            $imagePath = $this->config['uploads']['images'] . $item['bild'];
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }

        if ($item['datenblatt_type'] === 'file' && $item['datenblatt_value']) {
            $filePath = $this->config['uploads']['datasheets'] . $item['datenblatt_value'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }

        $result = $this->itemModel->delete($args['id']);

        if ($result) {
            $response->getBody()->write(json_encode(['message' => 'Item deleted']));
            return $response->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['error' => 'Failed to delete item']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }

    public function autocomplete(Request $request, Response $response)
    {
        $params = $request->getQueryParams();
        $query = $params['q'] ?? '';

        if (strlen($query) < 1) {
            $response->getBody()->write(json_encode([]));
            return $response->withHeader('Content-Type', 'application/json');
        }

        $names = $this->itemModel->autocomplete($query);
        $response->getBody()->write(json_encode($names));
        return $response->withHeader('Content-Type', 'application/json');
    }

}
