<?php
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = to_int_id($_GET['id'] ?? null);

function map_student(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'idNo' => $row['id_no'],
        'phone' => $row['phone'],
        'course' => $row['course'],
        'year' => $row['year_level'],
        'notes' => $row['notes'] ?? '',
        'updatedAt' => format_timestamp($row['updated_at'] ?? null),
    ];
}

if ($method === 'GET') {
    $rows = db()->query('SELECT * FROM students ORDER BY updated_at DESC')->fetchAll();
    send_json(['success' => true, 'data' => array_map('map_student', $rows)]);
}

if ($method === 'POST') {
    $body = read_json_body();

    $stmt = db()->prepare(
        'INSERT INTO students (name, id_no, phone, course, year_level, notes)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        trim($body['name'] ?? ''),
        trim($body['idNo'] ?? ''),
        trim($body['phone'] ?? ''),
        trim($body['course'] ?? ''),
        trim($body['year'] ?? ''),
        trim($body['notes'] ?? ''),
    ]);

    $newId = (int) db()->lastInsertId();
    $row = db()->query("SELECT * FROM students WHERE id = $newId")->fetch();
    send_json(['success' => true, 'data' => map_student($row)], 201);
}

if ($method === 'PUT') {
    if (!$id) {
        send_json(['success' => false, 'message' => 'Student ID is required.'], 400);
    }

    $body = read_json_body();
    $stmt = db()->prepare(
        'UPDATE students
         SET name = ?, id_no = ?, phone = ?, course = ?, year_level = ?, notes = ?
         WHERE id = ?'
    );
    $stmt->execute([
        trim($body['name'] ?? ''),
        trim($body['idNo'] ?? ''),
        trim($body['phone'] ?? ''),
        trim($body['course'] ?? ''),
        trim($body['year'] ?? ''),
        trim($body['notes'] ?? ''),
        $id,
    ]);

    $row = db()->prepare('SELECT * FROM students WHERE id = ?');
    $row->execute([$id]);
    $student = $row->fetch();

    if (!$student) {
        send_json(['success' => false, 'message' => 'Student not found.'], 404);
    }

    send_json(['success' => true, 'data' => map_student($student)]);
}

if ($method === 'DELETE') {
    if (!$id) {
        send_json(['success' => false, 'message' => 'Student ID is required.'], 400);
    }

    $stmt = db()->prepare('DELETE FROM students WHERE id = ?');
    $stmt->execute([$id]);
    send_json(['success' => true]);
}

send_json(['success' => false, 'message' => 'Method not allowed'], 405);
