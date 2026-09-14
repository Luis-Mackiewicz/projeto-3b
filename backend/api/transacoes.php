<?php

declare(strict_types=1);

require_once __DIR__ . '/../config.php';

configurar_cors();

$pdo = conectar_bd();
$metodo = $_SERVER['REQUEST_METHOD'];

function validar_transacao(PDO $pdo, array $dados): array {
    $erros = [];

    if (trim((string)($dados['descricao'] ?? '')) === '') {
        $erros[] = 'A descrição é obrigatória.';
    }

    if (empty($dados['conta_id']) || !is_numeric($dados['conta_id'])) {
        $erros[] = 'Informe a conta da transação.';
    }

    if (empty($dados['categoria_id']) || !is_numeric($dados['categoria_id'])) {
        $erros[] = 'Informe a categoria da transação.';
    }

    if (!isset($dados['valor']) || !is_numeric($dados['valor']) || (float)$dados['valor'] <= 0) {
        $erros[] = 'Informe um valor maior que zero.';
    }

    if (empty($dados['data_transacao'])) {
        $erros[] = 'Informe a data da transação.';
    }

    $tipo = (string)($dados['tipo'] ?? '');

    if (!in_array($tipo, ['receita', 'despesa'], true)) {
        $erros[] = 'O tipo deve ser "receita" ou "despesa".';
    }

    if ($erros) {
        return $erros;
    }

    $conta = (int)$dados['conta_id'];
    $categoria = (int)$dados['categoria_id'];

    $stmt = $pdo->prepare('SELECT id FROM contas WHERE id = :id AND ativo = TRUE');
    $stmt->execute([':id' => $conta]);

    if ($stmt->fetch() === false) {
        $erros[] = 'A conta informada não existe.';
    }

    $stmt = $pdo->prepare('SELECT id FROM categorias WHERE id = :id AND ativo = TRUE');
    $stmt->execute([':id' => $categoria]);

    if ($stmt->fetch() === false) {
        $erros[] = 'A categoria informada não existe.';
    }

    return $erros;
}

try {
    switch ($metodo) {
        case 'GET':
            $filtros = [];
            $parametros = [];

            $sql = 'SELECT t.id, t.descricao, t.valor, t.tipo, t.data_transacao,
                           t.conta_id, co.nome AS conta_nome,
                           t.categoria_id, c.nome AS categoria_nome
                    FROM transacoes t
                    INNER JOIN categorias c ON c.id = t.categoria_id
                    INNER JOIN contas co ON co.id = t.conta_id
                    WHERE t.ativo = TRUE';

            if (!empty($_GET['categoria_id']) && is_numeric($_GET['categoria_id'])) {
                $filtros[] = 't.categoria_id = :categoria';
                $parametros[':categoria'] = (int)$_GET['categoria_id'];
            }

            if (!empty($_GET['conta_id']) && is_numeric($_GET['conta_id'])) {
                $filtros[] = 't.conta_id = :conta';
                $parametros[':conta'] = (int)$_GET['conta_id'];
            }

            if (!empty($_GET['data_inicio'])) {
                $filtros[] = 't.data_transacao >= :data_inicio';
                $parametros[':data_inicio'] = $_GET['data_inicio'];
            }

            if (!empty($_GET['data_fim'])) {
                $filtros[] = 't.data_transacao <= :data_fim';
                $parametros[':data_fim'] = $_GET['data_fim'];
            }

            if ($filtros) {
                $sql .= ' AND ' . implode(' AND ', $filtros);
            }

            $sql .= ' ORDER BY t.data_transacao DESC, t.id DESC';

            $stmt = $pdo->prepare($sql);
            $stmt->execute($parametros);
            $transacoes = array_map(static function (array $t): array {
                $t['valor'] = (float)$t['valor'];
                return $t;
            }, $stmt->fetchAll());
            responder_json(['success' => true, 'data' => $transacoes]);

        case 'POST':
            $dados = ler_corpo_json();
            $erros = validar_transacao($pdo, $dados);

            if ($erros) {
                responder_json(['success' => false, 'message' => implode(' ', $erros)], 422);
            }

            $sql = 'INSERT INTO transacoes (conta_id, categoria_id, descricao, valor, tipo, data_transacao)
                    VALUES (:conta_id, :categoria_id, :descricao, :valor, :tipo, :data_transacao)';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':conta_id'      => (int)$dados['conta_id'],
                ':categoria_id'  => (int)$dados['categoria_id'],
                ':descricao'     => trim($dados['descricao']),
                ':valor'         => (float)$dados['valor'],
                ':tipo'          => $dados['tipo'],
                ':data_transacao'=> $dados['data_transacao'],
            ]);

            responder_json([
                'success' => true,
                'message' => 'Transação cadastrada com sucesso.',
                'id'      => (int)$pdo->lastInsertId(),
            ], 201);

        case 'PUT':
            $id = (int)($_GET['id'] ?? 0);

            if ($id <= 0) {
                responder_json(['success' => false, 'message' => 'Informe o id da transação.'], 400);
            }

            $dados = ler_corpo_json();
            $erros = validar_transacao($pdo, $dados);

            if ($erros) {
                responder_json(['success' => false, 'message' => implode(' ', $erros)], 422);
            }

            $sql = 'SELECT id FROM transacoes WHERE id = :id AND ativo = TRUE';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':id' => $id]);

            if ($stmt->fetch() === false) {
                responder_json(['success' => false, 'message' => 'Transação não encontrada.'], 404);
            }

            $sql = 'UPDATE transacoes
                    SET conta_id = :conta_id,
                        categoria_id = :categoria_id,
                        descricao = :descricao,
                        valor = :valor,
                        tipo = :tipo,
                        data_transacao = :data_transacao
                    WHERE id = :id';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':conta_id'      => (int)$dados['conta_id'],
                ':categoria_id'  => (int)$dados['categoria_id'],
                ':descricao'     => trim($dados['descricao']),
                ':valor'         => (float)$dados['valor'],
                ':tipo'          => $dados['tipo'],
                ':data_transacao'=> $dados['data_transacao'],
                ':id'            => $id,
            ]);

            responder_json(['success' => true, 'message' => 'Transação atualizada com sucesso.']);

        case 'DELETE':
            $id = (int)($_GET['id'] ?? 0);

            if ($id <= 0) {
                responder_json(['success' => false, 'message' => 'Informe o id da transação.'], 400);
            }

            $sql = 'DELETE FROM transacoes WHERE id = :id';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':id' => $id]);

            if ($stmt->rowCount() === 0) {
                responder_json(['success' => false, 'message' => 'Transação não encontrada.'], 404);
            }

            responder_json(['success' => true, 'message' => 'Transação excluída com sucesso.']);

        default:
            responder_json(['success' => false, 'message' => 'Método não permitido.'], 405);
    }
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        responder_json([
            'success' => false,
            'message' => 'Não foi possível concluir a operação: dependência entre registros do banco.',
        ], 409);
    }

    responder_json([
        'success' => false,
        'message' => 'Erro interno no servidor.',
    ], 500);
}