
// const express = require('express');
// const router = express.Router();
// const BusquedaController = require('../controllers/busqueda.controller');
// const authMiddleware = require('../../auth/middlewares/auth.middleware');

// const controller = new BusquedaController();

// /**
//  * @route GET /api/busqueda
//  * @description Búsqueda general en el sistema
//  * @access Private (opcional, puedes ajustar según necesidades)
//  */
// router.get('/', authMiddleware, (req, res) => controller.buscar(req, res));

// /**
//  * @route GET /api/busqueda/autocomplete
//  * @description Autocompletado para búsqueda
//  * @access Public o Private según necesidades
//  */
// router.get('/autocomplete', (req, res) => controller.autocomplete(req, res));

// /**
//  * @route GET /api/busqueda/estadisticas
//  * @description Obtener estadísticas generales
//  * @access Private (generalmente para administradores)
//  */
// router.get('/estadisticas', authMiddleware, (req, res) => controller.estadisticas(req, res));

// /**
//  * @route GET /api/busqueda/export
//  * @description Exportar resultados de búsqueda
//  * @access Private
//  */
// router.get('/export', authMiddleware, (req, res) => {
//     // Implementación para exportar a Excel/PDF
//     res.json({ mensaje: 'Exportación en desarrollo' });
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const BusquedaController = require('../controllers/busqueda.controller');
const { protect } = require('../../auth/middlewares/auth.middleware');

const controller = new BusquedaController();

router.get('/', protect, (req, res) => controller.buscar(req, res));

router.get('/autocomplete', (req, res) => controller.autocomplete(req, res));

router.get('/estadisticas', protect, (req, res) => controller.estadisticas(req, res));

router.get('/export', protect, (req, res) => {
    res.json({ mensaje: 'Exportación en desarrollo' });
});

module.exports = router;