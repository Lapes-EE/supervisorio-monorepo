FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache libc6-compat

# ---------------------------------------------------
# Prune Stage: Isolate the server scope
# ---------------------------------------------------
FROM base AS pruner
WORKDIR /app
RUN pnpm add -g turbo
COPY . .
RUN pnpm exec turbo prune --scope=@repo/server --docker

# ---------------------------------------------------
# Installer Stage: Install deps and build
# ---------------------------------------------------
FROM base AS installer
WORKDIR /app

# Copy pruned package definitions
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies (allowing lockfile adjustments if needed)
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY --from=pruner /app/out/full/ .

# Build the server
# We use pnpm exec to ensure we use the local turbo version if available, or globally installed
RUN pnpm exec turbo run build --filter=@repo/server...

# ---------------------------------------------------
# Runner Stage: Final production image
# ---------------------------------------------------
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify

# Copy necessary files
# We copy the entire monorepo structure from installer to preserve workspace links usually,
# but specifically for the server, we mainly need the dist and node_modules.
COPY --from=installer --chown=fastify:nodejs /app .

WORKDIR /app/apps/server
USER fastify

EXPOSE 3000
CMD ["node", "dist/server.js"]
