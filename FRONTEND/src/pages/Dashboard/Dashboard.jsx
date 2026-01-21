// src/pages/Dashboard/Dashboard.jsx - VERSIÓN MEJORADA
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('Todos los tipos');
  const [filterEstado, setFilterEstado] = useState('Todos los estados');
  const [filterDate, setFilterDate] = useState('');

  const handleCardClick = (path) => {
    navigate(path);
  };

  // Datos de ejemplo para vencimientos
  const vencimientos = [
    {
      id: 1,
      item: 'AB-123-CD',
      detalle: 'Toyota Hilux 2023',
      tipo: 'Seguro',
      vencimiento: '15/03/2024',
      estado: 'Por vencer',
      documentos: 2,
      diasRestantes: 3
    },
    {
      id: 2,
      item: 'EMP-001',
      detalle: 'Juan Pérez',
      tipo: 'Certificado',
      vencimiento: '20/03/2024',
      estado: 'Por vencer',
      documentos: 1,
      diasRestantes: 8
    },
    {
      id: 3,
      item: 'SEDE-CENTRAL',
      detalle: 'Permiso Ambiental',
      tipo: 'Permiso',
      vencimiento: '05/03/2024',
      estado: 'Vencido',
      documentos: 3,
      diasRestantes: -2
    }
  ];

  return (
    <div className="dashboard-page">
      {/* Panel de Alertas de Vencimiento */}
      <div className="alert-panel">
        <div className="alert-header">
          <span>⚠️</span>
          <strong>Alertas de Vencimiento</strong>
        </div>
        <div className="alert-item">
          <span>Seguro del vehículo AB-123-CD vence en 3 días</span>
          <button 
            className="btn-ver"
            onClick={() => navigate('/flota/listado-vehiculos')}
          >
            Ver
          </button>
        </div>
        <div className="alert-item">
          <span>Certificado de Juan Pérez vence en 7 días</span>
          <button 
            className="btn-ver"
            onClick={() => navigate('/personal')}
          >
            Ver
          </button>
        </div>
      </div>

      {/* Resumen General - Tarjetas más compactas */}
      <div className="dashboard-grid">
        <div 
          className="summary-card flota" 
          onClick={() => handleCardClick('/flota/rodado-maquinarias')}
        >
          <div className="card-header">
            <span className="card-icon">🚗</span>
            <h3>Flota Vehicular</h3>
          </div>
          <div className="card-stats">
            <span className="card-number">47</span>
            <span className="card-label">vehículos</span>
          </div>
          <div className="card-alert">5 vencimientos</div>
        </div>

        <div 
          className="summary-card personal" 
          onClick={() => handleCardClick('/personal')}
        >
          <div className="card-header">
            <span className="card-icon">👥</span>
            <h3>Personal</h3>
          </div>
          <div className="card-stats">
            <span className="card-number">24</span>
            <span className="card-label">personas</span>
          </div>
          <div className="card-alert">3 certificados por vencer</div>
        </div>

        <div 
          className="summary-card sedes" 
          onClick={() => handleCardClick('/sedes')}
        >
          <div className="card-header">
            <span className="card-icon">🏢</span>
            <h3>Sedes/Empresas</h3>
          </div>
          <div className="card-stats">
            <span className="card-number">5</span>
            <span className="card-label">sedes</span>
          </div>
          <div className="card-alert">1 permiso vencido</div>
        </div>

        <div 
          className="summary-card proveedores" 
          onClick={() => handleCardClick('/proveedores')}
        >
          <div className="card-header">
            <span className="card-icon">🤝</span>
            <h3>Proveedores</h3>
          </div>
          <div className="card-stats">
            <span className="card-number">12</span>
            <span className="card-label">proveedores</span>
          </div>
          <div className="card-alert">2 contratos por renovar</div>
        </div>
      </div>

      {/* Sección de Vencimientos Próximos */}
      <div className="data-section">
        <div className="section-header">
          <h2 className="section-title">
            <span>📋</span>
            Vencimientos Próximos
          </h2>
          <div className="table-toolbar">
            <button className="btn btn-secondary">
              <span>⏷</span> Filtrar
            </button>
            <button className="btn btn-secondary">
              <span>📤</span> Exportar
            </button>
            <button className="btn btn-primary">
              <span>+</span> Nuevo Documento
            </button>
          </div>
        </div>

        {/* Barra de filtros */}
        <div className="filter-bar">
          <select 
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option>Todos los tipos</option>
            <option>Seguro</option>
            <option>VTV</option>
            <option>Certificado</option>
            <option>Permiso</option>
          </select>
          <select 
            className="filter-select"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option>Todos los estados</option>
            <option>Vigente</option>
            <option>Por vencer</option>
            <option>Vencido</option>
          </select>
          <input 
            type="date" 
            className="filter-select"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            placeholder="dd/mm/aaaa"
          />
        </div>

        {/* Tabla de vencimientos */}
        <table className="data-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Tipo Documento</th>
              <th>Vencimiento</th>
              <th>Estado</th>
              <th>Documentos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vencimientos.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong style={{ color: '#1f2937' }}>{item.item}</strong>
                  <small>{item.detalle}</small>
                </td>
                <td style={{ color: '#374151', fontWeight: '500' }}>{item.tipo}</td>
                <td style={{ color: '#374151', fontWeight: '500' }}>{item.vencimiento}</td>
                <td>
                  <span className={`status-badge ${
                    item.estado === 'Vencido' ? 'status-expired' : 
                    item.estado === 'Por vencer' ? 'status-warning' : 'status-active'
                  }`}>
                    {item.estado}
                  </span>
                </td>
                <td style={{ color: '#374151', fontWeight: '500' }}>
                  {'📄'.repeat(item.documentos)}
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="icon-btn" 
                      title="Ver detalles"
                      onClick={() => console.log('Ver:', item.id)}
                    >
                      👁️
                    </button>
                    <button 
                      className="icon-btn" 
                      title="Editar"
                      onClick={() => console.log('Editar:', item.id)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="icon-btn" 
                      title="Descargar documentos"
                      onClick={() => console.log('Descargar:', item.id)}
                    >
                      📤
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;