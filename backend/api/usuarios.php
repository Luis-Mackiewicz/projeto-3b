<?php

declare(strict_types=1);

require_once __DIR__ . '/../config.php';

configurar_cors();
iniciar_sessao();

$usuarioLogado = exigir_admin();

$pdo = conectar_bd();
$metodo = $_SERVER['REQUEST_METHOD'];

function responder_usuario(array $usuario): array {
    return [
        'id'        => (int)$usuario['id'],
        'nome'      => $usuario['nome'],
        'email'     => $usuario['email'],
        'perfil'    => $usuario['perfil'],
        'ativo'     => (bool)$usuario['ativo'],
        'criado_em' => $usuario['criado_em'],
    ];
}

try {
    switch ($metodo) {
        case 'GET':
            $stmt = $pdo->query(
                'SELECT id, nome, email, perfil, ativo, criado_em
                 FROM usuarios
                 ORDER BY criado_em ASC, id ASC'
            );
            $usuarios = array_map('responder_usuario', $stmt->fetchAll());
            responder_json(['success' => true, 'data' => $usuarios]);

        case 'POST':
            $dados = ler_corpo_json();

            if (trim((string)($dados['nome'] ?? '')) === '') {
                responder_json(['success' => false, 'message' => 'Informe o nome.'], 422);
            }

            $email = strtolower(trim((string)($dados['email'] ?? '')));

            if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
                responder_json(['success' => false, 'message' => 'Informe um e-mail válido.'], 422);
            }

            if (mb_strlen((string)($dados['senha'] ?? '')) < 6) {
                responder_json(['success' => false, 'message' => 'A senha deve ter no mínimo 6 caracteres.'], 422);
            }

            $perfil = (string)($dados['perfil'] ?? 'usuario');

            if (!in_array($perfil, ['admin', 'usuario'], true)) {
                responder_json(['success' => false, 'message' => 'Perfil inválido.'], 422);
            }

            $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE email = :email');
            $stmt->execute([':email' => $email]);

            if ($stmt->fetch() !== false) {
                responder_json([
                    'success' => false,
                    'message' => 'Já existe um usuário com este e-mail.',
                ], 409);
            }

            $stmt = $pdo->prepare(
                'INSERT INTO usuarios (nome, email, senha_hash, perfil)
                 VALUES (:nome, :email, :senha_hash, :perfil)'
            );
            $stmt->execute([
                ':nome'       => trim($dados['nome']),
                ':email'      => $email,
                ':senha_hash' => password_hash((string)$dados['senha'], PASSWORD_DEFAULT),
                ':perfil'     => $perfil,
            ]);

            responder_json([
                'success' => true,
                'message' => 'Usuário cadastrado com sucesso.',
                'id'      => (int)$pdo->lastInsertId(),
            ], 201);

        case 'PUT':
            $id = (int)($_GET['id'] ?? 0);

            if ($id <= 0) {
                responder_json(['success' => false, 'message' => 'Informe o id do usuário.'], 400);
            }

            $dados = ler_corpo_json();

            $stmt = $pdo->prepare(
                'SELECT id, perfil, ativo FROM usuarios WHERE id = :id'
            );
            $stmt->execute([':id' => $id]);
            $alvo = $stmt->fetch();

            if ($alvo === false) {
                responder_json(['success' => false, 'message' => 'Usuário não encontrado.'], 404);
            }

            if ($id === $usuarioLogado['id']) {
                responder_json([
                    'success' => false,
                    'message' => 'Você não pode alterar as próprias permissões.',
                ], 422);
            }

            $novoPerfil = $perfilAlvo = (string)$alvo['perfil'];
            $novoAtivo = (int)$alvo['ativo'];

            if (array_key_exists('perfil', $dados)) {
                $novoPerfil = (string)$dados['perfil'];

                if (!in_array($novoPerfil, ['admin', 'usuario'], true)) {
                    responder_json(['success' => false, 'message' => 'Perfil inválido.'], 422);
                }
            }

            if (array_key_exists('ativo', $dados)) {
                $novoAtivo = (int)(bool)$dados['ativo'];
            }

            if ($novoAtivo === 0 || ($perfilAlvo === 'admin' && $novoPerfil === 'usuario')) {
                $stmt = $pdo->query(
                    "SELECT COUNT(*) AS total FROM usuarios
                     WHERE ativo = TRUE AND perfil = 'admin' AND id <> {$id}"
                );
                if ((int)$stmt->fetch()['total'] === 0) {
                    responder_json([
                        'success' => false,
                        'message' => 'Não é possível remover nem desativar o último administrador ativo.',
                    ], 422);
                }
            }

            $stmt = $pdo->prepare(
                'UPDATE usuarios SET perfil = :perfil, ativo = :ativo WHERE id = :id'
            );
            $stmt->execute([
                ':perfil' => $novoPerfil,
                ':ativo'  => $novoAtivo,
                ':id'     => $id,
            ]);

            $mensagem = $novoAtivo === 0
                ? 'Usuário desativado com sucesso.'
                : ($novoPerfil === 'admin'
                    ? 'Usuário promovido a administrador.'
                    : 'Ações aplicadas com sucesso.');

            responder_json(['success' => true, 'message' => $mensagem]);

        case 'DELETE':
            responder_json(['success' => false, 'message' => 'Use a desativação em vez de excluir usuários.'], 400);

        default:
            responder_json(['success' => false, 'message' => 'Método não permitido.'], 405);
    }
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        responder_json([
            'success' => false,
            'message' => 'Já existe um usuário com este e-mail.',
        ], 409);
    }

    responder_json([
        'success' => false,
        'message' => 'Erro interno no servidor.',
    ], 500);
}