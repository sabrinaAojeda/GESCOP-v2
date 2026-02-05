// src/components/Common/ColumnSelectorListadoVehiculos.jsx
import React from 'react';
import './ColumnSelector.css'; // Reutilizamos los mismos estilos

const ColumnSelectorListadoVehiculos = ({ columnasVisibles, onToggleColumna, onClose }) => {
    const gruposColumnas = [
        {
            titulo: 'Información Básica',
            columnas: [
                { key: 'interno', label: 'Interno', disabled: true },
                { key: 'año', label: 'Año', disabled: true },
                { key: 'dominio', label: 'Dominio', disabled: true },
                { key: 'modelo', label: 'Modelo', disabled: true },
                { key: 'tipo', label: 'Tipo', disabled: true }
            ]
        },
        {
            titulo: 'Operación',
            columnas: [
                { key: 'eq_incorporado', label: 'Eq. Incorporado' },
                { key: 'sector', label: 'Sector', disabled: true },
                { key: 'chofer', label: 'Chofer' },
                { key: 'estado', label: 'Estado', disabled: true },
                { key: 'observaciones', label: 'Observaciones' }
            ]
        },
        {
            titulo: 'VTV',
            columnas: [
                { key: 'vtv_vencimiento', label: 'VTV Vencimiento' },
                { key: 'vtv_estado', label: 'VTV Estado' }
            ]
        },
        {
            titulo: 'Habilitación',
            columnas: [
                { key: 'hab_vencimiento', label: 'Hab. Vencimiento' },
                { key: 'hab_estado', label: 'Hab. Estado' }
            ]
        },
        {
            titulo: 'Seguros',
            columnas: [
                { key: 'seguro_vencimiento', label: 'Seg. Vencimiento' }
            ]
        }
    ];

    return (
        <div className="column-selector-overlay" onClick={onClose}>
            <div className="column-selector-modal" onClick={e => e.stopPropagation()}>
                <div className="column-selector-header">
                    <h3>Seleccionar Columnas - Listado Vehículos</h3>
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

export default ColumnSelectorListadoVehiculos;