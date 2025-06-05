const express = require("express");
const path = require("path");
const compression = require("compression");
const app = express();
const PORT = process.env.PORT || 80;

// Habilitar compresión gzip
app.use(compression());

// Establecer encabezados de seguridad y caché
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  
  // Assets estáticos: caché de una semana
  if (req.url.startsWith("/assets/")) {
    res.setHeader("Cache-Control", "public, max-age=604800");
  }
  
  next();
});

// Endpoint para verificación de salud
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Configuración para servir contenido estático
console.log("Iniciando servidor en modo estático");
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor frontend corriendo en http://0.0.0.0:${PORT}`);
});
