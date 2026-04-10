<?php
namespace Modules\Auth;

use Config\Database;
use Helpers\Response;
use Firebase\JWT\JWT;

class AuthController {

    public function register(): void {
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate input
        $name  = trim($data['name']  ?? '');
        $email = trim($data['email'] ?? '');
        $pass  = $data['password']   ?? '';
        $role  = in_array($data['role'] ?? '', ['user','recruiter']) ? $data['role'] : 'user';

        if (!$name || !$email || !$pass) {
            Response::error('Name, email, and password are required');
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('Invalid email address');
        }

        if (strlen($pass) < 6) {
            Response::error('Password must be at least 6 characters');
        }

        $db = Database::connect();

        // Check duplicate email
        $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            Response::error('Email already registered', 409);
        }

        // Hash password and insert
        $hash = password_hash($pass, PASSWORD_BCRYPT);
        $stmt = $db->prepare(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([$name, $email, $hash, $role]);

        Response::success(['id' => $db->lastInsertId()], 'Registered successfully');
    }

    public function login(): void {
        $data = json_decode(file_get_contents('php://input'), true);

        $email = trim($data['email']    ?? '');
        $pass  = $data['password']      ?? '';

        if (!$email || !$pass) {
            Response::error('Email and password are required');
        }

        $db   = Database::connect();
        $stmt = $db->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($pass, $user['password'])) {
            Response::error('Invalid credentials', 401);
        }

        // Issue JWT (expires in 7 days)
        $payload = [
            'id'   => $user['id'],
            'role' => $user['role'],
            'exp'  => time() + 604800,
        ];
        $token = JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');

        Response::success([
            'token' => $token,
            'user'  => [
                'id'   => $user['id'],
                'name' => $user['name'],
                'role' => $user['role'],
            ]
        ], 'Login successful');
    }
}