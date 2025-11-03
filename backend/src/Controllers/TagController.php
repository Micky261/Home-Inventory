<?php

namespace App\Controllers;

use App\Models\Tag;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class TagController
{
    private $tagModel;

    public function __construct($db)
    {
        $this->tagModel = new Tag($db);
    }

    public function index(Request $request, Response $response)
    {
        $tags = $this->tagModel->getAll();
        $response->getBody()->write(json_encode($tags));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function create(Request $request, Response $response)
    {
        $data = json_decode($request->getBody(), true);

        if (!isset($data['name']) || empty($data['name'])) {
            $response->getBody()->write(json_encode(['error' => 'Name is required']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $color = $data['color'] ?? '#3498db';
        $id = $this->tagModel->create($data['name'], $color);

        if ($id) {
            $tag = $this->tagModel->getById($id);
            $response->getBody()->write(json_encode($tag));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['error' => 'Failed to create tag']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }

    public function update(Request $request, Response $response, $args)
    {
        $data = json_decode($request->getBody(), true);

        if (!isset($data['name']) || empty($data['name'])) {
            $response->getBody()->write(json_encode(['error' => 'Name is required']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $color = $data['color'] ?? '#3498db';
        $result = $this->tagModel->update($args['id'], $data['name'], $color);

        if ($result) {
            $tag = $this->tagModel->getById($args['id']);
            $response->getBody()->write(json_encode($tag));
            return $response->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['error' => 'Failed to update tag']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }

    public function delete(Request $request, Response $response, $args)
    {
        $result = $this->tagModel->delete($args['id']);

        if ($result) {
            $response->getBody()->write(json_encode(['message' => 'Tag deleted']));
            return $response->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['error' => 'Tag not found']));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }
}
