import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Hook utilitario para exportar datos a formato XLSX
 */
const useExportXLSX = () => {
    /**
     * Exporta un array de objetos a archivo XLSX
     * @param {Array} data - Array de objetos a exportar
     * @param {String} filename - Nombre del archivo (sin extensión)
     * @param {Object} options - Opciones adicionales
     */
    const exportToXLSX = (data, filename, options = {}) => {
        if (!data || data.length === 0) {
            alert('⚠️ No hay datos para exportar');
            return;
        }

        try {
            // Preparar los datos
            const worksheetData = data.map((row, index) => {
                const newRow = { ...row };
                // Filtrar campos undefined o null
                Object.keys(newRow).forEach(key => {
                    if (newRow[key] === undefined || newRow[key] === null) {
                        newRow[key] = '';
                    }
                    // Convertir objetos a strings
                    if (typeof newRow[key] === 'object') {
                        newRow[key] = JSON.stringify(newRow[key]);
                    }
                });
                return newRow;
            });

            // Crear workbook y worksheet
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(worksheetData);

            // Ajustar ancho de columnas
            const columnWidths = [];
            const headers = Object.keys(worksheetData[0] || {});
            
            headers.forEach((header, i) => {
                const maxWidth = Math.max(
                    header.length,
                    ...worksheetData.map(row => String(row[header] || '').length)
                );
                columnWidths[i] = { wch: Math.min(maxWidth + 2, 50) };
            });
            
            worksheet['!cols'] = columnWidths;

            // Añadir worksheet al workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Datos');

            // Generar archivo
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            
            // Nombre del archivo con fecha
            const date = new Date().toISOString().split('T')[0];
            const finalFilename = `${filename}_${date}.xlsx`;
            
            saveAs(blob, finalFilename);
            
            console.log(`✅ Exportado: ${finalFilename}`);
            return true;
        } catch (error) {
            console.error('Error exportando a XLSX:', error);
            alert('❌ Error al exportar datos');
            return false;
        }
    };

    /**
     * Exporta datos con headers personalizados
     * @param {Array} data - Array de objetos
     * @param {String} filename - Nombre del archivo
     * @param {Object} headerMap - Mapeo de campos a nombres legibles { campo: 'Nombre Columna' }
     */
    const exportWithHeaders = (data, filename, headerMap = {}) => {
        if (!data || data.length === 0) {
            alert('⚠️ No hay datos para exportar');
            return;
        }

        try {
            const worksheetData = data.map(row => {
                const newRow = {};
                Object.keys(row).forEach(key => {
                    let value = row[key];
                    if (value === undefined || value === null) {
                        value = '';
                    } else if (typeof value === 'object') {
                        value = JSON.stringify(value);
                    }
                    // Usar nombre legible si existe
                    newRow[headerMap[key] || key] = value;
                });
                return newRow;
            });

            return exportToXLSX(worksheetData, filename);
        } catch (error) {
            console.error('Error exportando con headers:', error);
            return false;
        }
    };

    return {
        exportToXLSX,
        exportWithHeaders
    };
};

export default useExportXLSX;
