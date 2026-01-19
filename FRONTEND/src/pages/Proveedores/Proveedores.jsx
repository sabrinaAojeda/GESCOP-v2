import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import GenericModal from '../../components/Common/GenericModal'
import ProveedorForm from '../../components/DataTable/forms/ProveedorForm'
import './Proveedores.css'

const Proveedores = () => {
  const [filtroRubro, setFiltroRubro] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroLocalidad, setFiltroLocalidad] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState('crear')
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null)

  const proveedores = [
    {
      id: 'PROV-001',
      codigo: 'PROV-001',
      razon_social: 'Seguridad Total S.A.',
      cuit: '30-12345678-9',
      rubro: 'Servicios de Vigilancia',
      sector_servicio: 'Seguridad',
      servicio: 'Vigilancia de Plantas',
      direccion: 'Av. Siempre Viva 123',
      localidad: 'Capital Federal',
      provincia: 'Buenos Aires',
      telefono: '011-4789-1234',
      email: 'contacto@seguridadtotal.com',
      contacto_nombre: 'Carlos Rodríguez',
      contacto_cargo: 'Gerente Comercial',
      estado: 'Activo',
      seguro_RT: true,
      seguro_vida: true,
      habilitacion_personal: 'Vigente hasta 2024-12-31',
      habilitacion_vehiculo: 'Vigente hasta 2024-11-30',
      personal_contratado: 15,
      documentos: 8,
      vencimiento_documentacion: '2024-06-15'
    },
    {
      id: 'PROV-002',
      codigo: 'PROV-002',
      razon_social: 'Transportes Rápidos SRL',
      cuit: '30-98765432-1',
      rubro: 'Transporte',
      sector_servicio: 'Logística',
      servicio: 'Transporte Especializado',
      direccion: 'Ruta 8 Km 45',
      localidad: 'Pilar',
      provincia: 'Buenos Aires',
      telefono: '0230-456-789',
      email: 'info@transportesrapidos.com',
      contacto_nombre: 'Ana López',
      contacto_cargo: 'Directora de Operaciones',
      estado: 'Activo',
      seguro_RT: true,
      seguro_vida: true,
      habilitacion_personal: 'Vigente hasta 2024-10-31',
      habilitacion_vehiculo: 'Vigente hasta 2024-09-30',
      personal_contratado: 8,
      documentos: 12,
      vencimiento_documentacion: '2024-05-20'
    },
    {
      id: 'PROV-003',
      codigo: 'PROV-003',
      razon_social: 'Mantenimiento Industrial S.A.',
      cuit: '30-45678912-3',
      rubro: 'Mantenimiento',
      sector_servicio: 'Mantenimiento',
      servicio: 'Mantenimiento de Maquinaria',
      direccion: 'Calle Industrial 789',
      localidad: 'Rosario',
      provincia: 'Santa Fe',
      telefono: '0341-789-456',
      email: 'servicio@mantenimientoindustrial.com',
      contacto_nombre: 'Roberto Gómez',
      contacto_cargo: 'Ingeniero de Servicio',
      estado: 'Activo',
      seguro_RT: true,
      seguro_vida: false,
      habilitacion_personal: 'Vigente hasta 2025-01-31',
      habilitacion_vehiculo: 'No requiere',
      personal_contratado: 6,
      documentos: 5,
      vencimiento_documentacion: '2024-07-10'
    }
  ]

  const personalProveedores = [
    {
      id: 1,
      proveedor_id: 'PROV-001',
      nombre: 'Juan Pérez',
      dni: '30123456',
      cargo: 'Guardia de Seguridad',
      capacitaciones: ['Seguridad Industrial', 'Primeros Auxilios'],
      seguro_vida: true,
      vencimiento_capacitacion: '2024-08-15'
    },
    {
      id: 2,
      proveedor_id: 'PROV-001',
      nombre: 'María González',
      dni: '28987654',
      cargo: 'Supervisora de Seguridad',
      capacitaciones: ['Seguridad Avanzada', 'Manejo de Crisis'],
      seguro_vida: true,
      vencimiento_capacitacion: '2024-09-30'
    }
  ]

  const handleOpenModal = (tipo, proveedor = null) => {
    setModalType(tipo)
    setProveedorSeleccionado(proveedor)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setProveedorSeleccionado(null)
  }

  const handleSaveProveedor = (datos) => {
    console.log('Guardar proveedor:', datos)
    handleCloseModal()
  }

  const handleDeleteProveedor = (id) => {
    if (window.confirm('¿Está seguro de eliminar este proveedor?')) {
      console.log('Eliminar proveedor:', id)
    }
  }

  const proveedoresFiltrados = proveedores.filter(prov => {
    if (filtroRubro && prov.rubro !== filtroRubro) return false
    if (filtroEstado && prov.estado !== filtroEstado) return false
    if (filtroLocalidad && prov.localidad !== filtroLocalidad) return false
    return true
  })

  const rubrosUnicos = [...new Set(proveedores.map(p => p.rubro))]
  const localidadesUnicas = [...new Set(proveedores.map(p => p.localidad))]

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
          <div className="number">{proveedores.filter(p => p.seguro_RT).length}</div>
          <div className="label">Con Seguro RT</div>
        </div>
        <div className="summary-card-small">
          <div className="number">
            {proveedores.filter(p => 
              new Date(p.vencimiento_documentacion) < new Date(Date.now() + 30*24*60*60*1000)
            ).length}
          </div>
          <div className="label">Docs. por Vencer</div>
        </div>
        <div className="summary-card-small">
          <div className="number">
            {proveedores.reduce((sum, prov) => sum + prov.personal_contratado, 0)}
          </div>
          <div className="label">Personal Contratado</div>
        </div>
      </div>

      <section className="data-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-icon">🤝</span>
            Gestión de Proveedores Terciarizados
          </h2>
          <div className="table-toolbar">
            <button className="btn btn-secondary">
              <span className="btn-icon">👁️</span> Columnas
            </button>
            <button className="btn btn-secondary">
              <span className="btn-icon">📤</span> Exportar
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => handleOpenModal('crear')}
            >
              <span className="btn-icon">+</span> Nuevo Proveedor
            </button>
          </div>
        </div>

        <div className="filter-bar">
          <input type="text" className="filter-select" placeholder="Buscar proveedor..." />
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
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Razón Social</th>
              <th>CUIT</th>
              <th>Rubro</th>
              <th>Sector/Servicio</th>
              <th>Ubicación</th>
              <th>Seguro RT</th>
              <th>Personal</th>
              <th>Venc. Doc.</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresFiltrados.map((proveedor) => {
              const personalProv = personalProveedores.filter(p => p.proveedor_id === proveedor.id)
              
              return (
                <tr key={proveedor.id}>
                  <td>
                    <strong>{proveedor.codigo}</strong>
                  </td>
                  <td>
                    <div>
                      <strong>{proveedor.razon_social}</strong>
                      <div className="contacto-info">
                        <small>👤 {proveedor.contacto_nombre}</small>
                        <small>📞 {proveedor.telefono}</small>
                      </div>
                    </div>
                  </td>
                  <td>{proveedor.cuit}</td>
                  <td>
                    <span className="rubro-badge">{proveedor.rubro}</span>
                  </td>
                  <td>
                    <div>
                      <div><strong>{proveedor.sector_servicio}</strong></div>
                      <small>{proveedor.servicio}</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div>{proveedor.localidad}</div>
                      <small>{proveedor.provincia}</small>
                    </div>
                  </td>
                  <td>
                    <span className={`seguro-badge ${proveedor.seguro_RT ? 'seguro-si' : 'seguro-no'}`}>
                      {proveedor.seguro_RT ? '✅ Sí' : '❌ No'}
                    </span>
                    {proveedor.habilitacion_personal && (
                      <small>👤 {proveedor.habilitacion_personal.split('hasta')[1]}</small>
                    )}
                  </td>
                  <td>
                    <div className="personal-info">
                      <span className="personal-count">👥 {proveedor.personal_contratado}</span>
                      {personalProv.length > 0 && (
                        <small>{personalProv[0].nombre} +{personalProv.length-1} más</small>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`vencimiento-badge ${
                      new Date(proveedor.vencimiento_documentacion) < new Date() ? 'vencido' :
                      new Date(proveedor.vencimiento_documentacion) < new Date(Date.now() + 30*24*60*60*1000) ? 'por-vencer' : 'vigente'
                    }`}>
                      {new Date(proveedor.vencimiento_documentacion).toLocaleDateString('es-AR')}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${proveedor.estado === 'Activo' ? 'status-active' : 'status-inactivo'}`}>
                      {proveedor.estado}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="icon-btn" 
                        title="Ver detalles"
                        onClick={() => handleOpenModal('ver', proveedor)}
                      >
                        👁️
                      </button>
                      <button 
                        className="icon-btn" 
                        title="Editar"
                        onClick={() => handleOpenModal('editar', proveedor)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="icon-btn" 
                        title="Documentación y Personal"
                        onClick={() => handleOpenModal('documentos', proveedor)}
                      >
                        📄
                      </button>
                      <button 
                        className="icon-btn" 
                        title="Eliminar"
                        onClick={() => handleDeleteProveedor(proveedor.id)}
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
      </section>

      {/* Modal para Proveedores */}
      {modalOpen && (modalType === 'crear' || modalType === 'editar' || modalType === 'ver') && (
        <GenericModal
          title={
            modalType === 'crear' ? '➕ Nuevo Proveedor' :
            modalType === 'editar' ? `✏️ Editar Proveedor: ${proveedorSeleccionado?.razon_social}` :
            `👁️ Ver Proveedor: ${proveedorSeleccionado?.razon_social}`
          }
          onClose={handleCloseModal}
          size="large"
        >
          <ProveedorForm
            mode={modalType}
            proveedor={proveedorSeleccionado}
            onClose={handleCloseModal}
            onSave={handleSaveProveedor}
            readOnly={modalType === 'ver'}
          />
        </GenericModal>
      )}

      {/* Modal para Documentación y Personal */}
      {modalOpen && modalType === 'documentos' && proveedorSeleccionado && (
        <GenericModal
          title={`📄 ${proveedorSeleccionado.razon_social} - Documentación y Personal`}
          onClose={handleCloseModal}
          size="xlarge"
        >
          <div className="proveedor-documentacion-container">
            {/* Información del Proveedor */}
            <div className="proveedor-info">
              <h3>Información del Proveedor</h3>
              <div className="info-grid">
                <div><strong>Razón Social:</strong> {proveedorSeleccionado.razon_social}</div>
                <div><strong>CUIT:</strong> {proveedorSeleccionado.cuit}</div>
                <div><strong>Rubro:</strong> {proveedorSeleccionado.rubro}</div>
                <div><strong>Sector/Servicio:</strong> {proveedorSeleccionado.sector_servicio} - {proveedorSeleccionado.servicio}</div>
                <div><strong>Ubicación:</strong> {proveedorSeleccionado.localidad}, {proveedorSeleccionado.provincia}</div>
                <div><strong>Seguro RT:</strong> {proveedorSeleccionado.seguro_RT ? '✅ Sí' : '❌ No'}</div>
              </div>
            </div>

            {/* Personal Contratado */}
            <div className="personal-proveedor-section">
              <h3>👥 Personal Contratado</h3>
              <button className="btn btn-sm btn-primary" style={{ marginBottom: '15px' }}>
                <span>+</span> Agregar Personal
              </button>
              
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
                  {personalProveedores
                    .filter(p => p.proveedor_id === proveedorSeleccionado.id)
                    .map(persona => (
                      <tr key={persona.id}>
                        <td>{persona.nombre}</td>
                        <td>{persona.dni}</td>
                        <td>{persona.cargo}</td>
                        <td>
                          <div className="capacitaciones-list">
                            {persona.capacitaciones.map((cap, idx) => (
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
                    ))
                  }
                </tbody>
              </table>
            </div>

            {/* Documentación */}
            <div className="documentacion-section">
              <h3>📋 Documentación del Proveedor</h3>
              
              <div className="documentos-grid">
                <div className="documento-card">
                  <h4>Habilitaciones</h4>
                  <div className="documento-info">
                    <strong>Personal:</strong> {proveedorSeleccionado.habilitacion_personal || 'No especificado'}
                  </div>
                  <div className="documento-info">
                    <strong>Vehículo:</strong> {proveedorSeleccionado.habilitacion_vehiculo || 'No especificado'}
                  </div>
                  <button className="btn btn-sm btn-secondary">Subir Habilitación</button>
                </div>

                <div className="documento-card">
                  <h4>Seguros</h4>
                  <div className="documento-info">
                    <strong>Seguro RT:</strong> {proveedorSeleccionado.seguro_RT ? '✅ Vigente' : '❌ No tiene'}
                  </div>
                  <div className="documento-info">
                    <strong>Seguro Vida Personal:</strong> {proveedorSeleccionado.seguro_vida ? '✅ Sí' : '❌ No'}
                  </div>
                  <button className="btn btn-sm btn-secondary">Subir Póliza</button>
                </div>

                <div className="documento-card">
                  <h4>Certificados</h4>
                  <div className="documento-info">
                    <strong>Capacitación:</strong> Disponibles: {proveedorSeleccionado.documentos || 0}
                  </div>
                  <div className="documento-info">
                    <strong>Vencimiento:</strong> 
                    <span className={`vencimiento-badge ${
                      new Date(proveedorSeleccionado.vencimiento_documentacion) < new Date() ? 'vencido' : 'vigente'
                    }`}>
                      {new Date(proveedorSeleccionado.vencimiento_documentacion).toLocaleDateString('es-AR')}
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
    </div>
  )
}

export default Proveedores