// src/components/Common/ColumnSelectorVehiculosVendidos.jsx
import React from 'react';
import './ColumnSelector.css';

const ColumnSelectorVehiculosVendidos = ({ columnasVisibles, onToggleColumna, onClose }) => {
    const gruposColumnas = [
        {
            titulo: 'Información del Vehículo',
            columnas: [
                { key: 'interno', label: 'Interno', disabled: true },
                { key: 'dominio', label: 'Dominio', disabled: true },
                { key: 'marca_modelo', label: 'Marca/Modelo', disabled: true }
            ]
        },
        {
            titulo: 'Información de Venta',
            columnas: [
                { key: 'fecha_venta', label: 'Fecha Venta', disabled: true },
                { key: 'comprador', label: 'Comprador', disabled: true },
                { key: 'precio', label: 'Precio', disabled: true },
                { key: 'kilometraje_venta', label: 'Kilometraje Venta' }
            ]
        },
        {
            titulo: 'Documentación',
            columnas: [
                { key: 'estado_documentacion', label: 'Estado Documentación', disabled: true },
                { key: 'observaciones', label: 'Observaciones' }
            ]
        }
    ];

    return (
        <div className="column-selector-overlay" onClick={onClose}>
            <div className="column-selector-modal" onClick={e => e.stopPropagation()}>
                <div className="column-selector-header">
                    <h3>Seleccionar Columnas - Vehículos Vendidos</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="column-selector-body">
                    {gruposColumnas.map(grupo => (
                        <div key={grupo.titulo} className="column-group">
                            <h4>{grupo.titulo}</h4>
                            {grupo.columnas.map(columna => (
                                <label key={columna.key} className="checkbox-label">
                                    <span className="checkbox-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={columnasVisibles[columna.key]}
                                            onChange={() => onToggleColumna(columna.key)}
                                            disabled={columna.disabled}
                                        />
                                        <span className="checkbox-box">
                                            <span className="checkbox-checkmark">✓</span>
                                        </span>
                                    </span>
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

export default ColumnSelectorVehiculosVendidos;