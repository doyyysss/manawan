<?php
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = to_int_id($_GET['id'] ?? null);

function map_placement(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'studentId' => (int) $row['student_id'],
        'companyId' => (int) $row['company_id'],
        'position' => $row['position'],
        'date' => $row['application_date'],
        'approval' => $row['approval'],
        'status' => $row['status'],
        'updatedAt' => format_timestamp($row['updated_at'] ?? null),
    ];
}

if ($method === 'GET') {
    $rows = db()->query('SELECT * FROM placements ORDER BY updated_at DESC')->fetchAll();
    send_json(['success' => true, 'data' => array_map('map_placement', $rows)]);
}

if ($method === 'POST') {
    $body = read_json_body();

    $stmt = db()->prepare(
        'INSERT INTO placements (student_id, company_id, position, application_date, approval, status)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        (int) ($body['studentId'] ?? 0),
        (int) ($body['companyId'] ?? 0),
        trim($body['position'] ?? ''),
        trim($body['date'] ?? ''),
        trim($body['approval'] ?? 'Pending'),
        trim($body['status'] ?? 'Applied'),
    ]);

    $newId = (int) db()->lastInsertId();
    $row = db()->query("SELECT * FROM placements WHERE id = $newId")->fetch();
    send_json(['success' => true, 'data' => map_placement($row)], 201);
}

if ($method === 'PUT') {
    if (!$id) {
        send_json(['success' => false, 'message' => 'Placement ID is required.'], 400);
    }

    $body = read_json_body();
    $stmt = db()->prepare(
        'UPDATE placements
         SET student_id = ?, company_id = ?, position = ?, application_date = ?, approval = ?, status = ?
         WHERE id = ?'
    );
    $stmt->execute([
        (int) ($body['studentId'] ?? 0),
        (int) ($body['companyId'] ?? 0),
        trim($body['position'] ?? ''),
        trim($body['date'] ?? ''),
        trim($body['approval'] ?? 'Pending'),
        trim($body['status'] ?? 'Applied'),
        $id,
    ]);

    $fetch = db()->prepare('SELECT * FROM placements WHERE id = ?');
    $fetch->execute([$id]);
    $placement = $fetch->fetch();

    if (!$placement) {
        send_json(['success' => false, 'message' => 'Placement not found.'], 404);
    }

    send_json(['success' => true, 'data' => map_placement($placement)]);
}

if ($method === 'DELETE') {
    if (!$id) {
        send_json(['success' => false, 'message' => 'Placement ID is required.'], 400);
    }

    $stmt = db()->prepare('DELETE FROM placements WHERE id = ?');
    $stmt->execute([$id]);
    send_json(['success' => true]);
}

send_json(['success' => false, 'message' => 'Method not allowed'], 405);
