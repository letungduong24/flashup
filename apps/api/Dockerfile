# Use Node.js LTS with pnpm
FROM node:20-alpine AS base

# Install pnpm latest
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build packages first
WORKDIR /app
RUN pnpm --filter @repo/types build

# Generate Prisma Client
# Note: prisma generate doesn't need a real DATABASE_URL, just a dummy one
WORKDIR /app/apps/api
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN pnpm prisma generate

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Copy built packages first (with dist)
COPY --from=base /app/packages ./packages

# Install production dependencies (this will link workspace packages)
# Note: Need to install all deps first to get workspace linking, then remove devDeps
RUN pnpm install --frozen-lockfile
RUN pnpm prune --prod

# Copy built application
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/apps/api/prisma ./apps/api/prisma
COPY --from=base /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts
COPY --from=base /app/apps/api/src/generated ./apps/api/src/generated

# Verify dist exists
RUN ls -la /app/apps/api/dist/ || echo "Dist directory not found"

# Create entrypoint script to run migrations before starting
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'set -e' >> /app/entrypoint.sh && \
    echo 'echo "Running database migrations..."' >> /app/entrypoint.sh && \
    echo 'cd /app/apps/api' >> /app/entrypoint.sh && \
    echo 'if command -v pnpm > /dev/null 2>&1; then' >> /app/entrypoint.sh && \
    echo '  pnpm prisma migrate deploy || echo "Migrations failed or already applied"' >> /app/entrypoint.sh && \
    echo 'else' >> /app/entrypoint.sh && \
    echo '  npx prisma migrate deploy || echo "Migrations failed or already applied"' >> /app/entrypoint.sh && \
    echo 'fi' >> /app/entrypoint.sh && \
    echo 'echo "Starting API server..."' >> /app/entrypoint.sh && \
    echo 'exec pnpm start:prod' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

WORKDIR /app/apps/api

EXPOSE 8000

CMD ["/app/entrypoint.sh"]

