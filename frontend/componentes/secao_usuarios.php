<!-- ============ SEÇÃO: USUÁRIOS (admin) ============ -->
<section data-secao="usuarios" class="d-none">
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
            <h1 class="h3 mb-1">Usuários</h1>
            <p class="text-muted mb-0">Gerencie quem pode acessar o sistema e os perfis de acesso.</p>
        </div>
        <button type="button" id="botaoNovoUsuario" class="btn btn-primary">
            <span class="me-1">+</span>Novo Usuário
        </button>
    </div>

    <div class="card">
        <div class="card-header app-card-header">
            <h6 class="mb-0 fw-semibold">Listagem de Usuários</h6>
        </div>
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>Perfil</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="tabelaUsuariosBody"></tbody>
            </table>
        </div>
    </div>
</section>
