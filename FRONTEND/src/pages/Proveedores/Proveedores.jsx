import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { useProveedores } from '../../hooks/useProveedores'
import GenericModal from '../../components/Common/GenericModal'
import ProveedorForm from '../../components/DataTable/forms/ProveedorForm'
import proveedoresService from '../../services/proveedoresService'
import ColumnSelectorProveedores from '../../components/Common/ColumnSelectorProveedores'
import CargaMasiva from '../../components/Common/CargaMasiva'
import '@assets/css/buttons.css'
import './Proveedores.css'

const Proveedores = () => {
  const {
    proveedores,
    loading,
    error,
    filters,
    pagination,
    filterOptions,
    loadProveedores,
    createProveedor,
    updateProveedor,
    deleteProveedor,
    handleSearch,
    handleRubroFilter,
    handleEstadoFilter,
    handleLocalidadFilter,
    resetFilters,
    selectedProveedor,
    isCreateModalOpen,
    isEditModalOpen,
    isViewModalOpen,
    isDeleteModalOpen,
    isDocumentosModalOpen,
    openCreateModal,
    openEditModal,
    openViewModal,
    openDeleteModal,
    openDocumentosModal,
    closeCreateModal,
    closeEditModal,
    closeViewModal,
    closeDeleteModal,
    closeDocumentosModal
  } = useProveedores()
  
  const [filtroRubro, setFiltroRubro] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroLocalidad, setFiltroLocalidad] = useState('')
  const [personalProveedor, setPersonalProveedor] = useState([])
  
  // Estados para ColumnSelector
  const [mostrarColumnSelector, setMostrarColumnSelector] = useState(false)
  const [columnasVisibles, setColumnasVisibles] = useState({
    'codigo': true,
    'razon_social': true,
    'cuit': true,
    'rubro': true,
    'estado': true,
    'contacto_nombre': false,
    'telefono': false,
    'email': false,
    'localidad': false,
    'provincia': false,
    'direccion': false,
    'sector_servicio': false,
    'servicio': false,
    'seguro_RT': false,
    'habilitacion_personal': false,
    'vencimiento_documentacion': false,
    'personal_contratado': false
  })
  
  // Handlers para ColumnSelector
  const abrirColumnSelector = () => setMostrarColumnSelector(true)
  const cerrarColumnSelector = () => setMostrarColumnSelector(false)
  const toggleColumna = (columnaKey) => {
    setColumnasVisibles(prev => ({
      ...prev,
      [columnaKey]: !prev[columnaKey]
    }))
  }
  
  // Estados para Carga Masiva
  const [mostrarCargaMasiva, setMostrarCargaMasiva] = useState(false)
  
  // Plantilla para carga masiva de proveedores
  const proveedoresTemplateFields = [
    'Código', 'Razón Social', 'CUIT', 'Rubro', 'Contacto', 
    'Teléfono', 'Email', 'Localidad', 'Provincia', 'Estado'
  ]
  const proveedoresRequiredFields = ['Razón Social', 'CUIT', 'Rubro']
  
  // Exportar a XLSX
  const handleExportToXLSX = () => {
    if (proveedoresFiltrados.length === 0) {
      alert('⚠️ No hay datos para exportar')
      return
    }
    
    try {
      const dataToExport = proveedoresFiltrados.map(p => ({
        Código: p.codigo || '',
        'Razón Social': p.razon_social || '',
        CUIT: p.cuit || '',
        Rubro: p.rubro || '',
        Estado: p.estado || '',
        'Nombre Contacto': p.contacto_nombre || '',
        Teléfono: p.telefono || '',
        Email: p.email || '',
        Localidad: p.localidad || '',
        Provincia: p.provincia || '',
        Dirección: p.direccion || '',
        'Sector/Servicio': p.sector_servicio || p.rubro || '',
        Servicio: p.servicio || '',
        'Seguro RT': p.seguro_RT ? 'Sí' : 'No',
        'Habilitación Personal': p.habilitacion_personal || '',
        'Venc. Documentación': p.vencimiento_documentacion || '',
        'Personal Contratado': p.personal_contratado || 0
      }))
      
      const ws = XLSX.utils.json_to_sheet(dataToExport)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Proveedores')
      
      // Ajustar ancho de columnas
      const wscols = [
        { wch: 10 }, { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 12 },
        { wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 20 },
        { wch: 40 }, { wch: 20 }, { wch: 25 }, { wch: 10 }, { wch: 25 }, { wch: 18 }, { wch: 15 }
      ];
      ws['!cols'] = wscols
      
      const date = new Date().toISOString().split('T')[0]
      XLSX.writeFile(wb, `proveedores_${date}.xlsx`)
      
      alert('✅ Proveedores exportados exitosamente')
    } catch (error) {
      console.error('Error exportando:', error)
      alert('❌ Error al exportar datos')
    }
  }

  // Efecto para sincronizar filtros
  useEffect(() => {
    if (filtroRubro && filtroRubro !== 'Todos los rubros') {
      handleRubroFilter(filtroRubro)
    }
    if (filtroEstado && filtroEstado !== 'Todos los estados') {
      handleEstadoFilter(filtroEstado)
    }
    if (filtroLocalidad && filtroLocalidad !== 'Todas las localidades') {
      handleLocalidadFilter(filtroLocalidad)
    }
  }, [filtroRubro, filtroEstado, filtroLocalidad])

  // Handler para abrir modal de documentos (necesario para carga de personal)
  const handleOpenDocumentosModal = async (proveedor) => {
    openDocumentosModal(proveedor);
    // Cargar personal si es modal de documentos
    try {
      const response = await proveedoresService.getPersonalProveedor(proveedor.id);
      if (response.success) {
        setPersonalProveedor(response.data || []);
      }
    } catch (error) {
      console.error('Error cargando personal:', error);
    }
  }

  const handleSaveProveedor = async (datos) => {
    try {
      if (isCreateModalOpen) {
        await createProveedor(datos)
      } else if (isEditModalOpen && selectedProveedor) {
        await updateProveedor(selectedProveedor.id, datos)
      }
      // Cerrar el modal correspondiente
      if (isCreateModalOpen) {
        closeCreateModal()
      } else if (isEditModalOpen) {
        closeEditModal()
      } else if (isViewModalOpen) {
        closeViewModal()
      }
    } catch (error) {
      console.error('Error guardando proveedor:', error)
    }
  }

  const handleDeleteProveedor = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este proveedor?')) {
      await deleteProveedor(id)
    }
  }
  
  // Manejar datos de carga masiva
  const handleDataLoaded = async (data) => {
    try {
      // Normalizar los datos del Excel al formato del formulario
      const normalizedData = data.map(row => ({
        razon_social: row['Razón Social'] || row['Razon Social'] || row.razon_social || '',
        cuit: row.CUIT || row.cuit || String(row.CUIT).replace(/[- ]/g, ''),
        rubro: row.Rubro || row.rubro || '',
        contacto_nombre: row.Contacto || row.contacto_nombre || row['Nombre Contacto'] || '',
        telefono: row.Teléfono || row.telefono || row['Teléfono'] || '',
        email: row.Email || row.email || row['Correo'] || '',
        localidad: row.Localidad || row.localidad || '',
        provincia: row.Provincia || row.provincia || '',
        direccion: row.Dirección || row.direccion || row['Dirección'] || '',
        sector_servicio: row['Sector/Servicio'] || row.sector_servicio || row.Sector || '',
        servicio: row.Servicio || row.servicio || '',
        estado: row.Estado || row.estado || 'Activo'
      }))
      
      // Guardar cada registro
      for (const proveedorData of normalizedData) {
        await createProveedor(proveedorData)
      }
    } catch (error) {
      console.error('Error en carga masiva:', error)
      alert('Error al procesar algunos registros')
    }
  }

  // Filtrar localmente para la UI
  const proveedoresFiltrados = proveedores.filter(prov => {
    if (filtroRubro && filtroRubro !== 'Todos los rubros' && prov.rubro !== filtroRubro) return false
    if (filtroEstado && filtroEstado !== 'Todos los estados' && prov.estado !== filtroEstado) return false
    if (filtroLocalidad && filtroLocalidad !== 'Todas las localidades' && prov.localidad !== filtroLocalidad) return false
    return true
  })

  // Dynamic获取唯一选项
  const rubrosUnicos = filterOptions.rubros?.filter(r => r !== 'Todos los rubros') || []
  const localidadesUnicas = filterOptions.localidades?.filter(l => l !== 'Todas las localidades') || []

  // 计算统计信息
  const proveedoresActivos = proveedores.filter(p => p.estado === 'Activo').length
  const proveedoresConSeguroRT = proveedores.filter(p => p.seguro_RT).length
  const docsPorVencer = proveedores.filter(p => {
    if (!p.vencimiento_documentacion) return false
    const fechaVenc = new Date(p.vencimiento_documentacion)
    return fechaVenc < new Date(Date.now() + 30*24*60*60*1000)
  }).length
  const totalPersonalContratado = proveedores.reduce((sum, prov) => sum + (prov.personal_contratado || 0), 0)

  if (loading && proveedores.length === 0) {
    return (
      <div className="proveedores-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando proveedores desde el servidor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="proveedores-page">
        <div className="error-message">
          <strong>Error de conexión:</strong> {error}
          <button className="btn btn-primary" onClick={loadProveedores}>Reintentar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="proveedores-page">
      <div className="breadcrumb">
        <Link to="/">Dashboard</Link> 
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Proveedores</span>
      </div>

      <div className="summary-cards">
        <div className="summary-card-small">
          <div className="number">{proveedores.length}</div>
          <div className="label">Proveedores Activos</div>
        </div>
        <div className="summary-card-small">
          <div className="number">{proveedoresConSeguroRT}</div>
          <div className="label">Con Seguro RT</div>
        </div>
        <div className="summary-card-small">
          <div className="number">{docsPorVencer}</div>
          <div className="label">Docs. por Vencer</div>
        </div>
        <div className="summary-card-small">
          <div className="number">{totalPersonalContratado}</div>
          <div className="label">Personal Contratado</div>
        </div>
      </div>

      <section className="data-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-icon">🤝</span>
            Gestión de Proveedores Terciarizados
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
              <span className="btn-icon">+</span> Nuevo Proveedor
            </button>
          </div>
        </div>

        <div className="filter-bar">
          <input 
            type="text" 
            className="filter-select" 
            placeholder="Buscar proveedor..." 
            onChange={(e) => handleSearch(e.target.value)}
          />
          <select 
            className="filter-select"
            value={filtroRubro}
            onChange={(e) => setFiltroRubro(e.target.value)}
          >
            <option value="">Todos los rubros</option>
            {rubrosUnicos.map(rubro => (
              <option key={rubro} value={rubro}>{rubro}</option>
            ))}
          </select>
          <select 
            className="filter-select"
            value={filtroLocalidad}
            onChange={(e) => setFiltroLocalidad(e.target.value)}
          >
            <option value="">Todas las localidades</option>
            {localidadesUnicas.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <select 
            className="filter-select"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Suspendido">Suspendido</option>
            <option value="Inactivo">Inactivo</option>
          </select>
          {(filtroRubro || filtroEstado || filtroLocalidad) && (
            <button 
              className="secondary"
              onClick={() => {
                setFiltroRubro('')
                setFiltroEstado('')
                setFiltroLocalidad('')
                resetFilters()
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
              {columnasVisibles.razon_social && <th>Razón Social</th>}
              {columnasVisibles.cuit && <th>CUIT</th>}
              {columnasVisibles.rubro && <th>Rubro</th>}
              {columnasVisibles.sector_servicio && <th>Sector/Servicio</th>}
              {columnasVisibles.localidad && columnasVisibles.provincia && <th>Ubicación</th>}
              {columnasVisibles.seguro_RT && <th>Seguro RT</th>}
              {columnasVisibles.personal_contratado && <th>Personal</th>}
              {columnasVisibles.vencimiento_documentacion && <th>Venc. Doc.</th>}
              {columnasVisibles.estado && <th>Estado</th>}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresFiltrados.map((proveedor) => {
              return (
                <tr key={proveedor.id}>
                  {columnasVisibles.codigo && (
                    <td>
                      <strong>{proveedor.codigo}</strong>
                    </td>
                  )}
                  {columnasVisibles.razon_social && (
                    <td>
                      <div>
                        <strong>{proveedor.razon_social}</strong>
                        <div className="contacto-info">
                          {columnasVisibles.contacto_nombre && <small>👤 {proveedor.contacto_nombre}</small>}
                          {columnasVisibles.telefono && <small>📞 {proveedor.telefono}</small>}
                        </div>
                      </div>
                    </td>
                  )}
                  {columnasVisibles.cuit && <td>{proveedor.cuit}</td>}
                  {columnasVisibles.rubro && (
                    <td>
                      <span className="rubro-badge">{proveedor.rubro}</span>
                    </td>
                  )}
                  {columnasVisibles.sector_servicio && (
                    <td>
                      <div>
                        <div><strong>{proveedor.sector_servicio || proveedor.rubro}</strong></div>
                        {columnasVisibles.servicio && <small>{proveedor.servicio || ''}</small>}
                      </div>
                    </td>
                  )}
                  {columnasVisibles.localidad && columnasVisibles.provincia && (
                    <td>
                      <div>
                        <div>{proveedor.localidad}</div>
                        <small>{proveedor.provincia}</small>
                      </div>
                    </td>
                  )}
                  {columnasVisibles.seguro_RT && (
                    <td>
                      <span className={`seguro-badge ${proveedor.seguro_RT ? 'seguro-si' : 'seguro-no'}`}>
                        {proveedor.seguro_RT ? '✅ Sí' : '❌ No'}
                      </span>
                      {proveedor.habilitacion_personal && proveedor.habilitacion_personal.includes('hasta') && (
                        <small>👤 {proveedor.habilitacion_personal.split('hasta')[1]}</small>
                      )}
                    </td>
                  )}
                  {columnasVisibles.personal_contratado && (
                    <td>
                      <div className="personal-info">
                        <span className="personal-count">👥 {proveedor.personal_contratado || 0}</span>
                      </div>
                    </td>
                  )}
                  {columnasVisibles.vencimiento_documentacion && (
                    <td>
                      <span className={`vencimiento-badge ${
                        new Date(proveedor.vencimiento_documentacion) < new Date() ? 'vencido' :
                        new Date(proveedor.vencimiento_documentacion) < new Date(Date.now() + 30*24*60*60*1000) ? 'por-vencer' : 'vigente'
                      }`}>
                        {proveedor.vencimiento_documentacion ? new Date(proveedor.vencimiento_documentacion).toLocaleDateString('es-AR') : 'N/A'}
                      </span>
                    </td>
                  )}
                  {columnasVisibles.estado && (
                    <td>
                      <span className={`status-badge ${proveedor.estado === 'Activo' ? 'status-active' : 'status-inactivo'}`}>
                        {proveedor.estado}
                      </span>
                    </td>
                  )}
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="icon-btn" 
                        title="Ver detalles"
                        onClick={() => openViewModal(proveedor)}
                      >
                        👁️
                      </button>
                      <button 
                        className="icon-btn" 
                        title="Editar"
                        onClick={() => openEditModal(proveedor)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="icon-btn" 
                        title="Documentación y Personal"
                        onClick={() => handleOpenDocumentosModal(proveedor)}
                      >
                        📄
                      </button>
                      <button 
                        className="icon-btn" 
                        title="Eliminar"
                        onClick={() => {
                        if (window.confirm('¿Está seguro de eliminar este proveedor?')) {
                          deleteProveedor(proveedor.id)
                        }
                      }}
                        style={{ color: '#ef4444' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>

        {/* Paginación */}
        {pagination.total_pages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={pagination.current_page === 1 || loading}
              onClick={() => loadProveedores({ page: pagination.current_page - 1 })}
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
              onClick={() => loadProveedores({ page: pagination.current_page + 1 })}
            >
              Siguiente →
            </button>
          </div>
        )}
      </section>

      {/* Modal para Proveedores */}
      {(isCreateModalOpen || isEditModalOpen || isViewModalOpen) && (
        <GenericModal
          title={
            isCreateModalOpen ? '➕ Nuevo Proveedor' :
            isEditModalOpen ? `✏️ Editar Proveedor: ${selectedProveedor?.razon_social}` :
            `👁️ Ver Proveedor: ${selectedProveedor?.razon_social}`
          }
          onClose={isCreateModalOpen ? closeCreateModal : isEditModalOpen ? closeEditModal : closeViewModal}
          size="large"
        >
          <ProveedorForm
            mode={isCreateModalOpen ? 'crear' : isEditModalOpen ? 'editar' : 'ver'}
            proveedor={selectedProveedor}
            onClose={isCreateModalOpen ? closeCreateModal : isEditModalOpen ? closeEditModal : closeViewModal}
            onSave={handleSaveProveedor}
            readOnly={isViewModalOpen}
          />
        </GenericModal>
      )}

      {/* Modal para Documentación y Personal */}
      {isDocumentosModalOpen && selectedProveedor && (
        <GenericModal
          title={`📄 ${selectedProveedor.razon_social} - Documentación y Personal`}
          onClose={closeDocumentosModal}
          size="xlarge"
        >
          <div className="proveedor-documentacion-container">
            {/* Información del Proveedor */}
            <div className="proveedor-info">
              <h3>Información del Proveedor</h3>
              <div className="info-grid">
                <div><strong>Razón Social:</strong> {selectedProveedor.razon_social}</div>
                <div><strong>CUIT:</strong> {selectedProveedor.cuit}</div>
                <div><strong>Rubro:</strong> {selectedProveedor.rubro}</div>
                <div><strong>Sector/Servicio:</strong> {selectedProveedor.sector_servicio || selectedProveedor.rubro} - {selectedProveedor.servicio || ''}</div>
                <div><strong>Ubicación:</strong> {selectedProveedor.localidad}, {selectedProveedor.provincia}</div>
                <div><strong>Seguro RT:</strong> {selectedProveedor.seguro_RT ? '✅ Sí' : '❌ No'}</div>
              </div>
            </div>

            {/* Personal Contratado */}
            <div className="personal-proveedor-section">
              <h3>👥 Personal Contratado</h3>
              <button className="btn btn-sm btn-primary" style={{ marginBottom: '15px' }}>
                <span>+</span> Agregar Personal
              </button>
              
              {personalProveedor.length > 0 ? (
                <table className="data-table small">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>DNI</th>
                      <th>Cargo</th>
                      <th>Capacitaciones</th>
                      <th>Seguro Vida</th>
                      <th>Venc. Capacitación</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personalProveedor.map(persona => (
                      <tr key={persona.id}>
                        <td>{persona.nombre || persona.nombre_completo}</td>
                        <td>{persona.dni}</td>
                        <td>{persona.cargo || persona.puesto}</td>
                        <td>
                          <div className="capacitaciones-list">
                            {(persona.capacitaciones || []).map((cap, idx) => (
                              <span key={idx} className="capacitacion-badge">{cap}</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className={`seguro-badge ${persona.seguro_vida ? 'seguro-si' : 'seguro-no'}`}>
                            {persona.seguro_vida ? '✅ Sí' : '❌ No'}
                          </span>
                        </td>
                        <td>
                          {persona.vencimiento_capacitacion && (
                            <span className={`vencimiento-badge ${
                              new Date(persona.vencimiento_capacitacion) < new Date() ? 'vencido' : 'vigente'
                            }`}>
                              {new Date(persona.vencimiento_capacitacion).toLocaleDateString('es-AR')}
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="icon-btn" title="Editar">✏️</button>
                            <button className="icon-btn" title="Eliminar">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data-message">No hay personal registrado para este proveedor.</p>
              )}
            </div>

            {/* Documentación */}
            <div className="documentacion-section">
              <h3>📋 Documentación del Proveedor</h3>
              
              <div className="documentos-grid">
                <div className="documento-card">
                  <h4>Habilitaciones</h4>
                  <div className="documento-info">
                    <strong>Personal:</strong> {selectedProveedor.habilitacion_personal || 'No especificado'}
                  </div>
                  <div className="documento-info">
                    <strong>Vehículo:</strong> {selectedProveedor.habilitacion_vehiculo || 'No especificado'}
                  </div>
                  <button className="btn btn-sm btn-secondary">Subir Habilitación</button>
                </div>

                <div className="documento-card">
                  <h4>Seguros</h4>
                  <div className="documento-info">
                    <strong>Seguro RT:</strong> {selectedProveedor.seguro_RT ? '✅ Vigente' : '❌ No tiene'}
                  </div>
                  <div className="documento-info">
                    <strong>Seguro Vida Personal:</strong> {selectedProveedor.seguro_vida ? '✅ Sí' : '❌ No'}
                  </div>
                  <button className="btn btn-sm btn-secondary">Subir Póliza</button>
                </div>

                <div className="documento-card">
                  <h4>Certificados</h4>
                  <div className="documento-info">
                    <strong>Capacitación:</strong> Disponibles: {selectedProveedor.documentos || 0}
                  </div>
                  <div className="documento-info">
                    <strong>Vencimiento:</strong> 
                    <span className={`vencimiento-badge ${
                      selectedProveedor.vencimiento_documentacion && new Date(selectedProveedor.vencimiento_documentacion) < new Date() ? 'vencido' : 'vigente'
                    }`}>
                      {selectedProveedor.vencimiento_documentacion ? new Date(selectedProveedor.vencimiento_documentacion).toLocaleDateString('es-AR') : 'N/A'}
                    </span>
                  </div>
                  <button className="btn btn-sm btn-secondary">Subir Certificado</button>
                </div>
              </div>

              {/* Subida de documentos */}
              <div className="subir-documento">
                <h4>Subir nuevo documento</h4>
                <select className="filter-select">
                  <option value="">Tipo de documento</option>
                  <option value="habilitacion">Habilitación</option>
                  <option value="seguro">Seguro</option>
                  <option value="certificado">Certificado</option>
                  <option value="contrato">Contrato</option>
                  <option value="capacitacion">Capacitación</option>
                </select>
                <input type="date" className="filter-select" placeholder="Fecha vencimiento" />
                <input type="file" className="filter-select" accept=".pdf,.jpg,.jpeg,.png" multiple />
                <button className="btn btn-primary">Subir Documentos</button>
              </div>
            </div>
          </div>
        </GenericModal>
      )}
      
      {/* Modal ColumnSelector */}
      {mostrarColumnSelector && (
        <ColumnSelectorProveedores
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
        title="Carga Masiva de Proveedores"
        templateFields={proveedoresTemplateFields}
        requiredFields={proveedoresRequiredFields}
      />
    </div>
  )
}

export default Proveedores
