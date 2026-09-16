<div id="modalUsuario" class="modal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <form id="usuarioForm" novalidate>
                <div class="modal-header">
                    <h5 class="modal-title" id="modalUsuarioTitulo">Novo Usuário</h5>
                    <button type="button" class="btn-close" data-fechar-modal="modalUsuario" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                    <div class="form-erro-geral d-none" id="usuarioErroGeral" role="alert"></div>
                    <div class="mb-3">
                        <label for="usuarioNome" class="form-label">Nome</label>
                        <input type="text" id="usuarioNome" name="nome" class="form-control" required maxlength="100">
                        <div class="invalid-feedback" id="usuarioNomeErro"></div>
                    </div>
                    <div class="mb-3">
                        <label for="usuarioEmail" class="form-label">E-mail</label>
                        <input type="email" id="usuarioEmail" name="email" class="form-control" required maxlength="150">
                        <div class="invalid-feedback" id="usuarioEmailErro"></div>
                    </div>
                    <div class="mb-3">
                        <label for="usuarioSenha" class="form-label">Senha</label>
                        <input type="password" id="usuarioSenha" name="senha" class="form-control" required minlength="6" autocomplete="new-password">
                        <div class="invalid-feedback" id="usuarioSenhaErro"></div>
                        <div class="form-text">Mínimo de 6 caracteres.</div>
                    </div>
                    <div class="mb-1">
                        <label for="usuarioPerfil" class="form-label">Perfil</label>
                        <select id="usuarioPerfil" name="perfil" class="form-select">
                            <option value="usuario">Usuário</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-fechar-modal="modalUsuario">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Cadastrar</button>
                </div>
            </form>
        </div>
    </div>
</div>
