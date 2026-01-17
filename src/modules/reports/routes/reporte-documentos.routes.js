// reportes/routes/reporte-digitalizacion.routes.js
const express = require('express');
const router = express.Router();
const ReporteDigitalizacionController = require('../controllers/reporte-documentos.controller');

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
// RUTAS DE REPORTE DE DIGITALIZACIÓN
// ==============================================

// 1. GENERAR REPORTE DE DIGITALIZACIÓN EN PDF
router.get('/pdf', async (req, res) => {
  console.log('📄 SOLICITUD DE REPORTE DE DIGITALIZACIÓN (PDF)');
  console.log('Filtros:', req.query);
  console.log('Timestamp:', new Date().toISOString());
  
  return await ReporteDigitalizacionController.generarReporteDigitalizacionPDF(req, res);
});

// 2. GENERAR REPORTE DE RENDIMIENTO DE DIGITALIZADORES EN PDF
router.get('/rendimiento/pdf', async (req, res) => {
  console.log('📊 SOLICITUD DE REPORTE DE RENDIMIENTO (PDF)');
  console.log('Filtros:', req.query);
  console.log('Timestamp:', new Date().toISOString());
  
  return await ReporteDigitalizacionController.generarReporteRendimientoPDF(req, res);
});

// 3. RUTA DE PRUEBA Y ESTADO DEL SERVICIO
router.get('/status', (req, res) => {
  console.log('🧪 Health check del servicio de reportes de digitalización');
  res.json({ 
    status: 'ok', 
    service: 'reportes-digitalizacion',
    version: '1.0.0',
    endpoints: [
      {
        method: 'GET',
        path: '/api/reports/reporte-digitalizacion/pdf',
        description: 'Generar reporte completo de digitalización en PDF'
      },
      {
        method: 'GET',
        path: '/api/reports/reporte-digitalizacion/rendimiento/pdf',
        description: 'Generar reporte de rendimiento de digitalizadores en PDF'
      },
      {
        method: 'GET',
        path: '/api/reports/reporte-digitalizacion/ultimos-documentos',
        description: 'Obtener los últimos documentos subidos',
        parameters: {
          limit: 'Número de documentos a obtener (default: 5)'
        }
      }
    ],
    filters_available: {
        tipo_id: 'Filtrar por ID de tipo de autorización (1: Concesión, 2: Permiso)',
        modalidad_id: 'Filtrar por ID de modalidad',
        municipio_id: 'Filtrar por ID de municipio',
        estado_digitalizacion: "'completado', 'pendiente', 'en_proceso', 'rechazado'",
        start_date: 'YYYY-MM-DD - Fecha de inicio de digitalización',
        end_date: 'YYYY-MM-DD - Fecha de fin de digitalización',
        search: 'Texto para buscar en número, título o nombre de archivo',
        digitalizado_por: 'ID del usuario digitalizador',
        include_files: 'true/false - Incluir información de archivos (default: true)',
        limit: 'Número máximo de resultados (default: 100)',
        offset: 'Desplazamiento para paginación (default: 0)'
    },
    metadata_included: {
      total_documents: 'Total de documentos en el sistema',
      digitalized_documents: 'Documentos con al menos un archivo digital',
      pending_documents: 'Documentos sin archivos digitales',
      total_file_size_mb: 'Tamaño total de archivos en MB',
      average_file_size_mb: 'Tamaño promedio por archivo en MB',
      documents_by_status: 'Distribución por estado de digitalización',
      documents_by_authorization_type: 'Distribución por tipo de autorización',
      top_digitalizers: 'Top 10 digitalizadores por cantidad de documentos'
    },
    report_structure: [
      'I. Encabezado oficial institucional',
      'II. Resumen estadístico de digitalización',
      'III. Listado de documentos digitalizados',
      'IV. Detalle por documento',
      'V. Observaciones y conclusiones',
      'VI. Pie de página institucional'
    ],
    timestamp: new Date().toISOString()
  });
});

// 4. OBTENER ÚLTIMOS DOCUMENTOS SUBIDOS
router.get('/ultimos-documentos', async (req, res) => {
  console.log('📄 SOLICITUD DE ÚLTIMOS DOCUMENTOS SUBIDOS');
  console.log('Límite solicitado:', req.query.limit || 5);
  console.log('Timestamp:', new Date().toISOString());
  
  return await ReporteDigitalizacionController.getUltimosDocumentos(req, res);
});

// ==============================================
// RUTA DE EJEMPLO Y PRUEBAS
// ==============================================
router.get('/ejemplo', (req, res) => {
  console.log('📋 Ejemplo de parámetros para reporte de digitalización');
  
  const ejemploQuery = {
    tipo_autorizacion_id: '1',
    modalidad_id: '3',
    municipio_id: '80',
    estado_digitalizacion: 'completado',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    search: 'reporte',
    digitalizado_por: '9',
    include_files: 'true',
    limit: '50',
    offset: '0'
  };
  
  res.json({
    message: 'Ejemplo de parámetros para reporte de digitalización',
    description: 'Copia los parámetros y ajusta según sea necesario',
    example_url: '/api/reports/reporte-digitalizacion/pdf?' + Object.entries(ejemploQuery)
      .map(([key, value]) => `${key}=${value}`)
      .join('&'),
    parameters: ejemploQuery,
    quick_tests: [
      {
        description: 'Reporte de concesiones completadas en municipio 80',
        url: '/api/reports/reporte-digitalizacion/pdf?tipo_autorizacion_id=1&municipio_id=80&estado_digitalizacion=completado'
      },
      {
        description: 'Reporte de documentos pendientes de digitalización',
        url: '/api/reports/reporte-digitalizacion/pdf?estado_digitalizacion=pendiente&limit=20'
      },
      {
        description: 'Reporte de rendimiento de todos los digitalizadores',
        url: '/api/reports/reporte-digitalizacion/rendimiento/pdf'
      },
      {
        description: 'Reporte de documentos digitalizados por usuario 9',
        url: '/api/reports/reporte-digitalizacion/pdf?digitalizado_por=9&include_files=true'
      }
    ]
  });
});

module.exports = router;