<div id="modalCategoria" class="modal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalCategoriaTitulo">Nova Categoria</h5>
                <button type="button" class="btn-close" data-fechar-modal="modalCategoria" aria-label="Fechar"></button>
            </div>
            <form id="categoriaForm">
                <div class="modal-body">
                    <input type="hidden" id="categoriaId">
                    <div class="mb-3">
                        <label for="categoriaNome" class="form-label">Nome</label>
                        <input type="text" id="categoriaNome" name="nome" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label for="categoriaTipo" class="form-label">Tipo</label>
                        <select id="categoriaTipo" name="tipo" class="form-select" required>
                            <option value="despesa">Despesa</option>
                            <option value="receita">Receita</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="categoriaDescricao" class="form-label">Descrição</label>
                        <textarea id="categoriaDescricao" name="descricao" class="form-control" rows="2"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-fechar-modal="modalCategoria">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
            </form>
        </div>
    </div>
</div>