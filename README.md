# Finanças Pessoais — Documentação do Projeto

Sistema de **Gestão de Finanças Pessoais** desenvolvido para o 3º período (Banco de Dados Avançado + Desenvolvimento Web Avançado + Lógica Avançada + Tech Forge).

**Stack:** PHP (PDO) · MariaDB · TypeScript · Bootstrap 5 · Docker

---

## 1. Estrutura do Projeto

```
projeto_3b/
├── .env                          # Credenciais do MariaDB (Docker)
├── compose.yaml                  # MariaDB (3313) + PHP/Apache (8080)
├── Dockerfile                    # Imagem PHP 8.3 + Apache + pdo_mysql
├── index.php                     # Redireciona / → /frontend/index.php
├── database/
│   └── schema.sql                # Tabelas, triggers, function, views, stored procedure
├── backend/
│   ├── config.php                # Conexão PDO + helpers de JSON/CORS
│   └── api/
│       ├── categorias.php        # CRUD categorias
│       ├── contas.php            # CRUD contas
│       ├── transacoes.php        # CRUD transações
│       └── dashboard.php         # Chama a Stored Procedure sp_dashboard
└── frontend/
    ├── index.php                 # Monta a página via componentes PHP
    ├── componentes/              # Componentes PHP reutilizáveis (template)
    │   ├── head.php              # <head> + Bootstrap CSS + Bootstrap Icons
    │   ├── navbar.php            # Navegação
    │   ├── secao_dashboard.php   # Dashboard (filtros, métricas, ranking)
    │   ├── secao_categorias.php  # CRUD Categorias
    │   ├── secao_contas.php      # CRUD Contas
    │   ├── secao_transacoes.php  # CRUD Transações
    │   ├── modal_categoria.php   # Modal Categoria
    │   ├── modal_conta.php       # Modal Conta
    │   ├── modal_transacao.php   # Modal Transação
    │   └── scripts.php           # <script type="module">
    ├── src/
    │   ├── types.ts              # Contratos de interface (tipagem estrita)
    │   ├── app.ts                # Ponto de entrada dos módulos
    │   └── css/style.css         # Design tokens + estilos
    ├── dist/                     # JS compilado (gerado pelo tsc)
    └── tsconfig.json             # Configuração strict do TypeScript
```

---

## 2. Como Rodar

### 2.1 Tudo via Docker (recomendado — banco + API + frontend)

Na raiz do projeto:

```bash
docker compose up -d --build
```

Este comando sobe **dois containers**:

| Container           | Função                                                        | Acesso              |
| ------------------- | ------------------------------------------------------------- | ------------------- |
| `mariadb-projeto-3b`| **MariaDB 10.4** — importa o `schema.sql` no primeiro boot    | porta `3313`        |
| `app-projeto-3b`    | **PHP 8.3 + Apache** — serve o frontend e a API               | porta `8080`        |

- O serviço `web` só inicia depois que o MariaDB estiver **saudável** (healthcheck).
- As credenciais/bancos são definidos em `.env` (`root` / `senha_secreta` / `projeto_3b`).

**Abra no navegador:** **http://127.0.0.1:8080/**

O `index.php` na raiz redireciona automaticamente para o frontend (`/frontend/index.php`). O container `web` possui o `pdo_mysql` habilitado, então a API funciona sem configuração extra.

> A porta **3313** foi escolhida para não conflitar com o container `mariadb-projeto`
> (porta 3312) usado pelo projeto de referência `Projeto3Bimestre2026`.

### 2.2 (Alternativa) Servidor PHP local

Se preferir rodar o PHP diretamente na máquina (sem o container `web`):

```bash
php -d extension=pdo_mysql -S 127.0.0.1:8080
```

> O comando roda em **primeiro plano**: mantenha o terminal aberto e abra o navegador em outro.
> Se `pdo_mysql` já estiver habilitado no `php.ini` do sistema, use apenas `php -S 127.0.0.1:8080`.

Abra: **http://127.0.0.1:8080/**

O caminho relativo `../backend/api/...` usado no frontend resolve corretamente porque a raiz do servidor é a pasta do projeto.

### 2.3 Compilar o TypeScript

Na pasta `frontend/`:

```bash
tsc                # compila uma vez
tsc --watch        # compila automaticamente a cada alteração
```

Saída gerada em `frontend/dist/` — Webpack-free (**ES Modules**): `app.js` (entrada) + módulos (`config.js`, `dados.js`, `componentes/*.js`, `cruds/*.js`, `dashboard/*.js`, `utils/*.js`, `types.js`).

---

## 3. Banco de Dados (schema.sql)

### Tabelas

| Tabela       | Campos principais                                                        |
| ------------ | ------------------------------------------------------------------------ |
| `categorias` | `id`, `nome`, `descricao`, `tipo` (`receita`/`despesa`), `ativo`         |
| `contas`     | `id`, `nome`, `tipo` (`corrente`/`poupanca`/`credito`), `saldo`, `ativo` |
| `transacoes` | `id`, `conta_id` (FK), `categoria_id` (FK), `descricao`, `valor`, `tipo`, `data_transacao` |

### Trigger
- `trg_transacoes_before_update` e `trg_transacoes_before_insert` — garantem `valor` sempre positivo usando `ABS(NEW.valor)`.

### Function
- `fn_calcular_imposto(valor, aliquota)` — aplica uma taxa/imposto sobre um valor. Ex.: `SELECT fn_calcular_imposto(100.00, 0.10)` → `110.00`.

### Views
1. `vw_saldo_consolidado` — usa **CTE** para calcular saldo consolidado por conta (receitas − despesas + saldo inicial).
2. `vw_transacoes_completa` — unifica transações com nomes de categoria e conta (dados de tabelas distintas).

### Stored Procedure
- `sp_dashboard(data_inicio, data_fim, categoria_id, conta_id, limite, offset)` retorna **3 conjuntos de resultados**:
  1. Transações filtradas e **paginadas** (com categoria e conta associadas);
  2. **Totais** do período: receitas, despesas e saldo líquido;
  3. **Totais por categoria** (ranking/gastos).

---

## 4. API (JSON)

| Endpoint              | Métodos                     | Ação                                   |
| --------------------- | --------------------------- | -------------------------------------- |
| `api/categorias.php`  | GET / POST / PUT / DELETE   | CRUD de categorias                     |
| `api/contas.php`      | GET / POST / PUT / DELETE   | CRUD de contas                         |
| `api/transacoes.php`  | GET / POST / PUT / DELETE   | CRUD de transações (aceita filtros)    |
| `api/dashboard.php`   | GET                         | `CALL sp_dashboard(...)` → JSON        |

**Regras de exclusão:** categorias/contas com transações vinculadas não podem ser excluídas — a API retorna uma mensagem clara (HTTP 409):
> "Não é possível excluir esta categoria porque existem transações vinculadas a ela."

---

## 5. Frontend (TypeScript)

- **Tipagem estrita**: interfaces em `types.ts` mapeiam 100% do JSON do PHP (`Categoria`, `Conta`, `Transacao`, `DashboardResponse`, etc.) — **sem `any`**.
- **Fetch assíncrono**: `async/await` com `try/catch` em todas as chamadas.
- **Dashboard:**
  - **`reduce()`** → totais de receitas, despesas e saldo líquido (`calcularTotaisPorTransacoes`);
  - **`filter()`** → despesas do mês atual, despesas acima de um valor;
  - **`map()`** → formatação de moeda `R$ 0,00` e datas `DD/MM/AAAA`;
  - **Ranking/Frequência** → objeto chave-valor contando ocorrências por categoria (`calcularFrequenciaCategorias`) + `reduce()` para achar o maior gasto;
  - **Edge cases** → "Nenhum dado registrado" para array vazio; DOM tratado com checagens `if` (sem `!`).
- **DOM seguro**: helper `elementoPorId` retorna `T | null` e todas as renderizações validam a existência do elemento.

### Interface
- Layout responsivo com **Bootstrap 5** (Navbar, Cards, Table, Modal, Badges, Alerts → mais de 3 componentes).
- **Template único** com navegação entre seções (Dashboard / Categorias / Contas / Transações).
- CSS com **design tokens** (variáveis teal/esmeralda + neutros quentes), tipografia display **Sora** + corpo **Inter**, **Bootstrap Icons** nos cards de métrica, responsivo e sem poluição visual.

---

## 6. Mapeamento com a Rubrica

| Critério                                              | Onde está                                             |
| ----------------------------------------------------- | ----------------------------------------------------- |
| CTEs e Views analíticas                               | `vw_saldo_consolidado` (CTE) + `vw_transacoes_completa` |
| Stored Procedure com filtros e paginação              | `sp_dashboard` em `schema.sql` + `api/dashboard.php`  |
| Trigger `BEFORE UPDATE` (valor positivo)              | `trg_transacoes_before_update`                        |
| Function reutilizável                                 | `fn_calcular_imposto`                                 |
| View centralizando tabelas distintas                  | `vw_transacoes_completa`                              |
| 3 CRUDs completos                                     | Categorias, Contas e Transações                       |
| Regras de exclusão com mensagens claras               | `DELETE` nas APIs (HTTP 409 + mensagem)               |
| Tipagem estrita TS (sem `any`)                        | `frontend/src/types.ts`                               |
| `reduce`, `filter`, `map`                             | Funções da seção Dashboard em `dashboard/dashboard.ts` |
| Algoritmo de ranking/frequência                       | `calcularFrequenciaCategorias` + `identificarCategoriaMaiorGasto` |
| Edge cases / arrays vazios                            | `exibirLinhaVazia` + tratamento em todas as listas    |
| Fetch async/await + try/catch                         | Helpers `requisicaoJson`/`requisicaoCorpo`/`requisicaoSemDados` |
| DOM sem `!` (checagens condicionais)                  | Helpers `elementoPorId`/`noElemento` + toda renderização |
| Bootstrap (≥3 componentes)                            | Cards, Table, Modal, Badges, Alerts, Navbar           |
| Template reutilizável / boa estrutura                 | Componentes PHP em `/frontend/componentes/` + seções por `data-secao` + módulos TS separados |
| Docker (em vez de XAMPP)                              | `compose.yaml` + `Dockerfile` — MariaDB + PHP/Apache  |