# Server

Este é o servidor do projeto, responsável por gerenciar a comunicação com o banco de dados, fornecer endpoints para o cliente e processar os dados de telemetria dos medidores.

## Bibliotecas Dependentes

O projeto utiliza as seguintes bibliotecas principais:

- **[Fastify](https://www.fastify.io/):** Um framework web de alta performance para Node.js.
- **[Drizzle ORM](https://orm.drizzle.team/):** Um ORM TypeScript que oferece uma experiência de desenvolvimento moderna e segura para bancos de dados SQL.
- **[Zod](https://zod.dev/):** Uma biblioteca de validação de esquemas para TypeScript.
- **[Postgres.js](https://github.com/porsager/postgres):** Um cliente PostgreSQL de alta performance para Node.js.

## Estrutura de Arquivos

A estrutura de arquivos do servidor está organizada da seguinte forma:

```
/
├── drizzle.config.ts
├── package.json
├── tsconfig.json
└── src/
    ├── server.ts
    ├── db/
    │   ├── connections.ts
    │   ├── migrations/
    │   └── schema/
    └── http/
        ├── routes/
        └── types/
```

- **`drizzle.config.ts`**: Arquivo de configuração para o Drizzle ORM.
- **`package.json`**: Define os metadados do projeto e as dependências.
- **`tsconfig.json`**: Arquivo de configuração do TypeScript.
- **`src/`**: Contém o código-fonte da aplicação.
- **`src/server.ts`**: Ponto de entrada da aplicação, onde o servidor Fastify é inicializado.
- **`src/db/`**: Contém todos os arquivos relacionados ao banco de dados.
- **`src/db/connections.ts`**: Estabelece a conexão com o banco de dados.
- **`src/db/migrations/`**: Armazena os arquivos de migração do banco de dados gerados pelo Drizzle.
- **`src/db/schema/`**: Define os esquemas do banco de dados utilizando o Drizzle ORM.
- **`src/http/`**: Contém os arquivos relacionados ao servidor HTTP.
- **`src/http/routes/`**: Define as rotas da API.
- **`src/http/types/`**: Define os tipos de dados utilizados nas rotas.

## Scripts Disponíveis

- **`pnpm dev`**: Inicia o servidor em modo de desenvolvimento com hot-reload.
- **`pnpm build`**: Compila o código TypeScript para produção.
- **`pnpm db:generate`**: Gera novos arquivos de migração do banco de dados com base nas alterações do esquema.
- **`pnpm db:migrate`**: Aplica as migrações pendentes no banco de dados.
- **`pnpm db:studio`**: Abre o Drizzle Studio para visualizar e gerenciar o banco de dados.
