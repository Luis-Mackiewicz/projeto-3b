<section data-secao="transacoes" class="d-none">
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
            <h1 class="h3 mb-1">Transações</h1>
            <p class="text-muted mb-0">Registre todas as entradas e saídas do seu fluxo financeiro.</p>
        </div>
        <button type="button" id="botaoNovaTransacao" class="btn btn-primary">
            <span class="me-1">+</span>Nova Transação
        </button>
    </div>

    <div class="card">
        <div class="card-header app-card-header">
            <h6 class="mb-0 fw-semibold">Histórico de Transações</h6>
        </div>
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Descrição</th>
                        <th>Tipo</th>
                        <th>Categoria</th>
                        <th>Conta</th>
                        <th class="text-end">Valor</th>
                        <th>Data</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="tabelaTransacoesBody"></tbody>
            </table>
        </div>
    </div>
</section>
</main>