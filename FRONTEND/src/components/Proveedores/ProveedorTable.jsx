// FRONTEND/src/components/Proveedores/ProveedorTable.jsx
import React from 'react';
import './ProveedorTable.css';

const ProveedorTable = ({ 
  proveedores, 
  loading, 
  onEdit, 
  onDelete, 
  onView,
  columnasVisibles 
}) => {
  const getEstadoBadge = (estado) => {
    switch(estado) {
      case 'Activo':
        return <span className="status-badge status-active">Activo</span>;
      case 'Suspendido':
        return <span className="status-badge status-warning">Suspendido</span>;
      case 'Inactivo':
        return <span className="status-badge status-inactivo">Inactivo</span>;
      default:
        return <span className="status-badge">{estado}</span>;
    }
  };

  const formatCUIT = (cuit) => {
    if (!cuit) return '';
    // Asegurar formato XX-XXXXXXXX-X
    if (cuit.length === 11 && !cuit.includes('-')) {
      return `${cuit.substring(0, 2)}-${cuit.substring(2, 10)}-${cuit.substring(10)}`;
    }
    return cuit;
  };

  if (loading && proveedores.length === 0) {
    return (
      <div className="loading-table">
        <div className="loading-spinner"></div>
        <p>Cargando proveedores...</p>
      </div>
    );
  }

  if (!loading && proveedores.length === 0) {
    return (
      <div className="empty-table">
        <div className="empty-icon">📭</div>
        <h3>No hay proveedores registrados</h3>
        <p>Comienza agregando un nuevo proveedor usando el botón "Nuevo Proveedor"</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="proveedor-table">
        <thead>
          <tr>
            {columnasVisibles.codigo && <th>Código</th>}
            {columnasVisibles.razon_social && <th>Razón Social</th>}
            {columnasVisibles.cuit && <th>CUIT</th>}
            {columnasVisibles.rubro && <th>Rubro</th>}
            {columnasVisibles.contacto && <th>Contacto</th>}
            {columnasVisibles.telefono && <th>Teléfono</th>}
            {columnasVisibles.email && <th>Email</th>}
            {columnasVisibles.localidad && <th>Localidad</th>}
            {columnasVisibles.estado && <th>Estado</th>}
            {columnasVisibles.seguro_RT && <th>Seguro RT</th>}
            <th className="actions-column">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map((proveedor) => (
            <tr key={proveedor.id} className="table-row">
              {columnasVisibles.codigo && (
                <td className="codigo-cell">
                  <span className="codigo-badge">{proveedor.codigo}</span>
                </td>
              )}
              {columnasVisibles.razon_social && (
                <td className="razon-social-cell">
                  <strong>{proveedor.razon_social}</strong>
                  {proveedor.campos_personalizados && proveedor.campos_personalizados.length > 0 && (
                    <span className="custom-fields-badge" title="Campos personalizados">+{proveedor.campos_personalizados.length}</span>
                  )}
                </td>
              )}
              {columnasVisibles.cuit && (
                <td className="cuit-cell">
                  <code>{formatCUIT(proveedor.cuit)}</code>
                </td>
              )}
              {columnasVisibles.rubro && (
                <td className="rubro-cell">
                  <span className="rubro-tag">{proveedor.rubro}</span>
                </td>
              )}
              {columnasVisibles.contacto && (
                <td className="contacto-cell">
                  <div className="contacto-info">
                    <div className="contacto-nombre">{proveedor.contacto_nombre}</div>
                    {proveedor.contacto_cargo && (
                      <div className="contacto-cargo">{proveedor.contacto_cargo}</div>
                    )}
                  </div>
                </td>
              )}
              {columnasVisibles.telefono && (
                <td className="telefono-cell">
                  {proveedor.telefono ? (
                    <a href={`tel:${proveedor.telefono}`} className="telefono-link">
                      📞 {proveedor.telefono}
                    </a>
                  ) : '-'}
                </td>
              )}
              {columnasVisibles.email && (
                <td className="email-cell">
                  {proveedor.email ? (
                    <a href={`mailto:${proveedor.email}`} className="email-link">
                      ✉️ {proveedor.email}
                    </a>
                  ) : '-'}
                </td>
              )}
              {columnasVisibles.localidad && (
                <td className="localidad-cell">
                  <div className="localidad-info">
                    <div>{proveedor.localidad || '-'}</div>
                    {proveedor.provincia && (
                      <div className="provincia">{proveedor.provincia}</div>
                    )}
                  </div>
                </td>
              )}
              {columnasVisibles.estado && (
                <td className="estado-cell">
                  {getEstadoBadge(proveedor.estado)}
                </td>
              )}
              {columnasVisibles.seguro_RT && (
                <td className="seguro-cell">
                  {proveedor.seguro_RT ? (
                    <span className="seguro-badge seguro-si">✓ Sí</span>
                  ) : (
                    <span className="seguro-badge seguro-no">✗ No</span>
                  )}
                </td>
              )}
              <td className="actions-cell">
                <div className="action-buttons">
                  <button 
                    className="icon-btn btn-view" 
                    title="Ver detalles"
                    onClick={() => onView(proveedor)}
                  >
                    👁️
                  </button>
                  <button 
                    className="icon-btn btn-edit" 
                    title="Editar"
                    onClick={() => onEdit(proveedor)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="icon-btn btn-documents" 
                    title="Documentación"
                    onClick={() => {/* Abrir modal de documentos */}}
                  >
                    📄
                  </button>
                  <button 
                    className="icon-btn btn-delete" 
                    title="Eliminar"
                    onClick={() => onDelete(proveedor)}
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

export default ProveedorTable;