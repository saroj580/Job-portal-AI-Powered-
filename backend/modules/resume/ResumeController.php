<?php
namespace Modules\Resume;

use Config\Database;
use Helpers\Response;
use Middleware\AuthMiddleware;
use Smalot\PdfParser\Parser;

class ResumeController {

    // POST /api/upload-resume  (multipart/form-data)
    public function upload(): void {
        $user = AuthMiddleware::handle();
        if ($user['role'] !== 'user') Response::error('Only job seekers can upload resumes', 403);

        if (empty($_FILES['resume'])) Response::error('No file uploaded');

        $file = $_FILES['resume'];

        // Validate: PDF only, max 5 MB
        $mime = mime_content_type($file['tmp_name']);
        if ($mime !== 'application/pdf') Response::error('Only PDF files are accepted');
        if ($file['size'] > 5 * 1024 * 1024) Response::error('File too large (max 5 MB)');

        // Save with a unique name to prevent collisions
        $filename  = 'resume_' . $user['id'] . '_' . time() . '.pdf';
        $uploadDir = __DIR__ . '/../../uploads/';

        if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

        if (!move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
            Response::error('Failed to save file', 500);
        }

        // Update user record with new resume path
        $db   = Database::connect();
        $path = 'uploads/' . $filename;
        $db->prepare('UPDATE users SET resume_path = ? WHERE id = ?')
           ->execute([$path, $user['id']]);

        Response::success(['resume_path' => $path], 'Resume uploaded');
    }

    // POST /api/analyze-resume
    public function analyze(): void {
        $user = AuthMiddleware::handle();
        $db   = Database::connect();

        // Get saved resume path
        $stmt = $db->prepare('SELECT resume_path FROM users WHERE id = ?');
        $stmt->execute([$user['id']]);
        $u = $stmt->fetch();

        if (empty($u['resume_path'])) Response::error('Upload a resume first');

        $pdfPath = __DIR__ . '/../../' . $u['resume_path'];
        if (!file_exists($pdfPath)) Response::error('Resume file not found', 404);

        // ── Step 1: Extract text from PDF ──────────────────────
        try {
            $parser   = new Parser();
            $pdf      = $parser->parseFile($pdfPath);
            $text     = $pdf->getText();
        } catch (\Exception $e) {
            Response::error('Could not parse PDF: ' . $e->getMessage(), 500);
        }

        if (strlen(trim($text)) < 50) {
            Response::error('PDF appears to be empty or image-only (not parseable)');
        }

        // ── Step 2: Send to Groq AI ────────────────────────────
        $analysisResult = $this->callGroqApi($text);

        if (!$analysisResult) {
            Response::error('AI analysis failed — try again later', 500);
        }

        // ── Step 3: Persist result ─────────────────────────────
        $stmt = $db->prepare(
            'INSERT INTO resume_analysis (user_id, score, missing_skills, suggestions)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               score=VALUES(score),
               missing_skills=VALUES(missing_skills),
               suggestions=VALUES(suggestions),
               created_at=CURRENT_TIMESTAMP'
        );
        // Note: For ON DUPLICATE KEY to work you'd add a UNIQUE KEY on user_id in the table.
        // Alternatively just INSERT — this keeps history. Adapt to your preference.
        $stmt->execute([
            $user['id'],
            $analysisResult['score'],
            json_encode($analysisResult['missing_skills']),
            json_encode($analysisResult['suggestions']),
        ]);

        Response::success($analysisResult, 'Analysis complete');
    }

    // GET /api/my-analysis  — fetch latest analysis for logged-in user
    public function myAnalysis(): void {
        $user = AuthMiddleware::handle();
        $db   = Database::connect();

        $stmt = $db->prepare(
            'SELECT * FROM resume_analysis WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
        );
        $stmt->execute([$user['id']]);
        $row = $stmt->fetch();

        if (!$row) Response::error('No analysis found', 404);

        $row['missing_skills'] = json_decode($row['missing_skills'], true);
        $row['suggestions']    = json_decode($row['suggestions'],    true);

        Response::success($row);
    }

    // ── Private: Groq API call ─────────────────────────────────
    private function callGroqApi(string $resumeText): ?array {
        $apiKey = $_ENV['GROQ_API_KEY'];

        $prompt = <<<PROMPT
You are an expert technical recruiter. Analyze the following resume text and respond ONLY with a valid JSON object (no markdown, no extra text).

The JSON must have exactly these keys:
- "score": integer 0-100 representing resume quality
- "missing_skills": array of strings — important skills absent from the resume
- "suggestions": array of strings — actionable improvement recommendations

Resume text:
---
$resumeText
---
PROMPT;

        $payload = json_encode([
            'model'      => 'llama3-8b-8192',
            'messages'   => [['role' => 'user', 'content' => $prompt]],
            'max_tokens' => 800,
            'temperature'=> 0.3,
        ]);

        $ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                "Authorization: Bearer $apiKey",
            ],
            CURLOPT_TIMEOUT        => 30,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || !$response) return null;

        $decoded = json_decode($response, true);
        $content = $decoded['choices'][0]['message']['content'] ?? '';

        // Strip any accidental markdown fences
        $content = preg_replace('/```json|```/', '', $content);
        $result  = json_decode(trim($content), true);

        if (!isset($result['score'], $result['missing_skills'], $result['suggestions'])) {
            return null;
        }

        return $result;
    }
}