<?php
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

// Run once after importing schema.sql:
// http://localhost/internship/api/setup_admin.php

$hash = password_hash('admin123', PASSWORD_DEFAULT);

$check = db()->prepare('SELECT id FROM admins WHERE username = ?');
$check->execute(['admin']);

if ($check->fetch()) {
    $stmt = db()->prepare('UPDATE admins SET password = ? WHERE username = ?');
    $stmt->execute([$hash, 'admin']);
} else {
    $stmt = db()->prepare('INSERT INTO admins (username, password) VALUES (?, ?)');
    $stmt->execute(['admin', $hash]);
}

send_json([
    'success' => true,
    'message' => 'Admin password updated. Login with admin / admin123',
]);
