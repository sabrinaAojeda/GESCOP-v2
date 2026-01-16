// src/services/index.js - ACTUALIZADO
// Exporta todos los servicios de manera consistente

// Exportación de servicios individuales
export { vehiculoService } from './vehiculoService';
export { personalService } from './personalService';
export { proveedoresService } from './proveedoresService'; // ← AGREGAR ESTA LÍNEA

// Exportación de utilidades
export { default as api } from './api';

// Exportación de loggers (si se necesitan individualmente)
export { Logger as VehiculoLogger } from './vehiculoService';
export { PersonalLogger } from './personalService';
export { ProveedoresLogger } from './proveedoresService'; // ← OPCIONAL: Para logging