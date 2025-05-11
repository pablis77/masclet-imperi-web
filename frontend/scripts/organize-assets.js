/**
 * Script para reorganizar y optimizar los recursos estáticos
 * Crea una estructura clara para imágenes, iconos y otros recursos
 */
const fs = require('fs');
const path = require('path');

// Configuración
const frontendDir = path.join(__dirname, '..');
const publicDir = path.join(frontendDir, 'public');
const assetsDir = path.join(publicDir, 'assets');

// Estructura de carpetas deseada
const folders = {
  icons: path.join(assetsDir, 'icons'),
  images: {
    root: path.join(assetsDir, 'images'),
    logos: path.join(assetsDir, 'images', 'logos'),
    animals: {
      cows: path.join(assetsDir, 'images', 'animals', 'cows'),
      bulls: path.join(assetsDir, 'images', 'animals', 'bulls'),
      calves: path.join(assetsDir, 'images', 'animals', 'calves')
    },
    backgrounds: path.join(assetsDir, 'images', 'backgrounds'),
    ui: path.join(assetsDir, 'images', 'ui')
  },
  fonts: path.join(assetsDir, 'fonts'),
  css: path.join(assetsDir, 'css'),
  js: path.join(assetsDir, 'js')
};

// Crear las carpetas necesarias
function createFolders(folderObj) {
  if (typeof folderObj === 'string') {
    if (!fs.existsSync(folderObj)) {
      fs.mkdirSync(folderObj, { recursive: true });
      console.log(`✅ Creada carpeta: ${folderObj}`);
    }
  } else {
    for (const key in folderObj) {
      if (key === 'root') {
        if (!fs.existsSync(folderObj.root)) {
          fs.mkdirSync(folderObj.root, { recursive: true });
          console.log(`✅ Creada carpeta: ${folderObj.root}`);
        }
      } else {
        createFolders(folderObj[key]);
      }
    }
  }
}

// Mapa de destinos para mover archivos según su nombre
const fileDestinationMap = [
  { pattern: /logo/i, destination: folders.images.logos },
  { pattern: /toro/i, destination: folders.images.animals.bulls },
  { pattern: /vaca/i, destination: folders.images.animals.cows },
  { pattern: /ternero/i, destination: folders.images.animals.calves },
  { pattern: /favicon/i, destination: folders.icons },
  { pattern: /\.ico$/i, destination: folders.icons },
  { pattern: /no_password/i, destination: folders.images.ui }
];

// Función para determinar destino según nombre de archivo
function getDestinationFolder(fileName) {
  for (const rule of fileDestinationMap) {
    if (rule.pattern.test(fileName)) {
      return rule.destination;
    }
  }
  return folders.images.root; // Carpeta predeterminada
}

// Función para mover archivos a su destino
function moveFile(sourcePath, fileName) {
  const destinationFolder = getDestinationFolder(fileName);
  const destinationPath = path.join(destinationFolder, fileName);
  
  // No sobrescribir si ya existe un archivo con el mismo nombre
  if (fs.existsSync(destinationPath)) {
    console.log(`⚠️ Ya existe un archivo con el mismo nombre: ${destinationPath}`);
    // Crear un nombre alternativo para evitar sobrescribir
    const ext = path.extname(fileName);
    const baseName = path.basename(fileName, ext);
    const timestamp = Date.now();
    const newFileName = `${baseName}_${timestamp}${ext}`;
    const newDestinationPath = path.join(destinationFolder, newFileName);
    fs.copyFileSync(sourcePath, newDestinationPath);
    console.log(`✅ Copiado como: ${newFileName}`);
  } else {
    // Copiar archivo a su destino
    fs.copyFileSync(sourcePath, destinationPath);
    console.log(`✅ Movido: ${fileName} → ${destinationPath}`);
  }
}

// Procesar directorios de forma recursiva
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Procesar subdirectorios solo si no son los destinos que estamos creando
      if (!fullPath.startsWith(assetsDir)) {
        processDirectory(fullPath);
      }
    } else {
      // Procesar sólo imágenes y recursos
      const ext = path.extname(entry.name).toLowerCase();
      const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico'].includes(ext);
      const isFont = ['.woff', '.woff2', '.ttf', '.otf', '.eot'].includes(ext);
      
      if (isImage || isFont) {
        moveFile(fullPath, entry.name);
      }
    }
  }
}

// Función principal
function main() {
  console.log('🚀 Iniciando reorganización de recursos estáticos...');
  
  // Crear carpeta de assets si no existe
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
    console.log(`✅ Creada carpeta principal de assets: ${assetsDir}`);
  }
  
  // Crear estructura de carpetas
  createFolders(folders);
  
  // Procesar directorios con imágenes
  const sourceDirs = [
    path.join(publicDir, 'images'),
    path.join(publicDir)
  ];
  
  for (const dir of sourceDirs) {
    if (fs.existsSync(dir)) {
      console.log(`📁 Procesando directorio: ${dir}`);
      processDirectory(dir);
    }
  }
  
  // Crear un mapeo de assets para facilitar su uso en el código
  const assetMapping = {};
  
  function mapAssetsInDirectory(dir, relativePath = '') {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const currentRelativePath = relativePath 
        ? path.join(relativePath, entry.name) 
        : entry.name;
      
      if (entry.isDirectory()) {
        mapAssetsInDirectory(fullPath, currentRelativePath);
      } else {
        // Solo incluir imágenes, iconos, etc.
        const ext = path.extname(entry.name).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico'].includes(ext)) {
          const key = path.basename(entry.name, ext)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_');
          
          assetMapping[key] = `/assets/${currentRelativePath}`;
        }
      }
    }
  }
  
  mapAssetsInDirectory(assetsDir);
  
  // Guardar el mapeo de assets en un archivo para usarlo en el código
  const assetMapFile = path.join(frontendDir, 'src', 'utils', 'assetMap.js');
  const assetMapContent = `/**
 * Mapeo de recursos estáticos para la aplicación
 * AUTOGENERADO - NO EDITAR MANUALMENTE
 */
export const AssetMap = ${JSON.stringify(assetMapping, null, 2)};

/**
 * Obtener la URL de un recurso
 * @param {string} key - Clave del recurso en AssetMap
 * @returns {string} URL del recurso o cadena vacía si no existe
 */
export function getAssetUrl(key) {
  const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return AssetMap[normalizedKey] || '';
}
`;

  // Crear directorio utils si no existe
  const utilsDir = path.join(frontendDir, 'src', 'utils');
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
  }
  
  fs.writeFileSync(assetMapFile, assetMapContent);
  console.log(`✅ Generado archivo de mapeo de assets: ${assetMapFile}`);
  
  console.log('✅ Reorganización de recursos estáticos completada');
}

// Ejecutar el script
try {
  main();
} catch (error) {
  console.error('Error general:', error);
  process.exit(1);
}
