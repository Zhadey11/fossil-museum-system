# ---- Frontend Dockerfile (modo desarrollo) ----
FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Puerto que expone Next.js
EXPOSE 3000

# Correr en modo desarrollo (sin build, evita errores de TypeScript)
CMD ["npm", "run", "dev"]
