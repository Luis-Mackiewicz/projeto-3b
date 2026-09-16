<div id="modalLogin" class="modal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <form id="loginForm" novalidate>
                <div class="modal-header">
                    <h5 class="modal-title" id="modalLoginTitulo">Entrar</h5>
                    <button type="button" class="btn-close" data-fechar-modal="modalLogin" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                    <div class="form-erro-geral d-none" id="loginErroGeral" role="alert"></div>
                    <div class="mb-3">
                        <label for="loginEmail" class="form-label">E-mail</label>
                        <input type="email" id="loginEmail" name="email" class="form-control" required autocomplete="email">
                        <div class="invalid-feedback" id="loginEmailErro"></div>
                    </div>
                    <div class="mb-1">
                        <label for="loginSenha" class="form-label">Senha</label>
                        <input type="password" id="loginSenha" name="senha" class="form-control" required autocomplete="current-password">
                        <div class="invalid-feedback" id="loginSenhaErro"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-fechar-modal="modalLogin">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Entrar</button>
                </div>
            </form>
        </div>
    </div>
</div>

<div id="modalCadastro" class="modal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <form id="cadastroForm" novalidate>
                <div class="modal-header">
                    <h5 class="modal-title" id="modalCadastroTitulo">Criar conta</h5>
                    <button type="button" class="btn-close" data-fechar-modal="modalCadastro" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                    <div class="form-erro-geral d-none" id="cadastroErroGeral" role="alert"></div>
                    <div class="mb-3">
                        <label for="cadastroNome" class="form-label">Nome</label>
                        <input type="text" id="cadastroNome" name="nome" class="form-control" required maxlength="100" autocomplete="name">
                        <div class="invalid-feedback" id="cadastroNomeErro"></div>
                    </div>
                    <div class="mb-3">
                        <label for="cadastroEmail" class="form-label">E-mail</label>
                        <input type="email" id="cadastroEmail" name="email" class="form-control" required maxlength="150" autocomplete="email">
                        <div class="invalid-feedback" id="cadastroEmailErro"></div>
                    </div>
                    <div class="mb-1">
                        <label for="cadastroSenha" class="form-label">Senha</label>
                        <input type="password" id="cadastroSenha" name="senha" class="form-control" required minlength="6" autocomplete="new-password">
                        <div class="invalid-feedback" id="cadastroSenhaErro"></div>
                        <div class="form-text">Mínimo de 6 caracteres.</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-fechar-modal="modalCadastro">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Criar conta</button>
                </div>
            </form>
        </div>
    </div>
</div>
