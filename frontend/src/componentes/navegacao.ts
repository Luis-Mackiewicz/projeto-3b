function alternarSecao(secaoAtiva: string): void {
    const secoes = document.querySelectorAll<HTMLElement>('[data-secao]');
    secoes.forEach((secao) => {
        const alvo = secao.dataset.secao;
        const ativa = alvo === secaoAtiva;
        secao.classList.toggle('d-none', !ativa);
    });

    const botoesNav = document.querySelectorAll<HTMLButtonElement>('[data-navegar]');
    botoesNav.forEach((botao) => {
        const ativo = botao.dataset.navegar === secaoAtiva;
        botao.classList.toggle('active', ativo);
        botao.setAttribute('aria-current', ativo ? 'page' : 'false');
    });
}

export function configurarNavegacao(): void {
    const itensNav = document.querySelectorAll<HTMLButtonElement>('[data-navegar]');
    itensNav.forEach((botao) => {
        botao.addEventListener('click', () => {
            const alvo = botao.dataset.navegar;
            if (alvo !== undefined) {
                alternarSecao(alvo);
            }
        });
    });
}
