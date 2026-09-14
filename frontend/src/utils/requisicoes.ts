import type { RespostaApi } from '../types.js';
import { exibirAlerta } from './dom.js';

export async function requisicaoJson<T>(url: string, opcoes?: RequestInit): Promise<T> {
    const resposta = await fetch(url, opcoes);

    let corpo: RespostaApi<T>;
    try {
        corpo = (await resposta.json()) as RespostaApi<T>;
    } catch (erro) {
        throw new Error('O servidor retornou uma resposta inválida.');
    }

    if (!resposta.ok || corpo.success !== true) {
        throw new Error(corpo.message ?? 'Erro desconhecido na operação.');
    }

    if (corpo.data === undefined) {
        throw new Error('A resposta do servidor não contém dados.');
    }

    return corpo.data;
}

async function requisicaoCorpo<T>(url: string, opcoes?: RequestInit): Promise<T> {
    const resposta = await fetch(url, opcoes);

    let corpo: T & { success?: boolean; message?: string };
    try {
        corpo = (await resposta.json()) as T & { success?: boolean; message?: string };
    } catch (erro) {
        throw new Error('O servidor retornou uma resposta inválida.');
    }

    if (!resposta.ok || corpo.success !== true) {
        throw new Error(corpo.message ?? 'Erro desconhecido na operação.');
    }

    return corpo;
}

export async function requisicaoSemDados(url: string, opcoes?: RequestInit): Promise<string> {
    const resposta = await fetch(url, opcoes);

    let corpo: { success?: boolean; message?: string };
    try {
        corpo = (await resposta.json()) as { success?: boolean; message?: string };
    } catch (erro) {
        throw new Error('O servidor retornou uma resposta inválida.');
    }

    if (!resposta.ok || corpo.success !== true) {
        throw new Error(corpo.message ?? 'Erro desconhecido na operação.');
    }

    return corpo.message ?? 'Operação concluída com sucesso.';
}

export async function criarRegistro<T>(endpoint: string, dados: unknown): Promise<T> {
    try {
        return await requisicaoCorpo<T>(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
        });
    } catch (erro) {
        const mensagem = erro instanceof Error ? erro.message : 'Erro ao criar registro.';
        exibirAlerta(mensagem, 'danger');
        throw erro;
    }
}

export async function atualizarRegistro<T>(endpoint: string, id: number, dados: unknown): Promise<T> {
    try {
        return await requisicaoCorpo<T>(`${endpoint}?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
        });
    } catch (erro) {
        const mensagem = erro instanceof Error ? erro.message : 'Erro ao atualizar registro.';
        exibirAlerta(mensagem, 'danger');
        throw erro;
    }
}

export async function excluirRegistro(endpoint: string, id: number): Promise<void> {
    try {
        const mensagem = await requisicaoSemDados(`${endpoint}?id=${id}`, { method: 'DELETE' });
        exibirAlerta(mensagem, 'success');
    } catch (erro) {
        const mensagem = erro instanceof Error ? erro.message : 'Erro ao excluir registro.';
        exibirAlerta(mensagem, 'danger');
        throw erro;
    }
}