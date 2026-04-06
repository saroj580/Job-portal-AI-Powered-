<?php
namespace Helpers;

class Response {
    public static function json(mixed $data, int $status = 200): void {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    public static function error(string $message, int $status = 400): void {
        self::json(['error' => $message], $status);
    }

    public static function success(mixed $data, string $message = 'OK'): void {
        self::json(['message' => $message, 'data' => $data]);
    }
}