const express = require('express');
const router = express.Router();
const ReporteUsuariosController = require('../controllers/reporte-usuarios.controller');

// ==============================================
// CONFIGURAR CORS
// ==============================================
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// ==============================================
// RUTAS DE REPORTE DE USUARIOS
// ==============================================

// 1. GENERAR REPORTE DE USUARIOS EN PDF
router.get('/pdf', async (req, res) => {
  return await ReporteUsuariosController.generarReporteUsuariosPDF(req, res);
});

// 2. RUTA DE PRUEBA Y ESTADO DEL SERVICIO
router.get('/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'reportes-usuarios',
    version: '1.0.0',
    endpoint: 'GET /api/reports/reporte-usuarios/pdf?filtros',
    filters_available: {
      role_id: 'Filtrar por ID de rol',
      active: 'true/false - Filtrar por estado activo',
      search: 'Texto para buscar en nombre, email o username',
      start_date: 'YYYY-MM-DD - Fecha de inicio',
      end_date: 'YYYY-MM-DD - Fecha de fin',
      limit: 'Número máximo de resultados (default: 50)',
      offset: 'Desplazamiento para paginación (default: 0)'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;