<!-- ============ SEÇÃO: CONTAS (CRUD 2) ============ -->
<section data-secao="contas" class="d-none">
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
            <h1 class="h3 mb-1">Contas</h1>
            <p class="text-muted mb-0">Gerencie as contas onde suas transações são movimentadas.</p>
        </div>
        <button type="button" id="botaoNovaConta" class="btn btn-primary">
            <span class="me-1">+</span>Nova Conta
        </button>
    </div>

    <div class="card">
        <div class="card-header app-card-header">
            <h6 class="mb-0 fw-semibold">Listagem de Contas</h6>
        </div>
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Tipo</th>
                        <th class="text-end">Saldo</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="tabelaContasBody"></tbody>
            </table>
        </div>
    </div>
</section>