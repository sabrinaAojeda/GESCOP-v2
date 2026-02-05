// FRONTEND/src/components/Proveedores/ProveedorModal.jsx - VERSIÓN CORREGIDA
import React from 'react';
import GenericModal from '../Common/GenericModal';
import ProveedorForm from "../DataTable/forms/ProveedorForm";
import './ProveedorModal.css';

const ProveedorModal = ({ 
  mode, 
  proveedor, 
  onClose, 
  onSave, 
  loading 
}) => {
  const getTitle = () => {
    switch(mode) {
      case 'crear':
        return '➕ Nuevo Proveedor';
      case 'editar':
        return `✏️ Editar Proveedor: ${proveedor?.razon_social || ''}`;
      case 'ver':
        return `👁️ Ver Proveedor: ${proveedor?.razon_social || ''}`;
      default:
        return 'Proveedor';
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSave = (formData) => {
    onSave(formData);
  };

  return (
    <GenericModal
      title={getTitle()}
      onClose={handleCancel}
      size="large"
      loading={loading}
    >
      <div className="proveedor-modal-content">
        <ProveedorForm
          initialData={proveedor}
          onSubmit={handleSave}
          mode={mode}
          loading={loading}
          onCancel={handleCancel}
        />
      </div>
    </GenericModal>
  );
};

export default ProveedorModal;