# ---- Backend Dockerfile ----
# Usamos la imagen completa de Node (no alpine) para tener las herramientas de compilación
FROM node:20

# Instalar dependencias del sistema necesarias para msnodesqlv8
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    unixodbc-dev \
    && rm -rf /var/lib/apt/lists/*

# Directorio de trabajo
WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Puerto que expone el backend
EXPOSE 3001

# Comando para iniciar el servidor
CMD ["node", "server.js"]
