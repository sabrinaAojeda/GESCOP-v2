import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as XLSX from 'xlsx'
import useSedes from '../../hooks/useSedes'
import GenericModal from '../../components/Common/GenericModal'
import SedesForm from '../../components/DataTable/forms/SedesForm'
import ColumnSelectorSedes from '../../components/Common/ColumnSelectorSedes'
import CargaMasiva from '../../components/Common/CargaMasiva'
import '@assets/css/buttons.css'
import './Sedes.css'

const Sedes = () => {
  const {
    sedes,
    loading,
    error,
    pagination,
    obtenerSedes,
    crearSede,
    actualizarSede,
    eliminarSede,
    sedeSeleccionada,
    documents,
    habilitations,
    
    // Estados de modales
    isCreateModalOpen,
    isEditModalOpen,
    isViewModalOpen,
    isDeleteModalOpen,
    isDocumentosModalOpen,
    isHabilitacionesModalOpen,
    
    // Funciones para abrir modales
    openCreateModal,
    openEditModal,
    openViewModal,
    openDeleteModal,
    openDocumentosModal,
    openHabilitacionesModal,
    
    // Funciones para cerrar modales
    closeCreateModal,
    closeEditModal,
    closeViewModal,
    closeDeleteModal,
    closeDocumentosModal,
    closeHabilitacionesModal
  } = useSedes()
  
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroProvincia, setFiltroProvincia] = useState('')
  
  // Estados para ColumnSelector
  const [mostrarColumnSelector, setMostrarColumnSelector] = useState(false)
  const [columnasVisibles, setColumnasVisibles] = useState({
    'codigo': true,
    'nombre': true,
    'tipo': true,
    'direccion': true,
    'estado': true,
    'localidad': false,
    'provincia': false,
    'telefono': false,
    'email': false,
    'responsable': false,
    'base_operativa': false,
    'habilitaciones': false,
    'vehiculos_asignados': false,
    'vencimiento_habilitacion': false,
    'documentos': false
  })
  
  // Estados para Carga Masiva
  const [mostrarCargaMasiva, setMostrarCargaMasiva] = useState(false)
  
  // Plantilla para carga masiva de sedes
  const sedesTemplateFields = [
    'Código', 'Nombre', 'Tipo', 'Dirección', 'Localidad', 
    'Provincia', 'Teléfono', 'Email', 'Responsable', 'Estado'
  ]
  const sedesRequiredFields = ['Nombre', 'Código', 'Tipo']
  
  // Handlers para ColumnSelector
  const abrirColumnSelector = () => setMostrarColumnSelector(true)
  const cerrarColumnSelector = () => setMostrarColumnSelector(false)
  const toggleColumna = (columnaKey) => {
    setColumnasVisibles(prev => ({
      ...prev,
      [columnaKey]: !prev[columnaKey]
    }))
  }

  const handleSaveSede = async (datos) => {
    try {
      if (sedeSeleccionada && sedeSeleccionada.id) {
        await actualizarSede(sedeSeleccionada.id, datos)
      } else {
        await crearSede(datos)
      }
      closeEditModal()
    } catch (error) {
      console.error('Error guardando sede:', error)
    }
  }

  const handleDeleteSede = async () => {
    if (sedeSeleccionada && window.confirm('¿Está seguro de eliminar esta sede?')) {
      await eliminarSede(sedeSeleccionada.id)
    }
  }
  
  // Manejar datos de carga masiva
  const handleDataLoaded = async (data) => {
    try {
      // Normalizar los datos del Excel al formato del formulario
      const normalizedData = data.map(row => ({
        codigo: row.Código || row.codigo || row['Codigo'] || '',
        nombre: row.Nombre || row.nombre || '',
        tipo: row.Tipo || row.tipo || '',
        direccion: row.Dirección || row.direccion || row['Dirección'] || '',
        localidad: row.Localidad || row.localidad || '',
        provincia: row.Provincia || row.provincia || '',
        telefono: row.Teléfono || row.telefono || row['Teléfono'] || '',
        email: row.Email || row.email || row['Correo'] || '',
        responsable: row.Responsable || row.responsable || '',
        base_operativa: row['Base Operativa'] || row.base_operativa || '',
        estado: row.Estado || row.estado || 'Activa'
      }))
      
      // Guardar cada registro
      for (const sedeData of normalizedData) {
        await crearSede(sedeData)
      }
    } catch (error) {
      console.error('Error en carga masiva:', error)
      alert('Error al procesar algunos registros')
    }
  }

  // Exportar sedes a XLSX
  const handleExportToXLSX = () => {
    if (sedesFiltradas.length === 0) {
      alert('⚠️ No hay datos para exportar');
      return;
    }
    
    try {
      const dataToExport = sedesFiltradas.map(s => ({
        Código: s.codigo || '',
        Nombre: s.nombre || '',
        Tipo: s.tipo || '',
        Dirección: s.direccion || '',
        Localidad: s.localidad || '',
        Provincia: s.provincia || '',
        Teléfono: s.telefono || '',
        Email: s.email || '',
        Responsable: s.responsable || '',
        'Base Operativa': s.base_operativa || '',
        Estado: s.estado || '',
        'Venc. Habilitación': s.vencimiento_habilitacion || ''
      }));
      
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sedes');
      
      // Ajustar ancho de columnas
      const wscols = [
        { wch: 10 }, { wch: 30 }, { wch: 15 }, { wch: 40 },
        { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 30 },
        { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 18 }
      ];
      ws['!cols'] = wscols;
      
      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `sedes_${date}.xlsx`);
      
      alert('✅ Sedes exportadas exitosamente');
    } catch (err) {
      console.error('Error exportando:', err);
      alert('❌ Error al exportar datos');
    }
  };

  // Filtrar localmente para la UI
  const sedesFiltradas = sedes.filter(sede => {
    if (filtroBusqueda) {
      const term = filtroBusqueda.toLowerCase()
      if (!sede.nombre?.toLowerCase().includes(term) && 
          !sede.codigo?.toLowerCase().includes(term) &&
          !sede.direccion?.toLowerCase().includes(term)) return false
    }
    if (filtroEstado && sede.estado !== filtroEstado) return false
    if (filtroProvincia && sede.provincia !== filtroProvincia) return false
    return true
  })

  // Obtener opciones únicas
  const provinciasUnicas = [...new Set(sedes.map(s => s.provincia).filter(Boolean))]
  const estadosUnicos = [...new Set(sedes.map(s => s.estado).filter(Boolean))]

  // Calcular estadísticas
  const sedesActivas = sedes.filter(s => s.estado === 'Activa').length
  const totalVehiculos = sedes.reduce((sum, sede) => sum + (sede.vehiculos_asignados || 0), 0)
  const habilitacionesPorVencer = sedes.filter(s => {
    if (!s.vencimiento_habilitacion) return false
    const fechaVenc = new Date(s.vencimiento_habilitacion)
    return fechaVenc < new Date(Date.now() + 60*24*60*60*1000)
  }).length
  const totalDocumentos = sedes.reduce((sum, sede) => sum + (sede.documentos || 0), 0)

  if (loading && sedes.length === 0) {
    return (
      <div className="sedes-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando sedes desde el servidor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="sedes-page">
        <div className="error-message">
          <strong>Error de conexión:</strong> {error}
          <button className="btn btn-primary" onClick={obtenerSedes}>Reintentar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="sedes-page">
      <div className="breadcrumb">
        <Link to="/">Dashboard</Link>  
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Sedes y Empresas</span>
      </div>

      <div className="summary-cards">
        <div className="summary-card-small">
          <div className="number">{sedes.length}</div>
          <div className="label">Sedes Activas</div>
        </div>
        <div className="summary-card-small">
          <div className="number">{totalVehiculos}</div>
          <div className="label">Vehículos Asignados</div>
        </div>
        <div className="summary-card-small">
          <div className="number">{habilitacionesPorVencer}</div>
          <div className="label">Habilit. por Vencer</div>
        </div>
        <div className="summary-card-small">
          <div className="number">{totalDocumentos}</div>
          <div className="label">Documentos</div>
        </div>
      </div>

      <section className="data-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-icon">🏢</span>
            Gestión de Sedes y Empresas COPESA
          </h2>
          {/* Botón de Carga Masiva - Separado */}
          <div className="carga-masiva-toolbar">
            <button 
              className="purple"
              onClick={() => setMostrarCargaMasiva(true)}
            >
              <span className="btn-icon">📥</span> Carga Masiva
            </button>
          </div>
          <div className="table-toolbar">
            <button 
              className="teal"
              onClick={abrirColumnSelector}
            >
              <span className="btn-icon">👁️</span> Columnas
            </button>
            <button 
              className="blue"
              onClick={handleExportToXLSX}
            >
              <span className="btn-icon">📤</span> Exportar
            </button>
            <button 
              className="green"
              onClick={openCreateModal}
            >
              <span className="btn-icon">+</span> Nueva Sede/Empresa
            </button>
          </div>
        </div>

        <div className="filter-bar">
          <input 
            type="text" 
            className="filter-select" 
            placeholder="Buscar sede..." 
            value={filtroBusqueda}
            onChange={(e) => setFiltroBusqueda(e.target.value)}
          />
          <select 
            className="filter-select"
            value={filtroProvincia}
            onChange={(e) => setFiltroProvincia(e.target.value)}
          >
            <option value="">Todas las provincias</option>
            {provinciasUnicas.map(prov => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </select>
          <select 
            className="filter-select"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {estadosUnicos.map(est => (
              <option key={est} value={est}>{est}</option>
            ))}
          </select>
          {(filtroBusqueda || filtroEstado || filtroProvincia) && (
            <button 
              className="secondary"
              onClick={() => {
                setFiltroBusqueda('')
                setFiltroEstado('')
                setFiltroProvincia('')
              }}
            >
              Limpiar Filtros
            </button>
          )}
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {columnasVisibles.codigo && <th>Código</th>}
                {columnasVisibles.nombre && <th>Nombre Sede/Empresa</th>}
                {columnasVisibles.tipo && <th>Tipo</th>}
                {columnasVisibles.direccion && <th>Ubicación</th>}
                {columnasVisibles.base_operativa && <th>Base Operativa</th>}
                {columnasVisibles.habilitaciones && <th>Habilitaciones</th>}
                {columnasVisibles.vencimiento_habilitacion && <th>Vencimiento</th>}
                {columnasVisibles.documentos && <th>Documentos</th>}
                {columnasVisibles.estado && <th>Estado</th>}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sedesFiltradas.map((sede) => (
                <tr key={sede.id}>
                  {columnasVisibles.codigo && (
                    <td>
                      <strong>{sede.codigo}</strong>
                    </td>
                  )}
                  {columnasVisibles.nombre && (
                    <td>
                      <div>
                        <strong>{sede.nombre}</strong>
                        <div className="contacto-info">
                          {columnasVisibles.telefono && <small>📞 {sede.telefono}</small>}
                          {columnasVisibles.email && <small>✉️ {sede.email}</small>}
                        </div>
                      </div>
                    </td>
                  )}
                  {columnasVisibles.tipo && <td>{sede.tipo}</td>}
                  {columnasVisibles.direccion && (
                    <td>
                      <div>
                        <div>{sede.direccion}</div>
                        <div>{sede.localidad}, {sede.provincia}</div>
                        {columnasVisibles.responsable && <small>👤 {sede.responsable}</small>}
                      </div>
                    </td>
                  )}
                  {columnasVisibles.base_operativa && <td>{sede.base_operativa}</td>}
                  {columnasVisibles.habilitaciones && (
                    <td>
                      <div className="habilitaciones-list">
                        {(sede.habilitaciones || []).map((hab, idx) => (
                          <span key={idx} className="habilitacion-badge">
                            {hab}
                          </span>
                        ))}
                      </div>
                    </td>
                  )}
                  {columnasVisibles.vencimiento_habilitacion && (
                    <td>
                      <span className={`vencimiento-badge ${
                        new Date(sede.vencimiento_habilitacion) < new Date() ? 'vencido' :
                        new Date(sede.vencimiento_habilitacion) < new Date(Date.now() + 60*24*60*60*1000) ? 'por-vencer' : 'vigente'
                      }`}>
                        {sede.vencimiento_habilitacion ? new Date(sede.vencimiento_habilitacion).toLocaleDateString('es-AR') : 'N/A'}
                      </span>
                    </td>
                  )}
                  {columnasVisibles.documentos && (
                    <td>
                      <span className="documentos-count">
                        📄 {sede.documentos || 0}
                      </span>
                    </td>
                  )}
                  {columnasVisibles.estado && (
                    <td>
                      <span className={`status-badge ${sede.estado === 'Activa' ? 'status-active' : 'status-inactivo'}`}>
                        {sede.estado}
                      </span>
                    </td>
                  )}
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="icon-btn" 
                        title="Ver detalles"
                        onClick={() => openViewModal(sede)}
                      >
                        👁️
                      </button>
                      <button 
                        className="icon-btn" 
                        title="Editar"
                        onClick={() => openEditModal(sede)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="icon-btn" 
                        title="Habilitaciones"
                        onClick={() => openHabilitacionesModal(sede)}
                      >
                        📋
                      </button>
                      <button 
                        className="icon-btn" 
                        title="Documentación"
                        onClick={() => openDocumentosModal(sede)}
                      >
                        📄
                      </button>
                      <button 
                        className="icon-btn" 
                        title="Eliminar"
                        onClick={() => openDeleteModal(sede)}
                        style={{ color: '#ef4444' }}
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

        {/* Paginación */}
        {pagination.total_pages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={pagination.current_page === 1 || loading}
              onClick={() => obtenerSedes(pagination.current_page - 1)}
            >
              ← Anterior
            </button>
            <span className="pagination-info">
              Página {pagination.current_page} de {pagination.total_pages}
              <small> ({pagination.total} registros)</small>
            </span>
            <button
              className="pagination-btn"
              disabled={pagination.current_page === pagination.total_pages || loading}
              onClick={() => obtenerSedes(pagination.current_page + 1)}
            >
              Siguiente →
            </button>
          </div>
        )}
      </section>

      {/* Modal para Crear */}
      {isCreateModalOpen && (
        <GenericModal
          title="➕ Nueva Sede/Empresa"
          onClose={closeCreateModal}
          size="large"
        >
          <SedesForm
            mode="crear"
            onClose={closeCreateModal}
            onSave={handleSaveSede}
          />
        </GenericModal>
      )}

      {/* Modal para Editar */}
      {isEditModalOpen && sedeSeleccionada && (
        <GenericModal
          title={`✏️ Editar Sede: ${sedeSeleccionada?.nombre}`}
          onClose={closeEditModal}
          size="large"
        >
          <SedesForm
            mode="editar"
            sede={sedeSeleccionada}
            onClose={closeEditModal}
            onSave={handleSaveSede}
          />
        </GenericModal>
      )}

      {/* Modal para Ver */}
      {isViewModalOpen && sedeSeleccionada && (
        <GenericModal
          title={`👁️ Ver Sede: ${sedeSeleccionada?.nombre}`}
          onClose={closeViewModal}
          size="large"
        >
          <SedesForm
            mode="ver"
            sede={sedeSeleccionada}
            onClose={closeViewModal}
            readOnly={true}
          />
        </GenericModal>
      )}

      {/* Modal para Eliminar */}
      {isDeleteModalOpen && sedeSeleccionada && (
        <GenericModal
          title={`🗑️ Eliminar Sede: ${sedeSeleccionada?.nombre}`}
          onClose={closeDeleteModal}
          size="small"
        >
          <div className="delete-modal-content">
            <p>¿Está seguro de eliminar la sede <strong>{sedeSeleccionada?.nombre}</strong>?</p>
            <p>Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button className="btn secondary" onClick={closeDeleteModal}>
                Cancelar
              </button>
              <button className="btn danger" onClick={handleDeleteSede}>
                Eliminar
              </button>
            </div>
          </div>
        </GenericModal>
      )}

      {/* Modal para Documentación */}
      {isDocumentosModalOpen && sedeSeleccionada && (
        <GenericModal
          title={`📄 Documentación: ${sedeSeleccionada?.nombre}`}
          onClose={closeDocumentosModal}
          size="large"
        >
          <div className="documentos-container">
            <h3>Documentación de Seguridad e Higiene</h3>
            <div className="documentos-section">
              <h4>📋 Habilitaciones y Certificaciones</h4>
              <div className="documentos-list">
                {documents.length > 0 ? (
                  documents.map((doc, index) => (
                    <div key={index} className="documento-item">
                      <div className="documento-info">
                        <strong>{doc.tipo || doc.nombre || 'Documento'}</strong>
                        <small>{doc.fecha_subida || doc.created_at || 'Sin fecha'}</small>
                        {doc.vencimiento && (
                          <span className={`vencimiento ${
                            new Date(doc.vencimiento) < new Date() ? 'vencido' :
                            new Date(doc.vencimiento) < new Date(Date.now() + 30*24*60*60*1000) ? 'por-vencer' : 'vigente'
                          }`}>
                            Vence: {new Date(doc.vencimiento).toLocaleDateString('es-AR')}
                          </span>
                        )}
                      </div>
                      <div className="documento-actions">
                        {doc.archivo && (
                          <button 
                            className="icon-btn" 
                            title="Descargar"
                            onClick={() => window.open(doc.archivo, '_blank')}
                          >
                            ⬇️
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-documents">No hay documentos cargados</p>
                )}
              </div>
            </div>
          </div>
        </GenericModal>
      )}

      {/* Modal para Habilitaciones */}
      {isHabilitacionesModalOpen && sedeSeleccionada && (
        <GenericModal
          title={`📋 Habilitaciones: ${sedeSeleccionada?.nombre}`}
          onClose={closeHabilitacionesModal}
          size="large"
        >
          <div className="habilitaciones-container">
            <h3>Habilitaciones de la Sede</h3>
            <div className="habilitaciones-list">
              {habilitations.length > 0 ? (
                habilitations.map((hab, index) => (
                  <div key={index} className="habilitacion-item">
                    <div className="habilitacion-info">
                      <strong>{hab.tipo || 'Habilitación'}</strong>
                      <small>Vence: {hab.fecha_vencimiento || 'Sin fecha'}</small>
                    </div>
                    <div className="habilitacion-status">
                      <span className={`status-badge status-${hab.estado || 'activo'}`}>
                        {hab.estado || 'Activo'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-habilitaciones">No hay habilitaciones cargadas</p>
              )}
            </div>
          </div>
        </GenericModal>
      )}
      
      {/* Modal ColumnSelector */}
      {mostrarColumnSelector && (
        <ColumnSelectorSedes
          columnasVisibles={columnasVisibles}
          onToggleColumna={toggleColumna}
          onClose={cerrarColumnSelector}
        />
      )}
      
      {/* Modal de Carga Masiva */}
      <CargaMasiva
        isOpen={mostrarCargaMasiva}
        onClose={() => setMostrarCargaMasiva(false)}
        onDataLoaded={handleDataLoaded}
        title="Carga Masiva de Sedes"
        templateFields={sedesTemplateFields}
        requiredFields={sedesRequiredFields}
      />
    </div>
  )
}

export default Sedes
