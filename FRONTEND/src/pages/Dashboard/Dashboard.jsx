// src/pages/Dashboard/Dashboard.jsx - VERSIÓN CONECTADA AL BACKEND
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../hooks/useDashboard';
import FilterBar from '../../components/Common/FilterBar';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    loading,
    error,
    estadisticas,
    resumen,
    alertas,
    vencimientos,
    loadDashboardData,
    refreshData
  } = useDashboard();
  
  const [filterType, setFilterType] = useState('Todos los tipos');
  const [filterEstado, setFilterEstado] = useState('Todos los estados');
  const [filterDate, setFilterDate] = useState('');

  // 🎯 EXPORTAR VENCIMIENTOS A CSV
  const handleExportVencimientos = () => {
    if (vencimientosFiltrados.length === 0) {
      alert('⚠️ No hay datos para exportar');
      return;
    }
    
    try {
      const dataToExport = vencimientosFiltrados.map(v => ({
        Item: v.item || v.interno || v.dominio || '',
        Tipo: v.tipo || '',
        Vencimiento: v.vencimiento || '',
        'Días Restantes': v.dias_restantes || 0,
        Estado: v.estado || v.nivel || ''
      }));
      
      const headers = Object.keys(dataToExport[0] || {}).join(',');
      const rows = dataToExport.map(row => 
        Object.values(row).map(value => `"${value || ''}"`).join(',')
      ).join('\n');
      
      const csv = `${headers}\n${rows}`;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vencimientos_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      alert('✅ Vencimientos exportados exitosamente');
    } catch (err) {
      console.error('Error exportando:', err);
      alert('❌ Error al exportar datos');
    }
  };

  // Ver detalles del vencimiento
  const handleVerDetalles = (item) => {
    alert(`📋 Detalles del Vencimiento\n\nItem: ${item.item || item.interno || item.dominio}\nTipo: ${item.tipo}\nVencimiento: ${item.vencimiento}\nEstado: ${item.estado}\nDías Restantes: ${item.dias_restantes}\n\n(${item.detalle || 'Sin detalles adicionales'})`);
  };

  // Editar vencimiento
  const handleEditar = (item) => {
    alert(`✏️ Editar Vencimiento\n\nEsta funcionalidad permitiría editar los detalles del vencimiento para: ${item.item || item.interno || item.dominio}\n\nRedirigiendo a formulario de edición...`);
  };

  // Descargar documentos
  const handleDescargarDocumentos = (item) => {
    alert(`📥 Descargar Documentos\n\nDescargando documentos asociados a: ${item.item || item.interno || item.dominio}\n\nTipo: ${item.tipo}\nDocumento: ${item.documento || 'Documento principal'}`);
  };
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleCardClick = (path) => {
    navigate(path);
  };

  // Filtrar vencimientos localmente
  const vencimientosFiltrados = vencimientos.filter(v => {
    if (filterType !== 'Todos los tipos' && v.tipo !== filterType) return false;
    if (filterEstado !== 'Todos los estados' && v.estado !== filterEstado) return false;
    if (filterDate && v.vencimiento !== filterDate) return false;
    return true;
  });

  if (loading && Object.keys(estadisticas).length === 0) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error-message">
          <strong>Error de conexión:</strong> {error}
          <button className="btn btn-primary" onClick={refreshData}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Panel de Alertas de Vencimiento */}
      {alertas.length > 0 && (
        <div className="alert-panel">
          <div className="alert-header">
            <span>⚠️</span>
            <strong>Alertas de Vencimiento ({alertas.length})</strong>
          </div>
          {alertas.slice(0, 5).map((alerta, index) => (
            <div key={index} className="alert-item">
              <span>{alerta.mensaje || alerta.descripcion}</span>
              <button 
                className="btn-ver"
                onClick={() => navigate(alerta.ruta || '/flota/vehiculos')}
              >
                Ver
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Resumen General - Tarjetas */}
      <div className="dashboard-grid">
        <div 
          className="summary-card flota" 
          onClick={() => handleCardClick('/flota/flota-servicio')}
        >
          <div className="card-header">
            <span className="card-icon">🚗</span>
            <h3>Flota Vehicular</h3>
          </div>
          <div className="card-stats">
            <span className="card-number">{estadisticas.totalVehiculos || 0}</span>
            <span className="card-label">vehículos</span>
          </div>
          <div className="card-alert">
            {estadisticas.vehiculosMantenimiento || 0} en mantenimiento
          </div>
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
            <span className="card-number">{estadisticas.totalPersonal || 0}</span>
            <span className="card-label">personas</span>
          </div>
          <div className="card-alert">
            {estadisticas.personalActivo || 0} activos
          </div>
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
            <span className="card-number">{estadisticas.totalSedes || 0}</span>
            <span className="card-label">sedes</span>
          </div>
          <div className="card-alert">
            {estadisticas.sedesActivas || 0} activas
          </div>
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
            <span className="card-number">{estadisticas.totalProveedores || 0}</span>
            <span className="card-label">proveedores</span>
          </div>
          <div className="card-alert">
            {estadisticas.proveedoresActivos || 0} activos
          </div>
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
            <button className="btn btn-secondary" onClick={refreshData}>
              <span>🔄</span> Actualizar
            </button>
            <button className="btn btn-secondary" onClick={handleExportVencimientos}>
              <span>📤</span> Exportar
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
            <option>Licencia</option>
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
          {(filterType !== 'Todos los tipos' || filterEstado !== 'Todos los estados' || filterDate) && (
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setFilterType('Todos los tipos');
                setFilterEstado('Todos los estados');
                setFilterDate('');
              }}
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Tabla de vencimientos */}
        {vencimientosFiltrados.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Tipo Documento</th>
                <th>Vencimiento</th>
                <th>Días Restantes</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vencimientosFiltrados.map((item) => (
                <tr key={item.id || item.interno || item.dominio}>
                  <td>
                    <strong style={{ color: '#1f2937' }}>{item.item || item.interno || item.dominio}</strong>
                    <small>{item.detalle}</small>
                  </td>
                  <td style={{ color: '#374151', fontWeight: '500' }}>{item.tipo}</td>
                  <td style={{ color: '#374151', fontWeight: '500' }}>
                    {item.vencimiento ? new Date(item.vencimiento).toLocaleDateString('es-AR') : item.vencimiento}
                  </td>
                  <td>
                    <span className={`dias-badge ${item.dias_restantes <= 0 ? 'vencido' : item.dias_restantes <= 7 ? 'por-vencer' : 'vigente'}`}>
                      {item.dias_restantes <= 0 ? `Vencido (${Math.abs(item.dias_restantes)} días)` : 
                       item.dias_restantes === 1 ? '1 día' : 
                       `${item.dias_restantes} días`}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${
                      item.estado === 'Vencido' ? 'status-expired' : 
                      item.estado === 'Por vencer' || item.dias_restantes <= 7 ? 'status-warning' : 'status-active'
                    }`}>
                      {item.estado || (item.dias_restantes <= 0 ? 'Vencido' : item.dias_restantes <= 7 ? 'Por vencer' : 'Vigente')}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="icon-btn" 
                        title="Ver detalles"
                        onClick={() => handleVerDetalles(item)}
                      >
                        👁️
                      </button>
                      <button 
                        className="icon-btn" 
                        title="Editar"
                        onClick={() => handleEditar(item)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="icon-btn" 
                        title="Descargar documentos"
                        onClick={() => handleDescargarDocumentos(item)}
                      >
                        📤
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No hay vencimientos próximos para mostrar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
