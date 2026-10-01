<?php
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

require_method('POST');

$body = read_json_body();
$username = trim($body['username'] ?? '');
$password = trim($body['password'] ?? '');

if ($username === '' || $password === '') {
    send_json(['success' => false, 'message' => 'Username and password are required.'], 400);
}

$stmt = db()->prepare('SELECT id, username, password FROM admins WHERE username = ? LIMIT 1');
$stmt->execute([$username]);
$admin = $stmt->fetch();

if (!$admin || !password_verify($password, $admin['password'])) {
    send_json(['success' => false, 'message' => 'Incorrect username or password.'], 401);
}

send_json([
    'success' => true,
    'user' => [
        'id' => (int) $admin['id'],
        'username' => $admin['username'],
        'role' => 'admin',
    ],
]);
