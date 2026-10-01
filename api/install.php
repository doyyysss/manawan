<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

try {
    $pdo = db_connect();

    $schema = file_get_contents(dirname(__DIR__) . '/database/schema.sql');
    if ($schema === false) {
        throw new RuntimeException('Could not read database/schema.sql');
    }

    $statements = array_filter(array_map('trim', explode(';', $schema)));

    foreach ($statements as $sql) {
        if ($sql !== '') {
            $pdo->exec($sql);
        }
    }

    $hash = password_hash('admin123', PASSWORD_DEFAULT);
    $check = $pdo->prepare('SELECT id FROM internship_db.admins WHERE username = ?');
    $check->execute(['admin']);

    if ($check->fetch()) {
        $update = $pdo->prepare('UPDATE internship_db.admins SET password = ? WHERE username = ?');
        $update->execute([$hash, 'admin']);
    } else {
        $insert = $pdo->prepare('INSERT INTO internship_db.admins (username, password) VALUES (?, ?)');
        $insert->execute(['admin', $hash]);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Database installed successfully. Open http://localhost:8080/internship/ and login with admin / admin123',
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Install failed: ' . $e->getMessage(),
    ]);
}
