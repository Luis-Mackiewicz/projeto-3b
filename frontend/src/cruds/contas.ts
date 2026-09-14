import { URL_CONTAS } from '../config.js';
import { carregarContas, preencherFiltrosDashboard } from '../dados.js';
import { abrirModal, fecharModal } from '../componentes/modais.js';
import { criarRegistro, atualizarRegistro } from '../utils/requisicoes.js';
import { elementoPorId, elementoDeFormulario, textoDoInput, numeroDoInput, exibirAlerta, exibirLinhaVazia } from '../utils/dom.js';
import { formatarMoeda } from '../utils/format.js';
import type { Conta, RespostaCriacao } from '../types.js';

export async function renderizarContas(): Promise<void> {
    const corpoTabela = elementoPorId<HTMLTableSectionElement>('tabelaContasBody');
    if (corpoTabela === null) {
        return;
    }

    corpoTabela.innerHTML = '';

    try {
        const contas = await carregarContas();
        preencherFiltrosDashboard();

        if (contas.length === 0) {
            exibirLinhaVazia(corpoTabela, 5, 'Nenhuma conta cadastrada.');
            return;
        }

        contas.forEach((conta) => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${conta.id}</td>
                <td>${conta.nome}</td>
                <td><span class="badge text-bg-secondary">${conta.tipo}</span></td>
                <td class="text-end">${formatarMoeda(conta.saldo)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-editar" data-tipo="conta" data-id="${conta.id}">Editar</button>
                    <button class="btn btn-sm btn-outline-danger btn-excluir" data-tipo="conta" data-id="${conta.id}">Excluir</button>
                </td>`;
            corpoTabela.appendChild(linha);
        });
    } catch (erro) {
        const mensagem = erro instanceof Error ? erro.message : 'Erro ao carregar contas.';
        exibirAlerta(mensagem, 'danger');
    }
}

export function abrirModalConta(conta?: Conta): void {
    const titulo = elementoPorId<HTMLHeadElement>('modalContaTitulo');
    const campoId = elementoPorId<HTMLInputElement>('contaId');
    const campoNome = elementoPorId<HTMLInputElement>('contaNome');
    const campoTipo = elementoPorId<HTMLSelectElement>('contaTipo');
    const campoSaldo = elementoPorId<HTMLInputElement>('contaSaldo');

    if (titulo !== null) {
        titulo.textContent = conta === undefined ? 'Nova Conta' : 'Editar Conta';
    }
    if (campoId !== null) {
        campoId.value = conta === undefined ? '' : String(conta.id);
    }
    if (campoNome !== null) {
        campoNome.value = conta === undefined ? '' : conta.nome;
    }
    if (campoTipo !== null) {
        campoTipo.value = conta === undefined ? 'corrente' : conta.tipo;
    }
    if (campoSaldo !== null) {
        campoSaldo.value = conta === undefined ? '' : String(conta.saldo);
    }

    abrirModal('modalConta');
}

export function configurarFormularioConta(): void {
    const formulario = elementoDeFormulario('contaForm');
    if (formulario === null) {
        return;
    }

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const campoId = elementoPorId<HTMLInputElement>('contaId');
        const idEdicao = campoId !== null ? Number(campoId.value) : 0;

        const dados = {
            nome: textoDoInput('contaNome'),
            tipo: new FormData(formulario).get('tipo') as string,
            saldo: numeroDoInput('contaSaldo'),
        };

        try {
            if (idEdicao > 0) {
                await atualizarRegistro(URL_CONTAS, idEdicao, dados);
                exibirAlerta('Conta atualizada com sucesso.', 'success');
            } else {
                await criarRegistro<RespostaCriacao>(URL_CONTAS, dados);
                exibirAlerta('Conta criada com sucesso.', 'success');
            }
            fecharModal('modalConta');
            formulario.reset();
            await renderizarContas();
        } catch (erro) {
            void erro;
        }
    });
}