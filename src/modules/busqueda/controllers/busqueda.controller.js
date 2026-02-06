const BusquedaService = require('../services/busqueda.service');
const auditService = require("../../audit/services/audit.service");

class BusquedaController {
    constructor() {
        this.busquedaService = new BusquedaService();
    }

    /**
     * @route GET /api/busqueda
     * @description Búsqueda general en toda la base de datos
     */
    async buscar(req, res) {
        try {
            const { 
                q, // término de búsqueda principal
                tipo, // tipo de búsqueda: 'todo', 'autorizacion', 'documento', 'archivo'
                municipio_id,
                modalidad_id,
                confidencialidad,
                estado_ocr,
                estado_digitalizacion,
                fecha_desde,
                fecha_hasta,
                limit = 20,
                offset = 0
            } = req.query;

            // Registrar auditoría
            await auditService.createLog(req, {
                // usuario_id: req.user?.id,
                action: 'BUSQUEDA',
                module: 'BUSQUEDA_GENERAL',
                // entidad: 'BUSQUEDA_GENERAL',
                // entidad_id: null,
                details: {
                    termino: q,
                    tipo_busqueda: tipo,
                    filtros: {
                        municipio_id,
                        modalidad_id,
                        confidencialidad,
                        estado_ocr,
                        estado_digitalizacion
                    }
                },
                // ip: req.ip,
                // user_agent: req.get('user-agent')
            });

            const resultados = await this.busquedaService.busquedaAvanzada({
                termino: q,
                tipoBusqueda: tipo || 'todo',
                fechaDesde: fecha_desde,
                fechaHasta: fecha_hasta,
                municipioId: municipio_id ? parseInt(municipio_id) : null,
                modalidadId: modalidad_id ? parseInt(modalidad_id) : null,
                confidencialidad,
                estadoOcr: estado_ocr,
                estadoDigitalizacion: estado_digitalizacion,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.json({
                success: true,
                data: resultados,
                mensaje: `Se encontraron ${resultados.total} resultados`
            });

        } catch (error) {
            console.error('Error en búsqueda:', error);
            res.status(500).json({
                success: false,
                mensaje: 'Error al realizar la búsqueda',
                error: error.message
            });
        }
    }

    /**
     * @route GET /api/busqueda/autocomplete
     * @description Autocompletado para búsqueda
     */
    async autocomplete(req, res) {
        try {
            const { q } = req.query;

            if (!q || q.length < 2) {
                return res.json({
                    success: true,
                    data: []
                });
            }

            // Búsqueda rápida para autocompletado
            const busquedas = await Promise.all([
                this.busquedaService.buscarEnAutorizaciones(q, {}),
                this.busquedaService.buscarEnDocumentos(q, {})
            ]);

            const [autorizaciones, documentos] = busquedas;
            const sugerencias = [];

            // Sugerencias de autorizaciones
            autorizaciones.slice(0, 5).forEach(auth => {
                
                sugerencias.push({
                    tipo: 'autorizacion',
                    value: auth.numeroAutorizacion,
                    label: ` ${auth.numeroAutorizacion} - ${auth.nombreCarpeta}`,
                    id: auth.id
                });
            });

            // Sugerencias de documentos
            // documentos.slice(0, 5).forEach(doc => {
            //     // console.log(auth)
            //     sugerencias.push({
            //         tipo: 'documento',
            //         value: doc.titulo,
            //         label: ` ${doc.titulo}${doc.numero_documento ? ` (${doc.numero_documento})` : ''}`,
            //         id: doc.id,
            //         autorizacion_id: doc.autorizacion_id
            //     });
            // });

            res.json({
                success: true,
                data: sugerencias
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                mensaje: 'Error en autocompletado',
                error: error.message
            });
        }
    }

    /**
     * @route GET /api/busqueda/estadisticas
     * @description Obtener estadísticas de búsqueda
     */
    async estadisticas(req, res) {
        try {
            const { 
                fecha_desde, 
                fecha_hasta,
                municipio_id 
            } = req.query;

            // Esta es una implementación básica, puedes expandirla según necesidades
            const Documento = require('../models/documento.model');
            const Autorizacion = require('../models/autorizacion.model');
            const { Op } = require('sequelize');

            const whereFecha = {};
            if (fecha_desde || fecha_hasta) {
                whereFecha.created_at = {};
                if (fecha_desde) whereFecha.created_at[Op.gte] = new Date(fecha_desde);
                if (fecha_hasta) whereFecha.created_at[Op.lte] = new Date(fecha_hasta);
            }

            const [totalDocumentos, totalAutorizaciones, documentosPorEstado] = await Promise.all([
                Documento.count({ where: whereFecha }),
                Autorizacion.count({ where: whereFecha }),
                Documento.findAll({
                    attributes: ['estado_digitalizacion', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
                    group: ['estado_digitalizacion'],
                    where: whereFecha
                })
            ]);

            res.json({
                success: true,
                data: {
                    total_documentos: totalDocumentos,
                    total_autorizaciones: totalAutorizaciones,
                    documentos_por_estado: documentosPorEstado,
                    fecha_desde,
                    fecha_hasta
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                mensaje: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    }
}

module.exports = BusquedaController;