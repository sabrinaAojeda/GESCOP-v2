// FRONTEND/src/components/Common/ColumnSelectorSedes.jsx
import React from 'react';
import './ColumnSelector.css';

const ColumnSelectorSedes = ({ columnasVisibles, onToggleColumna, onClose }) => {
    // 5 columnas principales siempre visibles
    const columnasPrincipales = [
        { key: 'codigo', label: 'Código', desc: 'Código identificador de la sede' },
        { key: 'nombre', label: 'Nombre', desc: 'Nombre de la sede/empresa' },
        { key: 'tipo', label: 'Tipo', desc: 'Tipo de sede' },
        { key: 'direccion', label: 'Dirección', desc: 'Dirección de la sede' },
        { key: 'estado', label: 'Estado', desc: 'Estado actual' }
    ];

    // Columnas opcionales
    const columnasOpcionales = [
        {
            titulo: 'Ubicación',
            columnas: [
                { key: 'localidad', label: 'Localidad' },
                { key: 'provincia', label: 'Provincia' }
            ]
        },
        {
            titulo: 'Contacto',
            columnas: [
                { key: 'telefono', label: 'Teléfono' },
                { key: 'email', label: 'Email' },
                { key: 'responsable', label: 'Responsable' }
            ]
        },
        {
            titulo: 'Operación',
            columnas: [
                { key: 'base_operativa', label: 'Base Operativa' },
                { key: 'habilitaciones', label: 'Habilitaciones' },
                { key: 'vehiculos_asignados', label: 'Vehículos Asignados' }
            ]
        },
        {
            titulo: 'Documentación',
            columnas: [
                { key: 'vencimiento_habilitacion', label: 'Venc. Habilitación' },
                { key: 'documentos', label: 'Documentos' }
            ]
        }
    ];

    // Contar columnas visibles
    const columnasVisiblesCount = Object.values(columnasVisibles).filter(Boolean).length;

    return (
        <div className="column-selector-overlay" onClick={onClose}>
            <div className="column-selector-modal" onClick={e => e.stopPropagation()}>
                <div className="column-selector-header">
                    <h3>Configurar Columnas - Sedes</h3>
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

export default ColumnSelectorSedes;
