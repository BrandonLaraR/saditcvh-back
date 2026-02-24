const axios = require('axios');
const FormData = require('form-data');

class OCRProcessorService {
    constructor() {
        this.pythonBaseURL = process.env.PYTHON_API_URL || 'http://localhost:8000/api/pdf';
        this.pollingInterval = 5000; // 5 segundos
        this.maxRetries = 3;
    }

    /**
     * Enviar PDF a Python para OCR
     */
    async enviarPDFParaOCR(pdfBuffer, filename) {
        try {
            const formData = new FormData();

            formData.append('file', pdfBuffer, {
                filename,
                contentType: 'application/pdf'
            });

            const response = await axios.post(
                `${this.pythonBaseURL}/upload?use_ocr=true`,
                formData,
                {
                    headers: {
                        ...formData.getHeaders()
                    },
                    timeout: 120000
                }
            );

            return {
                success: true,
                taskId: response.data.task_id,
                pythonPdfId: response.data.pdf_id,
                status: 'processing'
            };

        } catch (error) {
            console.error('Error enviando PDF a Python:',
                error.response?.data || error.message
            );

            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }


    /**
     * Polling para verificar estado del procesamiento
     */
    // async verificarEstadoOCR(taskId, maxWaitSeconds = 300) {
    //     const maxAttempts = Math.ceil(maxWaitSeconds * 1000 / this.pollingInterval);

    //     for (let attempt = 0; attempt < maxAttempts; attempt++) {
    //         try {
    //             const response = await axios.get(`${this.pythonBaseURL}/list`);


    //             const pdfs = response.data.pdfs || [];
    //             const task = pdfs.find(t => t.task_id === taskId);

    //             if (!task) {
    //                 throw new Error(`Tarea ${taskId} no encontrada en la lista`);
    //             }

    //             if (task.status === 'completed') {
    //                 return {
    //                     success: true,
    //                     status: 'completed',
    //                     pythonPdfId: task.id,
    //                     extractedTextPath: task.extracted_text_path
    //                 };
    //             }
    //             else if (task.status === 'failed') {
    //                 return {
    //                     success: false,
    //                     status: 'failed',
    //                     error: task.error || 'Procesamiento OCR falló'
    //                 };
    //             }

    //             // Sigue esperando si está processing o pending
    //             if (attempt < maxAttempts - 1) {
    //                 await new Promise(resolve => setTimeout(resolve, this.pollingInterval));
    //             }

    //         } catch (error) {
    //             console.error(`Error en polling (intento ${attempt + 1}):`, error.message);
    //         }
    //     }

    //     return {
    //         success: false,
    //         status: 'timeout',
    //         error: 'Timeout esperando procesamiento OCR'
    //     };
    // }

  /**
     * Verificar estado de OCR - SIN polling interno
     */
    async verificarEstadoOCRUnico(taskId, timeoutMs = 10000) {
        try {
            // Hacer UNA sola consulta a Python
            const response = await axios.get(`${this.pythonBaseURL}/list`, {
                timeout: timeoutMs
            });

            const pdfs = response.data.pdfs || [];
            const task = pdfs.find(t => t.task_id === taskId);

            if (!task) {
                return {
                    success: false,
                    error: 'Tarea no encontrada en Python',
                    status: 'pending'
                };
            }

            return {
                success: task.status === 'completed',
                status: task.status,
                pythonPdfId: task.id,
                extractedTextPath: task.extracted_text_path,
                error: task.error
            };

        } catch (error) {
            console.error(`Error verificando estado OCR: ${error.message}`);
            return {
                success: false,
                error: error.message,
                status: 'error'
            };
        }
    }
    async listarProcesos(timeoutMs = 10000) {
        const response = await axios.get(`${this.pythonBaseURL}/list`, {
            timeout: timeoutMs
        });
        return response.data;
    }
    /**
     * Descargar PDF procesado con OCR
     */
    async descargarPDFConOCR(pdfId) {
        try {
            const response = await axios.get(
                `${this.pythonBaseURL}/${pdfId}/searchable-pdf`,
                { responseType: 'arraybuffer' }
            );

            return {
                success: true,
                pdfBuffer: Buffer.from(response.data),
                contentType: response.headers['content-type'] || 'application/pdf'
            };
        } catch (error) {
            console.error('Error descargando PDF con OCR:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }


    /**
     * Descargar texto extraído
     */
    async descargarTextoOCR(pdfId) {
        try {
            const response = await axios.get(`${this.pythonBaseURL}/${pdfId}/text`);

            return {
                success: true,
                text: response.data.text || response.data
            };
        } catch (error) {
            console.error('Error descargando texto OCR:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Procesar PDF completo con OCR
     */
    async procesarPDFConOCR(pdfBuffer, filename) {
        try {
            // 1. Enviar a Python
            const envio = await this.enviarPDFParaOCR(pdfBuffer, filename);
            if (!envio.success) {
                throw new Error(envio.error);
            }

            // 2. Esperar procesamiento
            const estado = await this.verificarEstadoOCRUnico(envio.taskId);
            if (!estado.success) {
                throw new Error(estado.error);
            }

            // 3. Descargar resultados
            const [pdfResult, textResult] = await Promise.all([
                this.descargarPDFConOCR(estado.pythonPdfId),
                this.descargarTextoOCR(estado.pythonPdfId)
            ]);

            if (!pdfResult.success || !textResult.success) {
                throw new Error('Error descargando resultados');
            }

            return {
                success: true,
                pdfBuffer: pdfResult.pdfBuffer,
                text: textResult.text,
                pythonPdfId: estado.pythonPdfId,
                extractedTextPath: estado.extractedTextPath
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new OCRProcessorService();