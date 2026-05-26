# Base
FROM node:20-alpine

# Carpeta de trabajo
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto
COPY . .

# Build producción
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV PORT=3000
ENV NODE_ENV=production

# Iniciar app
CMD ["npm", "start"]
