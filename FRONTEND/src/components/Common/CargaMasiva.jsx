// FRONTEND/src/components/Common/CargaMasiva.jsx - CORREGIDO
import React, { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import './CargaMasiva.css';

const CargaMasiva = ({ 
    isOpen, 
    onClose, 
    onDataLoaded, 
    title,
    titulo, // Alias en español
    templateFields = [],
    camposPlantilla = [], // Alias en español
    requiredFields = [],
    camposRequeridos = [], // Alias en español
    onBatchSave = null // Nuevo: callback para guardar directamente al backend
}) => {
    // Usar alias si existen
    const displayTitle = title || titulo || 'Carga Masiva';
    const campos = camposPlantilla.length > 0 ? camposPlantilla : templateFields;
    const requeridos = camposRequeridos.length > 0 ? camposRequeridos : requiredFields;
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [warning, setWarning] = useState(null); // CORREGIDO: Ahora declarado
    const [success, setSuccess] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [step, setStep] = useState('upload'); // 'upload' | 'preview' | 'confirm' | 'saving'
    const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0 });
    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        setWarning(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    setError('El archivo está vacío o no contiene datos válidos');
                    setLoading(false);
                    return;
                }

                // Validar campos requeridos
                const missingFields = requeridos.filter(field => {
                    const fieldLower = field.toLowerCase();
                    return !Object.keys(jsonData[0]).some(key => 
                        key.toLowerCase().includes(fieldLower)
                    );
                });

                if (missingFields.length > 0 && requeridos.length > 0) {
                    setWarning(`El archivo no contiene algunos campos requeridos: ${missingFields.join(', ')}`);
                }

                // Mostrar vista previa (máximo 5 registros)
                setPreviewData(jsonData.slice(0, 5));
                setStep('preview');
                setLoading(false);
            } catch (err) {
                setError('Error al procesar el archivo: ' + err.message);
                setLoading(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // Función para guardar datos al backend
    const saveToBackend = useCallback(async (dataToSave) => {
        if (!onBatchSave) {
            // Si no hay función de guardado directo, usar el callback legacy
            onDataLoaded(dataToSave);
            return { success: true };
        }
        
        // Usar la función de guardado directo al backend
        return await onBatchSave(dataToSave);
    }, [onBatchSave, onDataLoaded]);

    const handleConfirm = async () => {
        if (onBatchSave) {
            // Usar modo de guardado al backend con progreso
            setStep('saving');
            setLoading(true);
            setError(null);
            setSuccess(null);
            
            try {
                const totalRecords = previewData.length;
                let savedCount = 0;
                let errors = [];

                for (const record of previewData) {
                    try {
                        await saveToBackend([record]);
                        savedCount++;
                    } catch (err) {
                        errors.push(`Error: ${err.message}`);
                    }
                    
                    setSaveProgress({ current: savedCount, total: totalRecords });
                }

                if (errors.length > 0) {
                    setWarning(`Guardados: ${savedCount}/${totalRecords}. Errors: ${errors.join('; ')}`);
                } else {
                    setSuccess(`✅ Guardados ${savedCount} registros exitosamente`);
                }
                
                setTimeout(() => {
                    handleClose();
                }, 2000);
                
            } catch (err) {
                setError('Error al guardar: ' + err.message);
            } finally {
                setLoading(false);
            }
        } else {
            // Modo legacy: esperar a que handleDataLoaded termine
            setStep('confirm');
            setLoading(true);
            setError(null);
            setSuccess(null);
            
            try {
                // Esperar a que handleDataLoaded procese todos los datos
                await onDataLoaded(previewData);
                setSuccess('✅ Datos cargados exitosamente');
                setTimeout(() => {
                    handleClose();
                }, 1500);
            } catch (err) {
                setError('Error al procesar datos: ' + err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleClose = () => {
        setError(null);
        setWarning(null);
        setSuccess(null);
        setPreviewData([]);
        setStep('upload');
        setSaveProgress({ current: 0, total: 0 });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClose();
    };

    const handleDownloadTemplate = () => {
        // Soportar tanto array de strings como array de objetos
        const template = campos.map(campo => {
            if (typeof campo === 'string') {
                return { [campo]: '' };
            }
            // Para objetos { key, label, requerido }
            return { [campo.key || campo.label || campo]: '' };
        });

        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
        XLSX.writeFile(wb, `${displayTitle.replace(/\s+/g, '_')}_plantilla.xlsx`);
    };

    if (!isOpen) return null;

    return (
        <div className="carga-masiva-overlay" onClick={handleClose}>
            <div className="carga-masiva-modal" onClick={e => e.stopPropagation()}>
                <div className="carga-masiva-header">
                    <h3>📤 {displayTitle}</h3>
                    <button className="close-btn" onClick={handleClose}>×</button>
                </div>

                <div className="carga-masiva-body">
                    {step === 'upload' && (
                        <>
                            <div className="upload-area">
                                <div className="upload-icon">📊</div>
                                <h4>Sube tu archivo Excel</h4>
                                <p>El archivo debe tener las columnas correspondientes a los campos del formulario</p>
                                
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".xlsx,.xls"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                                
                                <div className="upload-buttons">
                                    <button 
                                        className="blue"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={loading}
                                    >
                                        📁 Seleccionar Archivo
                                    </button>
                                    
                                    <button 
                                        className="teal"
                                        onClick={handleDownloadTemplate}
                                    >
                                        📋 Descargar Plantilla
                                    </button>
                                </div>
                            </div>

                            {campos.length > 0 && (
                                <div className="template-info">
                                    <h5>Campos requeridos:</h5>
                                    <div className="fields-list">
                                        {campos.map((campo, index) => {
                                            // Soportar tanto string como objeto { key, label, requerido }
                                            const label = typeof campo === 'string' ? campo : campo.label || campo.key || campo;
                                            return (
                                                <span key={index} className={`field-badge ${requeridos.includes(campo) || (campo.key && requeridos.includes(campo.key)) ? 'required' : ''}`}>
                                                    {label}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {(step === 'preview' || step === 'saving') && (
                        <div className="preview-area">
                            <h4>
                                {step === 'saving' 
                                    ? `Guardando registros... (${saveProgress.current}/${saveProgress.total})`
                                    : `Vista Previa (${previewData.length} registros)`
                                }
                            </h4>
                            
                            {step === 'preview' && previewData.length > 0 && (
                                <div className="preview-table-wrapper">
                                    <table className="preview-table">
                                        <thead>
                                            <tr>
                                                {Object.keys(previewData[0]).map((key, index) => (
                                                    <th key={index}>{key}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.map((row, rowIndex) => (
                                                <tr key={rowIndex}>
                                                    {Object.values(row).map((value, colIndex) => (
                                                        <td key={colIndex}>{String(value)}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {step === 'saving' && (
                                <div className="saving-progress">
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill" 
                                            style={{ width: `${(saveProgress.current / Math.max(saveProgress.total, 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {previewData.length > 5 && step === 'preview' && (
                                <p className="more-data">
                                    ... y {previewData.length - 5} registros más
                                </p>
                            )}
                        </div>
                    )}

                    {step === 'confirm' && (
                        <div className="confirm-area">
                            <div className="loading-spinner"></div>
                            <p>Procesando datos...</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {warning && (
                        <div className="warning-message">
                            {warning}
                        </div>
                    )}

                    {success && (
                        <div className="success-message">
                            {success}
                        </div>
                    )}
                </div>

                <div className="carga-masiva-footer">
                    {step === 'preview' && (
                        <>
                            <button 
                                className="teal"
                                onClick={() => {
                                    setStep('upload');
                                    setPreviewData([]);
                                }}
                            >
                                ← Volver
                            </button>
                            <button 
                                className="green"
                                onClick={handleConfirm}
                                disabled={loading}
                            >
                                ✅ Confirmar Carga
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CargaMasiva;
