import React from 'react';
import './ColumnSelector.css';

const ColumnSelector = ({ columnasVisibles, onToggleColumna, onClose }) => {
    // 5 columnas principales siempre visibles
    const columnasPrincipales = [
        { key: 'interno', label: 'Interno', desc: 'Número interno del vehículo' },
        { key: 'dominio', label: 'Dominio', desc: 'Patente del vehículo' },
        { key: 'modelo', label: 'Modelo', desc: 'Modelo del vehículo' },
        { key: 'anio', label: 'Año', desc: 'Año de fabricación' },
        { key: 'estado', label: 'Estado', desc: 'Estado actual' }
    ];

    // Columnas opcionales
    const columnasOpcionales = [
        {
            titulo: 'Operación',
            columnas: [
                { key: 'eq-incorporado', label: 'Eq. Incorporado' },
                { key: 'sector', label: 'Sector' },
                { key: 'chofer', label: 'Chofer' },
                { key: 'observaciones', label: 'Observaciones' }
            ]
        },
        {
            titulo: 'VTV',
            columnas: [
                { key: 'vtv-vencimiento', label: 'VTV Vencimiento' },
                { key: 'vtv-ev', label: 'VTV Estado' }
            ]
        },
        {
            titulo: 'Habilitación',
            columnas: [
                { key: 'habilitacion-vencimiento', label: 'Hab. Vencimiento' },
                { key: 'habilitacion-eh', label: 'Hab. Estado' }
            ]
        },
        {
            titulo: 'Seguros',
            columnas: [
                { key: 'tipo-seguro', label: 'Tipo Seguro' },
                { key: 'seguro-tecnico', label: 'Seg. Técnico' },
                { key: 'seguro-cargas', label: 'Seg. Cargas Pel.' }
            ]
        }
    ];

    // Contar columnas visibles
    const columnasVisiblesCount = Object.values(columnasVisibles).filter(Boolean).length;

    return (
        <div className="column-selector-overlay" onClick={onClose}>
            <div className="column-selector-modal" onClick={e => e.stopPropagation()}>
                <div className="column-selector-header">
                    <h3>Configurar Columnas</h3>
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

export default ColumnSelector;
