// src/pages/Alertas/Alertas.jsx - DISEÑO ESPECÍFICO PARA ALERTAS
import React, { useState, useEffect } from 'react';
import useResponsive from '../../hooks/useResponsive';
import './Alertas.css';

// Datos mock de alertas según capturas del cliente
const mockAlertas = [
  {
    id: 'ALT-001',
    categoria: 'Vencimientos',
    descripcion: 'VTV por vencer',
    elemento: 'AB-123-CD',
    fechaGeneracion: '01/04/2024',
    vencimiento: '15/04/2024',
    nivel: 'Alto',
    estado: 'Pendiente',
    tipo: 'VTV',
    prioridad: 'critico',
    icono: '🚨'
  },
  {
    id: 'ALT-002',
    categoria: 'Mantenimiento',
    descripcion: 'Service próximo',
    elemento: 'EF-456-GH',
    fechaGeneracion: '28/03/2024',
    vencimiento: '05/04/2024',
    nivel: 'Crítico',
    estado: 'Pendiente',
    tipo: 'Mantenimiento',
    prioridad: 'critico',
    icono: '🔧'
  },
  {
    id: 'ALT-003',
    categoria: 'Seguro',
    descripcion: 'Seguro por vencer',
    elemento: 'IJ-789-KL',
    fechaGeneracion: '25/03/2024',
    vencimiento: '10/04/2024',
    nivel: 'Alto',
    estado: 'En proceso',
    tipo: 'Seguro',
    prioridad: 'alto',
    icono: '📋'
  },
  {
    id: 'ALT-004',
    categoria: 'Licencias',
    descripcion: 'Licencia próxima a vencer',
    elemento: 'Juan Pérez',
    fechaGeneracion: '20/03/2024',
    vencimiento: '30/04/2024',
    nivel: 'Medio',
    estado: 'Pendiente',
    tipo: 'Licencia',
    prioridad: 'medio',
    icono: '👤'
  },
  {
    id: 'ALT-005',
    categoria: 'Documentación',
    descripcion: 'Documento vencido',
    elemento: 'Sede Central',
    fechaGeneracion: '15/03/2024',
    vencimiento: '01/04/2024',
    nivel: 'Alto',
    estado: 'Resuelto',
    tipo: 'Documento',
    prioridad: 'alto',
    icono: '📄'
  }
];

const Alertas = () => {
  const responsive = useResponsive();
  const [alertas, setAlertas] = useState(mockAlertas);
  const [filtros, setFiltros] = useState({
    categoria: '',
    nivel: '',
    estado: '',
    tipo: '',
    buscar: ''
  });
  const [alertasFiltradas, setAlertasFiltradas] = useState(mockAlertas);
  const [alertaExpandida, setAlertaExpandida] = useState(null);

  // Estadísticas
  const estadisticas = {
    total: alertas.length,
    criticas: alertas.filter(a => a.prioridad === 'critico').length,
    altas: alertas.filter(a => a.prioridad === 'alto').length,
    resueltasHoy: alertas.filter(a => a.estado === 'Resuelto').length
  };

  // Aplicar filtros
  useEffect(() => {
    let resultados = [...alertas];
    
    if (filtros.categoria) {
      resultados = resultados.filter(a => a.categoria === filtros.categoria);
    }
    
    if (filtros.nivel) {
      resultados = resultados.filter(a => a.nivel === filtros.nivel);
    }
    
    if (filtros.estado) {
      resultados = resultados.filter(a => a.estado === filtros.estado);
    }
    
    if (filtros.tipo) {
      resultados = resultados.filter(a => a.tipo === filtros.tipo);
    }
    
    if (filtros.buscar) {
      const termino = filtros.buscar.toLowerCase();
      resultados = resultados.filter(a => 
        a.descripcion.toLowerCase().includes(termino) ||
        a.elemento.toLowerCase().includes(termino) ||
        a.id.toLowerCase().includes(termino)
      );
    }
    
    setAlertasFiltradas(resultados);
  }, [alertas, filtros]);

  // Handlers
  const handleFiltrar = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const handleResolver = (id) => {
    setAlertas(prev => 
      prev.map(alerta => 
        alerta.id === id 
          ? { ...alerta, estado: 'Resuelto', nivel: 'Bajo' }
          : alerta
      )
    );
  };

  const handlePosponer = (id) => {
    const nuevaFecha = prompt('Ingrese nueva fecha (dd/mm/aaaa):');
    if (nuevaFecha) {
      setAlertas(prev =>
        prev.map(alerta =>
          alerta.id === id
            ? { 
                ...alerta, 
                vencimiento: nuevaFecha,
                estado: 'En proceso',
                nivel: 'Medio'
              }
            : alerta
        )
      );
    }
  };

  const handleArchivar = (id) => {
    if (window.confirm('¿Está seguro de archivar esta alerta?')) {
      setAlertas(prev => prev.filter(alerta => alerta.id !== id));
    }
  };

  // Render de tarjeta de alerta
  const renderAlertaCard = (alerta) => {
    const isExpanded = alertaExpandida === alerta.id;
    
    return (
      <div 
        key={alerta.id} 
        className={`alerta-card alerta-${alerta.prioridad} ${isExpanded ? 'expanded' : ''}`}
      >
        <div 
          className="alerta-card-header"
          onClick={() => setAlertaExpandida(isExpanded ? null : alerta.id)}
        >
          <div className="alerta-icon">{alerta.icono}</div>
          <div className="alerta-content">
            <div className="alerta-title">
              <h4>{alerta.descripcion}</h4>
              <span className="alerta-id">{alerta.id}</span>
            </div>
            <div className="alerta-details">
              <span className="alerta-elemento">
                <strong>Elemento:</strong> {alerta.elemento}
              </span>
              <span className="alerta-vencimiento">
                <strong>Vence:</strong> {alerta.vencimiento}
              </span>
            </div>
          </div>
          <div className="alerta-status">
            <span className={`nivel-badge nivel-${alerta.prioridad}`}>
              {alerta.nivel}
            </span>
            <span className="expansion-arrow">
              {isExpanded ? '▾' : '▸'}
            </span>
          </div>
        </div>
        
        {isExpanded && (
          <div className="alerta-card-body">
            <div className="alerta-info-grid">
              <div className="info-item">
                <span className="info-label">Categoría:</span>
                <span className="info-value">{alerta.categoria}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Tipo:</span>
                <span className="info-value">{alerta.tipo}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Generada:</span>
                <span className="info-value">{alerta.fechaGeneracion}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Estado:</span>
                <span className={`estado-badge estado-${alerta.estado.toLowerCase().replace(' ', '-')}`}>
                  {alerta.estado}
                </span>
              </div>
            </div>
            
            <div className="alerta-actions">
              {alerta.estado !== 'Resuelto' && (
                <>
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={() => handleResolver(alerta.id)}
                  >
                    ✅ Resolver
                  </button>
                  <button 
                    className="btn btn-warning btn-sm"
                    onClick={() => handlePosponer(alerta.id)}
                  >
                    ⏱️ Posponer
                  </button>
                </>
              )}
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => handleArchivar(alerta.id)}
              >
                📁 Archivar
              </button>
              <button className="btn btn-info btn-sm">
                👁️ Ver detalles
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render de tarjetas para móvil
  const renderMobileAlertas = () => {
    return (
      <div className="alertas-mobile-container">
        {alertasFiltradas.map(alerta => renderAlertaCard(alerta))}
      </div>
    );
  };

  // Render de tabla para desktop
  const renderDesktopTable = () => {
    return (
      <div className="alertas-table-container">
        <table className="alertas-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th>Elemento</th>
              <th>Generación</th>
              <th>Vencimiento</th>
              <th>Nivel</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alertasFiltradas.map(alerta => (
              <tr key={alerta.id} className={`alerta-row alerta-${alerta.prioridad}`}>
                <td className="alerta-id-cell">
                  <span className="alerta-icon-small">{alerta.icono}</span>
                  {alerta.id}
                </td>
                <td>{alerta.categoria}</td>
                <td>
                  <div className="alerta-descripcion">
                    <strong>{alerta.descripcion}</strong>
                    {alerta.tipo && <span className="alerta-tipo">{alerta.tipo}</span>}
                  </div>
                </td>
                <td>{alerta.elemento}</td>
                <td>{alerta.fechaGeneracion}</td>
                <td>
                  <span className="vencimiento-cell">
                    {alerta.vencimiento}
                  </span>
                </td>
                <td>
                  <span className={`nivel-badge nivel-${alerta.prioridad}`}>
                    {alerta.nivel}
                  </span>
                </td>
                <td>
                  <span className={`estado-badge estado-${alerta.estado.toLowerCase().replace(' ', '-')}`}>
                    {alerta.estado}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    {alerta.estado !== 'Resuelto' && (
                      <>
                        <button 
                          className="icon-btn success"
                          onClick={() => handleResolver(alerta.id)}
                          title="Resolver"
                        >
                          ✅
                        </button>
                        <button 
                          className="icon-btn warning"
                          onClick={() => handlePosponer(alerta.id)}
                          title="Posponer"
                        >
                          ⏱️
                        </button>
                      </>
                    )}
                    <button 
                      className="icon-btn secondary"
                      onClick={() => handleArchivar(alerta.id)}
                      title="Archivar"
                    >
                      📁
                    </button>
                    <button 
                      className="icon-btn info"
                      title="Ver detalles"
                    >
                      👁️
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

  return (
    <div className="alertas-page">
      {/* Header de página */}
      <div className="page-header">
        <h1>🚨 Sistema de Alertas</h1>
        <p className="page-subtitle">
          Gestión centralizada de alertas y vencimientos del sistema
        </p>
      </div>

      {/* Resumen de alertas */}
      <div className="alertas-summary">
        <div className="summary-card summary-total">
          <div className="summary-number">{estadisticas.total}</div>
          <div className="summary-label">Alertas Activas</div>
        </div>
        <div className="summary-card summary-criticas">
          <div className="summary-number">{estadisticas.criticas}</div>
          <div className="summary-label">Críticas</div>
        </div>
        <div className="summary-card summary-altas">
          <div className="summary-number">{estadisticas.altas}</div>
          <div className="summary-label">Alta Prioridad</div>
        </div>
        <div className="summary-card summary-resueltas">
          <div className="summary-number">{estadisticas.resueltasHoy}</div>
          <div className="summary-label">Resueltas Hoy</div>
        </div>
      </div>

      {/* Panel de configuración */}
      <div className="configuracion-panel">
        <div className="panel-header">
          <h3>⚙️ Configurar Alertas</h3>
          <div className="panel-actions">
            <button className="btn btn-primary">
              <span>⚙️</span> Configurar Alertas
            </button>
            <button className="btn btn-secondary">
              <span>📤</span> Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <div className="filtros-header">
          <h3>🔍 Filtros de Alertas</h3>
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => setFiltros({
              categoria: '',
              nivel: '',
              estado: '',
              tipo: '',
              buscar: ''
            })}
          >
            Limpiar filtros
          </button>
        </div>
        
        <div className="filtros-grid">
          <div className="filtro-group">
            <label>Categoría</label>
            <select 
              value={filtros.categoria}
              onChange={(e) => handleFiltrar('categoria', e.target.value)}
              className="filtro-select"
            >
              <option value="">Todas las categorías</option>
              <option value="Vencimientos">Vencimientos</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Seguro">Seguro</option>
              <option value="Licencias">Licencias</option>
              <option value="Documentación">Documentación</option>
            </select>
          </div>
          
          <div className="filtro-group">
            <label>Nivel</label>
            <select 
              value={filtros.nivel}
              onChange={(e) => handleFiltrar('nivel', e.target.value)}
              className="filtro-select"
            >
              <option value="">Todos los niveles</option>
              <option value="Crítico">Crítico</option>
              <option value="Alto">Alto</option>
              <option value="Medio">Medio</option>
              <option value="Bajo">Bajo</option>
            </select>
          </div>
          
          <div className="filtro-group">
            <label>Estado</label>
            <select 
              value={filtros.estado}
              onChange={(e) => handleFiltrar('estado', e.target.value)}
              className="filtro-select"
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En proceso">En proceso</option>
              <option value="Resuelto">Resuelto</option>
            </select>
          </div>
          
          <div className="filtro-group">
            <label>Tipo</label>
            <select 
              value={filtros.tipo}
              onChange={(e) => handleFiltrar('tipo', e.target.value)}
              className="filtro-select"
            >
              <option value="">Todos los tipos</option>
              <option value="VTV">VTV</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Seguro">Seguro</option>
              <option value="Licencia">Licencia</option>
              <option value="Documento">Documento</option>
            </select>
          </div>
          
          <div className="filtro-group filtro-buscar">
            <label>Buscar</label>
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Buscar alertas..."
                value={filtros.buscar}
                onChange={(e) => handleFiltrar('buscar', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="alertas-content">
        <div className="section-header">
          <h3 className="section-title">
            📋 Lista de Alertas ({alertasFiltradas.length})
          </h3>
          <div className="table-toolbar">
            <button className="btn btn-sm btn-primary">
              <span>➕</span> Nueva Alerta Manual
            </button>
            <button className="btn btn-sm btn-secondary">
              <span>🔄</span> Actualizar
            </button>
          </div>
        </div>

        {/* Contenido responsive */}
        {responsive.showCardsInsteadOfTable ? renderMobileAlertas() : renderDesktopTable()}

        {/* Contador */}
        <div className="contador-alertas">
          Mostrando {alertasFiltradas.length} de {alertas.length} alertas
        </div>
      </div>
    </div>
  );
};

export default Alertas;