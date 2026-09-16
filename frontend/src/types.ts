export type TipoRegistro = 'receita' | 'despesa';

export type TipoConta = 'corrente' | 'poupanca' | 'credito';

export type PerfilUsuario = 'admin' | 'usuario';

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    perfil: PerfilUsuario;
    ativo: boolean;
    criado_em: string;
}

export interface SessaoUsuario {
    id: number;
    nome: string;
    email: string;
    perfil: PerfilUsuario;
}

export interface Categoria {
    id: number;
    nome: string;
    descricao: string | null;
    tipo: TipoRegistro;
    ativo: boolean;
    criado_em: string;
}

export interface Conta {
    id: number;
    nome: string;
    tipo: TipoConta;
    saldo: number;
    ativo: boolean;
    criado_em: string;
}

export interface Transacao {
    id: number;
    descricao: string;
    valor: number;
    tipo: TipoRegistro;
    data_transacao: string;
    conta_id: number;
    conta_nome: string;
    categoria_id: number;
    categoria_nome: string;
}

export interface DashboardTotais {
    total_receitas: number;
    total_despesas: number;
    saldo_liquido: number;
    total_transacoes: number;
}

export interface CategoriaGasto {
    categoria_id: number;
    categoria_nome: string;
    total_despesas: number;
    total_receitas: number;
    total_transacoes: number;
}

export interface DashboardResponse {
    success: boolean;
    message?: string;
    transacoes: Transacao[];
    totais: DashboardTotais;
    por_categoria: CategoriaGasto[];
}

export interface RespostaApi<T> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface RespostaCriacao {
    success: boolean;
    message: string;
    id: number;
}

export interface TransacaoExibicao {
    id: number;
    descricao: string;
    valor: number;
    tipo: TipoRegistro;
    valorFormatado: string;
    dataFormatada: string;
    contaNome: string;
    categoriaNome: string;
}

export interface CategoriaRanking {
    categoriaId: number;
    nome: string;
    total: number;
    totalFormatado: string;
    quantidade: number;
}

export interface FrequenciaCategoria {
    totalOcorrencias: number;
    totalGasto: number;
}

export interface FiltrosDashboard {
    data: string;
    categoriaId: number;
    contaId: number;
}
