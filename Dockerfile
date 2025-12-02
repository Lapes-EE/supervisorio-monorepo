FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache libc6-compat

# Prune stage: isolates the target application and its dependencies
FROM base AS pruner
WORKDIR /app
RUN pnpm add -g turbo
COPY . .
ARG PROJECT
RUN turbo prune --scope=@repo/${PROJECT} --docker

# Installer stage: installs dependencies and builds the application
FROM base AS installer
RUN apk add --no-cache python3 make g++
WORKDIR /app

# Copy pruned package definitions and lockfile
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY --from=pruner /app/out/full/ .

# Build the project
ARG PROJECT
RUN pnpm exec turbo run build --filter=@repo/${PROJECT}...

# ---------------------------------------------------
# Runner stage for Server
# ---------------------------------------------------
FROM base AS server
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify

# Copy built artifacts and dependencies from installer
# We copy the whole monorepo structure for simplicity with workspace dependencies, 
# but we could optimize this further by deploying only the isolated package if bundled.
# However, for a "server" app in a monorepo, it's safer to keep the structure or use 'turbo deploy' (if available/configured) or just copy the relevant parts.
# Since we are using standard 'pnpm' workspace, copying node_modules is easiest.

COPY --from=installer --chown=fastify:nodejs /app .

WORKDIR /app/apps/server
USER fastify

EXPOSE 3000
CMD ["node", "dist/server.js"]

# ---------------------------------------------------
# Runner stage for Web
# ---------------------------------------------------
FROM nginx:alpine AS web
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built assets from installer
COPY --from=installer /app/apps/web/dist .

# Copy custom nginx config
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
