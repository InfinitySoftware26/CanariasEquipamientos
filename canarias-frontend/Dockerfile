# Imagen base
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build de producción
RUN npm run build

# Exponer puerto
EXPOSE 3000

CMD ["npm", "run", "start"]
