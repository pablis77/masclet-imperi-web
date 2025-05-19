// Configuración básica para multilenguaje
export const defaultLang = 'es';
export const supportedLanguages = ['es', 'ca'];

// Definición de tipos para evitar errores
type TranslationDict = Record<string, Record<string, any>>;

// Importar directamente las traducciones desde los archivos JSON
import * as esTranslations from './locales/es.json';
import * as caTranslations from './locales/ca.json';

// Usar las traducciones importadas
const es: TranslationDict = esTranslations as unknown as TranslationDict;
const ca: TranslationDict = caTranslations as unknown as TranslationDict;

// Asegurar que las traducciones se han cargado correctamente
console.log('[i18n] Traducciones cargadas:', 
  'ES:', Object.keys(es).length, 'secciones', 
  'CA:', Object.keys(ca).length, 'secciones');

// Función simple pero efectiva para las traducciones
export function t(key: string, lang = defaultLang): string {
  try {
    const parts = key.split('.');
    if (parts.length !== 2) return key;
    
    const section = parts[0];
    const term = parts[1];
    
    const dict = lang === 'ca' ? ca : es;
    
    if (dict[section] && dict[section][term]) {
      return dict[section][term];
    }
    
    return key;
  } catch (e) {
    console.error(`Error en traducción para la clave: ${key}`, e);
    return key;
  }
}

// Función para cambiar el idioma
export function setLanguage(lang: string): string {
  if (supportedLanguages.includes(lang)) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('userLanguage', lang);
    }
    return lang;
  }
  return defaultLang;
}

// Función para obtener el idioma actual
export function getCurrentLanguage(): string {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const savedLang = localStorage.getItem('userLanguage');
    return savedLang && supportedLanguages.includes(savedLang) 
      ? savedLang 
      : defaultLang;
  }
  return defaultLang;
}
