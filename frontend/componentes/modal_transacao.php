<div id="modalTransacao" class="modal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalTransacaoTitulo">Nova Transação</h5>
                <button type="button" class="btn-close" data-fechar-modal="modalTransacao" aria-label="Fechar"></button>
            </div>
            <form id="transacaoForm">
                <div class="modal-body">
                    <input type="hidden" id="transacaoId">
                    <div class="mb-3">
                        <label for="transacaoDescricao" class="form-label">Descrição</label>
                        <input type="text" id="transacaoDescricao" name="descricao" class="form-control" required>
                    </div>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label for="transacaoTipo" class="form-label">Tipo</label>
                            <select id="transacaoTipo" name="tipo" class="form-select" required>
                                <option value="despesa">Despesa</option>
                                <option value="receita">Receita</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="transacaoValor" class="form-label">Valor (R$)</label>
                            <input type="number" id="transacaoValor" name="valor" class="form-control" step="0.01" min="0" required>
                        </div>
                        <div class="col-md-6">
                            <label for="transacaoConta" class="form-label">Conta</label>
                            <select id="transacaoConta" name="conta_id" class="form-select" required></select>
                        </div>
                        <div class="col-md-6">
                            <label for="transacaoCategoria" class="form-label">Categoria</label>
                            <select id="transacaoCategoria" name="categoria_id" class="form-select" required></select>
                        </div>
                        <div class="col-md-6">
                            <label for="transacaoData" class="form-label">Data</label>
                            <input type="date" id="transacaoData" name="data_transacao" class="form-control" required>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-fechar-modal="modalTransacao">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
            </form>
        </div>
    </div>
</div>