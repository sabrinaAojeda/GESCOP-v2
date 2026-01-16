// src/utils/vehicleCalculations.js
/**
 * Calcula el estado automático basado en la fecha de vencimiento
 * @param {string} fechaVencimiento - Fecha de vencimiento (YYYY-MM-DD)
 * @param {number} diasAlerta - Días previos para alerta
 * @returns {string} Estado: 'Vigente', 'Por vencer', 'Vencido'
 */
export const calcularEstadoVencimiento = (fechaVencimiento, diasAlerta = 15) => {
  if (!fechaVencimiento) return 'No requiere';
  
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  const diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
  
  if (diasRestantes < 0) return 'Vencido';
  if (diasRestantes <= diasAlerta) return 'Por vencer';
  return 'Vigente';
};

/**
 * Calcula días restantes para vencimiento
 * @param {string} fechaVencimiento - Fecha de vencimiento
 * @returns {number} Días restantes (negativo si ya venció)
 */
export const calcularDiasRestantes = (fechaVencimiento) => {
  if (!fechaVencimiento) return null;
  
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  return Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
};

/**
 * Formatea fecha para input type="date"
 * @param {string} fechaString - Fecha en cualquier formato
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const formatDateForInput = (fechaString) => {
  if (!fechaString) return '';
  try {
    const date = new Date(fechaString);
    if (isNaN(date.getTime())) return fechaString;
    return date.toISOString().split('T')[0];
  } catch (e) {
    console.error('Error formateando fecha:', e);
    return fechaString;
  }
};

/**
 * Obtiene opciones de habilitación según reunión del cliente
 * @returns {Array} Lista de tipos de habilitación
 */
export const getHabilitacionOptions = () => {
  return [
    'Cargas Generales CH',
    'Cargas Generales SC',
    'Transporte Público',
    'Transporte Escolar',
    'Transporte de Pasajeros',
    'Transporte de Valores',
    'Transporte Especial',
    'Transporte Internacional',
    'Transporte de Mercancías Peligrosas',
    'Otros'
  ];
};

/**
 * Obtiene opciones de tipo de seguro
 * @returns {Array} Lista de tipos de seguro
 */
export const getSeguroOptions = () => {
  return [
    'Todo Riesgo',
    'Terceros Completos',
    'Responsabilidad Civil',
    'Carga',
    'Robo/Hurto',
    'Incendio',
    'Granizo',
    'Cristales',
    'Accidentes Personales',
    'Asistencia en Viaje',
    'Otros'
  ];
};

/**
 * Valida número de tarjeta YPF
 * @param {string} tarjetaYPF - Número de tarjeta
 * @returns {boolean} True si es válido
 */
export const validarTarjetaYPF = (tarjetaYPF) => {
  if (!tarjetaYPF) return true; // No requerido
  // Eliminar espacios y guiones
  const numeroLimpio = tarjetaYPF.replace(/[\s-]/g, '');
  // Validar formato: solo números y longitud típica
  return /^\d{8,16}$/.test(numeroLimpio);
};

/**
 * Genera alerta si hay vencimientos próximos
 * @param {Object} vehiculo - Datos del vehículo
 * @returns {Array} Alertas generadas
 */
export const generarAlertasVehiculo = (vehiculo) => {
  const alertas = [];
  const hoy = new Date();
  
  // Verificar VTV
  if (vehiculo.vtv_vencimiento) {
    const diasRestantesVTV = calcularDiasRestantes(vehiculo.vtv_vencimiento);
    if (diasRestantesVTV !== null && diasRestantesVTV <= 30) {
      alertas.push({
        tipo: 'VTV',
        descripcion: `VTV vence en ${diasRestantesVTV} días`,
        elemento: vehiculo.dominio,
        prioridad: diasRestantesVTV <= 7 ? 'critico' : diasRestantesVTV <= 15 ? 'alto' : 'medio'
      });
    }
  }
  
  // Verificar Seguro
  if (vehiculo.seguro_vencimiento) {
    const diasRestantesSeguro = calcularDiasRestantes(vehiculo.seguro_vencimiento);
    if (diasRestantesSeguro !== null && diasRestantesSeguro <= 45) {
      alertas.push({
        tipo: 'Seguro',
        descripcion: `Seguro vence en ${diasRestantesSeguro} días`,
        elemento: vehiculo.dominio,
        prioridad: diasRestantesSeguro <= 7 ? 'critico' : diasRestantesSeguro <= 15 ? 'alto' : 'medio'
      });
    }
  }
  
  return alertas;
};