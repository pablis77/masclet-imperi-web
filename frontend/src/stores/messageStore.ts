import { atom } from 'nanostores';
import type { Message, MessageType } from '../types/types';

// Store para mensajes y notificaciones
export const messagesStore = atom<Message[]>([]);

// Contador para generar IDs únicos
let messageCounter = 0;

/**
 * Añade un mensaje a la tienda
 * @param type - Tipo de mensaje
 * @param title - Título del mensaje
 * @param content - Contenido del mensaje
 * @param duration - Duración en milisegundos (por defecto 5000ms, 0 para no auto-eliminar)
 * @returns ID del mensaje
 */
export function addMessage(
  type: MessageType,
  title: string,
  content: string,
  duration: number = 5000
): string {
  const id = `msg-${Date.now()}-${messageCounter++}`;
  const message: Message = {
    id,
    type,
    title,
    content,
    duration,
    dismissible: true
  };
  
  // Añadir mensaje a la tienda
  messagesStore.set([...messagesStore.get(), message]);
  
  // Configurar auto-eliminación si la duración es mayor que 0
  if (duration > 0) {
    setTimeout(() => {
      removeMessage(id);
    }, duration);
  }
  
  return id;
}

/**
 * Elimina un mensaje de la tienda
 * @param id - ID del mensaje a eliminar
 */
export function removeMessage(id: string): void {
  const currentMessages = messagesStore.get();
  messagesStore.set(currentMessages.filter(message => message.id !== id));
}

/**
 * Elimina todos los mensajes de la tienda
 */
export function clearMessages(): void {
  messagesStore.set([]);
}


// Funciones de conveniencia para diferentes tipos de mensajes
export const showSuccess = (title: string, content: string, duration?: number) => 
  addMessage('success', title, content, duration);

export const showError = (title: string, content: string, duration?: number) => 
  addMessage('error', title, content, duration);

export const showInfo = (title: string, content: string, duration?: number) => 
  addMessage('info', title, content, duration);

export const showWarning = (title: string, content: string, duration?: number) => 
  addMessage('warning', title, content, duration);
