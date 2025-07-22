# Supervisório Monorepo

## Descrição

Este é um projeto monorepo que consiste em um frontend em React e um backend em Fastify. O objetivo é fornecer uma interface para visualização e gerenciamento de dados de telemetria.

## Estrutura do Projeto

```
.
├── apps
│   ├── server/ (Backend Fastify)
│   └── web/    (Frontend React)
├── packages
│   └── env/    (Variáveis de ambiente compartilhadas)
└── ...
```

## Tecnologias Utilizadas

- **Build Tool:** [Turborepo](https://turbo.build/repo)
- **Package Manager:** [pnpm](https://pnpm.io/)
- **Frontend:**
  - [React](https://react.dev/)
  - [Vite](https://vitejs.dev/)
  - [TanStack Router](https://tanstack.com/router)
  - [TanStack Query](https://tanstack.com/query)
  - [Tailwind CSS](https://tailwindcss.com/)
- **Backend:**
  - [Fastify](https://fastify.dev/)
  - [PostgreSQL](https://www.postgresql.org/)
  - [Drizzle ORM](https://orm.drizzle.team/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Containerização:** [Docker](https://www.docker.com/)

## Como Começar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 20 ou superior)
- [pnpm](https://pnpm.io/installation)
- [Docker](https://docs.docker.com/get-docker/)

### Instalação

1.  **Clone o repositório:**

    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd supervisorio-monorepo
    ```

2.  **Instale as dependências:**

    ```bash
    pnpm install
    ```

3.  **Configure as variáveis de ambiente:**

    Crie um arquivo `.env` na raiz do projeto, seguindo o exemplo do `.env.example`.

    ```env
    DATABASE_URL="postgresql://user:password@host:port/database"
    ```

4.  **Inicie o banco de dados com Docker:**

    ```bash
    docker-compose up -d
    ```

5.  **Rode as gerações do banco de dados:**

    ```bash
    pnpm db:generate
    ```

6.  **Rode as migrações do banco de dados:**

    ```bash
    pnpm db:migrate
    ```

### Rodando em Desenvolvimento

Para iniciar os aplicativos `web` e `server` em modo de desenvolvimento, execute:

```bash
pnpm dev
```

- O frontend estará disponível em `http://localhost:3000`.
- O backend estará disponível em `http://localhost:3333`.

## Scripts Principais

- `pnpm dev`: Inicia os aplicativos em modo de desenvolvimento.
- `pnpm build`: Gera a build de produção para todos os aplicativos.
- `pnpm lint`: Executa o linter em todos os pacotes.
- `pnpm db:generate`: Gera os arquivos de migração do Drizzle ORM.
- `pnpm db:migrate`: Aplica as migrações no banco de dados.
- `pnpm db:studio`: Abre o Drizzle Studio para visualizar e gerenciar o banco de dados.
- `pnpm api:generate`: Executa o gerador de funções da API

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
