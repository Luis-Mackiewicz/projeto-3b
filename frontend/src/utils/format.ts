import type { Transacao, TransacaoExibicao } from '../types.js';

export function formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarData(dataISO: string): string {
    const partes = dataISO.split('-');
    if (partes.length !== 3) {
        return dataISO;
    }
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export function transformarParaExibicao(transacoes: Transacao[]): TransacaoExibicao[] {
    return transacoes.map((transacao) => ({
        id: transacao.id,
        descricao: transacao.descricao,
        valor: transacao.valor,
        tipo: transacao.tipo,
        valorFormatado: formatarMoeda(transacao.valor),
        dataFormatada: formatarData(transacao.data_transacao),
        contaNome: transacao.conta_nome,
        categoriaNome: transacao.categoria_nome,
    }));
}
