// FRONTEND/src/components/Common/ColumnSelectorPersonal.jsx
import React from 'react';
import './ColumnSelector.css';

const ColumnSelectorPersonal = ({ columnasVisibles, onToggleColumna, onClose }) => {
    // 5 columnas principales siempre visibles
    const columnasPrincipales = [
        { key: 'legajo', label: 'Legajo', desc: 'Número de legajo del empleado' },
        { key: 'nombre', label: 'Nombre', desc: 'Nombre del empleado' },
        { key: 'apellido', label: 'Apellido', desc: 'Apellido del empleado' },
        { key: 'dni', label: 'DNI', desc: 'Documento Nacional de Identidad' },
        { key: 'estado', label: 'Estado', desc: 'Estado laboral actual' }
    ];

    // Columnas opcionales
    const columnasOpcionales = [
        {
            titulo: 'Información Laboral',
            columnas: [
                { key: 'cuil', label: 'CUIL' },
                { key: 'sector', label: 'Sector' },
                { key: 'cargo', label: 'Cargo' },
                { key: 'rol', label: 'Rol' }
            ]
        },
        {
            titulo: 'Contacto',
            columnas: [
                { key: 'telefono', label: 'Teléfono' },
                { key: 'correo_corporativo', label: 'Email Corporativo' }
            ]
        },
        {
            titulo: 'Documentación',
            columnas: [
                { key: 'vencimiento_licencia', label: 'Licencia Vencimiento' },
                { key: 'carnet_cargas_peligrosas', label: 'Carnet Cargas Pel.' }
            ]
        }
    ];

    // Contar columnas visibles
    const columnasVisiblesCount = Object.values(columnasVisibles).filter(Boolean).length;

    return (
        <div className="column-selector-overlay" onClick={onClose}>
            <div className="column-selector-modal" onClick={e => e.stopPropagation()}>
                <div className="column-selector-header">
                    <h3>Configurar Columnas - Personal</h3>
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

export default ColumnSelectorPersonal;
