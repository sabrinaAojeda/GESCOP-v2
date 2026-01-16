import React from 'react';
import './AlertBadge.css';

const AlertBadge = ({ nivel, estado, tamaño = 'normal' }) => {
  const getNivelClass = () => {
    switch(nivel?.toLowerCase()) {
      case 'crítico':
      case 'critico':
        return 'critico';
      case 'alto':
        return 'alto';
      case 'medio':
        return 'medio';
      case 'bajo':
        return 'bajo';
      default:
        return 'medio';
    }
  };

  const getEstadoClass = () => {
    switch(estado?.toLowerCase()) {
      case 'pendiente':
        return 'pendiente';
      case 'en proceso':
      case 'en-proceso':
        return 'en-proceso';
      case 'resuelto':
        return 'resuelto';
      case 'vencido':
        return 'vencido';
      case 'vigente':
        return 'vigente';
      case 'por vencer':
        return 'por-vencer';
      default:
        return 'pendiente';
    }
  };

  const getNivelIcon = () => {
    switch(nivel?.toLowerCase()) {
      case 'crítico':
      case 'critico':
        return '🔥';
      case 'alto':
        return '⚠️';
      case 'medio':
        return '📋';
      case 'bajo':
        return '📄';
      default:
        return '📋';
    }
  };

  const getEstadoIcon = () => {
    switch(estado?.toLowerCase()) {
      case 'pendiente':
        return '⏳';
      case 'en proceso':
      case 'en-proceso':
        return '🔄';
      case 'resuelto':
        return '✅';
      case 'vencido':
        return '❌';
      case 'vigente':
        return '✔️';
      case 'por vencer':
        return '⏰';
      default:
        return '⏳';
    }
  };

  return (
    <div className={`alert-badge-container tamaño-${tamaño}`}>
      {nivel && (
        <span className={`badge-nivel nivel-${getNivelClass()}`}>
          <span className="badge-icon">{getNivelIcon()}</span>
          <span className="badge-text">{nivel}</span>
        </span>
      )}
      
      {estado && (
        <span className={`badge-estado estado-${getEstadoClass()}`}>
          <span className="badge-icon">{getEstadoIcon()}</span>
          <span className="badge-text">{estado}</span>
        </span>
      )}
    </div>
  );
};

export default AlertBadge;