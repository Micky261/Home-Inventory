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
        $locations = $this->locationModel->getAll();
        $response->getBody()->write(json_encode($locations));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function create(Request $request, Response $response)
    {
        $data = json_decode($request->getBody(), true);

        if (!isset($data['name']) || empty($data['name'])) {
            $response->getBody()->write(json_encode(['error' => 'Name is required']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $id = $this->locationModel->create($data['name']);

        if ($id) {
            $location = $this->locationModel->getById($id);
            $response->getBody()->write(json_encode($location));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['error' => 'Failed to create location']));
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
}
