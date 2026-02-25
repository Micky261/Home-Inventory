<?php

namespace App\Controllers;

use App\Models\Location;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class LocationController
{
    private $locationModel;

    public function __construct($db)
    {
        $this->locationModel = new Location($db);
    }

    public function index(Request $request, Response $response)
    {
        $locations = $this->locationModel->getAllWithCounts();
        $response->getBody()->write(json_encode($locations));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function tree(Request $request, Response $response)
    {
        $tree = $this->locationModel->getTreeWithCounts();
        $response->getBody()->write(json_encode($tree));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function create(Request $request, Response $response)
    {
        $data = json_decode($request->getBody(), true);

        if (!isset($data['name']) || empty($data['name'])) {
            $response->getBody()->write(json_encode(['error' => 'Name is required']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $parentId = $data['parent_id'] ?? null;
        $id = $this->locationModel->create($data['name'], $parentId);

        if ($id) {
            $location = $this->locationModel->getById($id);
            $response->getBody()->write(json_encode($location));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['error' => 'Failed to create location']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }

    public function update(Request $request, Response $response, $args)
    {
        $data = json_decode($request->getBody(), true);

        if (!isset($data['name']) || empty($data['name'])) {
            $response->getBody()->write(json_encode(['error' => 'Name is required']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $parentId = $data['parent_id'] ?? null;
        $result = $this->locationModel->update($args['id'], $data['name'], $parentId);

        if ($result) {
            $location = $this->locationModel->getById($args['id']);
            $response->getBody()->write(json_encode($location));
            return $response->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['error' => 'Failed to update location']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }

    public function delete(Request $request, Response $response, $args)
    {
        $result = $this->locationModel->delete($args['id']);

        if ($result === false) {
            $response->getBody()->write(json_encode(['error' => 'Cannot delete location in use']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        if ($result) {
            $response->getBody()->write(json_encode(['message' => 'Location deleted']));
            return $response->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['error' => 'Location not found']));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }

    public function show(Request $request, Response $response, $args)
    {
        $location = $this->locationModel->getById($args['id']);

        if (!$location) {
            $response->getBody()->write(json_encode(['error' => 'Location not found']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        // Get items for this location
        $items = $this->locationModel->getItemsForLocation($args['id']);

        // Get child locations
        $children = $this->locationModel->getChildLocations($args['id']);

        $result = [
            'location' => $location,
            'items' => $items,
            'children' => $children
        ];

        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function updateDetails(Request $request, Response $response, $args)
    {
        $data = json_decode($request->getBody(), true);

        $description = $data['description'] ?? null;
        $inventoryStatus = $data['inventory_status'] ?? 'none';

        // Validate inventory_status
        $validStatuses = ['none', 'partial', 'complete'];
        if (!in_array($inventoryStatus, $validStatuses)) {
            $response->getBody()->write(json_encode(['error' => 'Invalid inventory status']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $result = $this->locationModel->updateDetails($args['id'], $description, $inventoryStatus);

        if ($result) {
            $location = $this->locationModel->getById($args['id']);
            $response->getBody()->write(json_encode($location));
            return $response->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['error' => 'Failed to update location details']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
}
