<?php
declare(strict_types=1);

// XAMPP MySQL settings.
// This PC: XAMPP MariaDB is on 3307 (MySQL 8 already uses 3306).
// Change DB_PORT to 3306 if your XAMPP MySQL uses the default port.
define('DB_HOST', '127.0.0.1');
define('DB_PORT', 3307);
define('DB_NAME', 'internship_db');
define('DB_USER', 'root');
define('DB_PASS', '');

function db_ports(): array
{
    return array_values(array_unique([DB_PORT, 3307, 3306]));
}

function db_connect(?string $database = null): PDO
{
    $errors = [];

    foreach (db_ports() as $port) {
        try {
            $dsn = 'mysql:host=' . DB_HOST . ';port=' . $port . ';charset=utf8mb4';
            if ($database !== null) {
                $dsn .= ';dbname=' . $database;
            }

            return new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $e) {
            $errors[] = 'port ' . $port . ': ' . $e->getMessage();
        }
    }

    throw new PDOException(
        'Could not connect to XAMPP MySQL. Start MySQL in XAMPP Control Panel. ' . implode(' | ', $errors)
    );
}

function db(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $pdo = db_connect(DB_NAME);
    }

    return $pdo;
}
