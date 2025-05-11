import { useStore } from '@nanostores/react';
import { messagesStore, removeMessage } from '../../stores/messageStore';
import type { Message } from '../../types/types';

/**
 * Componente para mostrar mensajes y notificaciones de la aplicación
 */
export default function Messages() {
  // Usar el store de mensajes
  const messages = useStore(messagesStore);

  // Si no hay mensajes, no renderizar nada
  if (messages.length === 0) {
    return null;
  }

  // Función para eliminar un mensaje
  const handleDismiss = (id: string) => {
    removeMessage(id);
  };

  // Obtener clases y iconos según el tipo de mensaje
  const getMessageStyles = (type: Message['type']) => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-500 dark:border-green-700',
          textColor: 'text-green-800 dark:text-green-300',
          iconSvg: (
            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'error':
        return {
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-500 dark:border-red-700',
          textColor: 'text-red-800 dark:text-red-300',
          iconSvg: (
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-500 dark:border-yellow-700',
          textColor: 'text-yellow-800 dark:text-yellow-300',
          iconSvg: (
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
      default: // info
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-500 dark:border-blue-700',
          textColor: 'text-blue-800 dark:text-blue-300',
          iconSvg: (
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 max-w-md">
      {messages.map((message) => {
        const { bgColor, borderColor, textColor, iconSvg } = getMessageStyles(message.type);
        
        return (
          <div
            key={message.id}
            className={`message-alert rounded-lg border ${borderColor} ${bgColor} p-4 shadow-lg transform transition-all duration-300 ease-in-out`}
            role="alert"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {iconSvg}
              </div>
              <div className="ml-3 flex-grow">
                {message.title && (
                  <h3 className={`text-sm font-medium ${textColor}`}>{message.title}</h3>
                )}
                <div className={`mt-1 text-sm ${textColor}`}>
                  <p>{message.content}</p>
                </div>
              </div>
              {message.dismissible && (
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      className="inline-flex rounded-md p-1.5 text-gray-500 hover:text-gray-600 focus:outline-none"
                      aria-label="Cerrar"
                      onClick={() => handleDismiss(message.id)}
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
