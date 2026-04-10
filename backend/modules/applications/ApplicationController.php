<?php
namespace Modules\Applications;

use Config\Database;
use Helpers\Response;
use Middleware\AuthMiddleware;

class ApplicationController {

    // POST /api/apply  — user applies using their saved resume
    public function apply(): void {
        $user = AuthMiddleware::handle();
        if ($user['role'] !== 'user') Response::error('Only job seekers can apply', 403);

        $data   = json_decode(file_get_contents('php://input'), true);
        $job_id = (int)($data['job_id'] ?? 0);

        if (!$job_id) Response::error('job_id is required');

        $db = Database::connect();

        // Check user has uploaded a resume
        $stmt = $db->prepare('SELECT resume_path FROM users WHERE id = ?');
        $stmt->execute([$user['id']]);
        $u = $stmt->fetch();
        if (empty($u['resume_path'])) Response::error('Upload a resume before applying');

        // Check not already applied
        $stmt = $db->prepare('SELECT id FROM applications WHERE user_id=? AND job_id=?');
        $stmt->execute([$user['id'], $job_id]);
        if ($stmt->fetch()) Response::error('Already applied to this job', 409);

        $stmt = $db->prepare(
            'INSERT INTO applications (user_id, job_id, resume_path) VALUES (?,?,?)'
        );
        $stmt->execute([$user['id'], $job_id, $u['resume_path']]);

        Response::success(['id' => $db->lastInsertId()], 'Application submitted');
    }

    // GET /api/applications
    // — user: sees their own applications
    // — recruiter: sees all applicants for their jobs
    public function index(): void {
        $user = AuthMiddleware::handle();
        $db   = Database::connect();

        if ($user['role'] === 'user') {
            $stmt = $db->prepare(
                'SELECT a.*, j.title, j.company, j.location
                 FROM applications a
                 JOIN jobs j ON a.job_id = j.id
                 WHERE a.user_id = ?
                 ORDER BY a.applied_at DESC'
            );
            $stmt->execute([$user['id']]);
        } else {
            // Recruiter: show applicants for jobs they posted
            $job_id = (int)($_GET['job_id'] ?? 0);
            if ($job_id) {
                $stmt = $db->prepare(
                    'SELECT a.*, u.name AS applicant_name, u.email AS applicant_email
                     FROM applications a
                     JOIN users u ON a.user_id = u.id
                     JOIN jobs j ON a.job_id = j.id
                     WHERE a.job_id = ? AND j.posted_by = ?
                     ORDER BY a.applied_at DESC'
                );
                $stmt->execute([$job_id, $user['id']]);
            } else {
                $stmt = $db->prepare(
                    'SELECT a.*, u.name AS applicant_name, j.title AS job_title
                     FROM applications a
                     JOIN users u ON a.user_id = u.id
                     JOIN jobs j ON a.job_id = j.id
                     WHERE j.posted_by = ?
                     ORDER BY a.applied_at DESC'
                );
                $stmt->execute([$user['id']]);
            }
        }

        Response::success($stmt->fetchAll());
    }

    // PUT /api/applications/{id}/status  (recruiter only)
    public function updateStatus(int $id): void {
        $user   = AuthMiddleware::requireRole('recruiter');
        $data   = json_decode(file_get_contents('php://input'), true);
        $status = $data['status'] ?? '';

        if (!in_array($status, ['accepted','rejected','pending'])) {
            Response::error('Status must be accepted, rejected, or pending');
        }

        $db   = Database::connect();
        
        // Verify that the recruiter owns the job for this application
        $stmt = $db->prepare(
            'SELECT a.id FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE a.id = ? AND j.posted_by = ?'
        );
        $stmt->execute([$id, $user['id']]);
        if (!$stmt->fetch()) {
            Response::error('Application not found or unauthorized', 403);
        }
        
        // Update the status
        $stmt = $db->prepare('UPDATE applications SET status = ? WHERE id = ?');
        $stmt->execute([$status, $id]);

        Response::success(null, 'Status updated');
    }
}