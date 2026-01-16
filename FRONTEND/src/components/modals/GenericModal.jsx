// src/components/Common/GenericModal.jsx
import React from 'react'
import './ModalVehiculo.css'

const GenericModal = ({ title, children, onClose, size = 'medium' }) => {
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    xlarge: 'max-w-6xl'
  }

  return (
    <div className="modal-vehiculo-overlay">
      <div className={`modal-vehiculo-content ${sizeClasses[size]}`}>
        <div className="modal-vehiculo-header">
          <h2 className="modal-vehiculo-title">{title}</h2>
          <button className="modal-vehiculo-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-vehiculo-form">
          {children}
        </div>
      </div>
    </div>
  )
}

export default GenericModal