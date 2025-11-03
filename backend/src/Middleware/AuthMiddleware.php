<?php

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Psr7\Response as SlimResponse;

class AuthMiddleware
{
    private $config;

    public function __construct($config)
    {
        $this->config = $config;
    }

    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        // Skip auth for login endpoint
        $path = $request->getUri()->getPath();
        if ($path === '/api/auth/login') {
            return $handler->handle($request);
        }

        // Check for token in Authorization header
        $authHeader = $request->getHeaderLine('Authorization');

        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $response = new SlimResponse();
            $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
            return $response
                ->withStatus(401)
                ->withHeader('Content-Type', 'application/json');
        }

        $token = $matches[1];

        // Simple token validation (username:password base64 encoded)
        $decoded = base64_decode($token);
        $parts = explode(':', $decoded);

        if (count($parts) !== 2 ||
            $parts[0] !== $this->config['auth']['username'] ||
            $parts[1] !== $this->config['auth']['password']) {
            $response = new SlimResponse();
            $response->getBody()->write(json_encode(['error' => 'Invalid token']));
            return $response
                ->withStatus(401)
                ->withHeader('Content-Type', 'application/json');
        }

        return $handler->handle($request);
    }
}
