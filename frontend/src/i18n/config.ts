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

// Función mejorada para las traducciones que soporta múltiples niveles de anidación
export function t(key: string, lang = defaultLang): string {
  try {
    const parts = key.split('.');
    if (parts.length < 2) return key;
    
    const dict = lang === 'ca' ? ca : es;
    
    // Manejar múltiples niveles de anidación
    let current: any = dict;
    
    // Navegar por la estructura anidada
    for (const part of parts) {
      if (current && current[part]) {
        current = current[part];
      } else {
        // Si no encuentra alguna parte de la ruta, devuelve la clave original
        console.warn(`Traducción no encontrada para la clave: ${key} (parte: ${part})`);
        return key;
      }
    }
    
    // Si llegamos aquí, current debería contener el valor final
    if (typeof current === 'string') {
      return current;
    }
    
    console.warn(`Valor no válido para la clave: ${key}`);
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

// Función mejorada para obtener el idioma actual
export function getCurrentLanguage(): string {
  // En entorno de navegador
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    // 1. Primero comprobar parámetro URL (para debugging y forzar idioma)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      
      if (urlLang && supportedLanguages.includes(urlLang)) {
        console.log('[i18n] Usando idioma desde URL:', urlLang);
        // Guardar en localStorage para mantener coherencia
        localStorage.setItem('userLanguage', urlLang);
        return urlLang;
      }
    } catch (e) {
      console.error('[i18n] Error al leer parámetros URL:', e);
    }
    
    // 2. Comprobar localStorage
    const savedLang = localStorage.getItem('userLanguage');
    if (savedLang && supportedLanguages.includes(savedLang)) {
      console.log('[i18n] Usando idioma desde localStorage:', savedLang);
      return savedLang;
    }
    
    // 3. Comprobar preferencia del navegador
    try {
      const browserLang = navigator.language.split('-')[0];
      if (supportedLanguages.includes(browserLang)) {
        console.log('[i18n] Usando idioma del navegador:', browserLang);
        localStorage.setItem('userLanguage', browserLang);
        return browserLang;
      }
    } catch (e) {
      console.error('[i18n] Error al detectar idioma del navegador:', e);
    }
  }
  
  // Si no se puede determinar o en SSR, usar idioma por defecto
  console.log('[i18n] Usando idioma por defecto:', defaultLang);
  return defaultLang;
}
