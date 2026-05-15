FROM node:20-alpine AS base

# --- Dependencies ---
FROM base AS deps
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# --- Build ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js standalone output for smaller image
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Production ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_PATH=/data/reviews.db
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build (includes node_modules for traced deps)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public 2>/dev/null || true

# Ensure better-sqlite3 native addon is present (standalone trace may miss it)
COPY --from=deps /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=deps /app/node_modules/bindings ./node_modules/bindings 2>/dev/null || true
COPY --from=deps /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path 2>/dev/null || true
COPY --from=deps /app/node_modules/prebuild-install ./node_modules/prebuild-install 2>/dev/null || true
COPY --from=deps /app/node_modules/node-addon-api ./node_modules/node-addon-api 2>/dev/null || true

# Create data directory for SQLite
RUN mkdir -p /data && chown nextjs:nodejs /data

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
