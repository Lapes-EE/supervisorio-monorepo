# Server API

Backend da aplicação de supervisão de energia elétrica, desenvolvido em Fastify com PostgreSQL e Drizzle ORM.

## O que é o Projeto

Este é um **Sistema de Supervisório de Energia Elétrica** que coleta, armazena e apresenta dados de telemetria de medidores elétricos. O sistema é responsável por:

- **Gerenciamento de Medidores**: Cadastro, edição, listagem e exclusão de medidores de energia
- **Coleta de Telemetria**: Recebimento e armazenamento de dados de medições elétricas
- **API REST**: Fornecimento de endpoints para o frontend consultar dados históricos e atuais

## Dados de Telemetria

O sistema armazena os seguintes parâmetros elétricos dos medidores:

### Tensão
- Tensão fase-neutro (A, B, C)
- Tensão fase-fase (AB, BC, CA)

### Corrente
- Corrente por fase (A, B, C)
- Corrente de neutro (medido e calculado)

### Potência
- Potência aparente (por fase e total aritmética/vetorial)
- Potência ativa (fundamental, harmônica, total)
- Potência reativa (por fase e total aritmética/vetorial)

### Qualidade de Energia
- Fator de potência (real e por deslocamento)
- THD - Distorção Harmônica Total (tensão e corrente)
- Frequência

### Outros
- Ângulos de fase (A, B, C)
- Ângulos phi
- Temperatura do sensor interno

## Tecnologias

- **Framework**: [Fastify](https://fastify.io/) - Servidor web de alta performance
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - ORM TypeScript moderno
- **Validação**: [Zod](https://zod.dev/) - Validação de esquemas
- **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/)
- **Cliente DB**: [Postgres.js](https://github.com/porsager/postgres)

## Estrutura de Arquivos

```
src/
├── server.ts                 # Ponto de entrada do servidor
├── db/
│   ├── connections.ts        # Conexão com PostgreSQL
│   ├── schema/
│   │   ├── meters.ts        # Schema de medidores
│   │   ├── measures.ts      # Schema de medições
│   │   ├── user.ts          # Schema de usuários
│   │   └── index.ts         # Exportações centralizadas
│   └── migrations/          # Migrações do banco
└── http/
    ├── routes/
    │   ├── login.ts          # Autenticação
    │   ├── get-meters.ts     # Listar medidores
    │   ├── create-meters.ts  # Criar medidor
    │   ├── update-meters.ts  # Atualizar medidor
    │   ├── delete-meters.ts  # Excluir medidor
    │   ├── change-meter-status.ts  # Ativar/desativar
    │   ├── get-telemetry-by-ip.ts  # Telemetria por IP
    │   └── get-database-telemetry.ts  # Dados históricos
    └── types/
        └── *.ts             # Tipos compartilhados
```

## API Endpoints

### Autenticação
- `POST /login` - Login de usuário

### Medidores
- `GET /meters` - Listar todos medidores
- `POST /meters` - Criar novo medidor
- `PUT /meters/:id` - Atualizar medidor
- `DELETE /meters/:id` - Excluir medidor
- `PATCH /meters/:id/status` - Ativar/desativar medidor

### Telemetria
- `GET /telemetry/:ip` - Obter telemetria atual por IP
- `GET /telemetry` - Listar dados históricos de telemetria

## Scripts

```bash
pnpm dev           # Inicia em modo desenvolvimento (hot-reload)
pnpm build         # Compila TypeScript para produção
pnpm db:generate   # Gera arquivos de migração
pnpm db:migrate    # Aplica migrações no banco
pnpm db:studio     # Abre Drizzle Studio
```

## Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

## Banco de Dados

O servidor utiliza PostgreSQL com as seguintes tabelas principais:

- **meters**: Medidores cadastrados (ID, serial, nome, IP, descrição, status)
- **measures**: Dados de medições (timestamp, valores de tensão, corrente, potência, etc.)
- **users**: Usuários do sistema para autenticação
