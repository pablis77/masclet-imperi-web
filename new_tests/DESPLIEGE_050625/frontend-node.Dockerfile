FROM node:18-alpine

WORKDIR /app

# Crear directorios de la aplicación
RUN mkdir -p /app/dist

# Copiar archivos compilados (solo lo estrictamente necesario)
COPY ./dist /app/dist

# Instalar dependencias mínimas necesarias
RUN npm init -y && \
    npm install express compression

# Crear un servidor Express simple para servir la aplicación
RUN echo 'const express = require("express");                                        \n\
const path = require("path");                                                     \n\
const compression = require("compression");                                       \n\
const app = express();                                                            \n\
const PORT = process.env.PORT || 80;                                              \n\
                                                                                  \n\
// Habilitar compresión gzip                                                      \n\
app.use(compression());                                                           \n\
                                                                                  \n\
// Establecer encabezados de seguridad y caché                                    \n\
app.use((req, res, next) => {                                                     \n\
  res.setHeader("X-Frame-Options", "SAMEORIGIN");                                 \n\
  res.setHeader("X-Content-Type-Options", "nosniff");                             \n\
  res.setHeader("X-XSS-Protection", "1; mode=block");                             \n\
                                                                                  \n\
  // Assets estáticos: caché de una semana                                        \n\
  if (req.url.startsWith("/assets/")) {                                           \n\
    res.setHeader("Cache-Control", "public, max-age=604800");                     \n\
  }                                                                               \n\
                                                                                  \n\
  next();                                                                         \n\
});                                                                               \n\
                                                                                  \n\
// Endpoint para verificación de salud                                            \n\
app.get("/health", (req, res) => {                                                \n\
  res.status(200).send("OK");                                                     \n\
});                                                                               \n\
                                                                                  \n\
// Determinar si tenemos un server/entry.mjs para SSR o solo estáticos            \n\
const fs = require("fs");                                                         \n\
if (fs.existsSync(path.join(__dirname, "dist/server/entry.mjs"))) {               \n\
  // Configuración para SSR (Server-Side Rendering)                               \n\
  console.log("Iniciando en modo SSR con el entry point generado");               \n\
  import("./dist/server/entry.mjs")                                               \n\
    .then((module) => {                                                           \n\
      // Iniciar el handler de Astro                                              \n\
    })                                                                            \n\
    .catch((error) => {                                                           \n\
      console.error("Error cargando el entry point:", error);                     \n\
      // Fallback a servir estáticos                                              \n\
      app.use(express.static(path.join(__dirname, "dist/client")));               \n\
      app.get("*", (req, res) => {                                                \n\
        res.sendFile(path.join(__dirname, "dist/client/index.html"));             \n\
      });                                                                         \n\
    });                                                                           \n\
} else {                                                                          \n\
  // Configuración para servir solo contenido estático                            \n\
  console.log("Iniciando en modo estático");                                      \n\
  app.use(express.static(path.join(__dirname, "dist/client")));                   \n\
  app.get("*", (req, res) => {                                                    \n\
    res.sendFile(path.join(__dirname, "dist/client/index.html"));                 \n\
  });                                                                             \n\
}                                                                                 \n\
                                                                                  \n\
// Iniciar servidor                                                               \n\
app.listen(PORT, "0.0.0.0", () => {                                               \n\
  console.log(`Servidor frontend corriendo en http://0.0.0.0:${PORT}`);           \n\
});' > /app/server.js

# Variables de entorno
ENV HOST=0.0.0.0
ENV PORT=80
ENV NODE_ENV=production
# El API_URL ahora se configura correctamente desde la compilación local

# Exponer puerto
EXPOSE 80

# Comando para iniciar el servidor
CMD ["node", "server.js"]
