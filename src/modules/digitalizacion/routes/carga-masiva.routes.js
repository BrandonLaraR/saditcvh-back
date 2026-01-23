// routes/carga-masiva.routes.js
const express = require('express');
const router = express.Router();
const CargaMasivaController = require('../controllers/carga-masiva.controller');
const multer = require('multer');
// const authMiddleware = require('../middlewares/auth.middleware');
const { protect } = require("../../auth/middlewares/auth.middleware");

router.use(protect);
// Configurar multer para archivos comprimidos
const storageComprimido = multer.memoryStorage();
const uploadComprimido = multer({
    storage: storageComprimido,
    limits: {
        fileSize:  2 * 1024 * 1024 * 1024, // 500MB límite
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed'];
        if (allowedTypes.includes(file.mimetype)) {
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
        fileSize:  2 * 1024 * 1024 * 1024,  // 100MB por archivo
        files: 50 // Máximo 50 archivos a la vez
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PDF'));
        }
    }
});

// Rutas protegidas
// router.use(authMiddleware);

// Subir archivo comprimido
router.post('/comprimido', 
    uploadComprimido.single('archivo'),
    CargaMasivaController.procesarArchivoComprimido
);

// Subir múltiples PDFs
router.post('/pdfs-multiples',
    uploadPDFs.array('archivos', 50),
    CargaMasivaController.procesarArchivosMultiples
);

// Verificar estado de procesamiento
router.get('/estado/:procesoId',
    CargaMasivaController.obtenerEstadoProcesamiento
);

module.exports = router;