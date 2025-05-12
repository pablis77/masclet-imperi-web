// Configuración básica para multilenguaje
export const defaultLang = 'es';
export const supportedLanguages = ['es', 'ca'];

// Este archivo servirá como punto de acceso a las traducciones
export function t(key: string, lang = defaultLang): string {
  try {
    // Intentamos cargar el archivo de idioma dinámicamente
    const translations = lang === 'es' 
      ? require('./locales/es.json')
      : require('./locales/ca.json');
      
    // Navegamos por la clave usando notación de punto (e.j. 'common.welcome')
    return key.split('.').reduce((obj, k) => obj[k], translations) || key;
  } catch (e) {
    console.error(`Error loading translation for key: ${key}`, e);
    return key;
  }
}

// Función para cambiar el idioma
export function setLanguage(lang: string) {
  if (supportedLanguages.includes(lang)) {
    localStorage.setItem('userLanguage', lang);
    return lang;
  }
  return defaultLang;
}

// Función para obtener el idioma actual
export function getCurrentLanguage(): string {
  if (typeof window !== 'undefined') {
    const savedLang = localStorage.getItem('userLanguage');
    return savedLang && supportedLanguages.includes(savedLang) 
      ? savedLang 
      : defaultLang;
  }
  return defaultLang;
}
