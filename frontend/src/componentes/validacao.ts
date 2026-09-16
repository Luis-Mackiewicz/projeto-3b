import { elementoPorId } from '../utils/dom.js';

export interface RegraCampo {
    id: string;
    erroId: string;
    validar: (valor: string) => string | null;
}

export function definirErroCampo(inputId: string, erroId: string, mensagem: string | null): void {
    const input = elementoPorId<HTMLInputElement>(inputId);
    const erro = elementoPorId<HTMLDivElement>(erroId);

    if (input !== null) {
        input.classList.toggle('is-invalid', mensagem !== null);
    }
    if (erro !== null) {
        erro.textContent = mensagem ?? '';
    }
}

export function limparErros(regras: RegraCampo[]): void {
    regras.forEach((regra) => definirErroCampo(regra.id, regra.erroId, null));
}

export function validarRegras(regras: RegraCampo[]): boolean {
    let valido = true;

    regras.forEach((regra) => {
        const input = elementoPorId<HTMLInputElement>(regra.id);
        const valor = input !== null ? input.value.trim() : '';
        const mensagem = regra.validar(valor);

        definirErroCampo(regra.id, regra.erroId, mensagem);

        if (mensagem !== null) {
            valido = false;
        }
    });

    return valido;
}

export function focarPrimeiroErro(container: HTMLElement): void {
    const invalido = container.querySelector<HTMLElement>('.is-invalid');
    if (invalido !== null) {
        invalido.focus();
    }
}

export function definirErroGeral(id: string, mensagem: string | null): void {
    const container = elementoPorId<HTMLDivElement>(id);
    if (container === null) {
        return;
    }

    if (mensagem !== null && mensagem !== '') {
        container.textContent = mensagem;
        container.classList.remove('d-none');
    } else {
        container.textContent = '';
        container.classList.add('d-none');
    }
}
