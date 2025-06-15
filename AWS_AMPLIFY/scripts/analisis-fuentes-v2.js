/**
 * analisis-fuentes-v2.js
 * Script avanzado para análisis de estructura de archivos por sección de la aplicación
 * 
 * Este script analiza la estructura completa del proyecto y genera un informe detallado
 * que muestra qué archivos y carpetas utiliza cada sección de la aplicación (Dashboard,
 * Explotaciones, Animales, etc.)
 */

// Importaciones necesarias
const fs = require('fs');
const path = require('path');
const util = require('util');
const { promisify } = require('util');

// Promisificar funciones de fs para usar async/await
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

// Configuración inicial
const RUTA_BASE = path.resolve(__dirname, '../../'); // Raíz del proyecto
const RUTA_FRONTEND = path.resolve(RUTA_BASE, 'frontend');
const RUTA_BACKEND = path.resolve(RUTA_BASE, 'backend');
const RUTA_SALIDA = path.resolve(RUTA_BASE, 'AWS_AMPLIFY/analisis-codigo-fuente');

// Directorios a excluir del análisis
const DIRECTORIOS_EXCLUIR = [
    'node_modules',
    'dist',
    'public',
    '.git',
    '.vscode',
    '__pycache__',
    'backups'
];

// Definición de secciones principales
const SECCIONES = {
    'dashboard': {
        rutas: ['/dashboard', '/'],
        archivos: [
            'frontend/src/pages/index.astro', 
            'frontend/src/components/dashboard',
            'frontend/src/routes/index.tsx',
            'frontend/src/components/DashboardV2.tsx'
        ]
    },
    'animales': {
        rutas: ['/animals'],
        archivos: [
            'frontend/src/pages/animals',
            'frontend/src/components/animals',
            'frontend/src/services/animal'
        ]
    },
    'explotaciones': {
        rutas: ['/explotaciones'],
        archivos: [
            'frontend/src/pages/explotaciones',
            'frontend/src/components/explotaciones',
            'frontend/src/services/explotacion',
            'frontend/src/pages/explotaciones-react'
        ]
    },
    'listados': {
        rutas: ['/listados'],
        archivos: [
            'frontend/src/pages/listados',
            'frontend/src/components/listados',
            'frontend/src/services/listado'
        ]
    },
    'importaciones': {
        rutas: ['/imports'],
        archivos: [
            'frontend/src/pages/imports',
            'frontend/src/components/imports',
            'frontend/src/services/imports'
        ]
    },
    'copias-seguridad': {
        rutas: ['/backup'],
        archivos: [
            'frontend/src/pages/backup',
            'frontend/src/components/backup',
            'frontend/src/services/backup'
        ]
    },
    'login': {
        rutas: ['/login'],
        archivos: [
            'frontend/src/pages/login.astro',
            'frontend/src/services/auth',
            'frontend/src/components/login'
        ]
    },
    'notificaciones': {
        rutas: ['/notifications'],
        archivos: [
            'frontend/src/pages/notifications.astro',
            'frontend/src/components/notifications'
        ]
    },
    'usuarios': {
        rutas: ['/users'],
        archivos: [
            'frontend/src/pages/users',
            'frontend/src/components/users',
            'frontend/src/services/user'
        ]
    },
    'backend-api': {
        rutas: ['/api'],
        archivos: ['backend/app']
    },
    'backend-database': {
        rutas: ['/database'],
        archivos: ['backend/database']
    },
    'compartidos': {
        rutas: [],
        archivos: [
            'frontend/src/components/shared',
            'frontend/src/services/shared',
            'frontend/src/api',
            'frontend/src/config',
            'frontend/src/contexts',
            'frontend/src/layouts',
            'frontend/src/utils'
        ]
    }
};

/**
 * Analiza un directorio y devuelve su estructura completa
 * @param {string} directorio - Ruta del directorio a analizar
 * @param {string} rutaBase - Ruta base para calcular rutas relativas
 * @returns {Object} - Estructura del directorio
 */
async function analizarDirectorio(directorio, rutaBase = directorio) {
    try {
        // Verificar si este directorio debe excluirse
        const nombreDirectorio = path.basename(directorio);
        if (DIRECTORIOS_EXCLUIR.includes(nombreDirectorio)) {
            return null;
        }
        
        const archivos = await readdir(directorio);
        const estructura = {
            nombre: nombreDirectorio,
            ruta: path.relative(rutaBase, directorio),
            tipo: 'directorio',
            hijos: []
        };

        for (const archivo of archivos) {
            // Saltar archivos ocultos
            if (archivo.startsWith('.')) continue;
            
            const rutaCompleta = path.join(directorio, archivo);
            const stats = await stat(rutaCompleta);
            
            if (stats.isDirectory()) {
                // Verificar si este subdirectorio debe excluirse
                if (DIRECTORIOS_EXCLUIR.includes(archivo)) continue;
                
                const subestructura = await analizarDirectorio(rutaCompleta, rutaBase);
                if (subestructura) {
                    estructura.hijos.push(subestructura);
                }
            } else {
                estructura.hijos.push({
                    nombre: archivo,
                    ruta: path.relative(rutaBase, rutaCompleta),
                    tipo: 'archivo',
                    tamaño: stats.size,
                    extension: path.extname(archivo)
                });
            }
        }

        return estructura;
    } catch (err) {
        console.error(`Error analizando directorio ${directorio}:`, err);
        return {
            nombre: path.basename(directorio),
            ruta: path.relative(rutaBase, directorio),
            tipo: 'directorio',
            error: err.message,
            hijos: []
        };
    }
}

/**
 * Identifica a qué sección pertenece un archivo
 * @param {string} rutaArchivo - Ruta relativa del archivo
 * @returns {Array} - Lista de secciones a las que pertenece
 */
function identificarSeccionesDeArchivo(rutaArchivo) {
    const seccionesIdentificadas = [];
    
    // Normalizar la ruta para comparación consistente
    const rutaNormalizada = rutaArchivo.replace(/\\/g, '/');
    
    // Verificar pertenencia a cada sección
    for (const [nombreSeccion, seccion] of Object.entries(SECCIONES)) {
        // Verificar si la ruta coincide con alguna ruta de archivo específica de la sección
        const perteneceAPorArchivo = seccion.archivos.some(rutaSeccion => {
            return rutaNormalizada.includes(rutaSeccion);
        });
        
        // Verificar si la ruta coincide con alguna ruta de URL de la sección
        const perteneceAPorRuta = seccion.rutas.some(rutaSeccion => {
            // Para rutas de URL, verificamos si aparecen como parte del path en el archivo
            // Por ejemplo, '/dashboard' debería coincidir con 'pages/dashboard'
            return rutaNormalizada.includes(`/${rutaSeccion.replace(/^\//g, '')}`);
        });
        
        if (perteneceAPorArchivo || perteneceAPorRuta) {
            seccionesIdentificadas.push(nombreSeccion);
        }
    }
    
    // Si no se identificó ninguna sección, asignar a 'desconocido'
    if (seccionesIdentificadas.length === 0) {
        seccionesIdentificadas.push('desconocido');
    }
    
    return seccionesIdentificadas;
}

/**
 * Genera un informe agrupando los archivos por sección
 * @param {Object} estructura - Estructura completa de directorios
 * @returns {Object} - Informe por sección
 */
function generarInformePorSeccion(estructura) {
    // Inicializar informe vacío para cada sección
    const informe = {};
    
    for (const seccion of Object.keys(SECCIONES)) {
        informe[seccion] = {
            archivos: [],
            directorios: [],
            numArchivos: 0,
            numDirectorios: 0
        };
    }
    
    // Añadir categoría 'desconocido'
    informe['desconocido'] = {
        archivos: [],
        directorios: [],
        numArchivos: 0,
        numDirectorios: 0
    };
    
    /**
     * Procesa recursivamente la estructura y clasifica archivos y directorios
     */
    function procesarEstructura(estructura, esRaiz = false) {
        // Saltar directorios null (excluidos)
        if (!estructura) return;
        
        if (estructura.tipo === 'directorio' && !esRaiz) {
            const seccionesDir = identificarSeccionesDeArchivo(estructura.ruta);
            
            for (const seccion of seccionesDir) {
                informe[seccion].directorios.push({
                    ruta: estructura.ruta,
                    nombre: estructura.nombre
                });
                informe[seccion].numDirectorios++;
            }
            
            // Procesar hijos recursivamente
            if (estructura.hijos && Array.isArray(estructura.hijos)) {
                for (const hijo of estructura.hijos) {
                    procesarEstructura(hijo);
                }
            }
        } else if (estructura.tipo === 'archivo') {
            const seccionesArchivo = identificarSeccionesDeArchivo(estructura.ruta);
            
            for (const seccion of seccionesArchivo) {
                informe[seccion].archivos.push({
                    ruta: estructura.ruta,
                    nombre: estructura.nombre,
                    extension: estructura.extension,
                    tamaño: estructura.tamaño
                });
                informe[seccion].numArchivos++;
            }
        } else if (esRaiz && estructura.hijos && Array.isArray(estructura.hijos)) {
            // Si es la raíz, procesar hijos sin clasificar el directorio
            for (const hijo of estructura.hijos) {
                procesarEstructura(hijo);
            }
        }
    }
    
    procesarEstructura(estructura, true);
    return informe;
}

/**
 * Función principal
 */
async function main() {
    console.log('Iniciando análisis de fuentes v2...');
    console.log(`Ruta base: ${RUTA_BASE}`);
    console.log(`Analizando frontend: ${RUTA_FRONTEND}`);
    console.log(`Analizando backend: ${RUTA_BACKEND}`);
    
    // Crear directorio de salida con timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const directorioSalida = path.join(RUTA_SALIDA, `analisis-${timestamp}`);
    
    try {
        await mkdir(directorioSalida, { recursive: true });
        console.log(`Directorio de salida creado: ${directorioSalida}`);
    } catch (err) {
        console.error('Error al crear directorio de salida:', err);
        process.exit(1);
    }
    
    // Analizar estructura del frontend
    console.log('Analizando estructura de frontend...');
    const estructuraFrontend = await analizarDirectorio(RUTA_FRONTEND, RUTA_BASE);
    
    // Analizar estructura del backend
    console.log('Analizando estructura de backend...');
    const estructuraBackend = await analizarDirectorio(RUTA_BACKEND, RUTA_BASE);
    
    // Combinar ambas estructuras en un solo objeto
    const estructuraCompleta = {
        nombre: 'masclet-imperi-web',
        tipo: 'directorio',
        ruta: '',
        hijos: [
            estructuraFrontend,
            estructuraBackend
        ]
    };
    
    // Guardar estructura completa a un archivo JSON
    await writeFile(
        path.join(directorioSalida, 'estructura-completa.json'),
        JSON.stringify(estructuraCompleta, null, 2)
    );
    console.log(`Estructura guardada en ${path.join(directorioSalida, 'estructura-completa.json')}`);
    
    // Generar informe por sección
    console.log('Generando informe por sección...');
    const informePorSeccion = generarInformePorSeccion(estructuraCompleta);
    
    // Guardar informe por sección
    await writeFile(
        path.join(directorioSalida, 'informe-por-seccion.json'),
        JSON.stringify(informePorSeccion, null, 2)
    );
    console.log(`Informe por sección guardado en ${path.join(directorioSalida, 'informe-por-seccion.json')}`);
    
    // Generar un resumen simplificado
    console.log('\nResumen del análisis:');
    for (const [seccion, datos] of Object.entries(informePorSeccion)) {
        console.log(`- ${seccion}: ${datos.numArchivos} archivos en ${datos.numDirectorios} directorios`);
    }
    
    console.log('\nAnálisis completado');
}

// Ejecutar script
main().catch(err => {
    console.error('Error en el análisis:', err);
    process.exit(1);
});
