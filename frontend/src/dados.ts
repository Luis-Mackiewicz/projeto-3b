import { URL_CATEGORIAS, URL_CONTAS } from './config.js';
import { requisicaoJson } from './utils/requisicoes.js';
import { preencherSelect } from './utils/dom.js';
import type { Categoria, Conta } from './types.js';

let cacheCategorias: Categoria[] = [];
let cacheContas: Conta[] = [];

export function obterCategoriasCache(): Categoria[] {
    return cacheCategorias;
}

export function obterContasCache(): Conta[] {
    return cacheContas;
}

export async function carregarCategorias(): Promise<Categoria[]> {
    cacheCategorias = await requisicaoJson<Categoria[]>(URL_CATEGORIAS);
    return cacheCategorias;
}

export async function carregarContas(): Promise<Conta[]> {
    cacheContas = await requisicaoJson<Conta[]>(URL_CONTAS);
    return cacheContas;
}

export function preencherFiltrosDashboard(): void {
    preencherSelect('filtroCategoria', cacheCategorias.map((c) => ({ valor: String(c.id), texto: c.nome })), 'Todas as categorias');
    preencherSelect('filtroConta', cacheContas.map((c) => ({ valor: String(c.id), texto: c.nome })), 'Todas as contas');
}

export function preencherSelectsTransacao(): void {
    preencherSelect('transacaoConta', cacheContas.map((c) => ({ valor: String(c.id), texto: c.nome })), 'Selecione a conta');
    preencherSelect('transacaoCategoria', cacheCategorias.map((c) => ({ valor: String(c.id), texto: c.nome })), 'Selecione a categoria');
}