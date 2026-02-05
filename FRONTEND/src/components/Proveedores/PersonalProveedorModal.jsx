// FRONTEND/src/components/Proveedores/PersonalProveedorModal.jsx
import React, { useState, useEffect } from 'react';
import GenericModal from '../Common/GenericModal';
import './PersonalProveedorModal.css';

const PersonalProveedorModal = ({ proveedor, onClose }) => {
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    cargo: '',
    fecha_nacimiento: '',
    fecha_ingreso: '',
    seguro_vida: false,
    poliza_vida: '',
    observaciones: ''
  });

  useEffect(() => {
    loadPersonal();
  }, [proveedor.id]);

  const loadPersonal = async () => {
    setLoading(true);
    try {
      // TODO: Conectar con backend
      const response = await fetch(`/api/proveedores/${proveedor.id}/personal`);
      const data = await response.json();
      setPersonal(data.data || []);
    } catch (err) {
      setError('Error al cargar el personal');
      // Datos de ejemplo para desarrollo
      setPersonal([
        {
          id: 1,
          nombre: 'Juan Pérez',
          dni: '30123456',
          cargo: 'Guardia de Seguridad',
          fecha_ingreso: '2023-01-15',
          seguro_vida: true
        },
        {
          id: 2,
          nombre: 'María González',
          dni: '28987654',
          cargo: 'Supervisora de Seguridad',
          fecha_ingreso: '2023-03-20',
          seguro_vida: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Conectar con backend
      const newPerson = {
        id: Date.now(),
        ...formData
      };
      setPersonal([...personal, newPerson]);
      setShowForm(false);
      setFormData({
        nombre: '',
        dni: '',
        cargo: '',
        fecha_nacimiento: '',
        fecha_ingreso: '',
        seguro_vida: false,
        poliza_vida: '',
        observaciones: ''
      });
    } catch (err) {
      setError('Error al guardar el personal');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePersonal = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este personal?')) {
      try {
        setPersonal(personal.filter(p => p.id !== id));
      } catch (err) {
        setError('Error al eliminar el personal');
      }
    }
  };

  return (
    <GenericModal
      title={`👥 Personal de ${proveedor.razon_social}`}
      onClose={onClose}
      size="xlarge"
      loading={loading}
    >
      <div className="personal-proveedor-modal">
        {error && (
          <div className="error-message alert-error">
            {error}
          </div>
        )}

        <div className="modal-header">
          <h3>Personal Contratado</h3>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            disabled={showForm}
          >
            <span className="btn-icon">+</span> Agregar Personal
          </button>
        </div>

        {showForm && (
          <div className="personal-form">
            <h4>Nuevo Personal</h4>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>DNI *</label>
                  <input
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cargo</label>
                  <input
                    type="text"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Fecha de Nacimiento</label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Fecha de Ingreso</label>
                  <input
                    type="date"
                    name="fecha_ingreso"
                    value={formData.fecha_ingreso}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="seguro_vida"
                      checked={formData.seguro_vida}
                      onChange={handleInputChange}
                    />
                    Seguro de Vida
                  </label>
                </div>
                {formData.seguro_vida && (
                  <div className="form-group">
                    <label>Póliza Seguro Vida</label>
                    <input
                      type="text"
                      name="poliza_vida"
                      value={formData.poliza_vida}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
                <div className="form-group full-width">
                  <label>Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="personal-list">
          {personal.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <h4>No hay personal registrado</h4>
              <p>Agrega el primer miembro del personal</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>DNI</th>
                  <th>Cargo</th>
                  <th>F. Ingreso</th>
                  <th>Seguro Vida</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {personal.map((persona) => (
                  <tr key={persona.id}>
                    <td>{persona.nombre}</td>
                    <td>{persona.dni}</td>
                    <td>{persona.cargo}</td>
                    <td>{persona.fecha_ingreso}</td>
                    <td>
                      {persona.seguro_vida ? (
                        <span className="status-badge status-active">Sí</span>
                      ) : (
                        <span className="status-badge status-inactivo">No</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="icon-btn" title="Ver capacitaciones">
                          📚
                        </button>
                        <button className="icon-btn" title="Editar">
                          ✏️
                        </button>
                        <button 
                          className="icon-btn" 
                          title="Eliminar"
                          onClick={() => handleDeletePersonal(persona.id)}
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
          )}
        </div>
      </div>
    </GenericModal>
  );
};

export default PersonalProveedorModal;