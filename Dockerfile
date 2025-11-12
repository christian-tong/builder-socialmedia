# ==========================================
# 🏗️ Etapa 1: Build de Next.js
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copiamos package.json y lock
COPY package*.json ./
COPY bun.lock* ./

# Instalamos dependencias
RUN npm install --legacy-peer-deps

# Copiamos todo el proyecto (incluido .env.production)
COPY . .

# Establecemos variables de entorno en build-time
ARG NEXT_PUBLIC_API_URL=https://demo.wimprove.com
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Compilamos Next.js (standalone)
RUN npm run build


# ==========================================
# 🚀 Etapa 2: Runtime (Producción)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# --- Copiamos solo lo necesario ---
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# --- Instalamos dependencias de producción ---
RUN npm install --omit=dev --legacy-peer-deps

EXPOSE 3000
CMD ["node", "server.js"]
