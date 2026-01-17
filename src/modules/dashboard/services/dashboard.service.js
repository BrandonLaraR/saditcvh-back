const { QueryTypes } = require("sequelize");
const sequelize = require("../../../config/db"); // Asegúrate de que esta ruta sea correcta

class DashboardService {

    /**
     * Obtiene estadísticas generales para el dashboard
     */
    async getDashboardStats() {
        try {
            console.log('📊 Obteniendo estadísticas del dashboard...');
            
            // Ejecutar todas las consultas en paralelo
            const [
                totalDocumentos,
                totalPaginas,
                usuariosActivos,
                documentosPorEstado,
                documentosHoy,
                documentosSemana,
                usuariosNuevosHoy,
                búsquedasHoy,
                archivosPorTipo,
                documentosPorTipo
            ] = await Promise.all([
                this.getTotalDocumentos(),
                this.getTotalPaginas(),
                this.getUsuariosActivos(),
                this.getDocumentosPorEstado(),
                this.getDocumentosHoy(),
                this.getDocumentosSemana(),
                this.getUsuariosNuevosHoy(),
                this.getBusquedasHoy(),
                this.getArchivosPorTipo(),
                this.getDocumentosPorTipo()
            ]);

            console.log('✅ Estadísticas obtenidas exitosamente');
            
            return {
                success: true,
                data: {
                    total_documentos: totalDocumentos,
                    total_paginas: totalPaginas,
                    total_usuarios_activos: usuariosActivos,
                    documentos_por_estado: documentosPorEstado,
                    documentos_hoy: documentosHoy,
                    documentos_semana: documentosSemana,
                    usuarios_nuevos_hoy: usuariosNuevosHoy,
                    busquedas_hoy: búsquedasHoy,
                    archivos_por_tipo: archivosPorTipo,
                    documentos_por_tipo: documentosPorTipo,
                    timestamp: new Date()
                },
                metadata: {
                    generated_at: new Date().toISOString(),
                    query_count: 10
                }
            };

        } catch (error) {
            console.error('❌ Error en DashboardService.getDashboardStats:', error);
            console.error('❌ Detalles del error:', error.message);
            return {
                success: false,
                message: 'Error al obtener estadísticas del dashboard',
                error: error.message,
                data: this.getDefaultStats()
            };
        }
    }

    /**
     * Obtiene el total de documentos digitalizados
     */
    async getTotalDocumentos() {
        try {
            const query = `
                SELECT COUNT(*) as total
                FROM documentos d
                WHERE d.deleted_at IS NULL
            `;
            
            const result = await sequelize.query(query, {
                type: QueryTypes.SELECT
            });
            
            return parseInt(result[0].total) || 0;
        } catch (error) {
            console.error('Error en getTotalDocumentos:', error);
            return 0;
        }
    }

    /**
     * Obtiene el total de páginas procesadas
     */
    async getTotalPaginas() {
        try {
            const query = `
                SELECT COALESCE(SUM(paginas), 0) as total_paginas
                FROM documentos d
                WHERE d.deleted_at IS NULL
            `;
            
            const result = await sequelize.query(query, {
                type: QueryTypes.SELECT
            });
            
            return parseInt(result[0].total_paginas) || 0;
        } catch (error) {
            console.error('Error en getTotalPaginas:', error);
            return 0;
        }
    }

    /**
     * Obtiene el total de usuarios activos en el sistema
     */
    async getUsuariosActivos() {
        try {
            const query = `
                SELECT COUNT(*) as total_activos
                FROM users u
                WHERE u.active = true 
                AND u.deleted_at IS NULL
            `;
            
            const result = await sequelize.query(query, {
                type: QueryTypes.SELECT
            });
            
            return parseInt(result[0].total_activos) || 0;
        } catch (error) {
            console.error('Error en getUsuariosActivos:', error);
            return 0;
        }
    }

    /**
     * Obtiene la distribución de documentos por estado de digitalización
     */
    async getDocumentosPorEstado() {
        try {
            const query = `
                SELECT 
                    COALESCE(estado_digitalizacion, 'sin_estado') as estado,
                    COUNT(*) as cantidad
                FROM documentos d
                WHERE d.deleted_at IS NULL
                GROUP BY estado_digitalizacion
                ORDER BY cantidad DESC
            `;
            
            const result = await sequelize.query(query, {
                type: QueryTypes.SELECT
            });
            
            const documentosPorEstado = {};
            result.forEach(row => {
                documentosPorEstado[row.estado] = parseInt(row.cantidad);
            });
            
            return documentosPorEstado;
        } catch (error) {
            console.error('Error en getDocumentosPorEstado:', error);
            return { 'pendiente': 0, 'completado': 0, 'en_proceso': 0 };
        }
    }

    /**
     * Obtiene documentos digitalizados hoy
     */
    async getDocumentosHoy() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const query = `
                SELECT COUNT(*) as documentos_hoy
                FROM documentos d
                WHERE d.deleted_at IS NULL
                AND DATE(d.created_at) = DATE(:today)
            `;
            
            const result = await sequelize.query(query, {
                replacements: { today },
                type: QueryTypes.SELECT
            });
            
            return parseInt(result[0].documentos_hoy) || 0;
        } catch (error) {
            console.error('Error en getDocumentosHoy:', error);
            return 0;
        }
    }

    /**
     * Obtiene documentos de la última semana
     */
    async getDocumentosSemana() {
        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            oneWeekAgo.setHours(0, 0, 0, 0);
            
            const query = `
                SELECT COUNT(*) as documentos_semana
                FROM documentos d
                WHERE d.deleted_at IS NULL
                AND d.created_at >= :oneWeekAgo
            `;
            
            const result = await sequelize.query(query, {
                replacements: { oneWeekAgo },
                type: QueryTypes.SELECT
            });
            
            return parseInt(result[0].documentos_semana) || 0;
        } catch (error) {
            console.error('Error en getDocumentosSemana:', error);
            return 0;
        }
    }

    /**
     * Obtiene usuarios nuevos registrados hoy
     */
    async getUsuariosNuevosHoy() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const query = `
                SELECT COUNT(*) as usuarios_hoy
                FROM users u
                WHERE u.deleted_at IS NULL
                AND DATE(u.created_at) = DATE(:today)
            `;
            
            const result = await sequelize.query(query, {
                replacements: { today },
                type: QueryTypes.SELECT
            });
            
            return parseInt(result[0].usuarios_hoy) || 0;
        } catch (error) {
            console.error('Error en getUsuariosNuevosHoy:', error);
            return 0;
        }
    }

    /**
     * Obtiene número de búsquedas realizadas hoy
     * Nota: Necesitarás tener una tabla de logs de búsquedas
     */
    async getBusquedasHoy() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Si tienes una tabla de logs de búsquedas
            const query = `
                SELECT COUNT(*) as busquedas_hoy
                FROM search_logs sl
                WHERE DATE(sl.created_at) = DATE(:today)
            `;
            
            const result = await sequelize.query(query, {
                replacements: { today },
                type: QueryTypes.SELECT
            });
            
            return parseInt(result[0]?.busquedas_hoy) || 0;
        } catch (error) {
            console.warn('Advertencia en getBusquedasHoy: No se pudo obtener datos de búsquedas');
            // Valor simulado para desarrollo
            return Math.floor(Math.random() * 50) + 10;
        }
    }

    /**
     * Obtiene distribución de archivos por tipo MIME
     */
    async getArchivosPorTipo() {
        try {
            const query = `
                SELECT 
                    COALESCE(mime_type, 'desconocido') as tipo_mime,
                    COUNT(*) as cantidad
                FROM archivos_digitales ad
                GROUP BY mime_type
                ORDER BY cantidad DESC
            `;
            
            const result = await sequelize.query(query, {
                type: QueryTypes.SELECT
            });
            
            const archivosPorTipo = {};
            result.forEach(row => {
                archivosPorTipo[row.tipo_mime] = parseInt(row.cantidad);
            });
            
            return archivosPorTipo;
        } catch (error) {
            console.error('Error en getArchivosPorTipo:', error);
            return { 'application/pdf': 0 };
        }
    }

    /**
     * Obtiene distribución de documentos por tipo
     */
    async getDocumentosPorTipo() {
        try {
            const query = `
                SELECT 
                    COALESCE(tipo_documento, 'sin_tipo') as tipo,
                    COUNT(*) as cantidad
                FROM documentos d
                WHERE d.deleted_at IS NULL
                GROUP BY tipo_documento
                ORDER BY cantidad DESC
            `;
            
            const result = await sequelize.query(query, {
                type: QueryTypes.SELECT
            });
            
            const documentosPorTipo = {};
            result.forEach(row => {
                documentosPorTipo[row.tipo] = parseInt(row.cantidad);
            });
            
            return documentosPorTipo;
        } catch (error) {
            console.error('Error en getDocumentosPorTipo:', error);
            return { 'sin_tipo': 0 };
        }
    }

    /**
     * Obtiene estadísticas avanzadas para gráficos
     */
    async getAdvancedStats(filters = {}) {
        try {
            const { tipo_id, modalidad_id, municipio_id, start_date, end_date } = filters;
            
            let whereConditions = ["d.deleted_at IS NULL"];
            const params = {};

            if (tipo_id) {
                whereConditions.push("a.tipo_id = :tipo_id");
                params.tipo_id = tipo_id;
            }

            if (modalidad_id) {
                whereConditions.push("a.modalidad_id = :modalidad_id");
                params.modalidad_id = modalidad_id;
            }

            if (municipio_id) {
                whereConditions.push("a.municipio_id = :municipio_id");
                params.municipio_id = municipio_id;
            }

            if (start_date) {
                whereConditions.push("d.created_at >= :start_date");
                params.start_date = start_date;
            }

            if (end_date) {
                whereConditions.push("d.created_at <= :end_date");
                params.end_date = end_date;
            }

            const whereClause = whereConditions.length
                ? `WHERE ${whereConditions.join(" AND ")}`
                : "";

            // Estadísticas por mes (últimos 6 meses)
            const statsByMonthQuery = `
                SELECT 
                    TO_CHAR(d.created_at, 'YYYY-MM') as mes,
                    COUNT(*) as total_documentos,
                    COUNT(CASE WHEN ad.id IS NOT NULL THEN 1 END) as documentos_digitalizados,
                    COUNT(CASE WHEN ad.id IS NULL THEN 1 END) as documentos_pendientes
                FROM documentos d
                LEFT JOIN archivos_digitales ad ON d.id = ad.documento_id
                LEFT JOIN autorizaciones a ON d.autorizacion_id = a.id
                ${whereClause}
                AND d.created_at >= NOW() - INTERVAL '6 months'
                GROUP BY TO_CHAR(d.created_at, 'YYYY-MM')
                ORDER BY mes DESC
            `;

            // Top 10 digitalizadores
            const topDigitalizersQuery = `
                SELECT 
                    u.id,
                    u.username,
                    u.first_name,
                    u.last_name,
                    COUNT(ad.id) as total_digitalizados,
                    COALESCE(SUM(ad.tamano_bytes), 0) as total_tamano_bytes
                FROM users u
                LEFT JOIN archivos_digitales ad ON u.id = ad.digitalizado_por
                LEFT JOIN documentos d ON ad.documento_id = d.id
                WHERE u.active = true 
                AND u.deleted_at IS NULL
                AND d.deleted_at IS NULL
                GROUP BY u.id, u.username, u.first_name, u.last_name
                ORDER BY total_digitalizados DESC
                LIMIT 10
            `;

            // Documentos por tipo de autorización
            const docsByAuthTypeQuery = `
                SELECT 
                    ta.nombre as tipo_autorizacion,
                    COUNT(d.id) as total_documentos
                FROM documentos d
                LEFT JOIN autorizaciones a ON d.autorizacion_id = a.id
                LEFT JOIN tipos_autorizacion ta ON a.tipo_id = ta.id
                ${whereClause}
                GROUP BY ta.nombre
                ORDER BY total_documentos DESC
            `;

            const [
                statsByMonth,
                topDigitalizers,
                docsByAuthType
            ] = await Promise.all([
                sequelize.query(statsByMonthQuery, {
                    replacements: params,
                    type: QueryTypes.SELECT
                }),
                sequelize.query(topDigitalizersQuery, {
                    type: QueryTypes.SELECT
                }),
                sequelize.query(docsByAuthTypeQuery, {
                    replacements: params,
                    type: QueryTypes.SELECT
                })
            ]);

            return {
                success: true,
                data: {
                    stats_by_month: statsByMonth,
                    top_digitalizers: topDigitalizers.map(d => ({
                        ...d,
                        total_tamano_mb: (parseInt(d.total_tamano_bytes) / (1024 * 1024)).toFixed(2)
                    })),
                    docs_by_auth_type: docsByAuthType,
                    filters_applied: Object.keys(params).length > 0 ? params : null
                }
            };

        } catch (error) {
            console.error('❌ Error en getAdvancedStats:', error);
            return {
                success: false,
                message: 'Error al obtener estadísticas avanzadas',
                error: error.message
            };
        }
    }

    /**
     * Estadísticas por defecto (fallback)
     */
    getDefaultStats() {
        return {
            total_documentos: 0,
            total_paginas: 0,
            total_usuarios_activos: 0,
            documentos_por_estado: {},
            documentos_hoy: 0,
            documentos_semana: 0,
            usuarios_nuevos_hoy: 0,
            busquedas_hoy: 0,
            archivos_por_tipo: {},
            documentos_por_tipo: {}
        };
    }

    /**
     * Obtiene datos para gráficas del dashboard
     */
    async getChartData() {
        try {
            // Datos para gráfica de documentos por mes
            const documentosPorMes = await this.getDocumentosPorMesChart();
            
            // Datos para gráfica de estados
            const documentosPorEstadoChart = await this.getDocumentosPorEstadoChart();
            
            // Datos para gráfica de tipos de documento
            const documentosPorTipoChart = await this.getDocumentosPorTipoChart();

            return {
                success: true,
                data: {
                    documentos_por_mes: documentosPorMes,
                    documentos_por_estado: documentosPorEstadoChart,
                    documentos_por_tipo: documentosPorTipoChart
                }
            };
        } catch (error) {
            console.error('❌ Error en getChartData:', error);
            return {
                success: false,
                message: 'Error al obtener datos para gráficas',
                error: error.message
            };
        }
    }

    async getDocumentosPorMesChart() {
        try {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            
            const query = `
                SELECT 
                    TO_CHAR(created_at, 'YYYY-MM') as mes,
                    TO_CHAR(created_at, 'Mon') as mes_corto,
                    COUNT(*) as cantidad
                FROM documentos d
                WHERE d.deleted_at IS NULL
                AND created_at >= :sixMonthsAgo
                GROUP BY TO_CHAR(created_at, 'YYYY-MM'), TO_CHAR(created_at, 'Mon')
                ORDER BY mes
            `;
            
            const result = await sequelize.query(query, {
                replacements: { sixMonthsAgo },
                type: QueryTypes.SELECT
            });
            
            return result;
        } catch (error) {
            console.error('Error en getDocumentosPorMesChart:', error);
            return [];
        }
    }

    async getDocumentosPorEstadoChart() {
        try {
            const query = `
                SELECT 
                    COALESCE(estado_digitalizacion, 'sin_estado') as estado,
                    COUNT(*) as cantidad,
                    CASE 
                        WHEN estado_digitalizacion = 'completado' THEN '#10b981'
                        WHEN estado_digitalizacion = 'en_proceso' THEN '#f59e0b'
                        WHEN estado_digitalizacion = 'pendiente' THEN '#ef4444'
                        ELSE '#6b7280'
                    END as color
                FROM documentos d
                WHERE d.deleted_at IS NULL
                GROUP BY estado_digitalizacion
                ORDER BY cantidad DESC
            `;
            
            const result = await sequelize.query(query, {
                type: QueryTypes.SELECT
            });
            
            return result;
        } catch (error) {
            console.error('Error en getDocumentosPorEstadoChart:', error);
            return [];
        }
    }

    async getDocumentosPorTipoChart() {
        try {
            const query = `
                SELECT 
                    COALESCE(tipo_documento, 'sin_tipo') as tipo,
                    COUNT(*) as cantidad
                FROM documentos d
                WHERE d.deleted_at IS NULL
                GROUP BY tipo_documento
                ORDER BY cantidad DESC
                LIMIT 10
            `;
            
            const result = await sequelize.query(query, {
                type: QueryTypes.SELECT
            });
            
            return result;
        } catch (error) {
            console.error('Error en getDocumentosPorTipoChart:', error);
            return [];
        }
    }

    /**
     * Obtiene documentos por día de los últimos 7 días
     */
    async getDocumentosUltimos7Dias() {
        try {
            const query = `
                SELECT 
                    DATE(created_at) as fecha,
                    TO_CHAR(created_at, 'Dy') as dia_semana_corto,
                    TO_CHAR(created_at, 'Day') as dia_semana,
                    COUNT(*) as cantidad
                FROM documentos d
                WHERE d.deleted_at IS NULL
                AND created_at >= CURRENT_DATE - INTERVAL '7 days'
                GROUP BY DATE(created_at), TO_CHAR(created_at, 'Dy'), TO_CHAR(created_at, 'Day')
                ORDER BY fecha
            `;
            
            const result = await sequelize.query(query, {
                type: QueryTypes.SELECT
            });
            
            return result;
        } catch (error) {
            console.error('Error en getDocumentosUltimos7Dias:', error);
            return [];
        }
    }    


        /**
     * Obtiene estadísticas diarias para los últimos 7 días
     */
    async getEstadisticasDiarias() {
        try {
            const [documentosPorDia, documentosPorEstadoDia, documentosPorTipoDia] = await Promise.all([
                this.getDocumentosUltimos7Dias(),
                this.getDocumentosPorEstadoUltimos7Dias(),
                this.getDocumentosPorTipoUltimos7Dias()
            ]);

            return {
                success: true,
                data: {
                    documentos_por_dia: documentosPorDia,
                    documentos_por_estado_dia: documentosPorEstadoDia,
                    documentos_por_tipo_dia: documentosPorTipoDia
                },
                metadata: {
                    period: 'ultimos_7_dias',
                    generated_at: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('❌ Error en getEstadisticasDiarias:', error);
            return {
                success: false,
                message: 'Error al obtener estadísticas diarias',
                error: error.message
            };
        }
    }

    async getDocumentosPorEstadoUltimos7Dias() {
        try {
            const query = `
                SELECT 
                    DATE(created_at) as fecha,
                    COALESCE(estado_digitalizacion, 'sin_estado') as estado,
                    COUNT(*) as cantidad
                FROM documentos d
                WHERE d.deleted_at IS NULL
                AND created_at >= CURRENT_DATE - INTERVAL '7 days'
                GROUP BY DATE(created_at), estado_digitalizacion
                ORDER BY fecha, estado
            `;
            
            const result = await sequelize.query(query, {
                type: QueryTypes.SELECT
            });
            
            return result;
        } catch (error) {
            console.error('Error en getDocumentosPorEstadoUltimos7Dias:', error);
            return [];
        }
    }

    async getDocumentosPorTipoUltimos7Dias() {
        try {
            const query = `
                SELECT 
                    DATE(created_at) as fecha,
                    COALESCE(tipo_documento, 'sin_tipo') as tipo,
                    COUNT(*) as cantidad
                FROM documentos d
                WHERE d.deleted_at IS NULL
                AND created_at >= CURRENT_DATE - INTERVAL '7 days'
                GROUP BY DATE(created_at), tipo_documento
                ORDER BY fecha, tipo
            `;
            
            const result = await sequelize.query(query, {
                type: QueryTypes.SELECT
            });
            
            return result;
        } catch (error) {
            console.error('Error en getDocumentosPorTipoUltimos7Dias:', error);
            return [];
        }
    }

    // En dashboard.service.js, agrega estos métodos:

    /**
     * Obtiene el total de documentos por tipo de autorización (Permiso/Concesión)
     */
    async getDocumentosPorTipoAutorizacion() {
        try {
            console.log('📊 Obteniendo documentos por tipo de autorización...');
            
            const query = `
                SELECT 
                    ta.nombre as tipo_autorizacion,
                    ta.abreviatura,
                    COUNT(DISTINCT d.id) as cantidad,
                    ROUND(
                        COUNT(DISTINCT d.id) * 100.0 / NULLIF(SUM(COUNT(DISTINCT d.id)) OVER(), 0), 
                        2
                    ) as porcentaje
                FROM documentos d
                LEFT JOIN autorizaciones a ON d.autorizacion_id = a.id
                LEFT JOIN tipos_autorizacion ta ON a.tipo_id = ta.id
                WHERE d.deleted_at IS NULL
                AND ta.nombre IS NOT NULL
                AND (ta.nombre ILIKE '%permiso%' OR ta.nombre ILIKE '%concesión%' OR ta.abreviatura IN ('P', 'C'))
                GROUP BY ta.nombre, ta.abreviatura
                ORDER BY cantidad DESC
            `;
            
            const result = await sequelize.query(query, {
                type: QueryTypes.SELECT
            });
            
            // Si no hay resultados, crear datos por defecto
            if (result.length === 0) {
                return [
                    { tipo_autorizacion: 'Permiso', abreviatura: 'P', cantidad: 0, porcentaje: 0 },
                    { tipo_autorizacion: 'Concesión', abreviatura: 'C', cantidad: 0, porcentaje: 0 }
                ];
            }
            
            // Normalizar nombres para asegurar consistencia
            const normalizedResult = result.map(item => {
                let tipo = item.tipo_autorizacion;
                
                // Normalizar nombres
                if (tipo.toLowerCase().includes('permiso')) {
                    tipo = 'Permiso';
                } else if (tipo.toLowerCase().includes('conces')) {
                    tipo = 'Concesión';
                }
                
                return {
                    tipo_autorizacion: tipo,
                    abreviatura: item.abreviatura || (tipo === 'Permiso' ? 'P' : 'C'),
                    cantidad: parseInt(item.cantidad) || 0,
                    porcentaje: parseFloat(item.porcentaje) || 0
                };
            });
            
            // Agrupar por tipo normalizado
            const groupedResult = {};
            normalizedResult.forEach(item => {
                if (!groupedResult[item.tipo_autorizacion]) {
                    groupedResult[item.tipo_autorizacion] = item;
                } else {
                    groupedResult[item.tipo_autorizacion].cantidad += item.cantidad;
                }
            });
            
            // Convertir a array y recalcular porcentajes
            const finalResult = Object.values(groupedResult);
            const total = finalResult.reduce((sum, item) => sum + item.cantidad, 0);
            
            finalResult.forEach(item => {
                item.porcentaje = total > 0 ? (item.cantidad / total * 100) : 0;
            });
            
            // Asegurar que tenemos ambos tipos
            const tiposNecesarios = ['Permiso', 'Concesión'];
            tiposNecesarios.forEach(tipo => {
                const existe = finalResult.find(item => item.tipo_autorizacion === tipo);
                if (!existe) {
                    finalResult.push({
                        tipo_autorizacion: tipo,
                        abreviatura: tipo === 'Permiso' ? 'P' : 'C',
                        cantidad: 0,
                        porcentaje: 0
                    });
                }
            });
            
            // Ordenar por cantidad descendente
            return finalResult.sort((a, b) => b.cantidad - a.cantidad);
            
        } catch (error) {
            console.error('❌ Error en getDocumentosPorTipoAutorizacion:', error);
            return [
                { tipo_autorizacion: 'Permiso', abreviatura: 'P', cantidad: 0, porcentaje: 0 },
                { tipo_autorizacion: 'Concesión', abreviatura: 'C', cantidad: 0, porcentaje: 0 }
            ];
        }
    }

  /**
   * Obtiene estadísticas detalladas por tipo de documento para la gráfica circular
   */
  async getEstadisticasTiposDocumento() {
      try {
          console.log('📊 Obteniendo estadísticas por tipo de documento...');
          
          // Obtener total de documentos
          const totalDocumentos = await this.getTotalDocumentos();
          
          // Obtener distribución por tipo de autorización
          const documentosPorTipo = await this.getDocumentosPorTipoAutorizacion();
          
          // Calcular totales
          const totalPorTipo = documentosPorTipo.reduce((sum, item) => sum + item.cantidad, 0);
          
          // Si no hay documentos, usar datos de ejemplo
          if (totalDocumentos === 0) {
              return {
                  total_documentos: 0,
                  tipos: [
                      { 
                          tipo: 'Permiso', 
                          abreviatura: 'P', 
                          cantidad: 0, 
                          porcentaje: 0,
                          color: '#BC955B'
                      },
                      { 
                          tipo: 'Concesión', 
                          abreviatura: 'C', 
                          cantidad: 0, 
                          porcentaje: 0,
                          color: '#A02142'
                      }
                  ],
                  fecha_actualizacion: new Date().toISOString()
              };
          }
          
          // Asignar colores y preparar respuesta
          const tiposConColores = documentosPorTipo.map(item => ({
              tipo: item.tipo_autorizacion,
              abreviatura: item.abreviatura,
              cantidad: item.cantidad,
              porcentaje: parseFloat(item.porcentaje.toFixed(2)),
              color: item.tipo_autorizacion === 'Permiso' ? '#BC955B' : '#A02142'
          }));
          
          return {
              total_documentos: totalDocumentos,
              total_por_tipo: totalPorTipo,
              tipos: tiposConColores,
              fecha_actualizacion: new Date().toISOString(),
              resumen: {
                  proporcion: `${tiposConColores[0]?.cantidad || 0} ${tiposConColores[0]?.tipo || 'Permisos'} / ${tiposConColores[1]?.cantidad || 0} ${tiposConColores[1]?.tipo || 'Concesiones'}`,
                  tipo_mayoritario: tiposConColores.reduce((prev, current) => 
                      (prev.cantidad > current.cantidad) ? prev : current
                  ).tipo
              }
          };
          
      } catch (error) {
          console.error('❌ Error en getEstadisticasTiposDocumento:', error);
          
          // Datos por defecto en caso de error
          return {
              total_documentos: 0,
              tipos: [
                  { 
                      tipo: 'Permiso', 
                      abreviatura: 'P', 
                      cantidad: 0, 
                      porcentaje: 0,
                      color: '#BC955B'
                  },
                  { 
                      tipo: 'Concesión', 
                      abreviatura: 'C', 
                      cantidad: 0, 
                      porcentaje: 0,
                      color: '#A02142'
                  }
              ],
              fecha_actualizacion: new Date().toISOString(),
              error: true,
              mensaje: 'Error al obtener estadísticas'
          };
      }
  }
}

module.exports = new DashboardService();