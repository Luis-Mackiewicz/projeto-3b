import { URL_USUARIOS } from '../config.js';
import { abrirModal, fecharModal } from '../componentes/modais.js';
import { requisicaoJson, criarRegistro, atualizarRegistro } from '../utils/requisicoes.js';
import { elementoPorId, elementoDeFormulario, textoDoInput, exibirAlerta, exibirLinhaVazia } from '../utils/dom.js';
import type { Usuario, PerfilUsuario } from '../types.js';

let cacheUsuarios: Usuario[] = [];

function obterUsuarioAtualId(): number {
    return Number(document.body.dataset.usuarioId ?? 0);
}

export async function renderizarUsuarios(): Promise<void> {
    const corpoTabela = elementoPorId<HTMLTableSectionElement>('tabelaUsuariosBody');
    if (corpoTabela === null) {
        return;
    }

    corpoTabela.innerHTML = '';

    try {
        cacheUsuarios = await requisicaoJson<Usuario[]>(URL_USUARIOS);

        if (cacheUsuarios.length === 0) {
            exibirLinhaVazia(corpoTabela, 6, 'Nenhum usuário cadastrado.');
            return;
        }

        const usuarioAtualId = obterUsuarioAtualId();

        cacheUsuarios.forEach((usuario) => {
            const linha = document.createElement('tr');
            const ehAtual = usuario.id === usuarioAtualId;
            const badgePerfil = usuario.perfil === 'admin' ? 'text-bg-success' : 'text-bg-secondary';
            const badgeStatus = usuario.ativo ? 'text-bg-success' : 'text-bg-danger';
            const labelPerfil = usuario.perfil === 'admin' ? 'admin' : 'usuário';
            const labelStatus = usuario.ativo ? 'ativo' : 'inativo';

            const acoes = ehAtual
                ? '<span class="text-muted small">Você</span>'
                : `
                    <button class="btn btn-sm btn-outline-primary btn-perfil" data-id="${usuario.id}">
                        ${usuario.perfil === 'admin' ? 'Rebaixar' : 'Tornar admin'}
                    </button>
                    <button class="btn btn-sm ${usuario.ativo ? 'btn-outline-danger' : 'btn-outline-success'} btn-ativo"
                            data-id="${usuario.id}" data-ativo="${usuario.ativo ? '1' : '0'}">
                        ${usuario.ativo ? 'Desativar' : 'Ativar'}
                    </button>`;

            linha.innerHTML = `
                <td>${usuario.id}</td>
                <td>${usuario.nome}</td>
                <td>${usuario.email}</td>
                <td><span class="badge ${badgePerfil}">${labelPerfil}</span></td>
                <td><span class="badge ${badgeStatus}">${labelStatus}</span></td>
                <td>${acoes}</td>`;
            corpoTabela.appendChild(linha);
        });
    } catch (erro) {
        const mensagem = erro instanceof Error ? erro.message : 'Erro ao carregar usuários.';
        exibirAlerta(mensagem, 'danger');
    }
}

export function abrirModalUsuario(): void {
    const formulario = elementoDeFormulario('usuarioForm');
    if (formulario !== null) {
        formulario.reset();
    }
    abrirModal('modalUsuario');
}

export function configurarFormularioUsuario(): void {
    const formulario = elementoDeFormulario('usuarioForm');
    if (formulario === null) {
        return;
    }

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const dados = {
            nome: textoDoInput('usuarioNome'),
            email: textoDoInput('usuarioEmail'),
            senha: textoDoInput('usuarioSenha'),
            perfil: textoDoInput('usuarioPerfil'),
        };

        try {
            await criarRegistro(URL_USUARIOS, dados);
            exibirAlerta('Usuário cadastrado com sucesso.', 'success');
            fecharModal('modalUsuario');
            await renderizarUsuarios();
        } catch (erro) {
            void erro;
        }
    });
}

export function configurarAcoesUsuario(): void {
    document.addEventListener('click', async (evento) => {
        const alvo = evento.target as HTMLElement | null;

        const botaoPerfil = alvo?.closest<HTMLButtonElement>('.btn-perfil');
        if (botaoPerfil !== null && botaoPerfil !== undefined) {
            const id = Number(botaoPerfil.dataset.id ?? 0);
            const usuario = cacheUsuarios.find((u) => u.id === id);

            if (usuario === undefined) {
                return;
            }

            const novoPerfil: PerfilUsuario = usuario.perfil === 'admin' ? 'usuario' : 'admin';

            try {
                await atualizarRegistro(URL_USUARIOS, id, { perfil: novoPerfil });
                exibirAlerta('Perfil atualizado com sucesso.', 'success');
                await renderizarUsuarios();
            } catch (erro) {
                void erro;
            }
            return;
        }

        const botaoAtivo = alvo?.closest<HTMLButtonElement>('.btn-ativo');
        if (botaoAtivo !== null && botaoAtivo !== undefined) {
            const id = Number(botaoAtivo.dataset.id ?? 0);
            const ativoAtual = botaoAtivo.dataset.ativo === '1';

            try {
                await atualizarRegistro(URL_USUARIOS, id, { ativo: !ativoAtual });
                exibirAlerta(ativoAtual ? 'Usuário desativado.' : 'Usuário ativado.', 'success');
                await renderizarUsuarios();
            } catch (erro) {
                void erro;
            }
        }
    });
}
