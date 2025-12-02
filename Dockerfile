FROM node:22-alpine AS base
RUN apk update
RUN apk add --no-cache libc6-compat

WORKDIR /app

# ---- Configurar PNPM ----
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@9 --activate

# ----
FROM base AS prepare

RUN pnpm add -g turbo@2.5.5

COPY . .

RUN turbo prune @repo/server --docker

# ----
FROM base AS builder
WORKDIR /app

COPY --from=prepare /app/out/json/ .
COPY pnpm-lock.yaml .

RUN pnpm install --frozen-lockfile --prod=false

COPY --from=prepare /app/out/full/ .

RUN pnpm turbo build --filter=@repo/server...

# ----
FROM node:22-alpine AS supervisorio-server
RUN apk add --no-cache libc6-compat

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify
USER fastify

WORKDIR /app

COPY --from=builder /app .

COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3333

CMD ["node", "apps/server/dist/server.js"]
