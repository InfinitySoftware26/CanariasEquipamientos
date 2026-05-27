# Imagen base
FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Dependencias para compilar módulos nativos (bcrypt)
RUN apk add --no-cache python3 make g++

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Copiar manifest y lockfile
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias con pnpm
RUN pnpm install --ignore-scripts

# Recompilar bcrypt para arquitectura Linux del contenedor
RUN cd node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt && npm rebuild bcrypt --build-from-source

# Copiar el resto del código
COPY . .

# Compilar TypeScript
RUN pnpm run build

# Exponer puerto (debe coincidir con PORT en .env)
EXPOSE 3001

# Producción: correr el build compilado
CMD ["node", "dist/main.js"]