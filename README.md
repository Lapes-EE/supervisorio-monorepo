# Supervisório Monorepo

## Visão Geral

Este é um **Sistema de Supervisório de Energia Elétrica** completo, desenvolvido como monorepo usando Turborepo. O sistema é responsável por coletar, armazenar e visualizar dados de telemetria de medidores elétricos, permitindo o monitoramento em tempo real da qualidade de energia em instalações industriais, comerciais ou prediais.

## O que o Sistema Faz

### Coleta de Dados
O sistema recebe dados de medidores de energia elétrica conectados via rede IP, coletando parâmetros como:
- Tensão (fase-neutro e fase-fase)
- Corrente (fases A, B, C e neutro)
- Potência (ativa, reativa e aparente)
- Fator de potência
- Frequência
- Temperatura
- Distorção Harmônica Total (THD)

### Monitoramento
- **Dashboard em Tempo Real**: Visualização instantânea dos parâmetros elétricos de todos os medidores
- **Layout de Edificação**: Representação geográfica dos medidores em planta baixa
- **Central de Alarmes**: Monitoramento de eventos e alarmes

### Análise
- **Gráficos Temporais**: Evolução dos parâmetros ao longo do tempo
- **Dados Históricos**: Consulta de medições passadas para análise de tendências
- **Comparação**: Análise comparativa entre diferentes medidores

### Gerenciamento
- **CRUD de Medidores**: Cadastro, edição, listagem e exclusão de medidores
- **Status de Ativos**: Controle de medidores ativos/inativos
- **Autenticação**: Sistema de login para acesso seguro

## Arquitetura do Projeto

```
.
├── apps/
│   ├── web/          # Frontend React (Vite + TanStack)
│   └── server/       # Backend Fastify (API REST)
├── packages/
│   └── env/          # Variáveis de ambiente compartilhadas
└── turbo.json       # Configuração Turborepo
```

## Tecnologias

### Build & Package
- **Turborepo**: Orquestração do monorepo
- **pnpm**: Gerenciador de pacotes

### Frontend
- **React**: Biblioteca de interface
- **Vite**: Build tool
- **TanStack Router**: Roteamento (file-based)
- **TanStack Query**: Gerenciamento de estado server
- **Tailwind CSS**: Estilização
- **Shadcn**: Componentes UI
- **Recharts**: Gráficos

### Backend
- **Fastify**: Framework web Node.js
- **PostgreSQL**: Banco de dados relacional
- **Drizzle ORM**: Mapeamento objeto-relacional
- **Zod**: Validação de dados

### Infraestrutura
- **Docker**: Containerização
- **TypeScript**: Linguagem tipada

## Pré-requisitos

- Node.js 20+
- pnpm 8+
- Docker e Docker Compose
- PostgreSQL (via Docker)

## Instalação

```bash
# Clone o repositório
git clone <URL>
cd supervisorio-monorepo

# Instale dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Inicie o banco de dados
docker-compose up -d

# Gere as migrações do banco
pnpm db:generate
pnpm db:migrate

# Inicie em desenvolvimento
pnpm dev
```

## Acesso à Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3333

## Scripts do Projeto

```bash
# Desenvolvimento
pnpm dev              # Inicia web e server

# Build
pnpm build            # Build de produção

# Banco de dados
pnpm db:generate      # Gera migrações
pnpm db:migrate       # Aplica migrações
pnpm db:studio        # Abre Drizzle Studio

# Qualidade de código
pnpm lint             # Executa linter

# API
pnpm api:generate     # Gera tipos da API
```

## Estrutura de Dados

### Medidor (Meter)
```typescript
{
  id: number;
  issoSerial: string;  // Serial do dispositivo
  name: string;        // Nome identificador
  ip: string;          // Endereço IP
  description?: string;
  active: boolean;
  createdAt: Date;
}
```

### Medição (Measure)
```typescript
{
  id: number;
  meterId: number;
  time: Date;
  // Tensão
  tensaoFaseNeutroA/B/C: number;
  tensaoFaseFaseAB/BC/CA: number;
  // Corrente
  correnteA/B/C: number;
  correnteNeutroMedido/Calculado: number;
  // Potência
  potenciaAtivaFundamental/Harmonica/Total: number;
  potenciaReativa: number;
  potenciaAparente: number;
  // Qualidade
  frequencia: number;
  fpReal/Deslocamento: number;
  thdTensao/Corrente: number;
  // Outro
  temperaturaSensorInterno: number;
}
```

## Licença

MIT License - Veja o arquivo [LICENSE](LICENSE) para detalhes.
