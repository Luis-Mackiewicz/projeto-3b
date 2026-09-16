<?php
require_once __DIR__ . '/../backend/config.php';

iniciar_sessao();
$usuario = usuario_logado();
?>
<?php require 'componentes/head.php'; ?>
<?php if ($usuario === null): ?>
    <?php require 'componentes/secao_landing.php'; ?>
    <?php require 'componentes/modal_auth.php'; ?>
    <div id="areaAlertas"></div>
    <script type="module">
        import { configurarAutenticacao } from './dist/auth.js';
        configurarAutenticacao();
    </script>
</body>
</html>
<?php else: ?>
    <?php require 'componentes/navbar.php'; ?>
    <?php require 'componentes/secao_dashboard.php'; ?>
    <?php require 'componentes/secao_categorias.php'; ?>
    <?php require 'componentes/secao_contas.php'; ?>
    <?php require 'componentes/secao_transacoes.php'; ?>
    <?php if ($usuario['perfil'] === 'admin'): ?>
        <?php require 'componentes/secao_usuarios.php'; ?>
    <?php endif; ?>
    <?php require 'componentes/modal_categoria.php'; ?>
    <?php require 'componentes/modal_conta.php'; ?>
    <?php require 'componentes/modal_transacao.php'; ?>
    <?php if ($usuario['perfil'] === 'admin'): ?>
        <?php require 'componentes/modal_usuario.php'; ?>
    <?php endif; ?>
    <?php require 'componentes/scripts.php'; ?>
<?php endif; ?>
