<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AuthController
{
    private $config;

    public function __construct($config)
    {
        $this->config = $config;
    }

    public function login(Request $request, Response $response)
    {
        $data = json_decode($request->getBody(), true);

        if (!isset($data['username']) || !isset($data['password'])) {
            $response->getBody()->write(json_encode(['error' => 'Username and password required']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        if ($data['username'] === $this->config['auth']['username'] &&
            $data['password'] === $this->config['auth']['password']) {
            $token = base64_encode($data['username'] . ':' . $data['password']);
            $response->getBody()->write(json_encode(['token' => $token]));
            return $response->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['error' => 'Invalid credentials']));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
}
