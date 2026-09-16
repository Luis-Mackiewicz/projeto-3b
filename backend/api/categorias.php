<?php

declare(strict_types=1);

require_once __DIR__ . '/../config.php';

configurar_cors();

$usuario = exigir_login();

const TABELA = 'categorias';

$pdo = conectar_bd();
$metodo = $_SERVER['REQUEST_METHOD'];

try {
    switch ($metodo) {
        case 'GET':
            $sql = 'SELECT id, nome, descricao, tipo, ativo, criado_em
                    FROM categorias
                    WHERE ativo = TRUE AND usuario_id = :usuario
                    ORDER BY nome ASC';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':usuario' => $usuario['id']]);
            $categorias = array_map(static function (array $categoria): array {
                $categoria['ativo'] = (bool)$categoria['ativo'];
                return $categoria;
            }, $stmt->fetchAll());
            responder_json(['success' => true, 'data' => $categorias]);

        case 'POST':
            $dados = ler_corpo_json();

            if (trim((string)($dados['nome'] ?? '')) === '') {
                responder_json(['success' => false, 'message' => 'O nome da categoria é obrigatório.'], 422);
            }

            $tipo = (string)($dados['tipo'] ?? 'despesa');

            if (!in_array($tipo, ['receita', 'despesa'], true)) {
                responder_json(['success' => false, 'message' => 'O tipo deve ser "receita" ou "despesa".'], 422);
            }

            $sql = 'INSERT INTO categorias (usuario_id, nome, descricao, tipo)
                    VALUES (:usuario, :nome, :descricao, :tipo)';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':usuario'   => $usuario['id'],
                ':nome'      => trim($dados['nome']),
                ':descricao' => trim((string)($dados['descricao'] ?? '')),
                ':tipo'      => $tipo,
            ]);

            responder_json([
                'success' => true,
                'message' => 'Categoria cadastrada com sucesso.',
                'id'      => (int)$pdo->lastInsertId(),
            ], 201);

        case 'PUT':
            $id = (int)($_GET['id'] ?? 0);

            if ($id <= 0) {
                responder_json(['success' => false, 'message' => 'Informe o id da categoria.'], 400);
            }

            $dados = ler_corpo_json();

            $sql = 'SELECT id FROM categorias WHERE id = :id AND ativo = TRUE AND usuario_id = :usuario';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':id' => $id, ':usuario' => $usuario['id']]);

            if ($stmt->fetch() === false) {
                responder_json(['success' => false, 'message' => 'Categoria não encontrada.'], 404);
            }

            $sql = 'UPDATE categorias
                    SET nome = :nome, descricao = :descricao, tipo = :tipo
                    WHERE id = :id AND usuario_id = :usuario';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':nome'      => trim((string)($dados['nome'] ?? '')),
                ':descricao' => trim((string)($dados['descricao'] ?? '')),
                ':tipo'      => (string)($dados['tipo'] ?? 'despesa'),
                ':id'        => $id,
                ':usuario'   => $usuario['id'],
            ]);

            responder_json(['success' => true, 'message' => 'Categoria atualizada com sucesso.']);

        case 'DELETE':
            $id = (int)($_GET['id'] ?? 0);

            if ($id <= 0) {
                responder_json(['success' => false, 'message' => 'Informe o id da categoria.'], 400);
            }

            $sql = 'SELECT COUNT(*) AS total FROM transacoes WHERE categoria_id = :id AND usuario_id = :usuario';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':id' => $id, ':usuario' => $usuario['id']]);
            $uso = (int)$stmt->fetch()['total'];

            if ($uso > 0) {
                responder_json([
                    'success' => false,
                    'message' => 'Não é possível excluir esta categoria porque existem transações vinculadas a ela.',
                ], 409);
            }

            $sql = 'DELETE FROM categorias WHERE id = :id AND usuario_id = :usuario';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':id' => $id, ':usuario' => $usuario['id']]);

            if ($stmt->rowCount() === 0) {
                responder_json(['success' => false, 'message' => 'Categoria não encontrada.'], 404);
            }

            responder_json(['success' => true, 'message' => 'Categoria excluída com sucesso.']);

        default:
            responder_json(['success' => false, 'message' => 'Método não permitido.'], 405);
    }
} catch (PDOException $e) {
    $codigo = $e->getCode();

    if ($codigo === '23000') {
        responder_json([
            'success' => false,
            'message' => 'Não é possível concluir a operação: já existe uma categoria com este nome.',
        ], 409);
    }

    responder_json([
        'success' => false,
        'message' => 'Erro interno no servidor.',
    ], 500);
}