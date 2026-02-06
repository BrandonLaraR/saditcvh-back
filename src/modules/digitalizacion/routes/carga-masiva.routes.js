// routes/carga-masiva.routes.js
const express = require('express');
const router = express.Router();
const CargaMasivaController = require('../controllers/carga-masiva.controller');
const multer = require('multer');
const { protect } = require("../../auth/middlewares/auth.middleware");

router.use(protect);

// Configurar multer para archivos comprimidos
const storageComprimido = multer.memoryStorage();
const uploadComprimido = multer({
    storage: storageComprimido,
    limits: {
        fileSize: 2 * 1024 * 1024 * 1024, // 2GB límite
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/zip', 
            'application/x-zip-compressed', 
            'application/x-rar-compressed',
            'application/octet-stream' // Para algunos archivos RAR
        ];
        
        const allowedExtensions = ['.zip', '.rar'];
        const extension = file.originalname.toLowerCase().slice(-4);
        
        if (allowedTypes.includes(file.mimetype) || allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext))) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido. Solo ZIP o RAR'));
        }
    }
});

// Configurar multer para múltiples PDFs
const storagePDFs = multer.memoryStorage();
const uploadPDFs = multer({
    storage: storagePDFs,
    limits: {
        fileSize: 2 * 1024 * 1024 * 1024, // 2GB por archivo
        files: 100 // Aumentado a 100 archivos
    },
    fileFilter: (req, file, cb) => {
        // Aceptar PDFs o archivos que terminen en .pdf
        if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PDF'));
        }
    }
});

// Rutas de carga masiva
router.post('/comprimido', 
    uploadComprimido.single('archivo'),
    CargaMasivaController.procesarArchivoComprimido
);

router.post('/pdfs-multiples',
    uploadPDFs.array('archivos', 100),
    CargaMasivaController.procesarArchivosMultiples
);

// Rutas para seguimiento de OCR
router.get('/estado-ocr/:loteId',
    CargaMasivaController.obtenerEstadoOCR
);

router.get('/resultados-ocr/:loteId',
    CargaMasivaController.obtenerResultadosOCR
);

router.get('/lotes',
    CargaMasivaController.listarLotesUsuario
);

// Ruta de estado original (mantener compatibilidad)
router.get('/estado/:procesoId',
    CargaMasivaController.obtenerEstadoProcesamiento
);

module.exports = router;