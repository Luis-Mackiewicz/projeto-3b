import { configurarNavegacao } from './componentes/navegacao.js';
import { configurarFechamentoModais } from './componentes/modais.js';
import { carregarCategorias, carregarContas, preencherFiltrosDashboard, preencherSelectsTransacao } from './dados.js';
import { renderizarCategorias, abrirModalCategoria, configurarFormularioCategoria } from './cruds/categorias.js';
import { renderizarContas, abrirModalConta, configurarFormularioConta } from './cruds/contas.js';
import { renderizarTransacoes, abrirModalTransacao, configurarFormularioTransacao } from './cruds/transacoes.js';
import { configurarAcoesTabela } from './cruds/acoesTabela.js';
import { carregarDashboard, configurarFiltrosDashboard } from './dashboard/dashboard.js';
import { elementoPorId } from './utils/dom.js';

function configurarBotoesNovo(): void {
    const botaoNovaCategoria = elementoPorId<HTMLButtonElement>('botaoNovaCategoria');
    const botaoNovaConta = elementoPorId<HTMLButtonElement>('botaoNovaConta');
    const botaoNovaTransacao = elementoPorId<HTMLButtonElement>('botaoNovaTransacao');

    if (botaoNovaCategoria !== null) {
        botaoNovaCategoria.addEventListener('click', () => abrirModalCategoria());
    }
    if (botaoNovaConta !== null) {
        botaoNovaConta.addEventListener('click', () => abrirModalConta());
    }
    if (botaoNovaTransacao !== null) {
        botaoNovaTransacao.addEventListener('click', () => abrirModalTransacao());
    }
}

async function inicializarAplicacao(): Promise<void> {
    configurarNavegacao();
    configurarFechamentoModais();
    configurarAcoesTabela();
    configurarFormularioCategoria();
    configurarFormularioConta();
    configurarFormularioTransacao();
    configurarBotoesNovo();
    configurarFiltrosDashboard();

    await Promise.all([carregarCategorias(), carregarContas()]);
    preencherFiltrosDashboard();
    preencherSelectsTransacao();

    await renderizarCategorias();
    await renderizarContas();
    await renderizarTransacoes();
    await carregarDashboard();
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarAplicacao();
});