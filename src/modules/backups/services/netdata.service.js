// src/modules/backups/services/netdata.service.js
const axios = require('axios');
const NETDATA_URL = 'http://localhost:19999';

/**
 * Obtiene datos crudos de Netdata
 * @param {string} chart - ID del chart
 * @param {number} points - Cantidad de registros (after: -points)
 */
async function fetchFromNetdata(chart, points = 1) {
    try {
        const res = await axios.get(`${NETDATA_URL}/api/v1/data`, {
            params: {
                chart,
                after: -Math.abs(points),
                points: points, // Forzamos la cantidad de puntos
                format: 'json'
            }
        });
        return res.data; // { labels, data: [ [], [] ] }
    } catch (error) {
        console.error(`Netdata Error (${chart}):`, error.message);
        return null;
    }
}

/**
 * Almacenamiento Estático (Disco y Archivos)
 */
async function getStorageData() {
    // Usamos el chart que confirmamos que existe
    const disk = await fetchFromNetdata('disk_space./data', 1);
    
    // Simulación de conteo de archivos/carpetas (Genérico)
    const fileStats = {
        total: 85420,
        folders: 1240
    };

    return {
        disk: disk || { labels: ['avail', 'used'], data: [[0, 0]] },
        files: fileStats
    };
}

/**
 * Rendimiento con Historial (CPU y RAM)
 */
async function getLivePerformance() {
    // Pedimos 30 puntos para que la gráfica de Angular se vea con movimiento
    const [cpuRaw, ramRaw] = await Promise.all([
        fetchFromNetdata('system.cpu', 30),
        fetchFromNetdata('system.ram', 30)
    ]);

    return {
        cpu: cpuRaw || { labels: ['idle'], data: [[100]] },
        ram: ramRaw || { labels: ['used', 'free'], data: [[0, 0]] }
    };
}

module.exports = {
    getStorageData,
    getLivePerformance
};