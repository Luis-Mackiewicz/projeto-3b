import { elementoPorId } from '../utils/dom.js';

export function abrirModal(idModal: string): void {
    const modal = elementoPorId<HTMLElement>(idModal);
    if (modal !== null) {
        modal.classList.add('show');
        modal.classList.add('d-block');
        modal.setAttribute('aria-hidden', 'false');
        const fundo = document.createElement('div');
        fundo.className = 'modal-backdrop fade show';
        modal.after(fundo);
    }
}

export function fecharModal(idModal: string): void {
    const modal = elementoPorId<HTMLElement>(idModal);
    if (modal !== null) {
        modal.classList.remove('show');
        modal.classList.remove('d-block');
        modal.removeAttribute('aria-hidden');
    }
    const backdrops = document.querySelectorAll<HTMLElement>('.modal-backdrop');
    backdrops.forEach((b) => b.remove());
}

export function configurarFechamentoModais(): void {
    const botoesFechar = document.querySelectorAll<HTMLElement>('[data-fechar-modal]');
    botoesFechar.forEach((botao) => {
        botao.addEventListener('click', () => {
            const alvo = botao.dataset.fecharModal;
            if (alvo !== undefined) {
                fecharModal(alvo);
            }
        });
    });
}
