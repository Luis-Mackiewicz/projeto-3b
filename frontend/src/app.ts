import { configurarNavegacao } from './componentes/navegacao.js';
import { configurarAutenticacao } from './auth.js';
import { carregarCategorias, carregarContas, preencherFiltrosDashboard, preencherSelectsTransacao } from './dados.js';
import { renderizarCategorias, abrirModalCategoria, configurarFormularioCategoria } from './cruds/categorias.js';
import { renderizarContas, abrirModalConta, configurarFormularioConta } from './cruds/contas.js';
import { renderizarTransacoes, abrirModalTransacao, configurarFormularioTransacao } from './cruds/transacoes.js';
import { renderizarUsuarios, abrirModalUsuario, configurarFormularioUsuario, configurarAcoesUsuario } from './cruds/usuarios.js';
import { configurarAcoesTabela } from './cruds/acoesTabela.js';
import { carregarDashboard, configurarFiltrosDashboard } from './dashboard/dashboard.js';
import { elementoPorId } from './utils/dom.js';

function configurarBotoesNovo(): void {
    const botaoNovaCategoria = elementoPorId<HTMLButtonElement>('botaoNovaCategoria');
    const botaoNovaConta = elementoPorId<HTMLButtonElement>('botaoNovaConta');
    const botaoNovaTransacao = elementoPorId<HTMLButtonElement>('botaoNovaTransacao');
    const botaoNovoUsuario = elementoPorId<HTMLButtonElement>('botaoNovoUsuario');

    if (botaoNovaCategoria !== null) {
        botaoNovaCategoria.addEventListener('click', () => abrirModalCategoria());
    }
    if (botaoNovaConta !== null) {
        botaoNovaConta.addEventListener('click', () => abrirModalConta());
    }
    if (botaoNovaTransacao !== null) {
        botaoNovaTransacao.addEventListener('click', () => abrirModalTransacao());
    }
    if (botaoNovoUsuario !== null) {
        botaoNovoUsuario.addEventListener('click', () => abrirModalUsuario());
    }
}

async function inicializarAplicacao(): Promise<void> {
    configurarAutenticacao();
    configurarNavegacao();
    configurarAcoesTabela();
    configurarAcoesUsuario();
    configurarFormularioCategoria();
    configurarFormularioConta();
    configurarFormularioTransacao();
    configurarFormularioUsuario();
    configurarBotoesNovo();
    configurarFiltrosDashboard();

    await Promise.all([carregarCategorias(), carregarContas()]);
    preencherFiltrosDashboard();
    preencherSelectsTransacao();

    await renderizarCategorias();
    await renderizarContas();
    await renderizarTransacoes();
    await carregarDashboard();

    if (elementoPorId<HTMLTableSectionElement>('tabelaUsuariosBody') !== null) {
        await renderizarUsuarios();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarAplicacao();
});
