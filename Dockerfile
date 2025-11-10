# ------------------------------
# 🧱 Etapa 1: Build
# ------------------------------
FROM node:20-slim AS builder

# Dependencias para compilar módulos nativos
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar solo package.json y package-lock.json para usar cache de Docker
COPY package*.json ./

# Instalar todas las dependencias (dev + prod)
RUN npm ci

# Copiar todo el código fuente
COPY . .

# Reconstruir módulos nativos (lightningcss)
RUN npm rebuild lightningcss || true

# Generar build de Next.js (Tailwind se compila automáticamente)
RUN npm run build

# ------------------------------
# 🚀 Etapa 2: Runtime
# ------------------------------
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copiar build generado y archivos públicos
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar .env si existe
COPY .env* . || true

EXPOSE 3000

CMD ["npm", "start"]
