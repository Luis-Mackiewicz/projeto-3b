<section data-secao="categorias" class="d-none">
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
            <h1 class="h3 mb-1">Categorias</h1>
            <p class="text-muted mb-0">Classifique suas receitas e despesas por categoria.</p>
        </div>
        <button type="button" id="botaoNovaCategoria" class="btn btn-primary">
            <span class="me-1">+</span>Nova Categoria
        </button>
    </div>

    <div class="card">
        <div class="card-header app-card-header">
            <h6 class="mb-0 fw-semibold">Listagem de Categorias</h6>
        </div>
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th>Tipo</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="tabelaCategoriasBody"></tbody>
            </table>
        </div>
    </div>
</section>