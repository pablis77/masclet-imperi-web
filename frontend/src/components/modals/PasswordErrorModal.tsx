import React, { useState, useEffect, useRef } from 'react';

interface PasswordErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordErrorModal: React.FC<PasswordErrorModalProps> = ({ isOpen: initialIsOpen, onClose }) => {
  // Estado local para controlar la visibilidad del modal
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Función para cerrar el modal
  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };
  
  useEffect(() => {
    // Actualizar el estado si cambia la prop
    setIsOpen(initialIsOpen);
  }, [initialIsOpen]);
  
  useEffect(() => {
    const modalElement = modalRef.current;
    
    // Escuchar el evento personalizado para actualizar el estado
    const handleUpdateState = (event: CustomEvent) => {
      if (event.detail && typeof event.detail.isOpen === 'boolean') {
        setIsOpen(event.detail.isOpen);
      }
    };
    
    // Escuchar el evento personalizado a nivel de documento
    const handleGlobalEvent = () => {
      setIsOpen(true);
    };
    
    // Registrar los event listeners
    if (modalElement) {
      modalElement.addEventListener('update-modal-state', handleUpdateState as EventListener);
    }
    
    document.addEventListener('show-password-error', handleGlobalEvent);
    
    // Limpiar los event listeners al desmontar
    return () => {
      if (modalElement) {
        modalElement.removeEventListener('update-modal-state', handleUpdateState as EventListener);
      }
      document.removeEventListener('show-password-error', handleGlobalEvent);
    };
  }, []);
  
  if (!isOpen) return null;

  return (
    <div ref={modalRef} id="passwordErrorModal" className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay de fondo oscuro */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Centrar el modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        {/* Contenido del modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-red-600" id="modal-title">
                  ¡Acceso denegado!
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Ramon y su perro protegen el acceso a Masclet Imperi.
                    <br />
                    Por favor, verifica tus credenciales e intenta de nuevo.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Imagen del perro de Ramon */}
            <div className="mt-4 flex justify-center">
              <img 
                src="/images/no_password.webp" 
                alt="Perro de Ramon protegiendo el sistema" 
                className="w-64 h-auto rounded-lg shadow-md"
              />
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleClose}
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordErrorModal;
