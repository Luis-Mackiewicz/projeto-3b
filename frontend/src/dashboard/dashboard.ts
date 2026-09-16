import { URL_DASHBOARD, LIMITE_PAGINA } from '../config.js';
import { listarTransacoes } from '../cruds/transacoes.js';
import { elementoPorId, noElemento, textoDoInput, numeroDoInput, exibirAlerta, exibirLinhaVazia } from '../utils/dom.js';
import { formatarMoeda, transformarParaExibicao } from '../utils/format.js';
import type { Transacao, FiltrosDashboard, DashboardTotais, CategoriaRanking, FrequenciaCategoria, DashboardResponse } from '../types.js';

let offsetAtual = 0;
let filtrosAtuais: FiltrosDashboard = {
    dataInicio: '',
    dataFim: '',
    categoriaId: 0,
    contaId: 0,
};

let cacheTransacoes: Transacao[] = [];

function construirURLDashboard(offset: number): string {
    const parametros = new URLSearchParams();
    parametros.set('limite', String(LIMITE_PAGINA));
    parametros.set('offset', String(offset));

    if (filtrosAtuais.dataInicio !== '') {
        parametros.set('data_inicio', filtrosAtuais.dataInicio);
    }
    if (filtrosAtuais.dataFim !== '') {
        parametros.set('data_fim', filtrosAtuais.dataFim);
    }
    if (filtrosAtuais.categoriaId > 0) {
        parametros.set('categoria_id', String(filtrosAtuais.categoriaId));
    }
    if (filtrosAtuais.contaId > 0) {
        parametros.set('conta_id', String(filtrosAtuais.contaId));
    }

    return `${URL_DASHBOARD}?${parametros.toString()}`;
}

function calcularTotaisPorTransacoes(transacoes: Transacao[]): DashboardTotais {
    return transacoes.reduce(
        (acumulador, transacao) => {
            if (transacao.tipo === 'receita') {
                acumulador.total_receitas += transacao.valor;
            } else {
                acumulador.total_despesas += transacao.valor;
            }
            acumulador.total_transacoes += 1;
            return acumulador;
        },
        { total_receitas: 0, total_despesas: 0, saldo_liquido: 0, total_transacoes: 0 }
    );
}

function filtrarDespesasDoMesAtual(transacoes: Transacao[]): Transacao[] {
    const agora = new Date();
    const anoAtual = agora.getFullYear();
    const mesAtual = agora.getMonth();

    return transacoes.filter((t) => {
        if (t.tipo !== 'despesa') {
            return false;
        }
        const partes = t.data_transacao.split('-');
        const data = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
        return data.getFullYear() === anoAtual && data.getMonth() === mesAtual;
    });
}

function filtrarDespesasAcimaDe(transacoes: Transacao[], valorMinimo: number): Transacao[] {
    return transacoes.filter((t) => t.tipo === 'despesa' && t.valor >= valorMinimo);
}

function calcularFrequenciaCategorias(transacoes: Transacao[]): Record<number, FrequenciaCategoria> {
    return transacoes.reduce((frequencia, t) => {
        const registro = frequencia[t.categoria_id];

        if (registro === undefined) {
            frequencia[t.categoria_id] = {
                totalOcorrencias: 1,
                totalGasto: t.tipo === 'despesa' ? t.valor : 0,
            };
        } else {
            registro.totalOcorrencias += 1;
            if (t.tipo === 'despesa') {
                registro.totalGasto += t.valor;
            }
        }

        return frequencia;
    }, {} as Record<number, FrequenciaCategoria>);
}

function montarRankingPorFrequencia(transacoes: Transacao[]): CategoriaRanking[] {
    const contagem = calcularFrequenciaCategorias(transacoes);

    const itens = Object.entries(contagem).map(([idStr, dados]) => {
        const id = Number(idStr);
        const transacaoExemplo = transacoes.find((t) => t.categoria_id === id);

        return {
            categoriaId: id,
            nome: transacaoExemplo?.categoria_nome ?? 'Desconhecida',
            total: dados.totalGasto,
            totalFormatado: formatarMoeda(dados.totalGasto),
            quantidade: dados.totalOcorrencias,
        };
    });

    return itens
        .filter((item) => item.total > 0)
        .sort((a, b) => b.total - a.total);
}

function identificarCategoriaMaiorGasto(ranking: CategoriaRanking[]): CategoriaRanking | undefined {
    if (ranking.length === 0) {
        return undefined;
    }
    return ranking.reduce((maior, atual) => (atual.total > maior.total ? atual : maior));
}

function renderizarRankingTransacoes(ranking: CategoriaRanking[]): void {
    const maiorGasto = identificarCategoriaMaiorGasto(ranking);

    noElemento('metricaMaiorCategoria', (el) => {
        el.textContent = maiorGasto === undefined ? '—' : maiorGasto.nome;
    });
    noElemento('metricaValorMaiorCategoria', (el) => {
        el.textContent = maiorGasto === undefined ? 'Nenhum dado registrado' : maiorGasto.totalFormatado;
    });

    const corpoTabela = elementoPorId<HTMLTableSectionElement>('tabelaRankingBody');
    if (corpoTabela === null) {
        return;
    }

    corpoTabela.innerHTML = '';

    if (ranking.length === 0) {
        exibirLinhaVazia(corpoTabela, 4, 'Nenhum dado registrado.');
        return;
    }

    const maiorValor = ranking.length > 0 ? ranking[0].total : 0;

    ranking.forEach((item, indice) => {
        const linha = document.createElement('tr');
        const posicao = indice + 1;
        const largura = maiorValor > 0 ? Math.round((item.total / maiorValor) * 100) : 0;
        linha.innerHTML = `
            <td class="fw-semibold">${posicao}º</td>
            <td>
                <div class="fw-medium">${item.nome}</div>
                <div class="ranking-bar-track" role="presentation">
                    <div class="ranking-bar-fill" style="width: ${largura}%"></div>
                </div>
            </td>
            <td>${item.quantidade} transação(ões)</td>
            <td class="text-end fw-semibold">${item.totalFormatado}</td>`;
        corpoTabela.appendChild(linha);
    });
}

async function carregarTabelaDashboard(): Promise<void> {
    try {
        const resposta = await fetch(construirURLDashboard(offsetAtual));

        let corpo: DashboardResponse;
        try {
            corpo = (await resposta.json()) as DashboardResponse;
        } catch (erro) {
            exibirAlerta('Erro ao interpretar a resposta da dashboard.', 'danger');
            return;
        }

        if (!resposta.ok || corpo.success !== true) {
            exibirAlerta(corpo.message ?? 'Erro ao carregar a tabela da dashboard.', 'danger');
            return;
        }

        renderizarTabelaDashboard(corpo.transacoes);
    } catch (erro) {
        const mensagem = erro instanceof Error ? erro.message : 'Erro ao carregar tabela.';
        exibirAlerta(mensagem, 'danger');
    }
}

function renderizarTabelaDashboard(transacoes: Transacao[]): void {
    const corpoTabela = elementoPorId<HTMLTableSectionElement>('tabelaDashboardBody');
    const botaoMais = elementoPorId<HTMLButtonElement>('carregarMais');

    if (corpoTabela === null) {
        return;
    }

    if (offsetAtual === 0) {
        corpoTabela.innerHTML = '';
    }

    if (transacoes.length === 0 && offsetAtual === 0) {
        exibirLinhaVazia(corpoTabela, 6, 'Nenhuma transação registrada no período selecionado.');
        if (botaoMais !== null) {
            botaoMais.classList.add('d-none');
        }
        return;
    }

    const exibicao = transformarParaExibicao(transacoes);

    exibicao.forEach((transacao) => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${transacao.dataFormatada}</td>
            <td>${transacao.descricao}</td>
            <td><span class="badge ${transacao.tipo === 'receita' ? 'text-bg-success' : 'text-bg-danger'}">${transacao.tipo}</span></td>
            <td>${transacao.categoriaNome}</td>
            <td>${transacao.contaNome}</td>
            <td class="text-end">${transacao.valorFormatado}</td>`;
        corpoTabela.appendChild(linha);
    });

    if (botaoMais !== null) {
        botaoMais.classList.remove('d-none');
        botaoMais.classList.toggle('d-none', transacoes.length < LIMITE_PAGINA);
    }
}

function definirMetricaMoeda(id: string, idSub: string, valor: number, mensagemVazia: string): void {
    noElemento(id, (el) => { el.textContent = formatarMoeda(valor); });
    noElemento(idSub, (el) => { el.textContent = valor === 0 ? mensagemVazia : ''; });
}

function renderizarMetricasDashboard(
    totais: DashboardTotais,
    despesasMesAtual: number,
    ranking: CategoriaRanking[]
): void {
    definirMetricaMoeda('metricaReceitas', 'metricaReceitasSub', totais.total_receitas, 'Nenhuma receita registrada.');
    definirMetricaMoeda('metricaDespesas', 'metricaDespesasSub', totais.total_despesas, 'Nenhuma despesa registrada.');
    noElemento('metricaTotalTransacoes', (el) => { el.textContent = String(totais.total_transacoes); });
    noElemento('metricaDespesasMesAtual', (el) => { el.textContent = String(despesasMesAtual); });

    const elementoSaldo = elementoPorId<HTMLElement>('metricaSaldo');
    if (elementoSaldo !== null) {
        elementoSaldo.textContent = formatarMoeda(totais.saldo_liquido);
        const positivo = totais.saldo_liquido >= 0;
        elementoSaldo.classList.toggle('text-success', positivo);
        elementoSaldo.classList.toggle('text-danger', !positivo);
    }
    noElemento('metricaSaldoSub', (el) => {
        el.textContent = totais.total_transacoes === 0 ? 'Sem movimentações no período.' : '';
    });

    renderizarRankingTransacoes(ranking);
}

export async function carregarDashboard(): Promise<void> {
    try {
        cacheTransacoes = await listarTransacoes();
    } catch (erro) {
        const mensagem = erro instanceof Error ? erro.message : 'Erro ao carregar transações.';
        exibirAlerta(mensagem, 'danger');
        return;
    }

    const totais = calcularTotaisPorTransacoes(cacheTransacoes);
    totais.saldo_liquido = totais.total_receitas - totais.total_despesas;

    const despesasMesAtual = filtrarDespesasDoMesAtual(cacheTransacoes);

    const ranking = montarRankingPorFrequencia(cacheTransacoes);

    renderizarMetricasDashboard(totais, despesasMesAtual.length, ranking);

    offsetAtual = 0;
    await carregarTabelaDashboard();
}

export function configurarFiltrosDashboard(): void {
    const botaoFiltrar = elementoPorId<HTMLButtonElement>('aplicarFiltros');
    const botaoLimpar = elementoPorId<HTMLButtonElement>('limparFiltros');
    const botaoMais = elementoPorId<HTMLButtonElement>('carregarMais');

    if (botaoFiltrar !== null) {
        botaoFiltrar.addEventListener('click', () => {
            filtrosAtuais = {
                dataInicio: textoDoInput('filtroDataInicio'),
                dataFim: textoDoInput('filtroDataFim'),
                categoriaId: numeroDoInput('filtroCategoria'),
                contaId: numeroDoInput('filtroConta'),
            };
            carregarDashboard();
        });
    }

    if (botaoLimpar !== null) {
        botaoLimpar.addEventListener('click', () => {
            noElemento('filtroDataInicio', (el) => { (el as HTMLInputElement).value = ''; });
            noElemento('filtroDataFim', (el) => { (el as HTMLInputElement).value = ''; });
            noElemento('filtroCategoria', (el) => { (el as HTMLSelectElement).value = ''; });
            noElemento('filtroConta', (el) => { (el as HTMLSelectElement).value = ''; });
            filtrosAtuais = { dataInicio: '', dataFim: '', categoriaId: 0, contaId: 0 };
            carregarDashboard();
        });
    }

    if (botaoMais !== null) {
        botaoMais.addEventListener('click', async () => {
            if (botaoMais.disabled) {
                return;
            }
            botaoMais.disabled = true;
            offsetAtual += LIMITE_PAGINA;
            await carregarTabelaDashboard();
            botaoMais.disabled = false;
        });
    }
}