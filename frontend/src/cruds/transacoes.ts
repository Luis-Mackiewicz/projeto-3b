import { URL_TRANSACOES } from '../config.js';
import { preencherSelectsTransacao } from '../dados.js';
import { abrirModal, fecharModal } from '../componentes/modais.js';
import { criarRegistro, atualizarRegistro, requisicaoJson } from '../utils/requisicoes.js';
import { elementoPorId, elementoDeFormulario, exibirAlerta, exibirLinhaVazia } from '../utils/dom.js';
import { transformarParaExibicao } from '../utils/format.js';
import type { Transacao, RespostaCriacao } from '../types.js';

export async function listarTransacoes(): Promise<Transacao[]> {
    const transacoes = await requisicaoJson<Transacao[]>(URL_TRANSACOES);
    return transacoes;
}

export async function renderizarTransacoes(): Promise<void> {
    const corpoTabela = elementoPorId<HTMLTableSectionElement>('tabelaTransacoesBody');
    if (corpoTabela === null) {
        return;
    }

    corpoTabela.innerHTML = '';

    try {
        const transacoes = await listarTransacoes();
        const exibicao = transformarParaExibicao(transacoes);

        if (exibicao.length === 0) {
            exibirLinhaVazia(corpoTabela, 8, 'Nenhuma transação registrada.');
            return;
        }

        exibicao.forEach((transacao) => {
            const linha = document.createElement('tr');
            const classeTipo = transacao.tipo === 'receita' ? 'text-success' : 'text-danger';
            linha.innerHTML = `
                <td>${transacao.id}</td>
                <td>${transacao.descricao}</td>
                <td><span class="badge ${transacao.tipo === 'receita' ? 'text-bg-success' : 'text-bg-danger'}">${transacao.tipo}</span></td>
                <td>${transacao.categoriaNome}</td>
                <td>${transacao.contaNome}</td>
                <td class="text-end">${transacao.valorFormatado}</td>
                <td class="${classeTipo}">${transacao.dataFormatada}</td>`;
            corpoTabela.appendChild(linha);

            const celulaAcoes = document.createElement('td');
            const botaoEditar = document.createElement('button');
            botaoEditar.className = 'btn btn-sm btn-outline-primary btn-editar';
            botaoEditar.dataset.tipo = 'transacao';
            botaoEditar.dataset.id = String(transacao.id);
            botaoEditar.textContent = 'Editar';
            celulaAcoes.appendChild(botaoEditar);

            const botaoExcluir = document.createElement('button');
            botaoExcluir.className = 'btn btn-sm btn-outline-danger btn-excluir';
            botaoExcluir.dataset.tipo = 'transacao';
            botaoExcluir.dataset.id = String(transacao.id);
            botaoExcluir.textContent = 'Excluir';
            celulaAcoes.appendChild(botaoExcluir);

            linha.appendChild(celulaAcoes);
        });
    } catch (erro) {
        const mensagem = erro instanceof Error ? erro.message : 'Erro ao carregar transações.';
        exibirAlerta(mensagem, 'danger');
    }
}

export function abrirModalTransacao(transacao?: Transacao): void {
    const titulo = elementoPorId<HTMLHeadElement>('modalTransacaoTitulo');
    const campoId = elementoPorId<HTMLInputElement>('transacaoId');
    const campoDescricao = elementoPorId<HTMLInputElement>('transacaoDescricao');
    const campoValor = elementoPorId<HTMLInputElement>('transacaoValor');
    const campoTipo = elementoPorId<HTMLSelectElement>('transacaoTipo');
    const campoData = elementoPorId<HTMLInputElement>('transacaoData');
    const campoConta = elementoPorId<HTMLSelectElement>('transacaoConta');
    const campoCategoria = elementoPorId<HTMLSelectElement>('transacaoCategoria');

    preencherSelectsTransacao();

    if (titulo !== null) {
        titulo.textContent = transacao === undefined ? 'Nova Transação' : 'Editar Transação';
    }
    if (campoId !== null) {
        campoId.value = transacao === undefined ? '' : String(transacao.id);
    }
    if (campoDescricao !== null) {
        campoDescricao.value = transacao === undefined ? '' : transacao.descricao;
    }
    if (campoValor !== null) {
        campoValor.value = transacao === undefined ? '' : String(transacao.valor);
    }
    if (campoTipo !== null) {
        campoTipo.value = transacao === undefined ? 'despesa' : transacao.tipo;
    }
    if (campoData !== null) {
        campoData.value = transacao === undefined ? '' : transacao.data_transacao;
    }
    if (campoConta !== null) {
        campoConta.value = transacao === undefined ? '' : String(transacao.conta_id);
    }
    if (campoCategoria !== null) {
        campoCategoria.value = transacao === undefined ? '' : String(transacao.categoria_id);
    }

    abrirModal('modalTransacao');
}

export function configurarFormularioTransacao(): void {
    const formulario = elementoDeFormulario('transacaoForm');
    if (formulario === null) {
        return;
    }

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const campoId = elementoPorId<HTMLInputElement>('transacaoId');
        const idEdicao = campoId !== null ? Number(campoId.value) : 0;

        const formData = new FormData(formulario);

        const dados = {
            descricao: String(formData.get('descricao') ?? ''),
            valor: Number(String(formData.get('valor') ?? '0').replace(',', '.')),
            tipo: String(formData.get('tipo') ?? 'despesa'),
            data_transacao: String(formData.get('data_transacao') ?? ''),
            conta_id: Number(formData.get('conta_id') ?? 0),
            categoria_id: Number(formData.get('categoria_id') ?? 0),
        };

        try {
            if (idEdicao > 0) {
                await atualizarRegistro(URL_TRANSACOES, idEdicao, dados);
                exibirAlerta('Transação atualizada com sucesso.', 'success');
            } else {
                await criarRegistro<RespostaCriacao>(URL_TRANSACOES, dados);
                exibirAlerta('Transação criada com sucesso.', 'success');
            }
            fecharModal('modalTransacao');
            formulario.reset();
            await renderizarTransacoes();
        } catch (erro) {
            void erro;
        }
    });
}