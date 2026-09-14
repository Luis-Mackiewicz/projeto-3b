export function elementoPorId<T extends HTMLElement>(id: string): T | null {
    const elemento = document.getElementById(id);
    return elemento instanceof HTMLElement ? (elemento as T) : null;
}

export function noElemento(id: string, acao: (elemento: HTMLElement) => void): void {
    const elemento = elementoPorId<HTMLElement>(id);
    if (elemento !== null) {
        acao(elemento);
    }
}

export function textoDoInput(id: string): string {
    const input = elementoPorId<HTMLInputElement>(id);
    if (input !== null) {
        return input.value.trim();
    }
    return '';
}

export function numeroDoInput(id: string): number {
    const valor = textoDoInput(id);
    const numero = Number(valor.replace(',', '.'));
    return Number.isFinite(numero) ? numero : 0;
}

export function elementoDeFormulario(idForm: string): HTMLFormElement | null {
    return elementoPorId<HTMLFormElement>(idForm);
}

function documento(): HTMLDivElement {
    const container = elementoPorId<HTMLDivElement>('areaAlertas');
    if (container !== null) {
        return container;
    }
    const novo = document.createElement('div');
    novo.id = 'areaAlertas';
    novo.className = 'area-alertas';
    document.body.appendChild(novo);
    return novo;
}

export function exibirAlerta(mensagem: string, tipo: 'success' | 'danger'): void {
    const container = documento();

    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.setAttribute('role', 'alert');

    const texto = document.createElement('span');
    texto.textContent = mensagem;
    alerta.appendChild(texto);

    const botaoFechar = document.createElement('button');
    botaoFechar.type = 'button';
    botaoFechar.className = 'btn-close';
    botaoFechar.setAttribute('data-bs-dismiss', 'alert');
    alerta.appendChild(botaoFechar);

    container.appendChild(alerta);

    window.setTimeout(() => {
        alerta.remove();
    }, 4500);
}

export function preencherSelect(selectId: string, opcoes: { valor: string; texto: string }[], placeholder: string): void {
    const select = elementoPorId<HTMLSelectElement>(selectId);
    if (select === null) {
        return;
    }

    select.innerHTML = '';

    const opcaoPadrao = document.createElement('option');
    opcaoPadrao.value = '';
    opcaoPadrao.textContent = placeholder;
    select.appendChild(opcaoPadrao);

    opcoes.forEach((opcao) => {
        const item = document.createElement('option');
        item.value = opcao.valor;
        item.textContent = opcao.texto;
        select.appendChild(item);
    });
}

export function exibirLinhaVazia(corpo: HTMLTableSectionElement, colunas: number, mensagem: string): void {
    const linha = document.createElement('tr');
    const celula = document.createElement('td');
    celula.colSpan = colunas;
    celula.className = 'text-center text-muted py-4';

    const icone = document.createElement('i');
    icone.className = 'bi bi-inbox empty-state-icon';
    celula.appendChild(icone);

    const legenda = document.createElement('span');
    legenda.className = 'empty-state-caption';
    legenda.textContent = mensagem;
    celula.appendChild(legenda);

    linha.appendChild(celula);
    corpo.appendChild(linha);
}
