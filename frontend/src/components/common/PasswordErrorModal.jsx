import React from 'react';
import Modal from './Modal';

const PasswordErrorModal = ({ isOpen, onClose, attempts = 1 }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Contraseña incorrecta"
      size="md"
    >
      <div className="text-center">
        <div className="mb-4">
          <img 
            src="/images/no_password.png" 
            alt="Error de contraseña" 
            className="mx-auto h-48 object-contain"
          />
        </div>
        
        <h4 className="text-xl font-semibold text-danger mb-2">¡Oops! Contraseña incorrecta</h4>
        
        <p className="text-text-secondary mb-6">
          {attempts === 1 
            ? 'Has introducido una contraseña incorrecta.' 
            : `Has introducido una contraseña incorrecta ${attempts} veces.`
          }
        </p>
        
        <div className="flex justify-center">
          <button 
            onClick={onClose}
            className="btn btn-primary"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PasswordErrorModal;
