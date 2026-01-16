import React from 'react';
import AlertBadge from './AlertBadge';
import './AlertCard.css';

const AlertCard = ({ alerta, onResolver, onPosponer, onVer }) => {
  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calcularDiasRestantes = (fechaVencimiento) => {
    if (!fechaVencimiento) return null;
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const diasRestantes = calcularDiasRestantes(alerta.vencimiento);
  
  const getDiasText = () => {
    if (diasRestantes === null) return '';
    if (diasRestantes === 0) return 'Vence hoy';
    if (diasRestantes === 1) return 'Vence mañana';
    if (diasRestantes < 0) return `Vencido hace ${Math.abs(diasRestantes)} días`;
    return `Vence en ${diasRestantes} días`;
  };

  return (
    <div className={`alert-card nivel-${alerta.nivel?.toLowerCase()}`}>
      <div className="alert-card-header">
        <div className="alert-title-section">
          <span className="alert-icon">
            {alerta.categoria === 'Vencimientos' ? '📅' : 
             alerta.categoria === 'Mantenimiento' ? '🔧' : 
             alerta.categoria === 'Documentación' ? '📄' : '🔔'}
          </span>
          <div>
            <h3 className="alert-title">{alerta.descripcion}</h3>
            <div className="alert-subtitle">
              <span className="alert-elemento">{alerta.elemento}</span>
              {alerta.vehiculoDominio && (
                <span className="alert-vehiculo">• {alerta.vehiculoDominio}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="alert-badges">
          <AlertBadge nivel={alerta.nivel} tamaño="pequeño" />
          <AlertBadge estado={alerta.estado} tamaño="pequeño" />
        </div>
      </div>

      <div className="alert-card-content">
        <div className="alert-info-grid">
          <div className="info-item">
            <span className="info-label">ID:</span>
            <span className="info-value">{alerta.id}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Categoría:</span>
            <span className="info-value">{alerta.categoria}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Generada:</span>
            <span className="info-value">{formatFecha(alerta.fechaGeneracion)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Vencimiento:</span>
            <span className="info-value fecha-vencimiento">
              {formatFecha(alerta.vencimiento)}
              {diasRestantes !== null && (
                <span className={`dias-restantes ${diasRestantes <= 3 ? 'critico' : diasRestantes <= 7 ? 'advertencia' : 'normal'}`}>
                  {getDiasText()}
                </span>
              )}
            </span>
          </div>
        </div>

        {alerta.observaciones && (
          <div className="alert-observaciones">
            <strong>Observaciones:</strong> {alerta.observaciones}
          </div>
        )}
      </div>

      <div className="alert-card-actions">
        <button 
          className="btn-resolver"
          onClick={() => onResolver && onResolver(alerta.id)}
          title="Marcar como resuelto"
        >
          <span className="btn-icon">✅</span>
          <span className="btn-text">Resolver</span>
        </button>
        
        <button 
          className="btn-posponer"
          onClick={() => onPosponer && onPosponer(alerta.id)}
          title="Posponer alerta"
        >
          <span className="btn-icon">⏰</span>
          <span className="btn-text">Posponer</span>
        </button>
        
        <button 
          className="btn-ver"
          onClick={() => onVer && onVer(alerta)}
          title="Ver detalles"
        >
          <span className="btn-icon">👁️</span>
          <span className="btn-text">Ver</span>
        </button>
      </div>
    </div>
  );
};

export default AlertCard;