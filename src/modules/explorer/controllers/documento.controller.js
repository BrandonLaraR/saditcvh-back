const documentoService = require('../services/documento.service');


class DocumentoController {
    // Crear nuevo documento
    async crear(req, res) {
        try {
            const documentoData = req.body;
            const userId = req.user.id;
            if (documentoData.autorizacionId) {
                documentoData.autorizacionId = parseInt(documentoData.autorizacionId);
            }

            // Validar que el archivo existe
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere un archivo adjunto'
                });
            }

            const documento = await documentoService.crearDocumento(documentoData, req.file,userId);

            res.status(201).json({
                success: true,
                message: 'Documento creado correctamente',
                data: documento
            });
        } catch (error) {
            console.error('Error detallado:', error);
            res.status(400).json({
                success: false,
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    // Obtener documento por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const documento = await documentoService.obtenerDocumentoPorId(id);

            res.status(200).json({
                success: true,
                message: 'Documento obtenido correctamente',
                data: documento
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    // Obtener documentos por autorización
    async getByAutorizacion(req, res) {
        try {
            // const { autorizacionId } = req.params;
            const { autorizacionId } = req.params;
            console.log(req.params)
            // const documentos = await documentoService.obtenerDocumentosPorAutorizacion(28);
            const documentos = await documentoService.obtenerDocumentosPorAutorizacion(autorizacionId);

            res.status(200).json({
                success: true,
                message: 'Documentos obtenidos correctamente',
                data: documentos
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Crear nueva versión de documento
    async crearVersion(req, res) {
        try {
            const { id } = req.params;
            const documentoData = req.body;
            const archivo = req.file;
            const userId = req.user.id;
            if (!archivo) {
                return res.status(400).json({
                    success: false,
                    message: 'Archivo es requerido para nueva versión'
                });
            }

            const nuevaVersion = await documentoService.crearNuevaVersion(id, documentoData, archivo,userId);

            res.status(201).json({
                success: true,
                message: 'Nueva versión creada correctamente',
                data: nuevaVersion
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Actualizar documento
    async update(req, res) {
        try {
            const { id } = req.params;
            const documento = await documentoService.actualizarDocumento(id, req.body);

            res.status(200).json({
                success: true,
                message: 'Documento actualizado correctamente',
                data: documento
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Eliminar documento
    async delete(req, res) {
        try {
            const { id } = req.params;
            await documentoService.eliminarDocumento(id);

            res.status(200).json({
                success: true,
                message: 'Documento eliminado correctamente'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Buscar documentos
    async search(req, res) {
        try {
            const criterios = req.query;
            const documentos = await documentoService.buscarDocumentos(criterios);

            res.status(200).json({
                success: true,
                message: 'Documentos encontrados',
                data: documentos
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Descargar archivo
    async descargarArchivo(req, res) {
        try {
            const { archivoId } = req.params;
            const archivo = await documentoService.obtenerArchivoDigital(archivoId);

            // Verificar que el archivo existe físicamente
            const fs = require('fs');
            if (!fs.existsSync(archivo.rutaAlmacenamiento)) {
                throw new Error('Archivo no encontrado en el servidor');
            }

            res.download(archivo.rutaAlmacenamiento, archivo.nombreOriginal || archivo.nombreArchivo);
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    // Obtener estadísticas
    async getEstadisticas(req, res) {
        try {
            const Documento = require('../models/documento.model');
            const ArchivoDigital = require('../models/archivo-digital.model');

            const totalDocumentos = await Documento.count();
            const totalArchivos = await ArchivoDigital.count();
            const documentosPorEstado = await Documento.findAll({
                attributes: ['estado_digitalizacion', [Documento.sequelize.fn('COUNT', Documento.sequelize.col('id')), 'count']],
                group: ['estado_digitalizacion']
            });

            res.status(200).json({
                success: true,
                message: 'Estadísticas obtenidas correctamente',
                data: {
                    totalDocumentos,
                    totalArchivos,
                    documentosPorEstado
                }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new DocumentoController();