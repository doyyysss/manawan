<?php
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = to_int_id($_GET['id'] ?? null);

function map_evaluation(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'studentId' => (int) $row['student_id'],
        'supervisor' => $row['supervisor_name'],
        'rating' => (string) $row['rating'],
        'grade' => $row['final_grade'],
        'status' => $row['report_status'],
        'comments' => $row['evaluation_comments'],
        'report' => $row['final_report'],
        'updatedAt' => format_timestamp($row['updated_at'] ?? null),
    ];
}

if ($method === 'GET') {
    $rows = db()->query('SELECT * FROM evaluations ORDER BY updated_at DESC')->fetchAll();
    send_json(['success' => true, 'data' => array_map('map_evaluation', $rows)]);
}

if ($method === 'POST') {
    $body = read_json_body();

    $stmt = db()->prepare(
        'INSERT INTO evaluations (student_id, supervisor_name, rating, final_grade, report_status, evaluation_comments, final_report)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        (int) ($body['studentId'] ?? 0),
        trim($body['supervisor'] ?? ''),
        (float) ($body['rating'] ?? 0),
        trim($body['grade'] ?? ''),
        trim($body['status'] ?? 'Draft'),
        trim($body['comments'] ?? ''),
        trim($body['report'] ?? ''),
    ]);

    $newId = (int) db()->lastInsertId();
    $row = db()->query("SELECT * FROM evaluations WHERE id = $newId")->fetch();
    send_json(['success' => true, 'data' => map_evaluation($row)], 201);
}

if ($method === 'PUT') {
    if (!$id) {
        send_json(['success' => false, 'message' => 'Evaluation ID is required.'], 400);
    }

    $body = read_json_body();
    $stmt = db()->prepare(
        'UPDATE evaluations
         SET student_id = ?, supervisor_name = ?, rating = ?, final_grade = ?, report_status = ?, evaluation_comments = ?, final_report = ?
         WHERE id = ?'
    );
    $stmt->execute([
        (int) ($body['studentId'] ?? 0),
        trim($body['supervisor'] ?? ''),
        (float) ($body['rating'] ?? 0),
        trim($body['grade'] ?? ''),
        trim($body['status'] ?? 'Draft'),
        trim($body['comments'] ?? ''),
        trim($body['report'] ?? ''),
        $id,
    ]);

    $fetch = db()->prepare('SELECT * FROM evaluations WHERE id = ?');
    $fetch->execute([$id]);
    $evaluation = $fetch->fetch();

    if (!$evaluation) {
        send_json(['success' => false, 'message' => 'Evaluation not found.'], 404);
    }

    send_json(['success' => true, 'data' => map_evaluation($evaluation)]);
}

if ($method === 'DELETE') {
    if (!$id) {
        send_json(['success' => false, 'message' => 'Evaluation ID is required.'], 400);
    }

    $stmt = db()->prepare('DELETE FROM evaluations WHERE id = ?');
    $stmt->execute([$id]);
    send_json(['success' => true]);
}

send_json(['success' => false, 'message' => 'Method not allowed'], 405);
