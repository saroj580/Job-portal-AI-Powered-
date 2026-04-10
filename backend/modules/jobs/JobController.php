<?php
namespace Modules\Jobs;

use Config\Database;
use Helpers\Response;
use Middleware\AuthMiddleware;

class JobController {

    // GET /api/jobs?search=react&location=remote
    public function index(): void {
        $db     = Database::connect();
        $search = trim($_GET['search']   ?? '');
        $loc    = trim($_GET['location'] ?? '');
        $skill  = trim($_GET['skill']    ?? '');

        $sql    = 'SELECT j.*, u.name AS recruiter_name
                   FROM jobs j
                   JOIN users u ON j.posted_by = u.id
                   WHERE 1=1';
        $params = [];

        if ($search) {
            $sql     .= ' AND (j.title LIKE ? OR j.description LIKE ?)';
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        if ($loc) {
            $sql     .= ' AND j.location LIKE ?';
            $params[] = "%$loc%";
        }
        if ($skill) {
            $sql     .= ' AND j.skills_required LIKE ?';
            $params[] = "%$skill%";
        }

        $sql .= ' ORDER BY j.created_at DESC';

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        Response::success($stmt->fetchAll());
    }

    // GET /api/jobs/{id}
    public function show(int $id): void {
        $db   = Database::connect();
        $stmt = $db->prepare(
            'SELECT j.*, u.name AS recruiter_name
             FROM jobs j JOIN users u ON j.posted_by = u.id
             WHERE j.id = ?'
        );
        $stmt->execute([$id]);
        $job = $stmt->fetch();

        if (!$job) Response::error('Job not found', 404);
        Response::success($job);
    }

    // POST /api/jobs  (recruiter only)
    public function store(): void {
        $user = AuthMiddleware::requireRole('recruiter');
        $data = json_decode(file_get_contents('php://input'), true);

        $required = ['title','company','description','skills_required'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                Response::error("Field '$field' is required");
            }
        }

        $db   = Database::connect();
        $stmt = $db->prepare(
            'INSERT INTO jobs (title, company, description, skills_required, salary, location, posted_by)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['title'],
            $data['company'],
            $data['description'],
            $data['skills_required'],
            $data['salary']   ?? null,
            $data['location'] ?? null,
            $user['id'],
        ]);

        Response::success(['id' => $db->lastInsertId()], 'Job posted');
    }

    // PUT /api/jobs/{id}
    public function update(int $id): void {
        $user = AuthMiddleware::requireRole('recruiter');
        $data = json_decode(file_get_contents('php://input'), true);
        $db   = Database::connect();

        // Verify ownership
        $stmt = $db->prepare('SELECT posted_by FROM jobs WHERE id = ?');
        $stmt->execute([$id]);
        $job = $stmt->fetch();

        if (!$job)                          Response::error('Job not found', 404);
        if ($job['posted_by'] !== $user['id']) Response::error('Forbidden', 403);

        $stmt = $db->prepare(
            'UPDATE jobs
             SET title=?, company=?, description=?, skills_required=?, salary=?, location=?
             WHERE id=?'
        );
        $stmt->execute([
            $data['title']           ?? $job['title'],
            $data['company']         ?? $job['company'],
            $data['description']     ?? $job['description'],
            $data['skills_required'] ?? $job['skills_required'],
            $data['salary']          ?? $job['salary'],
            $data['location']        ?? $job['location'],
            $id,
        ]);

        Response::success(null, 'Job updated');
    }

    // DELETE /api/jobs/{id}
    public function destroy(int $id): void {
        $user = AuthMiddleware::requireRole('recruiter');
        $db   = Database::connect();

        $stmt = $db->prepare('SELECT posted_by FROM jobs WHERE id = ?');
        $stmt->execute([$id]);
        $job = $stmt->fetch();

        if (!$job)                          Response::error('Job not found', 404);
        if ($job['posted_by'] !== $user['id']) Response::error('Forbidden', 403);

        $db->prepare('DELETE FROM jobs WHERE id = ?')->execute([$id]);
        Response::success(null, 'Job deleted');
    }
}