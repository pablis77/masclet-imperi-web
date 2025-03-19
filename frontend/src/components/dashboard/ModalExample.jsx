import React, { useState } from 'react';
import PasswordErrorModal from '../common/PasswordErrorModal';

const ModalExample = () => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordAttempts, setPasswordAttempts] = useState(1);

  const handleShowPasswordError = () => {
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordAttempts(prev => prev + 1);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="font-semibold text-secondary">Ejemplos de modal</h3>
      </div>
      <div className="card-body">
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium mb-2">Modal de error de contraseña</h4>
            <p className="text-gray-600 mb-3">
              Este modal muestra un mensaje de error cuando el usuario introduce una contraseña incorrecta.
            </p>
            <button 
              className="btn btn-danger" 
              onClick={handleShowPasswordError}
            >
              Mostrar error de contraseña
            </button>
          </div>
        </div>

        {/* Modales */}
        <PasswordErrorModal 
          isOpen={isPasswordModalOpen} 
          onClose={handleClosePasswordModal} 
          attempts={passwordAttempts}
        />
      </div>
    </div>
  );
};

export default ModalExample;
