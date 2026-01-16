// src/components/Common/ModalVehiculo.jsx - VERSIÓN COMPLETA
import React, { useState, useEffect } from "react";
import useResponsive from "../../hooks/useResponsive";
import {
  calcularEstadoVencimiento,
  formatDateForInput,
  getHabilitacionOptions,
  getSeguroOptions,
  validarTarjetaYPF
} from "../../utils/vehicleCalculations";
import "./ModalVehiculo.css";

const ModalVehiculo = ({ mode = "crear", vehiculo, onClose, onSave }) => {
  const responsive = useResponsive();
  const [formData, setFormData] = useState({
    interno: "",
    año: "",
    dominio: "",
    modelo: "",
    eq_incorporado: "",
    sector: "",
    sectorNuevo: "", // Para sector parametrizable
    chofer: "",
    estado: "Activo",
    observaciones: "",
    vtv_vencimiento: "",
    vtv_estado: "Vigente",
    hab_vencimiento: "",
    hab_tipo: "", // Nuevo campo: tipo de habilitación
    hab_estado: "Vigente",
    seguro_tipo: "", // Nuevo campo: tipo de seguro
    seguro_vencimiento: "",
    seguro_estado: "Vigente",
    tarjeta_ypf: "", // Nuevo campo según reunión
    tipo: "Rodado"
  });

  const [mostrarNuevoSector, setMostrarNuevoSector] = useState(false);
  const [sectores, setSectores] = useState([
    "Logística",
    "Producción", 
    "Administración",
    "Mantenimiento",
    "Ventas",
    "Operaciones"
  ]);

  // Cargar datos si estamos en modo edición
  useEffect(() => {
    if (mode === "editar" && vehiculo) {
      const datos = {
        interno: vehiculo.interno || "",
        año: vehiculo.año || "",
        dominio: vehiculo.dominio || "",
        modelo: vehiculo.modelo || "",
        eq_incorporado: vehiculo.eq_incorporado || "",
        sector: vehiculo.sector || "",
        chofer: vehiculo.chofer || "",
        estado: vehiculo.estado || "Activo",
        observaciones: vehiculo.observaciones || "",
        vtv_vencimiento: vehiculo.vtv_vencimiento || "",
        vtv_estado: vehiculo.vtv_estado || "Vigente",
        hab_vencimiento: vehiculo.hab_vencimiento || "",
        hab_tipo: vehiculo.hab_tipo || "",
        hab_estado: vehiculo.hab_estado || "Vigente",
        seguro_tipo: vehiculo.seguro_tipo || "",
        seguro_vencimiento: vehiculo.seguro_vencimiento || "",
        seguro_estado: vehiculo.seguro_estado || "Vigente",
        tarjeta_ypf: vehiculo.tarjeta_ypf || "",
        tipo: vehiculo.tipo || "Rodado"
      };
      
      // Calcular estados automáticos si hay fechas
      if (datos.vtv_vencimiento && !datos.vtv_estado) {
        datos.vtv_estado = calcularEstadoVencimiento(datos.vtv_vencimiento, 30);
      }
      if (datos.hab_vencimiento && !datos.hab_estado) {
        datos.hab_estado = calcularEstadoVencimiento(datos.hab_vencimiento, 30);
      }
      if (datos.seguro_vencimiento && !datos.seguro_estado) {
        datos.seguro_estado = calcularEstadoVencimiento(datos.seguro_vencimiento, 45);
      }
      
      setFormData(datos);
    }
  }, [mode, vehiculo]);

  // Calcular estado automático cuando cambia fecha de VTV
  useEffect(() => {
    if (formData.vtv_vencimiento) {
      const estado = calcularEstadoVencimiento(formData.vtv_vencimiento, 30);
      if (estado !== formData.vtv_estado) {
        setFormData(prev => ({ ...prev, vtv_estado: estado }));
      }
    }
  }, [formData.vtv_vencimiento]);

  // Calcular estado automático cuando cambia fecha de Habilitación
  useEffect(() => {
    if (formData.hab_vencimiento) {
      const estado = calcularEstadoVencimiento(formData.hab_vencimiento, 30);
      if (estado !== formData.hab_estado) {
        setFormData(prev => ({ ...prev, hab_estado: estado }));
      }
    }
  }, [formData.hab_vencimiento]);

  // Calcular estado automático cuando cambia fecha de Seguro
  useEffect(() => {
    if (formData.seguro_vencimiento) {
      const estado = calcularEstadoVencimiento(formData.seguro_vencimiento, 45);
      if (estado !== formData.seguro_estado) {
        setFormData(prev => ({ ...prev, seguro_estado: estado }));
      }
    }
  }, [formData.seguro_vencimiento]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.interno || !formData.dominio || !formData.modelo || !formData.estado) {
      alert("Por favor complete los campos obligatorios: Interno, Dominio, Modelo y Estado");
      return;
    }
    
    // Validar tarjeta YPF si se ingresó
    if (formData.tarjeta_ypf && !validarTarjetaYPF(formData.tarjeta_ypf)) {
      alert("El número de tarjeta YPF no es válido. Debe contener solo números (8-16 dígitos).");
      return;
    }
    
    // Preparar datos finales
    const datosFinales = {
      ...formData,
      // Eliminar campo temporal de sector nuevo
      sectorNuevo: undefined
    };
    
    onSave(datosFinales);
  };

  const agregarSector = () => {
    if (formData.sectorNuevo && !sectores.includes(formData.sectorNuevo)) {
      const nuevosSectores = [...sectores, formData.sectorNuevo];
      setSectores(nuevosSectores);
      setFormData(prev => ({ 
        ...prev, 
        sector: formData.sectorNuevo,
        sectorNuevo: "" 
      }));
      setMostrarNuevoSector(false);
    }
  };

  const opcionesHabilitacion = getHabilitacionOptions();
  const opcionesSeguro = getSeguroOptions();

  return (
    <div className={`modal-vehiculo-overlay ${responsive.isFullWidthModal ? 'mobile' : ''}`}>
      <div className={`modal-vehiculo-content ${responsive.isFullWidthModal ? 'mobile-full' : ''}`}>
        <div className="modal-vehiculo-header">
          <h2 className="modal-vehiculo-title">
            {mode === "crear" ? "➕ Nuevo Vehículo" : "✏️ Editar Vehículo"}
            {formData.dominio && ` - ${formData.dominio}`}
          </h2>
          <button 
            className="modal-vehiculo-close" 
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        <form className="modal-vehiculo-form" onSubmit={handleSubmit}>
          {/* Sección 1: Información Básica */}
          <div className="form-section">
            <h3 className="form-section-title">
              <span className="section-icon">📋</span>
              Información Básica del Vehículo
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="interno">
                  Interno *
                </label>
                <input
                  type="text"
                  id="interno"
                  className="form-input"
                  name="interno"
                  value={formData.interno}
                  onChange={handleChange}
                  required
                  disabled={mode === "editar"}
                  placeholder="Ej: 001, MQ-001"
                />
                <p className="form-help">Identificador único del vehículo en el sistema</p>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="año">
                  Año *
                </label>
                <input
                  type="number"
                  id="año"
                  className="form-input"
                  name="año"
                  value={formData.año}
                  onChange={handleChange}
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  required
                  placeholder="Ej: 2023"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="dominio">
                  Dominio (Patente) *
                </label>
                <input
                  type="text"
                  id="dominio"
                  className="form-input"
                  name="dominio"
                  value={formData.dominio}
                  onChange={handleChange}
                  required
                  placeholder="Ej: AB-123-CD"
                  style={{ textTransform: "uppercase" }}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="modelo">
                  Marca y Modelo *
                </label>
                <input
                  type="text"
                  id="modelo"
                  className="form-input"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Toyota Hilux 2.8 SRV"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="tipo">
                  Tipo de Vehículo *
                </label>
                <select
                  id="tipo"
                  className="form-input"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                >
                  <option value="Rodado">Rodado</option>
                  <option value="Maquinaria">Maquinaria</option>
                  <option value="Semirremolque">Semirremolque</option>
                  <option value="Acoplado">Acoplado</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="eq_incorporado">
                  Equipamiento Incorporado
                </label>
                <input
                  type="text"
                  id="eq_incorporado"
                  className="form-input"
                  name="eq_incorporado"
                  value={formData.eq_incorporado}
                  onChange={handleChange}
                  placeholder="GPS, Radio, Cámara, etc."
                />
                <p className="form-help">Separar con comas</p>
              </div>
            </div>
          </div>

          {/* Sección 2: Operación y Sector (PARAMETRIZABLE) */}
          <div className="form-section">
            <h3 className="form-section-title">
              <span className="section-icon">🏢</span>
              Operación y Asignación
            </h3>
            
            <div className="form-subsection">
              <h4 className="form-subsection-title">
                <span>📍</span> Sector Parametrizable
              </h4>
              
              <div className="sector-select-container">
                <div className="form-group">
                  <label className="form-label" htmlFor="sector">
                    Sector *
                  </label>
                  <select
                    id="sector"
                    className="form-input"
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar sector...</option>
                    {sectores.map((sector, index) => (
                      <option key={index} value={sector}>
                        {sector}
                      </option>
                    ))}
                    <option value="nuevo">➕ Agregar nuevo sector...</option>
                  </select>
                </div>
                
                {formData.sector === "nuevo" && (
                  <div className="nuevo-sector-input">
                    <input
                      type="text"
                      className="form-input"
                      name="sectorNuevo"
                      value={formData.sectorNuevo}
                      onChange={handleChange}
                      placeholder="Nombre del nuevo sector"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="btn-agregar-sector"
                      onClick={agregarSector}
                      disabled={!formData.sectorNuevo}
                    >
                      Agregar
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="estado">
                  Estado Operativo *
                </label>
                <select
                  id="estado"
                  className="form-input"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  required
                >
                  <option value="Activo">Activo</option>
                  <option value="Mantenimiento">En Mantenimiento</option>
                  <option value="Reparación">En Reparación</option>
                  <option value="Stand By">Stand By</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="Vendido">Vendido</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="chofer">
                  Chofer Asignado
                </label>
                <input
                  type="text"
                  id="chofer"
                  className="form-input"
                  name="chofer"
                  value={formData.chofer}
                  onChange={handleChange}
                  placeholder="Nombre del conductor"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="observaciones">
                Observaciones
              </label>
              <textarea
                id="observaciones"
                className="form-input"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows="3"
                placeholder="Observaciones adicionales sobre el vehículo..."
              />
            </div>
          </div>

          {/* Sección 3: Documentación y Vencimientos */}
          <div className="form-section">
            <h3 className="form-section-title">
              <span className="section-icon">📅</span>
              Documentación y Vencimientos
            </h3>
            
            {/* Subsección VTV */}
            <div className="form-subsection">
              <h4 className="form-subsection-title">
                <span>🚗</span> VTV - Verificación Técnica Vehicular
              </h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="vtv_vencimiento">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    id="vtv_vencimiento"
                    className="form-input"
                    name="vtv_vencimiento"
                    value={formatDateForInput(formData.vtv_vencimiento)}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="vtv_estado">
                    Estado (Automático)
                  </label>
                  <select
                    id="vtv_estado"
                    className="form-input"
                    name="vtv_estado"
                    value={formData.vtv_estado}
                    onChange={handleChange}
                    disabled={!formData.vtv_vencimiento}
                  >
                    <option value="Vigente">Vigente</option>
                    <option value="Por vencer">Por vencer</option>
                    <option value="Vencido">Vencido</option>
                    <option value="No requiere">No requiere</option>
                  </select>
                  <p className="form-help">
                    {formData.vtv_vencimiento 
                      ? `Estado calculado automáticamente` 
                      : `Ingrese fecha para calcular estado`}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Subsección Habilitación */}
            <div className="form-subsection">
              <h4 className="form-subsection-title">
                <span>📄</span> Habilitación
              </h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="hab_tipo">
                    Tipo de Habilitación
                  </label>
                  <select
                    id="hab_tipo"
                    className="form-input"
                    name="hab_tipo"
                    value={formData.hab_tipo}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar tipo...</option>
                    {opcionesHabilitacion.map((opcion, index) => (
                      <option key={index} value={opcion}>
                        {opcion}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="hab_vencimiento">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    id="hab_vencimiento"
                    className="form-input"
                    name="hab_vencimiento"
                    value={formatDateForInput(formData.hab_vencimiento)}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="hab_estado">
                    Estado (Automático)
                  </label>
                  <select
                    id="hab_estado"
                    className="form-input"
                    name="hab_estado"
                    value={formData.hab_estado}
                    onChange={handleChange}
                    disabled={!formData.hab_vencimiento}
                  >
                    <option value="Vigente">Vigente</option>
                    <option value="Por vencer">Por vencer</option>
                    <option value="Vencido">Vencido</option>
                    <option value="No requiere">No requiere</option>
                  </select>
                  <p className="form-help">
                    {formData.hab_vencimiento 
                      ? `Estado calculado automáticamente` 
                      : `Ingrese fecha para calcular estado`}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Subsección Seguro */}
            <div className="form-subsection">
              <h4 className="form-subsection-title">
                <span>🛡️</span> Seguro
              </h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="seguro_tipo">
                    Tipo de Seguro
                  </label>
                  <select
                    id="seguro_tipo"
                    className="form-input"
                    name="seguro_tipo"
                    value={formData.seguro_tipo}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar tipo...</option>
                    {opcionesSeguro.map((opcion, index) => (
                      <option key={index} value={opcion}>
                        {opcion}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="seguro_vencimiento">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    id="seguro_vencimiento"
                    className="form-input"
                    name="seguro_vencimiento"
                    value={formatDateForInput(formData.seguro_vencimiento)}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="seguro_estado">
                    Estado (Automático)
                  </label>
                  <select
                    id="seguro_estado"
                    className="form-input"
                    name="seguro_estado"
                    value={formData.seguro_estado}
                    onChange={handleChange}
                    disabled={!formData.seguro_vencimiento}
                  >
                    <option value="Vigente">Vigente</option>
                    <option value="Por vencer">Por vencer</option>
                    <option value="Vencido">Vencido</option>
                    <option value="No requiere">No requiere</option>
                  </select>
                  <p className="form-help">
                    {formData.seguro_vencimiento 
                      ? `Estado calculado automáticamente` 
                      : `Ingrese fecha para calcular estado`}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Subsección Tarjeta YPF (NUEVO según reunión) */}
            <div className="form-subsection">
              <h4 className="form-subsection-title">
                <span>⛽</span> Tarjeta YPF
              </h4>
              
              <div className="form-group">
                <label className="form-label" htmlFor="tarjeta_ypf">
                  Número de Tarjeta YPF
                </label>
                <input
                  type="text"
                  id="tarjeta_ypf"
                  className="form-input"
                  name="tarjeta_ypf"
                  value={formData.tarjeta_ypf}
                  onChange={handleChange}
                  placeholder="Ej: 12345678"
                  inputMode="numeric"
                  pattern="[0-9\s-]*"
                />
                <p className="form-help">
                  Ingrese solo números (se aceptan espacios y guiones)
                </p>
              </div>
            </div>
          </div>

          {/* Acciones del Modal */}
          <div className="modal-vehiculo-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              <span>✕</span> Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              <span>💾</span> 
              {mode === "crear" ? "Guardar Vehículo" : "Actualizar Vehículo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalVehiculo;