<?php

declare(strict_types=1);

require_once __DIR__ . '/../config.php';

configurar_cors();

$pdo = conectar_bd();
$metodo = $_SERVER['REQUEST_METHOD'];

try {
    switch ($metodo) {
        case 'GET':
            $sql = 'SELECT id, nome, tipo, saldo, ativo, criado_em
                    FROM contas
                    WHERE ativo = TRUE
                    ORDER BY nome ASC';
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $contas = array_map(static function (array $conta): array {
                $conta['saldo'] = (float)$conta['saldo'];
                $conta['ativo'] = (bool)$conta['ativo'];
                return $conta;
            }, $stmt->fetchAll());
            responder_json(['success' => true, 'data' => $contas]);

        case 'POST':
            $dados = ler_corpo_json();

            if (trim((string)($dados['nome'] ?? '')) === '') {
                responder_json(['success' => false, 'message' => 'O nome da conta é obrigatório.'], 422);
            }

            $tipo = (string)($dados['tipo'] ?? 'corrente');

            if (!in_array($tipo, ['corrente', 'poupanca', 'credito'], true)) {
                responder_json(['success' => false, 'message' => 'O tipo deve ser "corrente", "poupanca" ou "credito".'], 422);
            }

            $sql = 'INSERT INTO contas (nome, tipo, saldo)
                    VALUES (:nome, :tipo, :saldo)';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':nome'  => trim($dados['nome']),
                ':tipo'  => $tipo,
                ':saldo' => (float)($dados['saldo'] ?? 0),
            ]);

            responder_json([
                'success' => true,
                'message' => 'Conta cadastrada com sucesso.',
                'id'      => (int)$pdo->lastInsertId(),
            ], 201);

        case 'PUT':
            $id = (int)($_GET['id'] ?? 0);

            if ($id <= 0) {
                responder_json(['success' => false, 'message' => 'Informe o id da conta.'], 400);
            }

            $dados = ler_corpo_json();

            $sql = 'SELECT id FROM contas WHERE id = :id AND ativo = TRUE';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':id' => $id]);

            if ($stmt->fetch() === false) {
                responder_json(['success' => false, 'message' => 'Conta não encontrada.'], 404);
            }

            $sql = 'UPDATE contas
                    SET nome = :nome, tipo = :tipo, saldo = :saldo
                    WHERE id = :id';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':nome'  => trim((string)($dados['nome'] ?? '')),
                ':tipo'  => (string)($dados['tipo'] ?? 'corrente'),
                ':saldo' => (float)($dados['saldo'] ?? 0),
                ':id'    => $id,
            ]);

            responder_json(['success' => true, 'message' => 'Conta atualizada com sucesso.']);

        case 'DELETE':
            $id = (int)($_GET['id'] ?? 0);

            if ($id <= 0) {
                responder_json(['success' => false, 'message' => 'Informe o id da conta.'], 400);
            }

            $sql = 'SELECT COUNT(*) AS total FROM transacoes WHERE conta_id = :id';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':id' => $id]);
            $uso = (int)$stmt->fetch()['total'];

            if ($uso > 0) {
                responder_json([
                    'success' => false,
                    'message' => 'Não é possível excluir esta conta porque existem transações vinculadas a ela.',
                ], 409);
            }

            $sql = 'DELETE FROM contas WHERE id = :id';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':id' => $id]);

            if ($stmt->rowCount() === 0) {
                responder_json(['success' => false, 'message' => 'Conta não encontrada.'], 404);
            }

            responder_json(['success' => true, 'message' => 'Conta excluída com sucesso.']);

        default:
            responder_json(['success' => false, 'message' => 'Método não permitido.'], 405);
    }
} catch (PDOException $e) {
    responder_json([
        'success' => false,
        'message' => 'Erro interno no servidor.',
    ], 500);
}