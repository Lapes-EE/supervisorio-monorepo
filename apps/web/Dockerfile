FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache libc6-compat

# ---------------------------------------------------
# Prune Stage: Isolate the web scope
# ---------------------------------------------------
FROM base AS pruner
WORKDIR /app
RUN pnpm add -g turbo
COPY . .
RUN pnpm exec turbo prune --scope=@repo/web --docker

# ---------------------------------------------------
# Installer Stage: Install deps and build
# ---------------------------------------------------
FROM base AS installer
WORKDIR /app

# Copy pruned package definitions
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY --from=pruner /app/out/full/ .

# Build the web app
# Note: If you need build-time env vars (like VITE_API_URL), define ARGs here
RUN pnpm exec turbo run build --filter=@repo/web...

# ---------------------------------------------------
# Runner Stage: Serve with Nginx
# ---------------------------------------------------
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built assets from installer
COPY --from=installer /app/apps/web/dist .

# Copy custom nginx config (path relative to build context root)
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
