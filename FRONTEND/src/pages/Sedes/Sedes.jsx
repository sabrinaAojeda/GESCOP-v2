import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import GenericModal from '../../components/Common/GenericModal'
import SedesForm from '../../components/DataTable/forms/SedesForm'
import './Sedes.css'

const Sedes = () => {
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroProvincia, setFiltroProvincia] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState('crear')
  const [sedeSeleccionada, setSedeSeleccionada] = useState(null)

  const sedes = [
    {
      id: 'SED-001',
      codigo: 'SED-001',
      nombre: 'Sede Central - COPESA',
      tipo: 'Matriz',
      direccion: 'Av. Principal 1234',
      localidad: 'Capital Federal',
      provincia: 'Buenos Aires',
      telefono: '011-4567-8901',
      email: 'central@copesa-ar.com',
      responsable: 'Carlos Rodríguez',
      base_operativa: 'COPESA Central',
      habilitaciones: ['Ambiental', 'Sanitaria', 'Operativa'],
      vencimiento_habilitacion: '2024-12-31',
      estado: 'Activa',
      documentos: 5,
      vehiculos: 8
    },
    {
      id: 'SED-002',
      codigo: 'SED-002',
      nombre: 'Planta Caucho - Caleta Olivia',
      tipo: 'Planta Industrial',
      direccion: 'Ruta Nacional 3, Km 125',
      localidad: 'Caleta Olivia',
      provincia: 'Santa Cruz',
      telefono: '0297-456-789',
      email: 'planta.caucho@copesa-ar.com',
      responsable: 'María González',
      base_operativa: 'Planta Caucho',
      habilitaciones: ['Ambiental', 'Seguridad Química'],
      vencimiento_habilitacion: '2024-11-15',
      estado: 'Activa',
      documentos: 8,
      vehiculos: 15
    },
    {
      id: 'SED-003',
      codigo: 'SED-003',
      nombre: 'Base Incineración',
      tipo: 'Base Operativa',
      direccion: 'Zona Industrial Norte',
      localidad: 'Pilar',
      provincia: 'Buenos Aires',
      telefono: '0230-123-456',
      email: 'incineracion@copesa-ar.com',
      responsable: 'Juan Pérez',
      base_operativa: 'Incineración',
      habilitaciones: ['Térmica', 'Ambiental Especial'],
      vencimiento_habilitacion: '2024-10-20',
      estado: 'Activa',
      documentos: 12,
      vehiculos: 6
    }
  ]

  const handleOpenModal = (tipo, sede = null) => {
    setModalType(tipo)
    setSedeSeleccionada(sede)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSedeSeleccionada(null)
  }

  const handleSaveSede = (datos) => {
    console.log('Guardar sede:', datos)
    // Implementar lógica de guardado
    handleCloseModal()
  }

  const handleDeleteSede = (id) => {
    if (window.confirm('¿Está seguro de eliminar esta sede?')) {
      console.log('Eliminar sede:', id)
    }
  }

  const sedesFiltradas = sedes.filter(sede => {
    if (filtroEstado && sede.estado !== filtroEstado) return false
    if (filtroProvincia && sede.provincia !== filtroProvincia) return false
    return true
  })

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
          <div className="number">{sedes.reduce((sum, sede) => sum + sede.vehiculos, 0)}</div>
          <div className="label">Vehículos Asignados</div>
        </div>
        <div className="summary-card-small">
          <div className="number">
            {sedes.filter(s => 
              new Date(s.vencimiento_habilitacion) < new Date(Date.now() + 60*24*60*60*1000)
            ).length}
          </div>
          <div className="label">Habilit. por Vencer</div>
        </div>
        <div className="summary-card-small">
          <div className="number">{sedes.reduce((sum, sede) => sum + sede.documentos, 0)}</div>
          <div className="label">Documentos</div>
        </div>
      </div>

      <section className="data-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-icon">🏢</span>
            Gestión de Sedes y Empresas COPESA
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
              <span className="btn-icon">+</span> Nueva Sede/Empresa
            </button>
          </div>
        </div>

        <div className="filter-bar">
          <input 
            type="text" 
            className="filter-select" 
            placeholder="Buscar sede..." 
          />
          <select 
            className="filter-select"
            value={filtroProvincia}
            onChange={(e) => setFiltroProvincia(e.target.value)}
          >
            <option value="">Todas las provincias</option>
            <option value="Buenos Aires">Buenos Aires</option>
            <option value="Santa Cruz">Santa Cruz</option>
            <option value="Córdoba">Córdoba</option>
            <option value="Santa Fe">Santa Fe</option>
            <option value="Mendoza">Mendoza</option>
          </select>
          <select 
            className="filter-select"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="Activa">Activa</option>
            <option value="Inactiva">Inactiva</option>
            <option value="En Trámite">En Trámite</option>
          </select>
          <select className="filter-select">
            <option value="">Todas las bases</option>
            <option value="COPESA Central">COPESA Central</option>
            <option value="Planta Caucho">Planta Caucho</option>
            <option value="Incineración">Incineración</option>
            <option value="Tratamiento">Tratamiento</option>
          </select>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre Sede/Empresa</th>
              <th>Tipo</th>
              <th>Ubicación</th>
              <th>Base Operativa</th>
              <th>Habilitaciones</th>
              <th>Vencimiento</th>
              <th>Documentos</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sedesFiltradas.map((sede) => (
              <tr key={sede.id}>
                <td>
                  <strong>{sede.codigo}</strong>
                </td>
                <td>
                  <div>
                    <strong>{sede.nombre}</strong>
                    <div className="contacto-info">
                      <small>📞 {sede.telefono}</small>
                      <small>✉️ {sede.email}</small>
                    </div>
                  </div>
                </td>
                <td>{sede.tipo}</td>
                <td>
                  <div>
                    <div>{sede.direccion}</div>
                    <div>{sede.localidad}, {sede.provincia}</div>
                    <small>👤 {sede.responsable}</small>
                  </div>
                </td>
                <td>{sede.base_operativa}</td>
                <td>
                  <div className="habilitaciones-list">
                    {sede.habilitaciones.map((hab, idx) => (
                      <span key={idx} className="habilitacion-badge">
                        {hab}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <span className={`vencimiento-badge ${
                    new Date(sede.vencimiento_habilitacion) < new Date() ? 'vencido' :
                    new Date(sede.vencimiento_habilitacion) < new Date(Date.now() + 60*24*60*60*1000) ? 'por-vencer' : 'vigente'
                  }`}>
                    {new Date(sede.vencimiento_habilitacion).toLocaleDateString('es-AR')}
                  </span>
                </td>
                <td>
                  <span className="documentos-count">
                    📄 {sede.documentos}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${sede.estado === 'Activa' ? 'status-active' : 'status-inactivo'}`}>
                    {sede.estado}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="icon-btn" 
                      title="Ver detalles"
                      onClick={() => handleOpenModal('ver', sede)}
                    >
                      👁️
                    </button>
                    <button 
                      className="icon-btn" 
                      title="Editar"
                      onClick={() => handleOpenModal('editar', sede)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="icon-btn" 
                      title="Documentación"
                      onClick={() => handleOpenModal('documentos', sede)}
                    >
                      📄
                    </button>
                    <button 
                      className="icon-btn" 
                      title="Eliminar"
                      onClick={() => handleDeleteSede(sede.id)}
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
      </section>

      {/* Modal para Sedes */}
      {modalOpen && (modalType === 'crear' || modalType === 'editar' || modalType === 'ver') && (
        <GenericModal
          title={
            modalType === 'crear' ? '➕ Nueva Sede/Empresa' :
            modalType === 'editar' ? `✏️ Editar Sede: ${sedeSeleccionada?.nombre}` :
            `👁️ Ver Sede: ${sedeSeleccionada?.nombre}`
          }
          onClose={handleCloseModal}
          size="large"
        >
          <SedesForm
            mode={modalType}
            sede={sedeSeleccionada}
            onClose={handleCloseModal}
            onSave={handleSaveSede}
            readOnly={modalType === 'ver'}
          />
        </GenericModal>
      )}

      {/* Modal para Documentación */}
      {modalOpen && modalType === 'documentos' && sedeSeleccionada && (
        <GenericModal
          title={`📄 Documentación: ${sedeSeleccionada.nombre}`}
          onClose={handleCloseModal}
          size="large"
        >
          <div className="documentos-container">
            <h3>Documentación de Seguridad e Higiene</h3>
            <div className="documentos-section">
              <h4>📋 Habilitaciones y Certificaciones</h4>
              <div className="documentos-list">
                <div className="documento-item">
                  <div className="documento-info">
                    <strong>Habilitación Ambiental</strong>
                    <small>N° 12345-AB</small>
                    <span className="vencimiento por-vencer">
                      Vence: 31/12/2024
                    </span>
                  </div>
                  <div className="documento-actions">
                    <button className="icon-btn" title="Descargar">📤</button>
                    <button className="icon-btn" title="Renovar">🔄</button>
                  </div>
                </div>
                <div className="documento-item">
                  <div className="documento-info">
                    <strong>Certificado de Seguridad Química</strong>
                    <small>N° CHEM-789</small>
                    <span className="vencimiento vigente">
                      Vence: 15/11/2024
                    </span>
                  </div>
                  <div className="documento-actions">
                    <button className="icon-btn" title="Descargar">📤</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="subir-documento">
              <h4>Subir nuevo documento</h4>
              <select className="filter-select">
                <option value="">Tipo de documento</option>
                <option value="habilitacion_ambiental">Habilitación Ambiental</option>
                <option value="certificado_seguridad">Certificado de Seguridad</option>
                <option value="habilitacion_sanitaria">Habilitación Sanitaria</option>
                <option value="certificado_incendio">Certificado de Incendio</option>
                <option value="permiso_municipal">Permiso Municipal</option>
              </select>
              <input type="text" className="filter-select" placeholder="Número de documento" />
              <input type="date" className="filter-select" placeholder="Fecha vencimiento" />
              <input type="file" className="filter-select" accept=".pdf,.jpg,.jpeg,.png" />
              <button className="btn btn-primary">Subir Documento</button>
            </div>
          </div>
        </GenericModal>
      )}
    </div>
  )
}

export default Sedes