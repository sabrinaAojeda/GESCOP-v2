// FRONTEND/src/components/Common/ColumnSelectorProveedores.jsx
import React from 'react';
import './ColumnSelector.css';

const ColumnSelectorProveedores = ({ columnasVisibles, onToggleColumna, onClose }) => {
    // 5 columnas principales siempre visibles
    const columnasPrincipales = [
        { key: 'codigo', label: 'Código', desc: 'Código identificador del proveedor' },
        { key: 'razon_social', label: 'Razón Social', desc: 'Nombre o razón social del proveedor' },
        { key: 'cuit', label: 'CUIT', desc: 'CUIT del proveedor' },
        { key: 'rubro', label: 'Rubro', desc: 'Rubro o actividad del proveedor' },
        { key: 'estado', label: 'Estado', desc: 'Estado actual del proveedor' }
    ];

    // Columnas opcionales
    const columnasOpcionales = [
        {
            titulo: 'Información de Contacto',
            columnas: [
                { key: 'contacto_nombre', label: 'Nombre Contacto' },
                { key: 'telefono', label: 'Teléfono' },
                { key: 'email', label: 'Email' }
            ]
        },
        {
            titulo: 'Ubicación',
            columnas: [
                { key: 'localidad', label: 'Localidad' },
                { key: 'provincia', label: 'Provincia' },
                { key: 'direccion', label: 'Dirección' }
            ]
        },
        {
            titulo: 'Servicios',
            columnas: [
                { key: 'sector_servicio', label: 'Sector/Servicio' },
                { key: 'servicio', label: 'Servicio Específico' }
            ]
        },
        {
            titulo: 'Documentación',
            columnas: [
                { key: 'seguro_RT', label: 'Seguro RT' },
                { key: 'habilitacion_personal', label: 'Habilitación Personal' },
                { key: 'vencimiento_documentacion', label: 'Venc. Documentación' }
            ]
        },
        {
            titulo: 'Personal',
            columnas: [
                { key: 'personal_contratado', label: 'Personal Contratado' }
            ]
        }
    ];

    // Contar columnas visibles
    const columnasVisiblesCount = Object.values(columnasVisibles).filter(Boolean).length;

    return (
        <div className="column-selector-overlay" onClick={onClose}>
            <div className="column-selector-modal" onClick={e => e.stopPropagation()}>
                <div className="column-selector-header">
                    <h3>Configurar Columnas - Proveedores</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="column-selector-body">
                    {/* Columnas Principales */}
                    <div className="column-group">
                        <h4>📌 Columnas Principales (Obligatorias)</h4>
                        {columnasPrincipales.map(columna => (
                            <div key={columna.key} className="columna-principal">
                                <label className="checkbox-label">
                                    <span className="checkbox-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={columnasVisibles[columna.key]}
                                            onChange={() => onToggleColumna(columna.key)}
                                            disabled={true}
                                        />
                                        <span className="checkbox-box">
                                            <span className="checkbox-checkmark">✓</span>
                                        </span>
                                    </span>
                                    <span>{columna.label}</span>
                                    <span className="columna-badge badge-principal">Fijo</span>
                                </label>
                                <small style={{ marginLeft: 30, color: '#64748b' }}>{columna.desc}</small>
                            </div>
                        ))}
                    </div>

                    {/* Columnas Opcionales */}
                    {columnasOpcionales.map(grupo => (
                        <div key={grupo.titulo} className="column-group">
                            <h4>{grupo.titulo}</h4>
                            {grupo.columnas.map(columna => (
                                <div key={columna.key} className="columna-opcional">
                                    <label className="checkbox-label">
                                        <span className="checkbox-wrapper">
                                            <input
                                                type="checkbox"
                                                checked={columnasVisibles[columna.key]}
                                                onChange={() => onToggleColumna(columna.key)}
                                            />
                                            <span className="checkbox-box">
                                                <span className="checkbox-checkmark">✓</span>
                                            </span>
                                        </span>
                                        <span>{columna.label}</span>
                                        <span className="columna-badge badge-opcional">Opcional</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="column-selector-footer">
                    <span className="column-count">
                        {columnasVisiblesCount} columnas visibles
                    </span>
                    <button className="btn btn-primary" onClick={onClose}>
                        ✅ Aplicar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ColumnSelectorProveedores;
