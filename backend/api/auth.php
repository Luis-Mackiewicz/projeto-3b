<?php

declare(strict_types=1);

require_once __DIR__ . '/../config.php';

configurar_cors();
iniciar_sessao();

$pdo = conectar_bd();
$rota = (string)($_GET['rota'] ?? '');
$metodo = $_SERVER['REQUEST_METHOD'];

function normalizar_email(string $email): string {
    return strtolower(trim($email));
}

function validar_cadastro(array $dados): array {
    $erros = [];

    if (trim((string)($dados['nome'] ?? '')) === '') {
        $erros['nome'] = 'Informe seu nome.';
    }

    $email = (string)($dados['email'] ?? '');

    if (filter_var(normalizar_email($email), FILTER_VALIDATE_EMAIL) === false) {
        $erros['email'] = 'Informe um e-mail válido.';
    }

    $senha = (string)($dados['senha'] ?? '');

    if (mb_strlen($senha) < 6) {
        $erros['senha'] = 'A senha deve ter no mínimo 6 caracteres.';
    }

    return $erros;
}

function registrar_sessao(array $usuario): void {
    session_regenerate_id(true);

    $_SESSION['usuario_id']     = (int)$usuario['id'];
    $_SESSION['usuario_nome']   = $usuario['nome'];
    $_SESSION['usuario_email']  = $usuario['email'];
    $_SESSION['usuario_perfil'] = $usuario['perfil'];
}

try {
    switch ($rota) {
        case 'registrar':
            if ($metodo !== 'POST') {
                responder_json(['success' => false, 'message' => 'Método não permitido.'], 405);
            }

            $dados = ler_corpo_json();
            $erros = validar_cadastro($dados);

            if ($erros) {
                responder_json([
                    'success' => false,
                    'message' => implode(' ', $erros),
                    'campos'  => $erros,
                ], 422);
            }

            $nome = trim($dados['nome']);
            $email = normalizar_email($dados['email']);
            $senha = (string)$dados['senha'];

            $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE email = :email');
            $stmt->execute([':email' => $email]);

            if ($stmt->fetch() !== false) {
                responder_json([
                    'success' => false,
                    'message' => 'Já existe uma conta cadastrada com este e-mail.',
                    'campos'  => ['email' => 'Já existe uma conta cadastrada com este e-mail.'],
                ], 409);
            }

            $stmt = $pdo->query('SELECT COUNT(*) AS total FROM usuarios');
            $primeiroUsuario = ((int)$stmt->fetch()['total'] === 0);
            $perfil = $primeiroUsuario ? 'admin' : 'usuario';

            $stmt = $pdo->prepare(
                'INSERT INTO usuarios (nome, email, senha_hash, perfil)
                 VALUES (:nome, :email, :senha_hash, :perfil)'
            );
            $stmt->execute([
                ':nome'       => $nome,
                ':email'      => $email,
                ':senha_hash' => password_hash($senha, PASSWORD_DEFAULT),
                ':perfil'     => $perfil,
            ]);

            $id = (int)$pdo->lastInsertId();

            if ($primeiroUsuario) {
                $adotar = $pdo->prepare('UPDATE categorias SET usuario_id = :id WHERE usuario_id IS NULL');
                $adotar->execute([':id' => $id]);
                $adotar = $pdo->prepare('UPDATE contas SET usuario_id = :id WHERE usuario_id IS NULL');
                $adotar->execute([':id' => $id]);
                $adotar = $pdo->prepare('UPDATE transacoes SET usuario_id = :id WHERE usuario_id IS NULL');
                $adotar->execute([':id' => $id]);
            }

            registrar_sessao(['id' => $id, 'nome' => $nome, 'email' => $email, 'perfil' => $perfil]);

            responder_json([
                'success' => true,
                'message' => $perfil === 'admin'
                    ? 'Conta criada com sucesso. Você é o administrador inicial.'
                    : 'Conta criada com sucesso.',
                'usuario' => ['id' => $id, 'nome' => $nome, 'email' => $email, 'perfil' => $perfil],
            ], 201);

        case 'login':
            if ($metodo !== 'POST') {
                responder_json(['success' => false, 'message' => 'Método não permitido.'], 405);
            }

            $dados = ler_corpo_json();

            $stmt = $pdo->prepare(
                'SELECT id, nome, email, senha_hash, perfil, ativo
                 FROM usuarios
                 WHERE email = :email'
            );
            $stmt->execute([':email' => normalizar_email((string)($dados['email'] ?? ''))]);
            $usuario = $stmt->fetch();

            if ($usuario === false || !password_verify((string)($dados['senha'] ?? ''), (string)$usuario['senha_hash'])) {
                responder_json([
                    'success' => false,
                    'message' => 'E-mail ou senha inválidos.',
                ], 401);
            }

            if ((int)$usuario['ativo'] !== 1) {
                responder_json([
                    'success' => false,
                    'message' => 'Sua conta está desativada. Contate o administrador.',
                ], 403);
            }

            $usuarioAutenticado = [
                'id'     => (int)$usuario['id'],
                'nome'   => $usuario['nome'],
                'email'  => $usuario['email'],
                'perfil' => $usuario['perfil'],
            ];
            registrar_sessao($usuarioAutenticado);

            responder_json([
                'success' => true,
                'message' => 'Login realizado com sucesso.',
                'usuario' => $usuarioAutenticado,
            ]);

        case 'logout':
            iniciar_sessao();
            $_SESSION = [];
            session_unset();

            if (session_status() === PHP_SESSION_ACTIVE) {
                session_destroy();
            }

            responder_json(['success' => true, 'message' => 'Sessão encerrada.']);

        case 'sessao':
            $usuario = usuario_logado();

            if ($usuario === null) {
                responder_json(['success' => false, 'message' => 'Não autenticado.'], 401);
            }

            responder_json(['success' => true, 'usuario' => $usuario]);

        default:
            responder_json(['success' => false, 'message' => 'Rota inválida.'], 404);
    }
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        responder_json([
            'success' => false,
            'message' => 'Já existe uma conta cadastrada com este e-mail.',
            'campos'  => ['email' => 'Já existe uma conta cadastrada com este e-mail.'],
        ], 409);
    }

    responder_json([
        'success' => false,
        'message' => 'Erro interno no servidor.',
    ], 500);
}