<nav class="navbar navbar-expand-lg navbar-light app-navbar mb-4">
    <div class="container-fluid px-4">
        <span class="navbar-brand d-flex align-items-center gap-2">
            <span class="navbar-brand-icon">R$</span>
            <span class="fw-semibold">Finanças Pessoais</span>
        </span>
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 w-100 mt-2 mt-lg-0">
            <div class="d-flex flex-wrap gap-1" role="tablist">
                <button type="button" class="btn btn-nav active" data-navegar="dashboard" aria-current="page">Dashboard</button>
                <button type="button" class="btn btn-nav" data-navegar="categorias">Categorias</button>
                <button type="button" class="btn btn-nav" data-navegar="contas">Contas</button>
                <button type="button" class="btn btn-nav" data-navegar="transacoes">Transações</button>
                <?php if (($usuario['perfil'] ?? '') === 'admin'): ?>
                    <button type="button" class="btn btn-nav" data-navegar="usuarios">Usuários</button>
                <?php endif; ?>
            </div>
            <div class="d-flex align-items-center gap-2">
                <span class="text-muted small">Olá, <strong><?= htmlspecialchars((string)($usuario['nome'] ?? ''), ENT_QUOTES, 'UTF-8') ?></strong></span>
                <span class="badge <?= ($usuario['perfil'] ?? '') === 'admin' ? 'text-bg-success' : 'text-bg-secondary' ?>">
                    <?= ($usuario['perfil'] ?? '') === 'admin' ? 'admin' : 'usuário' ?>
                </span>
                <button type="button" id="btnSair" class="btn btn-outline-secondary btn-sm">Sair</button>
            </div>
        </div>
    </div>
</nav>
