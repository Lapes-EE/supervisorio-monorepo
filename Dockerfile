FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache libc6-compat

# ---------------------------------------------------
# Prune Stage: Isolate the target project
# ---------------------------------------------------
FROM base AS pruner
WORKDIR /app
RUN pnpm add -g turbo
COPY . .
ARG PROJECT
RUN turbo prune --scope=@repo/${PROJECT} --docker

# ---------------------------------------------------
# Installer Stage: Install deps and build
# ---------------------------------------------------
FROM base AS installer
WORKDIR /app

# Copy pruned package definitions
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies
# We use --no-frozen-lockfile because prune might create slight inconsistencies that are safe to ignore here
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY --from=pruner /app/out/full/ .

# Build the project
ARG PROJECT
RUN pnpm exec turbo run build --filter=@repo/${PROJECT}...

# ---------------------------------------------------
# Runner Stage: Server (Node.js)
# ---------------------------------------------------
FROM base AS server
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify

COPY --from=installer --chown=fastify:nodejs /app .

WORKDIR /app/apps/server
USER fastify

EXPOSE 3000
CMD ["node", "dist/server.js"]

# ---------------------------------------------------
# Runner Stage: Web (Nginx)
# ---------------------------------------------------
FROM nginx:alpine AS web
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=installer /app/apps/web/dist .
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
