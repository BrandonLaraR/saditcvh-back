const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const config = require("./config");
const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandlers");

const ejemploRoutes = require('./modules/reports/routes/ejemplo.routes');

const app = express();

app.disable("etag");
app.use((req, res, next) => {
    res.removeHeader("Server");
    next();
});
app.use(config.helmet);
app.use(config.rateLimiter);
app.use(config.cors);

// Logging
if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

// Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ==============================================
// CSRF - CON EXCLUSIÓN PARA REPORTES
// ==============================================
app.use((req, res, next) => {
  // Excluir rutas de reportes de la validación CSRF
  if (req.path.startsWith('/api/reports') || req.path.startsWith('/api/reportes')) {
    console.log(`✅ Saltando CSRF para: ${req.path}`);
    return next();
  }
  // Para otras rutas, aplicar CSRF normalmente
  config.csrf.doubleCsrfProtection(req, res, next);
});

// CSRF token endpoint 
app.get("/csrf-token", (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// ==============================================
// RUTAS
// ==============================================

// Ruta de ejemplo (sin autenticación para pruebas)
app.use('/api/reports', ejemploRoutes);

// Rutas principales
app.use("/api", routes);

// 404
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

module.exports = app;