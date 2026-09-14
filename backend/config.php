<?php

declare(strict_types=1);

/**
 * Conexão PDO segura com MariaDB
 */
function conectar_bd(): PDO {
    $host = getenv('DB_HOST') ?: '127.0.0.1';
    $porta = getenv('DB_PORT') ?: '3313';
    $banco = getenv('DB_NAME') ?: 'projeto_3b';
    $usuario = getenv('DB_USER') ?: 'root';
    $senha = getenv('DB_PASS') ?: 'senha_secreta';

    $dsn = "mysql:host={$host};port={$porta};dbname={$banco};charset=utf8mb4";

    try {
        $pdo = new PDO($dsn, $usuario, $senha, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode([
            'success' => false,
            'message' => 'Erro de conexão com o banco de dados.',
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

/**
 * Resposta JSON padronizada
 */
function responder_json(mixed $dados, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/**
 * Cabeçalhos comuns de CORS
 */
function configurar_cors(): void {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

/**
 * Lê o corpo JSON da requisição de forma segura
 */
function ler_corpo_json(): array {
    $conteudo = file_get_contents('php://input');

    if ($conteudo === false || $conteudo === '') {
        return [];
    }

    $dados = json_decode($conteudo, true);

    if (!is_array($dados)) {
        responder_json([
            'success' => false,
            'message' => 'JSON inválido enviado na requisição.',
        ], 400);
    }

    return $dados;
}