const PDFDocument = require('pdfkit');

class EjemploReportController {
  
  async generarPDFDetallado(req, res) {
    try {
      console.log('=== GENERANDO REPORTE OFICIAL DETALLADO ===');
      console.log('Tipo solicitado:', req.body?.reportType || 'General');
      console.log('Timestamp:', new Date().toISOString());
      
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true,
        info: {
          Title: 'Reporte Oficial STCH',
          Author: 'Sistema de Gestión Documental',
          Subject: 'Reporte de Actividad y Métricas',
          Keywords: 'STCH, reporte, métricas, digitalización'
        }
      });
      
      // Configurar headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="reporte_oficial_stch_${Date.now()}.pdf"`);
      
      doc.pipe(res);
      
      // ==============================================
      // ENCABEZADO OFICIAL
      // ==============================================
      
      // Línea superior institucional
      doc.fontSize(8)
         .fillColor('#1e3a8a')
         .font('Helvetica-Bold')
         .text('SISTEMA DE GESTIÓN DOCUMENTAL STCH', 40, 40, { align: 'center' });
      
      doc.fontSize(7)
         .fillColor('#374151')
         .font('Helvetica')
         .text('Entidad Gubernamental • Clasificación: Confidencial • Código: STCH-DOC-2025', 40, 55, { align: 'center' });
      
      // Línea divisoria
      doc.moveTo(40, 70)
         .lineTo(555, 70)
         .lineWidth(1)
         .stroke('#1e3a8a');
      
      doc.moveDown(4);
      
      // ==============================================
      // TÍTULO PRINCIPAL
      // ==============================================
      
      doc.fontSize(16)
         .fillColor('#000000')
         .font('Helvetica-Bold')
         .text('INFORME TÉCNICO DE ACTIVIDAD', { align: 'center' });
      
      doc.fontSize(10)
         .fillColor('#4b5563')
         .font('Helvetica')
         .text('Análisis cuantitativo del sistema de digitalización documental', { align: 'center' });
      
      doc.moveDown(1);
      
      // Información de referencia
      doc.fontSize(8)
         .fillColor('#6b7280')
         .text(`Número de referencia: STCH-RPT-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-4)}`, { align: 'center' });
      
      doc.text(`Período de análisis: 01 de diciembre de 2025 al 20 de diciembre de 2025`, { align: 'center' });
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });
      
      doc.moveDown(2);
      
      // Línea divisoria
      doc.moveTo(40, doc.y)
         .lineTo(555, doc.y)
         .lineWidth(0.5)
         .stroke('#9ca3af');
      
      doc.moveDown(1.5);
      
      // ==============================================
      // RESUMEN EJECUTIVO
      // ==============================================
      
      this.addSectionHeader(doc, 'I. RESUMEN EJECUTIVO');
      
      doc.fontSize(9)
         .fillColor('#374151')
         .text('El presente documento proporciona un análisis exhaustivo de las operaciones del sistema de digitalización documental durante el período especificado. Los datos reflejan el rendimiento general del sistema, métricas de calidad y tendencias operativas.');
      
      doc.moveDown(1);
      
      // Tabla de resumen ejecutivo
      const summaryData = [
        { indicador: 'Total de expedientes procesados', valor: '20,400', unidad: 'unidades' },
        { indicador: 'Volumen de páginas digitalizadas', valor: '9,650,000', unidad: 'páginas' },
        { indicador: 'Precisión promedio del OCR', valor: '94.2', unidad: '%' },
        { indicador: 'Usuarios activos del sistema', valor: '85', unidad: 'usuarios' },
        { indicador: 'Velocidad promedio de procesamiento', valor: '1,245', unidad: 'páginas/hora' },
        { indicador: 'Tasa de crecimiento mensual', valor: '+8.3', unidad: '%' }
      ];
      
      this.createCompactTable(doc, summaryData, ['Indicador', 'Valor', 'Unidad']);
      
      doc.moveDown(1.5);
      
      // Observación del resumen
      doc.fontSize(8)
         .fillColor('#6b7280')
         .text('Nota: Los datos presentados corresponden al período de análisis especificado y están sujetos a validación por el departamento de calidad.', 50, doc.y, {
           width: 500
         });
      
      doc.moveDown(2);
      
      // ==============================================
      // ANÁLISIS DETALLADO
      // ==============================================
      
      this.addSectionHeader(doc, 'II. ANÁLISIS DETALLADO POR MÉTRICA');
      
      // 1. PROCESAMIENTO DE EXPEDIENTES
      doc.fontSize(10)
         .fillColor('#1e40af')
         .font('Helvetica-Bold')
         .text('II.1. Procesamiento de Expedientes', 50, doc.y);
      
      doc.moveDown(0.5);
      
      doc.fontSize(9)
         .fillColor('#374151')
         .text('La siguiente tabla detalla el procesamiento mensual de expedientes, comparado con las metas establecidas para cada período:');
      
      doc.moveDown(0.5);
      
      const expedientesData = [
        { periodo: 'Enero 2025', procesados: 1800, meta: 2000, cumplimiento: 90.0 },
        { periodo: 'Febrero 2025', procesados: 1950, meta: 2000, cumplimiento: 97.5 },
        { periodo: 'Marzo 2025', procesados: 2100, meta: 2200, cumplimiento: 95.5 },
        { periodo: 'Abril 2025', procesados: 2250, meta: 2200, cumplimiento: 102.3 },
        { periodo: 'Mayo 2025', procesados: 2400, meta: 2400, cumplimiento: 100.0 },
        { periodo: 'Junio 2025', procesados: 2550, meta: 2500, cumplimiento: 102.0 },
        { periodo: 'Julio 2025', procesados: 2700, meta: 2600, cumplimiento: 103.8 },
        { periodo: 'Agosto 2025', procesados: 2850, meta: 2700, cumplimiento: 105.6 },
        { periodo: 'Septiembre 2025', procesados: 3000, meta: 2800, cumplimiento: 107.1 },
        { periodo: 'Octubre 2025', procesados: 3150, meta: 2900, cumplimiento: 108.6 },
        { periodo: 'Noviembre 2025', procesados: 3300, meta: 3000, cumplimiento: 110.0 },
        { periodo: 'Diciembre 2025*', procesados: 3450, meta: 3100, cumplimiento: 111.3 }
      ];
      
      const expedientesTable = expedientesData.map(item => [
        item.periodo,
        item.procesados.toLocaleString(),
        item.meta.toLocaleString(),
        `${item.cumplimiento.toFixed(1)}%`
      ]);
      
      expedientesTable.unshift(['Período', 'Expedientes Procesados', 'Meta Establecida', '% Cumplimiento']);
      
      this.createFormalTable(doc, expedientesTable);
      
      doc.moveDown(1);
      
      doc.fontSize(8)
         .fillColor('#6b7280')
         .text('* Datos proyectados al 20 de diciembre de 2025', 50, doc.y);
      
      doc.moveDown(2);
      
      // 2. ACTIVIDAD DEL SISTEMA
      this.addSubsectionHeader(doc, 'II.2. Actividad del Sistema');
      
      doc.fontSize(9)
         .fillColor('#374151')
         .text('Métricas de uso y actividad del sistema durante el período de análisis:');
      
      doc.moveDown(0.5);
      
      const actividadData = [
        ['Sesiones totales del sistema', '1,250', '+12.0%'],
        ['Promedio diario de sesiones', '178', '+8.2%'],
        ['Duración promedio por sesión', '24.5 minutos', '+1.8%'],
        ['Horario pico de actividad', '09:00 - 11:00', 'Estable'],
        ['Accesos desde estaciones de trabajo', '830 (66.4%)', '+4.8%'],
        ['Accesos desde dispositivos móviles', '420 (33.6%)', '+15.2%'],
        ['Total de búsquedas realizadas', '3,560', '+14.7%'],
        ['Tasa de éxito en búsquedas', '87.9%', '+3.1%']
      ];
      
      actividadData.unshift(['Métrica', 'Valor', 'Variación vs. período anterior']);
      
      this.createFormalTable(doc, actividadData, [180, 100, 120]);
      
      doc.moveDown(2);
      
      // 3. CALIDAD DEL PROCESAMIENTO - CORREGIDO
      this.addSubsectionHeader(doc, 'II.3. Calidad del Procesamiento');
      
      doc.fontSize(9)
         .fillColor('#374151')
         .text('Análisis de precisión y calidad en el procesamiento documental:');
      
      doc.moveDown(0.5);
      
      const calidadData = [
        ['Precisión general del sistema', '94.2%', '+1.8%'],
        ['Formularios administrativos', '97.8%', '+0.5%'],
        ['Documentos contractuales', '92.4%', '+2.1%'],
        ['Facturas y comprobantes', '95.6%', '+1.3%'],
        ['Correspondencia oficial', '91.2%', '+2.8%'],
        ['Otros documentos diversos', '89.3%', '+3.2%']
      ];
      
      calidadData.unshift(['Tipo de Documento', 'Tasa de Precisión', 'Mejora vs. trimestre anterior']);
      
      this.createFormalTable(doc, calidadData);
      
      doc.moveDown(1);
      
      // Análisis de errores - CORREGIDO
      doc.fontSize(9)
         .fillColor('#374151')
         .font('Helvetica-Bold')
         .text('Distribución de errores detectados:');
      
      doc.moveDown(0.5);
      
      const erroresData = [
        { tipo: 'Reconocimiento de caracteres', cantidad: 45, porcentaje: 43.3 },
        { tipo: 'Alineación de documento', cantidad: 28, porcentaje: 26.9 },
        { tipo: 'Detección de tablas', cantidad: 19, porcentaje: 18.3 },
        { tipo: 'Separación de páginas', cantidad: 12, porcentaje: 11.5 }
      ];
      
      const errorsStartY = doc.y;
      
      erroresData.forEach((error, index) => {
        const y = errorsStartY + (index * 25); // Usar posición fija en lugar de doc.y
        
        // Tipo de error
        doc.fontSize(8)
           .fillColor('#4b5563')
           .font('Helvetica')
           .text(error.tipo, 50, y, { width: 250 });
        
        // Cantidad
        doc.fontSize(8)
           .fillColor('#374151')
           .font('Helvetica-Bold')
           .text(error.cantidad.toString(), 310, y, { width: 50, align: 'right' });
        
        // Barra de porcentaje
        const barWidth = error.porcentaje * 2;
        doc.rect(370, y + 1, barWidth, 6)
           .fill(error.porcentaje > 30 ? '#ef4444' : '#f59e0b');
        
        // Porcentaje
        doc.fontSize(8)
           .fillColor('#374151')
           .font('Helvetica')
           .text(`${error.porcentaje.toFixed(1)}%`, 470, y, { width: 50, align: 'right' });
      });
      
      // Actualizar posición Y después de las barras
      doc.y = errorsStartY + (erroresData.length * 25);
      
      doc.moveDown(1.5);
      
      // ==============================================
      // ANÁLISIS POR DEPARTAMENTO
      // ==============================================
      
      this.addSectionHeader(doc, 'III. RENDIMIENTO POR DEPARTAMENTO');
      
      doc.fontSize(9)
         .fillColor('#374151')
         .text('Comparativa del rendimiento entre las diferentes unidades administrativas:');
      
      doc.moveDown(0.5);
      
      const departamentosData = [
        ['Administración Central', '2,450', '850,000', '96.5%', '45 min', 'Sobresaliente'],
        ['Recursos Humanos', '1,890', '620,000', '94.8%', '52 min', 'Adecuado'],
        ['Contabilidad y Finanzas', '3,210', '1,250,000', '92.1%', '68 min', 'Requiere atención'],
        ['Asesoría Jurídica', '1,750', '890,000', '97.2%', '39 min', 'Sobresaliente'],
        ['Operaciones Técnicas', '2,980', '980,000', '93.5%', '58 min', 'Adecuado'],
        ['Archivo General', '4,120', '1,450,000', '91.8%', '72 min', 'Requiere mejora']
      ];
      
      departamentosData.unshift(['Departamento', 'Expedientes', 'Páginas', 'Precisión', 'Tiempo Promedio', 'Evaluación']);
      
      this.createFormalTable(doc, departamentosData, [140, 80, 90, 80, 90, 100]);
      
      doc.moveDown(1);
      
      doc.fontSize(8)
         .fillColor('#6b7280')
         .text('Nota: El tiempo promedio se refiere al tiempo de procesamiento por lote de 100 documentos.', 50, doc.y);
      
      doc.moveDown(2);
      
      // ==============================================
      // PROYECCIONES Y TENDENCIAS
      // ==============================================
      
      this.addSectionHeader(doc, 'IV. PROYECCIONES Y TENDENCIAS');
      
      doc.fontSize(9)
         .fillColor('#374151')
         .text('Análisis proyectivo basado en los datos históricos y tendencias actuales:');
      
      doc.moveDown(0.5);
      
      const proyeccionesData = [
        ['Crecimiento mensual de expedientes', '+8.3%', '+9.5%', 'Estacionalidad positiva'],
        ['Incorporación de nuevos usuarios', '12/mes', '15/mes', 'Capacitación programada'],
        ['Volumen diario de digitalización', '12,400 pág.', '14,800 pág.', 'Incremento de capacidad'],
        ['Utilización de almacenamiento', '85%', '92%', 'Ampliación requerida Q2 2026'],
        ['Tiempo de respuesta del sistema', '1.2 seg.', '0.9 seg.', 'Optimización en progreso'],
        ['Costo por página procesada', '$0.024', '$0.021', 'Eficiencia operativa']
      ];
      
      proyeccionesData.unshift(['Indicador', 'Actual (Q4 2025)', 'Proyectado (Q1 2026)', 'Observaciones']);
      
      this.createFormalTable(doc, proyeccionesData, [150, 90, 90, 170]);
      
      doc.moveDown(2);
      
      // ==============================================
      // CONCLUSIONES Y RECOMENDACIONES
      // ==============================================
      
      this.addSectionHeader(doc, 'V. CONCLUSIONES Y RECOMENDACIONES');
      
      doc.fontSize(9)
         .fillColor('#374151')
         .font('Helvetica-Bold')
         .text('Conclusiones Principales:');
      
      doc.moveDown(0.3);
      
      const conclusiones = [
        '1. El sistema mantiene una tendencia de crecimiento positiva en el procesamiento de expedientes, superando consistentemente las metas establecidas.',
        '2. Se observa una mejora continua en la precisión del OCR, particularmente en documentos contractuales y correspondencia oficial.',
        '3. El departamento de Contabilidad y Finanzas requiere atención específica para mejorar sus métricas de calidad y tiempo de procesamiento.',
        '4. La capacidad de almacenamiento actual alcanzará su límite operativo durante el segundo trimestre de 2026, requiriendo planificación anticipada.',
        '5. La adopción de acceso móvil muestra un crecimiento significativo, indicando la necesidad de optimizar la experiencia en dispositivos portátiles.'
      ];
      
      conclusiones.forEach(conclusion => {
        doc.fontSize(8)
           .fillColor('#4b5563')
           .font('Helvetica')
           .text(conclusion, 50, doc.y, {
             width: 500,
             indent: 10,
             paragraphGap: 3
           });
      });
      
      doc.moveDown(1);
      
      doc.fontSize(9)
         .fillColor('#374151')
         .font('Helvetica-Bold')
         .text('Recomendaciones Técnicas:');
      
      doc.moveDown(0.3);
      
      const recomendaciones = [
        '1. Implementar un programa de capacitación específico para el personal del departamento de Contabilidad y Finanzas.',
        '2. Iniciar el proceso de adquisición de capacidad de almacenamiento adicional durante el primer trimestre de 2026.',
        '3. Desarrollar e implementar optimizaciones en la interfaz móvil del sistema para Q1 2026.',
        '4. Establecer un grupo de trabajo para revisar y mejorar los procesos de digitalización en el Archivo General.',
        '5. Programar mantenimiento preventivo del sistema OCR durante el primer fin de semana de enero 2026.'
      ];
      
      recomendaciones.forEach(recomendacion => {
        doc.fontSize(8)
           .fillColor('#4b5563')
           .font('Helvetica')
           .text(recomendacion, 50, doc.y, {
             width: 500,
             indent: 10,
             paragraphGap: 3
           });
      });
      
      doc.moveDown(3);
      
      // ==============================================
      // FIRMAS Y VALIDACIONES - CORREGIDO
      // ==============================================
      
      doc.fontSize(8)
         .fillColor('#374151')
         .text('Elaborado por:', 50, doc.y);
      
      doc.moveDown(1.5);
      
      const firmasY = doc.y;
      
      // Firma 1 (Izquierda)
      doc.moveTo(50, firmasY)
         .lineTo(250, firmasY)
         .lineWidth(0.5)
         .stroke('#374151');
      
      doc.fontSize(7)
         .text('Ing. Carlos Martínez Rodríguez', 50, firmasY + 5);
      doc.text('Jefe del Departamento de Tecnología', 50, firmasY + 15);
      doc.text('Sistema de Gestión Documental STCH', 50, firmasY + 25);
      
      // Firma 2 (Derecha) - CORREGIDA ALINEACIÓN
      doc.moveTo(300, firmasY)
         .lineTo(500, firmasY)
         .lineWidth(0.5)
         .stroke('#374151');
      
      doc.fontSize(7)
         .text('Lic. Ana Isabel García Fernández', 300, firmasY + 5);
      doc.text('Directora de Operaciones', 300, firmasY + 15);
      doc.text('Sistema de Gestión Documental STCH', 300, firmasY + 25);
      
      doc.moveDown(4);
      
      // ==============================================
      // PIE DE PÁGINA OFICIAL - CORREGIDO
      // ==============================================
      
      // Finalizar el documento primero para obtener el número correcto de páginas
      doc.end();
      
      console.log('✅ PDF oficial detallado generado exitosamente');
      console.log('📄 Documento: Informe Técnico de Actividad (completo)');
      console.log('📊 Secciones: 5 secciones principales con análisis detallado');
      console.log('📈 Incluye: Tablas, métricas, proyecciones, conclusiones y firmas');
      
    } catch (error) {
      console.error('❌ Error generando PDF oficial:', error);
      res.status(500).json({
        success: false,
        message: 'Error generando documento oficial',
        error: error.message
      });
    }
  }
  
  // ==============================================
  // MÉTODOS AUXILIARES (INTERNOS)
  // ==============================================
  
  addSectionHeader(doc, title) {
    doc.save();
    
    doc.fontSize(11)
       .fillColor('#1e3a8a')
       .font('Helvetica-Bold')
       .text(title, 40, doc.y);
    
    // Línea inferior
    doc.moveTo(40, doc.y + 2)
       .lineTo(555, doc.y + 2)
       .lineWidth(0.5)
       .stroke('#1e3a8a');
    
    doc.restore();
    doc.moveDown(1.2);
  }
  
  addSubsectionHeader(doc, title) {
    doc.save();
    
    doc.fontSize(10)
       .fillColor('#374151')
       .font('Helvetica-Bold')
       .text(title, 50, doc.y);
    
    doc.restore();
    doc.moveDown(0.5);
  }
  
  createCompactTable(doc, data, headers) {
    const startY = doc.y;
    const rowHeight = 18;
    const colWidths = [250, 100, 60];
    
    // Encabezados
    headers.forEach((header, index) => {
      doc.fontSize(8)
         .fillColor('#ffffff')
         .font('Helvetica-Bold');
      
      doc.rect(50 + colWidths.slice(0, index).reduce((a, b) => a + b, 0), startY, colWidths[index], rowHeight)
         .fill('#374151');
      
      doc.text(header, 55 + colWidths.slice(0, index).reduce((a, b) => a + b, 0), startY + 5);
    });
    
    // Datos
    data.forEach((item, rowIndex) => {
      const y = startY + (rowIndex + 1) * rowHeight;
      
      // Fondo alternado
      if (rowIndex % 2 === 0) {
        doc.rect(50, y, colWidths.reduce((a, b) => a + b, 0), rowHeight)
           .fill('#f9fafb');
      }
      
      // Indicador
      doc.fontSize(8)
         .fillColor('#374151')
         .font('Helvetica')
         .text(item.indicador, 55, y + 5, { width: colWidths[0] - 10 });
      
      // Valor
      doc.fontSize(8)
         .fillColor('#1e40af')
         .font('Helvetica-Bold')
         .text(item.valor, 55 + colWidths[0], y + 5, { width: colWidths[1] - 10 });
      
      // Unidad
      doc.fontSize(7)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text(item.unidad, 55 + colWidths[0] + colWidths[1], y + 5, { width: colWidths[2] - 10 });
      
      // Bordes
      doc.rect(50, y, colWidths.reduce((a, b) => a + b, 0), rowHeight)
         .stroke('#e5e7eb');
    });
    
    // Bordes de encabezado
    doc.rect(50, startY, colWidths.reduce((a, b) => a + b, 0), rowHeight)
       .stroke('#374151');
    
    doc.moveDown(data.length + 1.5);
  }
  
  createFormalTable(doc, rows, customWidths = null) {
    const startY = doc.y;
    const rowHeight = 18;
    const numCols = rows[0].length;
    const colWidths = customWidths || Array(numCols).fill(500 / numCols);
    
    // Asegurar que la suma de anchos sea correcta
    const totalWidth = colWidths.reduce((a, b) => a + b, 0);
    const startX = 50;
    
    // Filas
    rows.forEach((row, rowIndex) => {
      const y = startY + (rowIndex * rowHeight);
      
      // Encabezado
      if (rowIndex === 0) {
        row.forEach((cell, colIndex) => {
          const x = startX + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
          
          doc.rect(x, y, colWidths[colIndex], rowHeight)
             .fill('#1e3a8a')
             .stroke('#1e3a8a');
          
          doc.fontSize(8)
             .fillColor('#ffffff')
             .font('Helvetica-Bold')
             .text(cell, x + 4, y + 5, {
               width: colWidths[colIndex] - 8,
               height: rowHeight - 8,
               align: 'left'
             });
        });
      } else {
        // Datos
        row.forEach((cell, colIndex) => {
          const x = startX + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
          
          // Fondo alternado
          if (rowIndex % 2 === 0) {
            doc.rect(x, y, colWidths[colIndex], rowHeight)
               .fill('#f8fafc');
          }
          
          // Estilo condicional para evaluaciones
          let textColor = '#374151';
          let fontWeight = 'Helvetica';
          
          if (colIndex === numCols - 1) {
            if (cell.includes('Sobresaliente') || cell.includes('Excelente')) {
              textColor = '#059669';
            } else if (cell.includes('Requiere') || cell.includes('Atención')) {
              textColor = '#dc2626';
              fontWeight = 'Helvetica-Bold';
            }
          }
          
          doc.fontSize(7)
             .fillColor(textColor)
             .font(fontWeight)
             .text(cell, x + 4, y + 5, {
               width: colWidths[colIndex] - 8,
               height: rowHeight - 8,
               align: 'left'
             });
          
          // Borde de celda
          doc.rect(x, y, colWidths[colIndex], rowHeight)
             .stroke('#e5e7eb');
        });
      }
    });
    
    // Borde exterior de la tabla
    doc.rect(startX, startY, totalWidth, rows.length * rowHeight)
       .stroke('#9ca3af');
    
    doc.moveDown(rows.length + 0.5);
  }
}

module.exports = EjemploReportController;