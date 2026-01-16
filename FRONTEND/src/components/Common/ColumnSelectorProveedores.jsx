// FRONTEND/src/components/Common/ColumnSelectorProveedores.jsx
import React from 'react';
import './ColumnSelector.css';

const ColumnSelectorProveedores = ({ columnasVisibles, onToggleColumna, onClose }) => {
    const gruposColumnas = [
        {
            titulo: 'Identificación',
            columnas: [
                { key: 'codigo', label: 'Código', disabled: true },
                { key: 'razon_social', label: 'Razón Social', disabled: true },
                { key: 'cuit', label: 'CUIT', disabled: true }
            ]
        },
        {
            titulo: 'Clasificación',
            columnas: [
                { key: 'rubro', label: 'Rubro', disabled: true },
                { key: 'estado', label: 'Estado', disabled: true }
            ]
        },
        {
            titulo: 'Contacto',
            columnas: [
                { key: 'contacto', label: 'Contacto' },
                { key: 'telefono', label: 'Teléfono' },
                { key: 'email', label: 'Email' }
            ]
        },
        {
            titulo: 'Ubicación',
            columnas: [
                { key: 'localidad', label: 'Localidad' },
                { key: 'direccion', label: 'Dirección' }
            ]
        },
        {
            titulo: 'Documentación',
            columnas: [
                { key: 'seguro_RT', label: 'Seguro RT' }
            ]
        }
    ];

    return (
        <div className="column-selector-overlay" onClick={onClose}>
            <div className="column-selector-modal" onClick={e => e.stopPropagation()}>
                <div className="column-selector-header">
                    <h3>Seleccionar Columnas - Proveedores</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="column-selector-body">
                    {gruposColumnas.map(grupo => (
                        <div key={grupo.titulo} className="column-group">
                            <h4>{grupo.titulo}</h4>
                            {grupo.columnas.map(columna => (
                                <label key={columna.key} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={columnasVisibles[columna.key]}
                                        onChange={() => onToggleColumna(columna.key)}
                                        disabled={columna.disabled}
                                    />
                                    <span>{columna.label}</span>
                                </label>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="column-selector-footer">
                    <button className="btn btn-primary" onClick={onClose}>
                        Aplicar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ColumnSelectorProveedores;