<?php
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = to_int_id($_GET['id'] ?? null);

function map_progress(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'studentId' => (int) $row['student_id'],
        'week' => $row['week_label'],
        'attendance' => (string) $row['attendance'],
        'supervisor' => $row['supervisor_status'],
        'report' => $row['weekly_report'],
        'updatedAt' => format_timestamp($row['updated_at'] ?? null),
    ];
}

if ($method === 'GET') {
    $rows = db()->query('SELECT * FROM progress_logs ORDER BY updated_at DESC')->fetchAll();
    send_json(['success' => true, 'data' => array_map('map_progress', $rows)]);
}

if ($method === 'POST') {
    $body = read_json_body();

    $stmt = db()->prepare(
        'INSERT INTO progress_logs (student_id, week_label, attendance, supervisor_status, weekly_report)
         VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        (int) ($body['studentId'] ?? 0),
        trim($body['week'] ?? ''),
        (int) ($body['attendance'] ?? 0),
        trim($body['supervisor'] ?? 'On Track'),
        trim($body['report'] ?? ''),
    ]);

    $newId = (int) db()->lastInsertId();
    $row = db()->query("SELECT * FROM progress_logs WHERE id = $newId")->fetch();
    send_json(['success' => true, 'data' => map_progress($row)], 201);
}

if ($method === 'PUT') {
    if (!$id) {
        send_json(['success' => false, 'message' => 'Progress ID is required.'], 400);
    }

    $body = read_json_body();
    $stmt = db()->prepare(
        'UPDATE progress_logs
         SET student_id = ?, week_label = ?, attendance = ?, supervisor_status = ?, weekly_report = ?
         WHERE id = ?'
    );
    $stmt->execute([
        (int) ($body['studentId'] ?? 0),
        trim($body['week'] ?? ''),
        (int) ($body['attendance'] ?? 0),
        trim($body['supervisor'] ?? 'On Track'),
        trim($body['report'] ?? ''),
        $id,
    ]);

    $fetch = db()->prepare('SELECT * FROM progress_logs WHERE id = ?');
    $fetch->execute([$id]);
    $progress = $fetch->fetch();

    if (!$progress) {
        send_json(['success' => false, 'message' => 'Progress log not found.'], 404);
    }

    send_json(['success' => true, 'data' => map_progress($progress)]);
}

if ($method === 'DELETE') {
    if (!$id) {
        send_json(['success' => false, 'message' => 'Progress ID is required.'], 400);
    }

    $stmt = db()->prepare('DELETE FROM progress_logs WHERE id = ?');
    $stmt->execute([$id]);
    send_json(['success' => true]);
}

send_json(['success' => false, 'message' => 'Method not allowed'], 405);
