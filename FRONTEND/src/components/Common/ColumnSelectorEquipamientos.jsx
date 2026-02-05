// src/components/Common/ColumnSelectorEquipamientos.jsx
import React from 'react';
import './ColumnSelector.css';

const ColumnSelectorEquipamientos = ({ columnasVisibles, onToggleColumna, onClose }) => {
    const gruposColumnas = [
        {
            titulo: 'Información Básica',
            columnas: [
                { key: 'codigo', label: 'Código', disabled: true },
                { key: 'descripcion', label: 'Descripción', disabled: true },
                { key: 'tipo', label: 'Tipo', disabled: true }
            ]
        },
        {
            titulo: 'Asignación',
            columnas: [
                { key: 'vehiculo_asignado', label: 'Vehículo Asignado', disabled: true },
                { key: 'estado', label: 'Estado', disabled: true }
            ]
        },
        {
            titulo: 'Mantenimiento',
            columnas: [
                { key: 'ultima_revision', label: 'Última Revisión' },
                { key: 'proxima_revision', label: 'Próxima Revisión', disabled: true },
                { key: 'observaciones', label: 'Observaciones' }
            ]
        }
    ];

    return (
        <div className="column-selector-overlay" onClick={onClose}>
            <div className="column-selector-modal" onClick={e => e.stopPropagation()}>
                <div className="column-selector-header">
                    <h3>Seleccionar Columnas - Equipamiento</h3>
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

export default ColumnSelectorEquipamientos;