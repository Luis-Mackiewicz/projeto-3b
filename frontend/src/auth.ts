import { URL_AUTH } from './config.js';
import { abrirModal, configurarFechamentoModais } from './componentes/modais.js';
import { elementoPorId, elementoDeFormulario, textoDoInput, exibirAlerta } from './utils/dom.js';
import {
    definirErroCampo,
    definirErroGeral,
    focarPrimeiroErro,
    limparErros,
    validarRegras,
    type RegraCampo,
} from './componentes/validacao.js';

interface RespostaAuth {
    success?: boolean;
    message?: string;
    campos?: Record<string, string>;
}

interface ResultadoAuth {
    ok: boolean;
    message?: string;
    campos?: Record<string, string>;
}

interface MapaCampoServidor {
    campo: string;
    input: string;
    erro: string;
}

interface ConfiguracaoFormulario {
    formId: string;
    erroGeralId: string;
    regras: RegraCampo[];
    camposServidor: MapaCampoServidor[];
    rota: string;
    montarDados: () => unknown;
}

const REGEX_EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const REGRAS_LOGIN: RegraCampo[] = [
    {
        id: 'loginEmail',
        erroId: 'loginEmailErro',
        validar: (valor) => {
            if (valor === '') {
                return 'Informe seu e-mail.';
            }
            return REGEX_EMAIL.test(valor) ? null : 'Informe um e-mail válido.';
        },
    },
    {
        id: 'loginSenha',
        erroId: 'loginSenhaErro',
        validar: (valor) => (valor === '' ? 'Informe sua senha.' : null),
    },
];

const REGRAS_CADASTRO: RegraCampo[] = [
    {
        id: 'cadastroNome',
        erroId: 'cadastroNomeErro',
        validar: (valor) => (valor === '' ? 'Informe seu nome.' : null),
    },
    {
        id: 'cadastroEmail',
        erroId: 'cadastroEmailErro',
        validar: (valor) => {
            if (valor === '') {
                return 'Informe seu e-mail.';
            }
            return REGEX_EMAIL.test(valor) ? null : 'Informe um e-mail válido.';
        },
    },
    {
        id: 'cadastroSenha',
        erroId: 'cadastroSenhaErro',
        validar: (valor) => {
            if (valor === '') {
                return 'Informe uma senha.';
            }
            return valor.length < 6 ? 'A senha deve ter no mínimo 6 caracteres.' : null;
        },
    },
];

async function enviarAuth(rota: string, dados: unknown): Promise<ResultadoAuth> {
    try {
        const resposta = await fetch(`${URL_AUTH}?rota=${rota}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
        });

        let corpo: RespostaAuth;
        try {
            corpo = (await resposta.json()) as RespostaAuth;
        } catch (erro) {
            return { ok: false, message: 'O servidor retornou uma resposta inválida.' };
        }

        if (!resposta.ok || corpo.success !== true) {
            return {
                ok: false,
                message: corpo.message ?? 'Não foi possível concluir a operação.',
                campos: corpo.campos,
            };
        }

        return { ok: true, message: corpo.message };
    } catch (erro) {
        return { ok: false, message: 'Não foi possível conectar ao servidor.' };
    }
}

function configurarAberturaModais(): void {
    const gatilhos = document.querySelectorAll<HTMLElement>('[data-abrir-modal]');
    gatilhos.forEach((gatilho) => {
        gatilho.addEventListener('click', () => {
            const idModal = gatilho.dataset.abrirModal;
            if (idModal !== undefined) {
                abrirModal(idModal);
            }
        });
    });
}

function aplicarErrosServidor(config: ConfiguracaoFormulario, resultado: ResultadoAuth): void {
    const campos = resultado.campos;

    if (campos !== undefined) {
        config.camposServidor.forEach(({ campo, input, erro }) => {
            const mensagem = campos[campo];
            if (mensagem !== undefined) {
                definirErroCampo(input, erro, mensagem);
            }
        });
        definirErroGeral(config.erroGeralId, null);
        return;
    }

    definirErroGeral(config.erroGeralId, resultado.message ?? 'Não foi possível concluir a operação.');
}

function configurarFormulario(config: ConfiguracaoFormulario): void {
    const formulario = elementoDeFormulario(config.formId);
    if (formulario === null) {
        return;
    }

    let jaSubmeteu = false;

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        jaSubmeteu = true;

        limparErros(config.regras);
        definirErroGeral(config.erroGeralId, null);

        if (!validarRegras(config.regras)) {
            focarPrimeiroErro(formulario);
            return;
        }

        const resultado = await enviarAuth(config.rota, config.montarDados());

        if (resultado.ok) {
            window.location.reload();
            return;
        }

        aplicarErrosServidor(config, resultado);
        focarPrimeiroErro(formulario);
    });

    config.regras.forEach((regra) => {
        const input = elementoPorId<HTMLInputElement>(regra.id);
        if (input === null) {
            return;
        }

        input.addEventListener('input', () => {
            if (!jaSubmeteu) {
                return;
            }

            const mensagem = regra.validar(input.value.trim());
            definirErroCampo(regra.id, regra.erroId, mensagem);

            if (mensagem === null) {
                definirErroGeral(config.erroGeralId, null);
            }
        });
    });
}

function configurarFormularioLogin(): void {
    configurarFormulario({
        formId: 'loginForm',
        erroGeralId: 'loginErroGeral',
        regras: REGRAS_LOGIN,
        camposServidor: [],
        rota: 'login',
        montarDados: () => ({
            email: textoDoInput('loginEmail'),
            senha: textoDoInput('loginSenha'),
        }),
    });
}

function configurarFormularioCadastro(): void {
    configurarFormulario({
        formId: 'cadastroForm',
        erroGeralId: 'cadastroErroGeral',
        regras: REGRAS_CADASTRO,
        camposServidor: [
            { campo: 'nome', input: 'cadastroNome', erro: 'cadastroNomeErro' },
            { campo: 'email', input: 'cadastroEmail', erro: 'cadastroEmailErro' },
            { campo: 'senha', input: 'cadastroSenha', erro: 'cadastroSenhaErro' },
        ],
        rota: 'registrar',
        montarDados: () => ({
            nome: textoDoInput('cadastroNome'),
            email: textoDoInput('cadastroEmail'),
            senha: textoDoInput('cadastroSenha'),
        }),
    });
}

function configurarLogout(): void {
    const botao = elementoPorId<HTMLButtonElement>('btnSair');
    if (botao === null) {
        return;
    }

    botao.addEventListener('click', async () => {
        const resultado = await enviarAuth('logout', {});
        if (resultado.ok) {
            window.location.reload();
        } else {
            exibirAlerta(resultado.message ?? 'Não foi possível sair.', 'danger');
        }
    });
}

export function configurarAutenticacao(): void {
    configurarFechamentoModais();
    configurarAberturaModais();
    configurarFormularioLogin();
    configurarFormularioCadastro();
    configurarLogout();
}
