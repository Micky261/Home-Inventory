<?php

namespace App\Controllers;

use App\Models\Category;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class CategoryController
{
    private $categoryModel;

    public function __construct($db)
    {
        $this->categoryModel = new Category($db);
    }

    public function index(Request $request, Response $response)
    {
        $categories = $this->categoryModel->getAll();
        $response->getBody()->write(json_encode($categories));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function indexWithCounts(Request $request, Response $response)
    {
        $categories = $this->categoryModel->getAllWithCounts();
        $response->getBody()->write(json_encode($categories));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function show(Request $request, Response $response, $args)
    {
        $category = $this->categoryModel->getById($args['id']);

        if (!$category) {
            $response->getBody()->write(json_encode(['error' => 'Category not found']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $items = $this->categoryModel->getItemsForCategory($args['id']);

        $result = [
            'category' => $category,
            'items' => $items
        ];

        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function create(Request $request, Response $response)
    {
        $data = json_decode($request->getBody(), true);

        if (!isset($data['name']) || empty($data['name'])) {
            $response->getBody()->write(json_encode(['error' => 'Name is required']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $id = $this->categoryModel->create($data['name']);

        if ($id) {
            $category = $this->categoryModel->getById($id);
            $response->getBody()->write(json_encode($category));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['error' => 'Failed to create category']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }

    public function update(Request $request, Response $response, $args)
    {
        $data = json_decode($request->getBody(), true);

        if (!isset($data['name']) || empty($data['name'])) {
            $response->getBody()->write(json_encode(['error' => 'Name is required']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $result = $this->categoryModel->update($args['id'], $data['name']);

        if ($result) {
            $category = $this->categoryModel->getById($args['id']);
            $response->getBody()->write(json_encode($category));
            return $response->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['error' => 'Failed to update category']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }

    public function delete(Request $request, Response $response, $args)
    {
        $result = $this->categoryModel->delete($args['id']);

        if ($result === false) {
            $response->getBody()->write(json_encode(['error' => 'Cannot delete category in use']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        if ($result) {
            $response->getBody()->write(json_encode(['message' => 'Category deleted']));
            return $response->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['error' => 'Category not found']));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }
}
