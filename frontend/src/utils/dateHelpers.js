/**
 * Utilidades para manejo de fechas
 */

/**
 * Convierte una fecha de cualquier formato a YYYY-MM-DD para inputs HTML
 * @param {string|Date} date - Fecha a convertir
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export function formatDateForInput(date) {
  if (!date || (typeof date !== 'string' && !(date instanceof Date))) return '';
  
  // Si ya está en formato YYYY-MM-DD, devolverlo tal cual
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  
  // Si está en formato DD/MM/YYYY, convertirlo a YYYY-MM-DD
  if (typeof date === 'string') {
    const match = date.match(/^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/);
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`;
    }
  }
  
  // Intentar parsear como fecha
  try {
    const fecha = date instanceof Date ? date : new Date(date);
    if (!isNaN(fecha.getTime())) {
      const year = fecha.getFullYear();
      const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const day = fecha.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    console.error('Error al parsear fecha:', e);
  }
  
  // Si no coincide con ningún formato conocido, devolver cadena vacía
  return '';
}

/**
 * Convierte una fecha de formato YYYY-MM-DD a DD/MM/YYYY
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @returns {string} - Fecha en formato DD/MM/YYYY
 */
export function formatDateForDisplay(date) {
  if (!date || typeof date !== 'string') return '';
  
  // Si ya está en formato DD/MM/YYYY, devolverlo tal cual
  if (/^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/.test(date)) {
    return date;
  }
  
  // Si está en formato YYYY-MM-DD, convertirlo a DD/MM/YYYY
  const match = date.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  
  // Intentar parsear como fecha
  try {
    const fecha = new Date(date);
    if (!isNaN(fecha.getTime())) {
      const year = fecha.getFullYear();
      const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const day = fecha.getDate().toString().padStart(2, '0');
      return `${day}/${month}/${year}`;
    }
  } catch (e) {
    console.error('Error al parsear fecha:', e);
  }
  
  return date; // Devolver la fecha original si no se pudo convertir
}

/**
 * Calcula la edad en años a partir de una fecha de nacimiento
 * @param {string|Date} dob - Fecha de nacimiento
 * @returns {number|null} - Edad en años o null si la fecha no es válida
 */
export function calculateAge(dob) {
  if (!dob) return null;
  
  try {
    let birthDate;
    
    if (typeof dob === 'string') {
      // Formato DD/MM/YYYY
      const matchDDMMYYYY = dob.match(/^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/);
      if (matchDDMMYYYY) {
        birthDate = new Date(`${matchDDMMYYYY[3]}-${matchDDMMYYYY[2]}-${matchDDMMYYYY[1]}`);
      } else {
        // Intentar parsear directamente
        birthDate = new Date(dob);
      }
    } else {
      birthDate = dob;
    }
    
    if (isNaN(birthDate.getTime())) {
      return null;
    }
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (e) {
    console.error('Error al calcular edad:', e);
    return null;
  }
}

/**
 * Formatea una fecha para mostrar hace cuánto tiempo ocurrió (ej: "hace 2 días")
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Texto formateado
 */
export function formatTimeAgo(date) {
  if (!date) return '';
  
  try {
    const fecha = date instanceof Date ? date : new Date(date);
    if (isNaN(fecha.getTime())) return '';
    
    const ahora = new Date();
    const diferenciaMilisegundos = ahora.getTime() - fecha.getTime();
    const segundos = Math.floor(diferenciaMilisegundos / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const meses = Math.floor(dias / 30);
    const años = Math.floor(dias / 365);
    
    if (años > 0) {
      return años === 1 ? 'hace 1 año' : `hace ${años} años`;
    } else if (meses > 0) {
      return meses === 1 ? 'hace 1 mes' : `hace ${meses} meses`;
    } else if (dias > 0) {
      return dias === 1 ? 'hace 1 día' : `hace ${dias} días`;
    } else if (horas > 0) {
      return horas === 1 ? 'hace 1 hora' : `hace ${horas} horas`;
    } else if (minutos > 0) {
      return minutos === 1 ? 'hace 1 minuto' : `hace ${minutos} minutos`;
    } else {
      return 'hace unos segundos';
    }
  } catch (e) {
    console.error('Error al formatear tiempo:', e);
    return '';
  }
}
