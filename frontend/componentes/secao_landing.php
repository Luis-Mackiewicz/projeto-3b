<main class="landing bg-light min-vh-100">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top py-3">
        <div class="container px-4">
            <a class="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary" href="#">
                <span class="badge bg-primary-subtle text-primary p-2 rounded-circle">
                    <i class="bi bi-currency-dollar fs-5"></i>
                </span>
                <span>Finanças Pessoais</span>
            </a>
            <div class="d-flex gap-2">
                <button type="button" class="btn btn-outline-primary btn-sm px-3 fw-semibold" data-abrir-modal="modalLogin">Entrar</button>
                <button type="button" class="btn btn-primary btn-sm px-3 fw-semibold shadow-sm" data-abrir-modal="modalCadastro">Criar conta</button>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="landing-hero py-5 py-lg-6 overflow-hidden">
        <div class="container px-4">
            <div class="row align-items-center g-5">
                <div class="col-lg-6">
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-2 mb-3 fw-medium">
                        <i class="bi bi-shield-check me-1"></i> Gestão financeira pessoal
                    </span>
                    <h1 class="display-5 fw-bold mb-3 text-dark lh-sm">
                        Tenha o controle total do seu dinheiro em um só lugar.
                    </h1>
                    <p class="lead text-secondary mb-4 fs-5">
                        Registre receitas e despesas, organize suas contas e acompanhe um dashboard completo com saldo, maiores gastos e evolução das suas transações.
                    </p>
                    <div class="d-flex flex-sm-row flex-column gap-3 mb-3">
                        <button type="button" class="btn btn-primary btn-lg px-4 fw-semibold shadow-sm" data-abrir-modal="modalCadastro">
                            Começar agora gratuitamente
                        </button>
                        <button type="button" class="btn btn-outline-secondary btn-lg px-4 fw-semibold" data-abrir-modal="modalLogin">
                            Já tenho conta
                        </button>
                    </div>
                    <div class="d-flex align-items-center gap-2 text-muted small">
                        <i class="bi bi-lock-fill text-success"></i>
                        <span>Seus dados ficam privados e seguros.</span>
                    </div>
                </div>

                <!-- Visual Preview do Dashboard -->
                <div class="col-lg-6">
                    <div class="card border-0 shadow-lg rounded-4 overflow-hidden">
                        <div class="card-header bg-dark text-white d-flex align-items-center justify-content-between px-3 py-2">
                            <div class="d-flex gap-1">
                                <span class="bg-danger rounded-circle d-inline-block" style="width: 10px; height: 10px;"></span>
                                <span class="bg-warning rounded-circle d-inline-block" style="width: 10px; height: 10px;"></span>
                                <span class="bg-success rounded-circle d-inline-block" style="width: 10px; height: 10px;"></span>
                            </div>
                            <small class="text-white-50 font-monospace">app.financas.com</small>
                        </div>
                        <div class="card-body bg-light p-4">
                            <div class="row g-3">
                                <div class="col-12">
                                    <div class="p-3 bg-white rounded-3 shadow-sm border border-light-subtle d-flex align-items-center justify-content-between">
                                        <div>
                                            <span class="text-muted small d-block mb-1">Saldo líquido</span>
                                            <span class="h4 fw-bold text-dark mb-0">R$ 4.770,00</span>
                                        </div>
                                        <div class="bg-info-subtle text-info p-3 rounded-circle">
                                            <i class="bi bi-wallet2 fs-4"></i>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="p-3 bg-white rounded-3 shadow-sm border border-light-subtle">
                                        <div class="d-flex align-items-center gap-2 mb-2">
                                            <div class="bg-success-subtle text-success p-1 rounded">
                                                <i class="bi bi-arrow-up-right fs-6"></i>
                                            </div>
                                            <span class="text-muted small">Receitas</span>
                                        </div>
                                        <span class="fw-bold text-success">R$ 8.250,00</span>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="p-3 bg-white rounded-3 shadow-sm border border-light-subtle">
                                        <div class="d-flex align-items-center gap-2 mb-2">
                                            <div class="bg-danger-subtle text-danger p-1 rounded">
                                                <i class="bi bi-arrow-down-right fs-6"></i>
                                            </div>
                                            <span class="text-muted small">Despesas</span>
                                        </div>
                                        <span class="fw-bold text-danger">R$ 3.480,00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="py-5 bg-white border-top">
        <div class="container px-4">
            <div class="text-center max-w-2xl mx-auto mb-5">
                <h2 class="h3 fw-bold mb-2">Tudo o que você precisa em um só lugar</h2>
                <p class="text-secondary">Ferramentas simples e intuitivas para organizar sua vida financeira sem complicação.</p>
            </div>

            <div class="row g-4">
                <div class="col-12 col-md-6 col-xl-3">
                    <div class="card border-0 shadow-sm h-100 p-2">
                        <div class="card-body">
                            <div class="badge bg-teal-soft text-teal p-3 rounded-3 mb-3">
                                <i class="bi bi-speedometer2 fs-4"></i>
                            </div>
                            <h3 class="h6 fw-bold mb-2">Dashboard Central</h3>
                            <p class="text-secondary small mb-0">Visão consolidada de entradas, saídas, saldo atual e categorias com maiores gastos.</p>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-md-6 col-xl-3">
                    <div class="card border-0 shadow-sm h-100 p-2">
                        <div class="card-body">
                            <div class="badge bg-success-subtle text-success p-3 rounded-3 mb-3">
                                <i class="bi bi-tags fs-4"></i>
                            </div>
                            <h3 class="h6 fw-bold mb-2">Categorização</h3>
                            <p class="text-secondary small mb-0">Classifique lançamentos e entenda exatamente em quais áreas seu dinheiro está sendo gasto.</p>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-md-6 col-xl-3">
                    <div class="card border-0 shadow-sm h-100 p-2">
                        <div class="card-body">
                            <div class="badge bg-warning-subtle text-warning p-3 rounded-3 mb-3">
                                <i class="bi bi-credit-card-2-front fs-4"></i>
                            </div>
                            <h3 class="h6 fw-bold mb-2">Múltiplas Contas</h3>
                            <p class="text-secondary small mb-0">Gerencie contas correntes, investimentos, poupança e cartões de maneira individualizada.</p>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-md-6 col-xl-3">
                    <div class="card border-0 shadow-sm h-100 p-2">
                        <div class="card-body">
                            <div class="badge bg-info-subtle text-info p-3 rounded-3 mb-3">
                                <i class="bi bi-arrow-left-right fs-4"></i>
                            </div>
                            <h3 class="h6 fw-bold mb-2">Histórico Completo</h3>
                            <p class="text-secondary small mb-0">Filtre, busque e analise detalhadamente qualquer movimentação realizada no sistema.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</main>
