<main class="container-fluid px-4">
    <section data-secao="dashboard">

        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
                <h1 class="h3 mb-1">Dashboard Financeiro</h1>
                <p class="text-muted mb-0">Visão consolidada das suas receitas, despesas e saldo.</p>
            </div>
            <button type="button" class="btn btn-outline-primary btn-sm" data-navegar="transacoes">
                Nova transação
            </button>
        </div>

        <!-- Filtros da dashboard -->
        <div class="card card-filtros mb-4">
            <div class="card-body">
                <h6 class="card-subtitle text-muted mb-3 fw-semibold text-uppercase letter-spacing">Filtros</h6>
                <div class="row g-3 align-items-end">
                    <div class="col-6 col-md-2">
                        <label for="filtroDataInicio" class="form-label small">Data início</label>
                        <input type="date" id="filtroDataInicio" class="form-control form-control-sm">
                    </div>
                    <div class="col-6 col-md-2">
                        <label for="filtroDataFim" class="form-label small">Data fim</label>
                        <input type="date" id="filtroDataFim" class="form-control form-control-sm">
                    </div>
                    <div class="col-6 col-md-3">
                        <label for="filtroCategoria" class="form-label small">Categoria</label>
                        <select id="filtroCategoria" class="form-select form-select-sm"></select>
                    </div>
                    <div class="col-6 col-md-3">
                        <label for="filtroConta" class="form-label small">Conta</label>
                        <select id="filtroConta" class="form-select form-select-sm"></select>
                    </div>
                    <div class="col-12 col-md-2 d-flex gap-2">
                        <button type="button" id="aplicarFiltros" class="btn btn-primary btn-sm flex-fill">Filtrar</button>
                        <button type="button" id="limparFiltros" class="btn btn-outline-secondary btn-sm flex-fill">Limpar</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Cards de métricas -->
        <div class="row g-3 mb-4">
            <div class="col-12 col-sm-6 col-xl-4">
                <div class="card metric-card h-100">
                    <div class="card-body">
                        <p class="metric-label">Total de Receitas</p>
                        <p id="metricaReceitas" class="metric-value text-success">Carregando...</p>
                        <span id="metricaReceitasSub" class="metric-subvalue"></span>
                        <span class="metric-icon bg-success-subtle text-success"><i class="bi bi-graph-up-arrow"></i></span>
                    </div>
                </div>
            </div>
            <div class="col-12 col-sm-6 col-xl-4">
                <div class="card metric-card h-100">
                    <div class="card-body">
                        <p class="metric-label">Total de Despesas</p>
                        <p id="metricaDespesas" class="metric-value text-danger">Carregando...</p>
                        <span id="metricaDespesasSub" class="metric-subvalue"></span>
                        <span class="metric-icon bg-danger-subtle text-danger"><i class="bi bi-graph-down-arrow"></i></span>
                    </div>
                </div>
            </div>
            <div class="col-12 col-sm-6 col-xl-4">
                <div class="card metric-card h-100">
                    <div class="card-body">
                        <p class="metric-label">Saldo Líquido</p>
                        <p id="metricaSaldo" class="metric-value">Carregando...</p>
                        <span id="metricaSaldoSub" class="metric-subvalue"></span>
                        <span class="metric-icon bg-teal-soft text-teal"><i class="bi bi-wallet2"></i></span>
                    </div>
                </div>
            </div>
        </div>

        <div class="row g-3 mb-4">
            <div class="col-12 col-sm-6 col-xl-4">
                <div class="card metric-card h-100">
                    <div class="card-body">
                        <p class="metric-label">Maior Gasto (Categoria)</p>
                        <p id="metricaMaiorCategoria" class="metric-value">Carregando...</p>
                        <span id="metricaValorMaiorCategoria" class="metric-subvalue">—</span>
                        <span class="metric-icon bg-warning-subtle text-warning"><i class="bi bi-trophy"></i></span>
                    </div>
                </div>
            </div>
            <div class="col-12 col-sm-6 col-xl-4">
                <div class="card metric-card h-100">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <p class="metric-label mb-1">Total de Transações</p>
                            <p id="metricaTotalTransacoes" class="metric-value mb-0">Carregando...</p>
                        </div>
                        <span class="metric-icon bg-secondary-subtle text-secondary"><i class="bi bi-arrow-repeat"></i></span>
                    </div>
                </div>
            </div>
            <div class="col-12 col-sm-6 col-xl-4">
                <div class="card metric-card h-100">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <p class="metric-label mb-1">Despesas no Mês Atual</p>
                            <p id="metricaDespesasMesAtual" class="metric-value mb-0">Carregando...</p>
                        </div>
                        <span class="metric-icon bg-info-subtle text-info"><i class="bi bi-calendar-month"></i></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Ranking e tabela -->
        <div class="row g-3">
            <div class="col-12 col-xl-4">
                <div class="card h-100">
                    <div class="card-header app-card-header">
                        <h6 class="mb-0 fw-semibold">Ranking de Categorias (Gastos)</h6>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>Posição</th>
                                    <th>Categoria</th>
                                    <th>Qtd.</th>
                                    <th class="text-end">Total Gasto</th>
                                </tr>
                            </thead>
                            <tbody id="tabelaRankingBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="col-12 col-xl-8">
                <div class="card">
                    <div class="card-header app-card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0 fw-semibold">Transações Recentes</h6>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Descrição</th>
                                    <th>Tipo</th>
                                    <th>Categoria</th>
                                    <th>Conta</th>
                                    <th class="text-end">Valor</th>
                                </tr>
                            </thead>
                            <tbody id="tabelaDashboardBody"></tbody>
                        </table>
                    </div>
                    <div class="card-footer bg-transparent text-center">
                        <button type="button" id="carregarMais" class="btn btn-outline-primary">Carregar mais</button>
                    </div>
                </div>
            </div>
        </div>
    </section>