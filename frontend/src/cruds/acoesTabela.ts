import { URL_CATEGORIAS, URL_CONTAS, URL_TRANSACOES } from '../config.js';
import { excluirRegistro } from '../utils/requisicoes.js';
import { exibirAlerta } from '../utils/dom.js';
import { obterCategoriasCache, obterContasCache } from '../dados.js';
import { renderizarCategorias, abrirModalCategoria } from './categorias.js';
import { renderizarContas, abrirModalConta } from './contas.js';
import { renderizarTransacoes, listarTransacoes, abrirModalTransacao } from './transacoes.js';
import { carregarDashboard } from '../dashboard/dashboard.js';

function preencherDadosExclusao(botao: HTMLElement): void {
    const tipo = botao.dataset.tipo;
    const id = Number(botao.dataset.id ?? 0);

    if (tipo === undefined || id <= 0) {
        return;
    }

    window.setTimeout(async () => {
        const confirmacao = window.confirm('Deseja realmente excluir este registro? Esta ação não pode ser desfeita.');

        if (!confirmacao) {
            return;
        }

        const endpoints: Record<string, string> = {
            categoria: URL_CATEGORIAS,
            conta: URL_CONTAS,
            transacao: URL_TRANSACOES,
        };

        const endpoint = endpoints[tipo];

        if (endpoint === undefined) {
            exibirAlerta('Tipo de registro inválido.', 'danger');
            return;
        }

        await excluirRegistro(endpoint, id);

        if (tipo === 'categoria') {
            await renderizarCategorias();
        } else if (tipo === 'conta') {
            await renderizarContas();
        } else {
            await renderizarTransacoes();
        }
        await carregarDashboard();
    }, 0);
}

async function preencherModalEdicao(botao: HTMLElement): Promise<void> {
    const tipo = botao.dataset.tipo;
    const id = Number(botao.dataset.id ?? 0);

    if (tipo === undefined || id <= 0) {
        return;
    }

    if (tipo === 'categoria') {
        const categoria = obterCategoriasCache().find((c) => c.id === id);
        if (categoria !== undefined) {
            abrirModalCategoria(categoria);
        }
    } else if (tipo === 'conta') {
        const conta = obterContasCache().find((c) => c.id === id);
        if (conta !== undefined) {
            abrirModalConta(conta);
        }
    } else if (tipo === 'transacao') {
        const transacoes = await listarTransacoes();
        const transacao = transacoes.find((t) => t.id === id);
        if (transacao !== undefined) {
            abrirModalTransacao(transacao);
        }
    }
}

export function configurarAcoesTabela(): void {
    document.addEventListener('click', (evento) => {
        const alvo = evento.target as HTMLElement | null;
        const botaoEditar = alvo?.closest<HTMLElement>('.btn-editar');
        const botaoExcluir = alvo?.closest<HTMLElement>('.btn-excluir');

        if (botaoEditar !== null && botaoEditar !== undefined) {
            preencherModalEdicao(botaoEditar);
        }

        if (botaoExcluir !== null && botaoExcluir !== undefined) {
            preencherDadosExclusao(botaoExcluir);
        }
    });
}