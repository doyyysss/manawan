<?php
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = to_int_id($_GET['id'] ?? null);

function map_company(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'industry' => $row['industry'],
        'contact' => $row['contact_person'],
        'email' => $row['email'],
        'phone' => $row['phone'],
        'address' => $row['address'],
        'vacancy' => $row['vacancy'],
        'slots' => (string) $row['slots'],
        'updatedAt' => format_timestamp($row['updated_at'] ?? null),
    ];
}

if ($method === 'GET') {
    $rows = db()->query('SELECT * FROM companies ORDER BY updated_at DESC')->fetchAll();
    send_json(['success' => true, 'data' => array_map('map_company', $rows)]);
}

if ($method === 'POST') {
    $body = read_json_body();

    $stmt = db()->prepare(
        'INSERT INTO companies (name, industry, contact_person, email, phone, address, vacancy, slots)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        trim($body['name'] ?? ''),
        trim($body['industry'] ?? ''),
        trim($body['contact'] ?? ''),
        trim($body['email'] ?? ''),
        trim($body['phone'] ?? ''),
        trim($body['address'] ?? ''),
        trim($body['vacancy'] ?? ''),
        (int) ($body['slots'] ?? 1),
    ]);

    $newId = (int) db()->lastInsertId();
    $row = db()->query("SELECT * FROM companies WHERE id = $newId")->fetch();
    send_json(['success' => true, 'data' => map_company($row)], 201);
}

if ($method === 'PUT') {
    if (!$id) {
        send_json(['success' => false, 'message' => 'Company ID is required.'], 400);
    }

    $body = read_json_body();
    $stmt = db()->prepare(
        'UPDATE companies
         SET name = ?, industry = ?, contact_person = ?, email = ?, phone = ?, address = ?, vacancy = ?, slots = ?
         WHERE id = ?'
    );
    $stmt->execute([
        trim($body['name'] ?? ''),
        trim($body['industry'] ?? ''),
        trim($body['contact'] ?? ''),
        trim($body['email'] ?? ''),
        trim($body['phone'] ?? ''),
        trim($body['address'] ?? ''),
        trim($body['vacancy'] ?? ''),
        (int) ($body['slots'] ?? 1),
        $id,
    ]);

    $fetch = db()->prepare('SELECT * FROM companies WHERE id = ?');
    $fetch->execute([$id]);
    $company = $fetch->fetch();

    if (!$company) {
        send_json(['success' => false, 'message' => 'Company not found.'], 404);
    }

    send_json(['success' => true, 'data' => map_company($company)]);
}

if ($method === 'DELETE') {
    if (!$id) {
        send_json(['success' => false, 'message' => 'Company ID is required.'], 400);
    }

    $stmt = db()->prepare('DELETE FROM companies WHERE id = ?');
    $stmt->execute([$id]);
    send_json(['success' => true]);
}

send_json(['success' => false, 'message' => 'Method not allowed'], 405);
