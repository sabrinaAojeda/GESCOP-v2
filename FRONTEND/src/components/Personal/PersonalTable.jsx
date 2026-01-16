import React, { useState, useEffect } from 'react';
import './PersonalTable.css';

const PersonalTable = ({ personal, loading, onEdit, onDelete, onView }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleRowExpansion = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando personal...</p>
      </div>
    );
  }

  if (personal.length === 0) {
    return (
      <div className="empty-state">
        <p>No se encontró personal</p>
      </div>
    );
  }

  // Vista para móviles - Tarjetas
  if (isMobile) {
    return (
      <div className="mobile-cards-container">
        {personal.map((empleado) => (
          <div 
            key={empleado.id} 
            className={`personal-card ${expandedRow === empleado.id ? 'expanded' : ''}`}
          >
            <div className="card-header" onClick={() => toggleRowExpansion(empleado.id)}>
              <div className="card-main-info">
                <div className="card-title">{empleado.nombre} {empleado.apellido}</div>
                <div className="card-subtitle">Legajo: {empleado.legajo}</div>
              </div>
              <div className="card-status">
                <span className={`status-badge status-${empleado.estado.toLowerCase()}`}>
                  {empleado.estado}
                </span>
                <span className="expansion-arrow">
                  {expandedRow === empleado.id ? '▾' : '▸'}
                </span>
              </div>
            </div>
            
            <div className="card-details">
              <div className="detail-row">
                <span className="detail-label">DNI:</span>
                <span className="detail-value">{empleado.dni}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Sector:</span>
                <span className="detail-value">{empleado.sector}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Cargo:</span>
                <span className="detail-value">{empleado.cargo}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Ingreso:</span>
                <span className="detail-value">
                  {empleado.fecha_ingreso ? new Date(empleado.fecha_ingreso).toLocaleDateString() : '-'}
                </span>
              </div>
            </div>
            
            <div className="card-actions">
              <button 
                className="action-btn view-btn"
                onClick={() => onView(empleado)}
                title="Ver"
              >
                👁️
              </button>
              <button 
                className="action-btn edit-btn"
                onClick={() => onEdit(empleado)}
                title="Editar"
              >
                ✏️
              </button>
              <button 
                className="action-btn delete-btn"
                onClick={() => onDelete(empleado)}
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Vista para desktop - Tabla
  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Legajo</th>
            <th>Nombre Completo</th>
            <th>DNI</th>
            <th>Sector</th>
            <th>Cargo</th>
            <th>Estado</th>
            <th>Fecha Ingreso</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {personal.map((empleado) => (
            <tr key={empleado.id}>
              <td>{empleado.legajo}</td>
              <td className="employee-name">{empleado.nombre} {empleado.apellido}</td>
              <td>{empleado.dni}</td>
              <td>{empleado.sector}</td>
              <td>{empleado.cargo}</td>
              <td>
                <span className={`status-badge status-${empleado.estado.toLowerCase()}`}>
                  {empleado.estado}
                </span>
              </td>
              <td>{empleado.fecha_ingreso ? new Date(empleado.fecha_ingreso).toLocaleDateString() : '-'}</td>
              <td>
                <div className="action-buttons">
                  <button 
                    className="icon-btn" 
                    title="Ver"
                    onClick={() => onView(empleado)}
                  >
                    👁️
                  </button>
                  <button 
                    className="icon-btn" 
                    title="Editar"
                    onClick={() => onEdit(empleado)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="icon-btn" 
                    title="Eliminar"
                    onClick={() => onDelete(empleado)}
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PersonalTable;