<?php
namespace Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Helpers\Response;

class AuthMiddleware {
    public static function handle(): array {
        $headers = getallheaders();
        $auth    = $headers['Authorization'] ?? '';

        if (substr($auth, 0, 7) !== 'Bearer ') {
            Response::error('Unauthorized', 401);
        }

        $token = substr($auth, 7);

        try {
            $decoded = JWT::decode($token, new Key($_ENV['JWT_SECRET'], 'HS256'));
            return (array) $decoded;  // returns ['id' => ..., 'role' => ...]
        } catch (\Exception $e) {
            Response::error('Invalid or expired token', 401);
        }
    }

    // Call this in recruiter-only routes
    public static function requireRole(string $role): array {
        $user = self::handle();
        if ($user['role'] !== $role) {
            Response::error('Forbidden — insufficient role', 403);
        }
        return $user;
    }
}