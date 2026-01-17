// reports/services/users.service.js
const { Op, QueryTypes } = require("sequelize");
const sequelize = require("../../../config/db");

class UsersReportService {
    
    /**
     * Obtiene el reporte completo de usuarios con sus roles y permisos de municipios
     * @param {Object} filters - Filtros opcionales para el reporte
     * @returns {Promise<Array>} - Lista de usuarios con información detallada
     */
    async getUsersReport(filters = {}) {
        try {
            const {
                role_id,
                active,
                search,
                start_date,
                end_date,
                include_permissions = true, // TRUE por defecto para incluir permisos de municipios
                limit = 100,
                offset = 0
            } = filters;

            // Construir condiciones WHERE - IMPORTANTE: Solo filtrar por active si se especifica
            let whereConditions = ["u.deleted_at IS NULL"];
            const params = [];
            
            // Filtro por rol (SOLO si el usuario tiene ese rol)
            if (role_id) {
                whereConditions.push("ur.role_id = ?");
                params.push(role_id);
            }
            
            // Filtro por estado activo - SOLO si se especifica
            if (active !== undefined) {
                whereConditions.push("u.active = ?");
                params.push(active);
            }
            // Si NO se especifica 'active', se muestran TODOS los usuarios (activos e inactivos)
            
            // Filtro por texto (búsqueda en nombre, email, username)
            if (search) {
                whereConditions.push(`(
                    u.username ILIKE ? OR 
                    u.first_name ILIKE ? OR 
                    u.last_name ILIKE ? OR 
                    u.email ILIKE ?
                )`);
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }
            
            // Filtro por rango de fechas
            if (start_date) {
                whereConditions.push("u.created_at >= ?");
                params.push(start_date);
            }
            
            if (end_date) {
                whereConditions.push("u.created_at <= ?");
                params.push(end_date);
            }
            
            const whereClause = whereConditions.length > 0 
                ? `WHERE ${whereConditions.join(' AND ')}` 
                : '';
            
            // CONSULTA SQL PRINCIPAL CORREGIDA - OBTENER TODOS LOS USUARIOS
            // CORRECCIÓN CRÍTICA: Usar LEFT JOIN con user_roles y roles
            const usersQuery = `
                SELECT 
                    u.id,
                    u.username,
                    u.first_name,
                    u.last_name,
                    u.second_last_name,
                    u.email,
                    u.phone,
                    u.active,
                    u.cargo_id,
                    u.created_at,
                    u.updated_at,
                    COALESCE(r.name, 'Sin rol asignado') as role_name,
                    COALESCE(r.id, 0) as role_id,
                    COALESCE(permission_counts.total_permissions, 0) as total_permissions
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                LEFT JOIN (
                    SELECT user_id, COUNT(*) as total_permissions
                    FROM user_municipality_permissions
                    GROUP BY user_id
                ) permission_counts ON u.id = permission_counts.user_id
                ${whereClause}
                GROUP BY u.id, r.id, permission_counts.total_permissions
                ORDER BY u.created_at DESC
                LIMIT ${parseInt(limit)}
                OFFSET ${parseInt(offset)}
            `;
            
            // Ejecutar consulta principal de usuarios
            const users = await sequelize.query(usersQuery, {
                replacements: params,
                type: QueryTypes.SELECT
            });
            
            console.log('📊 Usuarios encontrados en consulta:', users.length);
            console.log('👤 Usuarios con detalles:', users.map(u => ({
                id: u.id,
                username: u.username,
                active: u.active,
                role: u.role_name,
                role_id: u.role_id
            })));
            
            // **OBTENER PERMISOS DE MUNICIPIOS PARA CADA USUARIO**
            if (include_permissions) {
                const usersWithPermissions = await Promise.all(
                    users.map(async (user) => {
                        if (user.total_permissions > 0) {
                            // Obtener permisos de municipios del usuario
                            const permissionsQuery = `
                                SELECT 
                                    ump.id,
                                    ump.user_id,
                                    ump.municipio_id,
                                    ump.permission_id,
                                    ump.is_exception,
                                    ump.created_at as assigned_at,
                                    p.name as permission_name,
                                    p.description as permission_description,
                                    m.num as municipio_num,
                                    m.nombre as municipio_nombre
                                FROM user_municipality_permissions ump
                                LEFT JOIN permissions p ON ump.permission_id = p.id
                                LEFT JOIN municipios m ON ump.municipio_id = m.id
                                WHERE ump.user_id = ?
                                ORDER BY m.num, p.id
                            `;
                            
                            const permissions = await sequelize.query(permissionsQuery, {
                                replacements: [user.id],
                                type: QueryTypes.SELECT
                            });
                            
                            // Formatear permisos
                            const formattedPermissions = permissions.map(perm => ({
                                id: perm.id,
                                user_id: perm.user_id,
                                municipio_id: perm.municipio_id,
                                municipio_num: perm.municipio_num,
                                municipio_nombre: perm.municipio_nombre,
                                permission_id: perm.permission_id,
                                permission_name: perm.permission_name,
                                description: perm.permission_description || 'Sin descripción',
                                is_exception: perm.is_exception,
                                exception_type: perm.is_exception ? 'Excepción' : 'Permitido',
                                assigned_at: perm.assigned_at
                            }));
                            
                            // Agrupar permisos por municipio para mejor presentación
                            const permissionsByMunicipality = this.groupPermissionsByMunicipality(formattedPermissions);
                            
                            return {
                                ...user,
                                permissions: formattedPermissions,
                                permissions_by_municipality: permissionsByMunicipality,
                                total_permissions: formattedPermissions.length
                            };
                        } else {
                            return {
                                ...user,
                                permissions: [],
                                permissions_by_municipality: [],
                                total_permissions: 0
                            };
                        }
                    })
                );
                
                // Procesar los datos para el reporte
                const processedUsers = this.processUsersData(usersWithPermissions, true);
                
                // Obtener estadísticas del reporte
                const stats = await this.getReportStatistics(filters);
                
                console.log('📈 Estadísticas obtenidas:', {
                    total_all_users: stats.totalUsers,
                    active: stats.activeUsers,
                    inactive: stats.inactiveUsers,
                    total_with_role: stats.totalUsersWithRole,
                    total_without_role: stats.totalUsersWithoutRole,
                    roles: stats.rolesDistribution
                });
                
                return {
                    success: true,
                    data: processedUsers,
                    metadata: {
                        total_users: stats.totalUsers, // TODOS los usuarios (activos e inactivos)
                        total_users_with_role: stats.totalUsersWithRole, // Solo usuarios con rol
                        active: stats.activeUsers,
                        inactive: stats.inactiveUsers,
                        roles_distribution: stats.rolesDistribution,
                        pagination: {
                            limit: parseInt(limit),
                            offset: parseInt(offset),
                            hasMore: (parseInt(offset) + users.length) < stats.totalUsers
                        }
                    }
                };
            } else {
                // Si no se solicitan permisos, procesar normalmente
                const processedUsers = this.processUsersData(users, false);
                const stats = await this.getReportStatistics(filters);
                
                return {
                    success: true,
                    data: processedUsers,
                    metadata: {
                        total_users: stats.totalUsers, // TODOS los usuarios
                        total_users_with_role: stats.totalUsersWithRole, // Solo usuarios con rol
                        active: stats.activeUsers,
                        inactive: stats.inactiveUsers,
                        roles_distribution: stats.rolesDistribution,
                        pagination: {
                            limit: parseInt(limit),
                            offset: parseInt(offset),
                            hasMore: (parseInt(offset) + users.length) < stats.totalUsers
                        }
                    }
                };
            }

        } catch (error) {
            console.error('❌ Error en UsersReportService.getUsersReport:', error);
            throw new Error(`Error al generar reporte de usuarios: ${error.message}`);
        }
    }

    /**
     * Agrupa permisos por municipio para mejor presentación
     * @param {Array} permissions - Lista de permisos
     * @returns {Array} - Permisos agrupados por municipio
     */
    groupPermissionsByMunicipality(permissions) {
        const grouped = {};
        
        permissions.forEach(perm => {
            const municipioKey = `${perm.municipio_num} - ${perm.municipio_nombre}`;
            
            if (!grouped[municipioKey]) {
                grouped[municipioKey] = {
                    municipio_id: perm.municipio_id,
                    municipio_num: perm.municipio_num,
                    municipio_nombre: perm.municipio_nombre,
                    permissions: [],
                    total_permissions: 0,
                    exceptions: 0,
                    regular_permissions: 0
                };
            }
            
            grouped[municipioKey].permissions.push({
                permission_id: perm.permission_id,
                permission_name: perm.permission_name,
                description: perm.description,
                is_exception: perm.is_exception,
                exception_type: perm.exception_type,
                assigned_at: perm.assigned_at
            });
            
            grouped[municipioKey].total_permissions++;
            
            if (perm.is_exception) {
                grouped[municipioKey].exceptions++;
            } else {
                grouped[municipioKey].regular_permissions++;
            }
        });
        
        // Convertir a array y ordenar por número de municipio
        return Object.values(grouped)
            .sort((a, b) => a.municipio_num - b.municipio_num);
    }

    /**
     * Procesa los datos de usuarios para el formato del reporte
     * @param {Array} users - Lista de usuarios de Sequelize
     * @param {Boolean} includePermissions - Incluir información de permisos
     * @returns {Array} - Usuarios procesados
     */
    processUsersData(users, includePermissions = false) {
        return users.map(user => {
            const userData = {
                id: user.id,
                username: user.username,
                full_name: `${user.first_name} ${user.last_name}${user.second_last_name ? ' ' + user.second_last_name : ''}`,
                first_name: user.first_name,
                last_name: user.last_name,
                second_last_name: user.second_last_name || '',
                email: user.email,
                phone: user.phone || 'No registrado',
                status: user.active ? 'Activo' : 'Inactivo',
                cargo_id: user.cargo_id,
                created_at: user.created_at,
                last_updated: user.updated_at,
                main_role: user.role_name,
                role_id: user.role_id || 0,
                total_permissions: parseInt(user.total_permissions) || 0
            };

            // Incluir permisos detallados si están disponibles
            if (includePermissions) {
                userData.permissions = user.permissions || [];
                userData.permissions_by_municipality = user.permissions_by_municipality || [];
                
                // Calcular estadísticas de permisos
                userData.permissions_stats = {
                    total: userData.permissions.length,
                    exceptions: userData.permissions.filter(p => p.is_exception).length,
                    regular: userData.permissions.filter(p => !p.is_exception).length,
                    unique_municipalities: [...new Set(userData.permissions.map(p => p.municipio_id))].length
                };
            } else {
                userData.permissions = [];
                userData.permissions_by_municipality = [];
                userData.permissions_stats = {
                    total: 0,
                    exceptions: 0,
                    regular: 0,
                    unique_municipalities: 0
                };
            }

            return userData;
        });
    }

    /**
     * Obtiene estadísticas del reporte
     * @param {Object} filters - Filtros aplicados
     * @returns {Promise<Object>} - Estadísticas
     */
    async getReportStatistics(filters) {
        try {
            // Construir condiciones WHERE para estadísticas
            let whereConditions = ["u.deleted_at IS NULL"];
            const params = [];
            
            // IMPORTANTE: Solo filtrar por active si se especifica explícitamente
            if (filters.active !== undefined) {
                whereConditions.push("u.active = ?");
                params.push(filters.active);
            }
            
            if (filters.search) {
                whereConditions.push(`(
                    u.username ILIKE ? OR 
                    u.first_name ILIKE ? OR 
                    u.last_name ILIKE ? OR 
                    u.email ILIKE ?
                )`);
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }
            
            const whereClause = whereConditions.length > 0 
                ? `WHERE ${whereConditions.join(' AND ')}` 
                : '';
            
            // ESTADÍSTICAS COMPLETAS - TODOS LOS USUARIOS
            const statsQuery = `
                SELECT 
                    COUNT(DISTINCT u.id) as total_all_users,
                    COUNT(CASE WHEN u.active = true THEN 1 END) as active_count,
                    COUNT(CASE WHEN u.active = false THEN 1 END) as inactive_count,
                    COUNT(DISTINCT CASE WHEN ur.user_id IS NOT NULL THEN u.id END) as total_with_role,
                    COUNT(DISTINCT CASE WHEN ur.user_id IS NULL THEN u.id END) as total_without_role
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                ${whereClause}
            `;
            
            const stats = await sequelize.query(statsQuery, {
                replacements: params,
                type: QueryTypes.SELECT
            });
            
            console.log('📊 Consulta stats ejecutada:', {
                query: statsQuery,
                params: params,
                result: stats[0]
            });
            
            // DISTRIBUCIÓN POR ROLES - SOLO USUARIOS CON ROL
            const rolesQuery = `
                SELECT 
                    COALESCE(r.name, 'Sin rol asignado') as role_name,
                    COALESCE(r.id, 0) as role_id,
                    COUNT(DISTINCT u.id) as user_count
                FROM users u
                INNER JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                ${whereClause}
                GROUP BY r.id, r.name
                ORDER BY user_count DESC
            `;
            
            const rolesDistribution = await sequelize.query(rolesQuery, {
                replacements: params,
                type: QueryTypes.SELECT
            });
            
            console.log('🎯 Distribución por roles:', rolesDistribution);
            
            // Estadísticas de permisos
            const permissionsQuery = `
                SELECT 
                    COUNT(*) as total_permissions,
                    COUNT(CASE WHEN ump.is_exception = true THEN 1 END) as total_exceptions,
                    COUNT(DISTINCT ump.user_id) as users_with_permissions,
                    COUNT(DISTINCT ump.municipio_id) as total_municipalities
                FROM user_municipality_permissions ump
                LEFT JOIN users u ON ump.user_id = u.id
                WHERE u.deleted_at IS NULL
            `;
            
            const permissionsStats = await sequelize.query(permissionsQuery, {
                type: QueryTypes.SELECT
            });
            
            return {
                totalUsers: parseInt(stats[0]?.total_all_users) || 0, // TODOS los usuarios
                activeUsers: parseInt(stats[0]?.active_count) || 0,
                inactiveUsers: parseInt(stats[0]?.inactive_count) || 0,
                totalUsersWithRole: parseInt(stats[0]?.total_with_role) || 0, // Solo usuarios CON rol
                totalUsersWithoutRole: parseInt(stats[0]?.total_without_role) || 0, // Usuarios SIN rol
                rolesDistribution: rolesDistribution.map(item => ({
                    role_id: item.role_id || 0,
                    role_name: item.role_name,
                    user_count: parseInt(item.user_count) || 0
                })),
                permissionsStats: {
                    total: parseInt(permissionsStats[0]?.total_permissions) || 0,
                    exceptions: parseInt(permissionsStats[0]?.total_exceptions) || 0,
                    users_with_permissions: parseInt(permissionsStats[0]?.users_with_permissions) || 0,
                    total_municipalities: parseInt(permissionsStats[0]?.total_municipalities) || 0
                }
            };

        } catch (error) {
            console.error('❌ Error en UsersReportService.getReportStatistics:', error);
            return {
                totalUsers: 0,
                activeUsers: 0,
                inactiveUsers: 0,
                totalUsersWithRole: 0,
                totalUsersWithoutRole: 0,
                rolesDistribution: [],
                permissionsStats: {
                    total: 0,
                    exceptions: 0,
                    users_with_permissions: 0,
                    total_municipalities: 0
                }
            };
        }
    }

    /**
     * Obtiene permisos de municipios específicos de un usuario
     * @param {Number} userId - ID del usuario
     * @returns {Promise<Array>} - Permisos del usuario
     */
    async getUserMunicipalityPermissions(userId) {
        try {
            const query = `
                SELECT 
                    ump.id,
                    ump.user_id,
                    ump.municipio_id,
                    ump.permission_id,
                    ump.is_exception,
                    ump.created_at as assigned_at,
                    p.name as permission_name,
                    p.description as permission_description,
                    m.num as municipio_num,
                    m.nombre as municipio_nombre
                FROM user_municipality_permissions ump
                LEFT JOIN permissions p ON ump.permission_id = p.id
                LEFT JOIN municipios m ON ump.municipio_id = m.id
                WHERE ump.user_id = ?
                ORDER BY m.num, p.id
            `;
            
            const permissions = await sequelize.query(query, {
                replacements: [userId],
                type: QueryTypes.SELECT
            });
            
            return permissions.map(perm => ({
                id: perm.id,
                user_id: perm.user_id,
                municipio_id: perm.municipio_id,
                municipio_num: perm.municipio_num,
                municipio_nombre: perm.municipio_nombre,
                permission_id: perm.permission_id,
                permission_name: perm.permission_name,
                description: perm.permission_description || 'Sin descripción',
                is_exception: perm.is_exception,
                exception_type: perm.is_exception ? 'Excepción' : 'Permitido',
                assigned_at: perm.assigned_at
            }));
            
        } catch (error) {
            console.error('❌ Error obteniendo permisos de municipios del usuario:', error);
            return [];
        }
    }

    /**
     * Genera un reporte resumido de permisos por municipio
     * @returns {Promise<Object>} - Reporte de permisos por municipio
     */
    async getPermissionsByMunicipalityReport() {
        try {
            const query = `
                SELECT 
                    m.id as municipio_id,
                    m.num as municipio_num,
                    m.nombre as municipio_nombre,
                    COUNT(ump.id) as total_permisos,
                    COUNT(DISTINCT ump.user_id) as usuarios_con_permisos,
                    COUNT(CASE WHEN ump.is_exception = true THEN 1 END) as total_excepciones,
                    STRING_AGG(DISTINCT p.name, ', ') as permisos_asignados
                FROM municipios m
                LEFT JOIN user_municipality_permissions ump ON m.id = ump.municipio_id
                LEFT JOIN permissions p ON ump.permission_id = p.id
                GROUP BY m.id, m.num, m.nombre
                ORDER BY m.num
            `;
            
            const result = await sequelize.query(query, {
                type: QueryTypes.SELECT
            });
            
            return {
                success: true,
                data: result.map(item => ({
                    municipio_id: item.municipio_id,
                    municipio_num: item.municipio_num,
                    municipio_nombre: item.municipio_nombre,
                    total_permisos: parseInt(item.total_permisos) || 0,
                    usuarios_con_permisos: parseInt(item.usuarios_con_permisos) || 0,
                    total_excepciones: parseInt(item.total_excepciones) || 0,
                    permisos_asignados: item.permisos_asignados || 'Ninguno'
                })),
                metadata: {
                    total_municipalities: result.length,
                    total_permissions: result.reduce((sum, item) => sum + (parseInt(item.total_permisos) || 0), 0),
                    generated_at: new Date().toISOString()
                }
            };
            
        } catch (error) {
            console.error('❌ Error en UsersReportService.getPermissionsByMunicipalityReport:', error);
            throw new Error(`Error al generar reporte por municipios: ${error.message}`);
        }
    }

    /**
     * Convierte datos del reporte a formato CSV
     * @param {Array} data - Datos del reporte
     * @param {Boolean} includePermissions - Incluir permisos detallados
     * @returns {String} - CSV string
     */
    convertToCSV(data, includePermissions = false) {
        if (!data || data.length === 0) return '';
        
        let headers = [
            'ID',
            'Usuario',
            'Nombre Completo',
            'Email',
            'Teléfono',
            'Estado',
            'Rol Principal',
            'Total Permisos',
            'Municipios Únicos',
            'Excepciones',
            'Fecha Creación'
        ];
        
        let rows = data.map(user => [
            user.id,
            `"${user.username}"`,
            `"${user.full_name}"`,
            `"${user.email}"`,
            `"${user.phone}"`,
            user.status,
            user.main_role,
            user.total_permissions,
            user.permissions_stats?.unique_municipalities || 0,
            user.permissions_stats?.exceptions || 0,
            new Date(user.created_at).toLocaleDateString('es-MX')
        ]);
        
        // Si se incluyen permisos, agregar sección separada
        if (includePermissions) {
            let permissionsCSV = '\n\nPERMISOS DETALLADOS POR MUNICIPIO\n';
            permissionsCSV += 'Usuario,Municipio,Permiso,Tipo,Descripción,Fecha Asignación\n';
            
            data.forEach(user => {
                if (user.permissions && user.permissions.length > 0) {
                    user.permissions.forEach(perm => {
                        permissionsCSV += [
                            `"${user.username}"`,
                            `"${perm.municipio_num} - ${perm.municipio_nombre}"`,
                            `"${perm.permission_name}"`,
                            `"${perm.exception_type}"`,
                            `"${perm.description}"`,
                            new Date(perm.assigned_at).toLocaleDateString('es-MX')
                        ].join(',') + '\n';
                    });
                }
            });
            
            return [
                headers.join(','),
                ...rows.map(row => row.join(',')),
                permissionsCSV
            ].join('\n');
        }
        
        return [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
    }
}

module.exports = new UsersReportService();