# Supervisório Web

Frontend da aplicação de supervisão de energia elétrica, desenvolvido em React com TanStack Router e TanStack Query.

## Funcionalidades

### Dashboard Principal (`/supervisorio`)
- **Monitor de Edificação**: Visualização geográfica dos medidores em um layout de planta baixa
- **Central de Alarmes**: Exibição de alarmes e eventos dos medidores em tempo real
- **Modo Tela Cheia**: Visualização em tela cheia para monitores dedicados

### Telemetria (`/telemetria`)
- **Lista de Medidores**: Visualização de todos os medidores cadastrados com status
- **Detalhes por Medidor**: dados detalhados de cada medidor incluindo:
  - Tensão (fase-neutro e fase-fase)
  - Corrente (fases A, B, C e neutro)
  - Potência (ativa, reativa e aparente)
  - Fator de potência
  - Frequência
  - Temperatura do sensor
  - THD (Distorção Harmônica Total)
- **Edição de Medidores**: Formulário para editar informações dos medidores

### Gráficos (`/gráficos`)
- **Visualização Gráfica**: Gráficos temporais dos parâmetros elétricos
- **Comparação de Medidores**: Análise comparativa entre diferentes medidores

### Configurações (`/settings`)
- **Gerenciamento de Medidores**: CRUD completo de medidores
- **Configurações por Medidor**: Parâmetros específicos de cada dispositivo

## Tecnologias

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Roteamento**: [TanStack Router](https://tanstack.com/router) (file-based routing)
- **Estado Server**: [TanStack Query](https://tanstack.com/query)
- **UI**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn](https://ui.shadcn.com/)
- **Gráficos**: [Recharts](https://recharts.org/)

## Estrutura de Rotas

```
src/routes/
├── __root.tsx              # Layout raiz
├── login/                  # Página de login
├── index.tsx               # Redirect para /supervisorio
├── full-plan.tsx           # Visualização em tela cheia
├── (dashboard)/
│   ├── route.tsx           # Layout do dashboard
│   ├── supervisorio/      # Dashboard principal
│   ├── telemetria/        # Lista e detalhes de medidores
│   ├── gráficos/          # Visualização gráfica
│   └── settings/          # Configurações
```

## Scripts

```bash
pnpm dev        # Inicia em modo desenvolvimento
pnpm build      # Build de produção
pnpm test       # Executa testes com Vitest
```

## Variáveis de Ambiente

O frontend se conecta à API em `http://localhost:3333` por padrão. Configure através do arquivo `.env` na raiz do projeto.
