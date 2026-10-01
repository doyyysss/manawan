<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

function send_json(mixed $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '[]', true);
    return is_array($data) ? $data : [];
}

function require_method(string $method): void
{
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        send_json(['success' => false, 'message' => 'Method not allowed'], 405);
    }
}

function to_int_id(?string $value): ?int
{
    if ($value === null || $value === '') {
        return null;
    }

    $id = filter_var($value, FILTER_VALIDATE_INT);
    return $id !== false ? $id : null;
}

function format_timestamp(?string $value): string
{
    if (!$value) {
        return date('c');
    }

    return date('c', strtotime($value));
}
