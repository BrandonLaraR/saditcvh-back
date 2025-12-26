const express = require('express');
const router = express.Router();
const EjemploReportController = require('../controllers/ejemplo-report.controller');

// Crear instancia del controlador
const ejemploController = new EjemploReportController();

// ==============================================
// CONFIGURAR CORS (IMPORTANTE PARA EVITAR ERROR 403)
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
// ÚNICA RUTA PARA PDF DETALLADO
// ==============================================
router.post('/generar-reporte', (req, res) => {
  console.log('📄 SOLICITUD DE REPORTE DETALLADO');
  console.log('Tipo:', req.body?.reportType || 'General');
  console.log('Timestamp:', new Date().toISOString());
  
  return ejemploController.generarPDFDetallado(req, res);
});

// ==============================================
// RUTA DE PRUEBA (OPCIONAL)
// ==============================================
router.get('/test', (req, res) => {
  console.log('🧪 Health check del servicio de reportes');
  res.json({ 
    status: 'ok', 
    service: 'reportes-pdf',
    version: '1.0.0',
    endpoint: 'POST /api/reportes/generar-reporte',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;