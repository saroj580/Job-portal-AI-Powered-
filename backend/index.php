<?php
use Modules\Applications\ApplicationController;
use Modules\Auth\AuthController;
use Modules\Jobs\JobController;
use Modules\Resume\ResumeController;

require_once __DIR__ . '/vendor/autoload.php';

// Load .env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// CORS headers (allow your React dev server)
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Parse route
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Strip leading /api/ prefix
$route = preg_replace('#^/api/#', '', $uri);

// ── Auth routes ───────────────────────────────────────────
if ($route === 'register' && $method === 'POST') {
    (new AuthController())->register();

} elseif ($route === 'login' && $method === 'POST') {
    (new AuthController())->login();

// ── Job routes ────────────────────────────────────────────
} elseif ($route === 'jobs' && $method === 'GET') {
    (new JobController())->index();

} elseif ($route === 'jobs' && $method === 'POST') {
    (new JobController())->store();

} elseif (preg_match('#^jobs/(\d+)$#', $route, $m) && $method === 'PUT') {
    (new JobController())->update((int)$m[1]);

} elseif (preg_match('#^jobs/(\d+)$#', $route, $m) && $method === 'DELETE') {
    (new JobController())->destroy((int)$m[1]);

} elseif (preg_match('#^jobs/(\d+)$#', $route, $m) && $method === 'GET') {
    (new JobController())->show((int)$m[1]);

// ── Application routes ────────────────────────────────────
} elseif ($route === 'apply' && $method === 'POST') {
    (new ApplicationController())->apply();

} elseif ($route === 'applications' && $method === 'GET') {
    (new ApplicationController())->index();

} elseif (preg_match('#^applications/(\d+)/status$#', $route, $m) && $method === 'PUT') {
    (new ApplicationController())->updateStatus((int)$m[1]);

// ── Resume routes ─────────────────────────────────────────
} elseif ($route === 'upload-resume' && $method === 'POST') {
    (new ResumeController())->upload();

} elseif ($route === 'analyze-resume' && $method === 'POST') {
    (new ResumeController())->analyze();

} elseif ($route === 'my-analysis' && $method === 'GET') {
    (new ResumeController())->myAnalysis();

} else {
    http_response_code(404);
    echo json_encode(['error' => 'Route not found']);
}