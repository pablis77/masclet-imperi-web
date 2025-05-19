// Configuración básica para multilenguaje
export const defaultLang = 'es';
export const supportedLanguages = ['es', 'ca'];

// Traducción en Español
const es = {
  common: {
    welcome: "Bienvenido a Masclet Imperi",
    dashboard: "Dashboard",
    animals: "Animales",
    exploitations: "Explotaciones",
    users: "Usuarios",
    settings: "Configuración"
  },
  imports: {
    title: "Importación"
  }
};

// Traducción en Catalán
const ca = {
  common: {
    welcome: "Benvingut a Masclet Imperi",
    dashboard: "Tauler de control",
    animals: "Animals",
    exploitations: "Explotacions",
    users: "Usuaris",
    settings: "Configuració"
  },
  imports: {
    title: "Importació"
  }
};

// Función simple pero efectiva para las traducciones
export function t(key, lang = defaultLang) {
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
export function setLanguage(lang) {
  if (supportedLanguages.includes(lang)) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('userLanguage', lang);
    }
    return lang;
  }
  return defaultLang;
}

// Función para obtener el idioma actual
export function getCurrentLanguage() {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const savedLang = localStorage.getItem('userLanguage');
    return savedLang && supportedLanguages.includes(savedLang) 
      ? savedLang 
      : defaultLang;
  }
  return defaultLang;
}
