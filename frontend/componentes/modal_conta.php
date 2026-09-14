<div id="modalConta" class="modal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalContaTitulo">Nova Conta</h5>
                <button type="button" class="btn-close" data-fechar-modal="modalConta" aria-label="Fechar"></button>
            </div>
            <form id="contaForm">
                <div class="modal-body">
                    <input type="hidden" id="contaId">
                    <div class="mb-3">
                        <label for="contaNome" class="form-label">Nome</label>
                        <input type="text" id="contaNome" name="nome" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label for="contaTipo" class="form-label">Tipo</label>
                        <select id="contaTipo" name="tipo" class="form-select" required>
                            <option value="corrente">Corrente</option>
                            <option value="poupanca">Poupança</option>
                            <option value="credito">Crédito</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="contaSaldo" class="form-label">Saldo Inicial (R$)</label>
                        <input type="number" id="contaSaldo" name="saldo" class="form-control" step="0.01" min="0">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-fechar-modal="modalConta">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
            </form>
        </div>
    </div>
</div>