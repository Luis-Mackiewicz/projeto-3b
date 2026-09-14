import { URL_CATEGORIAS } from '../config.js';
import { carregarCategorias, preencherFiltrosDashboard } from '../dados.js';
import { abrirModal, fecharModal } from '../componentes/modais.js';
import { criarRegistro, atualizarRegistro } from '../utils/requisicoes.js';
import { elementoPorId, elementoDeFormulario, textoDoInput, exibirAlerta, exibirLinhaVazia } from '../utils/dom.js';
import type { Categoria, RespostaCriacao } from '../types.js';

export async function renderizarCategorias(): Promise<void> {
    const corpoTabela = elementoPorId<HTMLTableSectionElement>('tabelaCategoriasBody');
    if (corpoTabela === null) {
        return;
    }

    corpoTabela.innerHTML = '';

    try {
        const categorias = await carregarCategorias();
        preencherFiltrosDashboard();

        if (categorias.length === 0) {
            exibirLinhaVazia(corpoTabela, 5, 'Nenhuma categoria cadastrada.');
            return;
        }

        categorias.forEach((categoria) => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${categoria.id}</td>
                <td>${categoria.nome}</td>
                <td>${categoria.descricao ?? '—'}</td>
                <td><span class="badge ${categoria.tipo === 'receita' ? 'text-bg-success' : 'text-bg-danger'}">${categoria.tipo}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-editar" data-tipo="categoria" data-id="${categoria.id}">Editar</button>
                    <button class="btn btn-sm btn-outline-danger btn-excluir" data-tipo="categoria" data-id="${categoria.id}">Excluir</button>
                </td>`;
            corpoTabela.appendChild(linha);
        });
    } catch (erro) {
        const mensagem = erro instanceof Error ? erro.message : 'Erro ao carregar categorias.';
        exibirAlerta(mensagem, 'danger');
    }
}

export function abrirModalCategoria(categoria?: Categoria): void {
    const titulo = elementoPorId<HTMLHeadElement>('modalCategoriaTitulo');
    const campoId = elementoPorId<HTMLInputElement>('categoriaId');
    const campoNome = elementoPorId<HTMLInputElement>('categoriaNome');
    const campoDescricao = elementoPorId<HTMLTextAreaElement>('categoriaDescricao');
    const campoTipo = elementoPorId<HTMLSelectElement>('categoriaTipo');

    if (titulo !== null) {
        titulo.textContent = categoria === undefined ? 'Nova Categoria' : 'Editar Categoria';
    }
    if (campoId !== null) {
        campoId.value = categoria === undefined ? '' : String(categoria.id);
    }
    if (campoNome !== null) {
        campoNome.value = categoria === undefined ? '' : categoria.nome;
    }
    if (campoDescricao !== null) {
        campoDescricao.value = categoria?.descricao ?? '';
    }
    if (campoTipo !== null) {
        campoTipo.value = categoria === undefined ? 'despesa' : categoria.tipo;
    }

    abrirModal('modalCategoria');
}

export function configurarFormularioCategoria(): void {
    const formulario = elementoDeFormulario('categoriaForm');
    if (formulario === null) {
        return;
    }

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const campoId = elementoPorId<HTMLInputElement>('categoriaId');
        const idEdicao = campoId !== null ? Number(campoId.value) : 0;

        const dados = {
            nome: textoDoInput('categoriaNome'),
            descricao: textoDoInput('categoriaDescricao'),
            tipo: new FormData(formulario).get('tipo') as string,
        };

        try {
            if (idEdicao > 0) {
                await atualizarRegistro(URL_CATEGORIAS, idEdicao, dados);
                exibirAlerta('Categoria atualizada com sucesso.', 'success');
            } else {
                await criarRegistro<RespostaCriacao>(URL_CATEGORIAS, dados);
                exibirAlerta('Categoria criada com sucesso.', 'success');
            }
            fecharModal('modalCategoria');
            formulario.reset();
            await renderizarCategorias();
        } catch (erro) {
            void erro;
        }
    });
}