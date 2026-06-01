# Base
FROM node:20-alpine

# Carpeta de trabajo
WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Copiar manifest y lockfile
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias con pnpm
RUN pnpm install

# Copiar el resto del código
COPY . .

# Build producción
RUN pnpm run build

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV PORT=3000
ENV NODE_ENV=development

# Iniciar app
CMD ["pnpm", "start"]
