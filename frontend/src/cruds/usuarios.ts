import { URL_USUARIOS } from '../config.js';
import { abrirModal, fecharModal } from '../componentes/modais.js';
import { requisicaoJson, atualizarRegistro } from '../utils/requisicoes.js';
import { elementoPorId, elementoDeFormulario, textoDoInput, exibirAlerta, exibirLinhaVazia } from '../utils/dom.js';
import {
    definirErroCampo,
    definirErroGeral,
    focarPrimeiroErro,
    limparErros,
    validarRegras,
    type RegraCampo,
} from '../componentes/validacao.js';
import type { Usuario, PerfilUsuario } from '../types.js';

let cacheUsuarios: Usuario[] = [];

interface RespostaUsuario {
    success?: boolean;
    message?: string;
    campos?: Record<string, string>;
}

interface ResultadoCriacaoUsuario {
    ok: boolean;
    message?: string;
    campos?: Record<string, string>;
}

const REGEX_EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const REGRAS_USUARIO: RegraCampo[] = [
    {
        id: 'usuarioNome',
        erroId: 'usuarioNomeErro',
        validar: (valor) => (valor === '' ? 'Informe o nome.' : null),
    },
    {
        id: 'usuarioEmail',
        erroId: 'usuarioEmailErro',
        validar: (valor) => {
            if (valor === '') {
                return 'Informe o e-mail.';
            }
            return REGEX_EMAIL.test(valor) ? null : 'Informe um e-mail válido.';
        },
    },
    {
        id: 'usuarioSenha',
        erroId: 'usuarioSenhaErro',
        validar: (valor) => {
            if (valor === '') {
                return 'Informe uma senha.';
            }
            return valor.length < 6 ? 'A senha deve ter no mínimo 6 caracteres.' : null;
        },
    },
];

const CAMPOS_SERVIDOR_USUARIO = [
    { campo: 'nome', input: 'usuarioNome', erro: 'usuarioNomeErro' },
    { campo: 'email', input: 'usuarioEmail', erro: 'usuarioEmailErro' },
    { campo: 'senha', input: 'usuarioSenha', erro: 'usuarioSenhaErro' },
];

async function enviarCriacaoUsuario(dados: unknown): Promise<ResultadoCriacaoUsuario> {
    try {
        const resposta = await fetch(URL_USUARIOS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
        });

        let corpo: RespostaUsuario;
        try {
            corpo = (await resposta.json()) as RespostaUsuario;
        } catch (erro) {
            return { ok: false, message: 'O servidor retornou uma resposta inválida.' };
        }

        if (!resposta.ok || corpo.success !== true) {
            return {
                ok: false,
                message: corpo.message ?? 'Não foi possível cadastrar o usuário.',
                campos: corpo.campos,
            };
        }

        return { ok: true, message: corpo.message };
    } catch (erro) {
        return { ok: false, message: 'Não foi possível conectar ao servidor.' };
    }
}

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
    limparErros(REGRAS_USUARIO);
    definirErroGeral('usuarioErroGeral', null);
    abrirModal('modalUsuario');
}

export function configurarFormularioUsuario(): void {
    const formulario = elementoDeFormulario('usuarioForm');
    if (formulario === null) {
        return;
    }

    let jaSubmeteu = false;

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        jaSubmeteu = true;

        limparErros(REGRAS_USUARIO);
        definirErroGeral('usuarioErroGeral', null);

        if (!validarRegras(REGRAS_USUARIO)) {
            focarPrimeiroErro(formulario);
            return;
        }

        const resultado = await enviarCriacaoUsuario({
            nome: textoDoInput('usuarioNome'),
            email: textoDoInput('usuarioEmail'),
            senha: textoDoInput('usuarioSenha'),
            perfil: textoDoInput('usuarioPerfil'),
        });

        if (resultado.ok) {
            exibirAlerta(resultado.message ?? 'Usuário cadastrado com sucesso.', 'success');
            fecharModal('modalUsuario');
            await renderizarUsuarios();
            return;
        }

        const campos = resultado.campos;

        if (campos !== undefined) {
            CAMPOS_SERVIDOR_USUARIO.forEach(({ campo, input, erro }) => {
                const mensagem = campos[campo];
                if (mensagem !== undefined) {
                    definirErroCampo(input, erro, mensagem);
                }
            });
            definirErroGeral('usuarioErroGeral', null);
        } else {
            definirErroGeral('usuarioErroGeral', resultado.message ?? 'Não foi possível cadastrar o usuário.');
        }

        focarPrimeiroErro(formulario);
    });

    REGRAS_USUARIO.forEach((regra) => {
        const input = elementoPorId<HTMLInputElement>(regra.id);
        if (input === null) {
            return;
        }

        input.addEventListener('input', () => {
            if (!jaSubmeteu) {
                return;
            }

            const mensagem = regra.validar(input.value.trim());
            definirErroCampo(regra.id, regra.erroId, mensagem);

            if (mensagem === null) {
                definirErroGeral('usuarioErroGeral', null);
            }
        });
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
