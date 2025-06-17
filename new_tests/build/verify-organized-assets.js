/**
 * Test para verificar la organización de assets y detectar duplicados
 * Comprueba que los scripts se detecten correctamente y no haya duplicados
 */

const fs = require('fs');
const path = require('path');
const { organizeSectionAssets } = require('../../frontend/build-modules/section-loader.cjs');

// Función para detectar duplicados en un array
function findDuplicates(arr) {
    const seen = {};
    const duplicates = [];
    
    for (const item of arr) {
        // Extraer solo el nombre base del archivo (sin hash ni ruta)
        const parts = item.split('/');
        const filename = parts[parts.length - 1];
        const baseFilename = filename.replace(/\.[A-Za-z0-9_-]+\.js$/, '.js');
        
        if (!seen[baseFilename]) {
            seen[baseFilename] = 1;
        } else {
            seen[baseFilename]++;
            if (seen[baseFilename] === 2) { // Solo añadir en la primera detección de duplicado
                duplicates.push(baseFilename);
            }
        }
    }
    
    return duplicates;
}

// Test principal
(async function() {
    console.log('==== TEST: Verificando organización de assets ====');
    
    // 1. Simular assets para probar
    const mockAssets = {
        allJs: [
            // CORE
            'dist/client/_astro/vendor.BAk4NxX6.js',
            'dist/client/_astro/client.DKNAXmG2.js',
            'dist/client/_astro/apiConfig.BYL0hBvc.js',
            'dist/client/_astro/apiService.DCRZ96ES.js',
            'dist/client/_astro/authService.CvC7CJU-.js',
            'dist/client/_astro/notificationService.DETo-XEc.js',
            'dist/client/_astro/Navbar.BhT4Hx0d.js',
            'dist/client/_astro/Sidebar.BhT4Hx0d.js',
            'dist/client/_astro/Footer.BhT4Hx0d.js',
            'dist/client/_astro/MainLayout.BhT4Hx0d.js',
            
            // LOGIN
            'dist/client/_astro/PasswordErrorModal.BrSl3daN.js',
            'dist/client/_astro/LoginDebugger.DewzcQPo.js',
            'dist/client/_astro/login.DKNAXmG2.js',
            
            // DASHBOARD
            'dist/client/_astro/DashboardV2.D3-bt97t.js',
            'dist/client/_astro/Dashboard2.CHYKY2KF.js',
            'dist/client/_astro/DashboardNew.CHYKY2KF.js',
            'dist/client/_astro/NotificationsMenu._4m-Nx7C.js',
            
            // BACKUP
            'dist/client/_astro/backup/index.DFksm31.js',
            'dist/client/_astro/backupService.BAj3Hx1d.js',
            'dist/client/_astro/block-delete-button.CamjK0L.js'
        ],
        allCss: [
            'dist/client/_astro/index.DJoSdzOi.css',
            'dist/client/_astro/login.Cc07-JCR.css'
        ]
    };
    
    // 2. Organizar assets
    const organizeSections = ['LOGIN', 'DASHBOARD', 'BACKUP'];
    
    for (const section of organizeSections) {
        console.log(`\nProbando sección: ${section}`);
        
        // Organizar assets para esta sección
        const organizedAssets = organizeSectionAssets(mockAssets, section);
        
        // Verificar que existe la clave "core" (no "CORE")
        if (!organizedAssets.core) {
            console.error(`❌ ERROR: No se encontró la clave "core" en los assets organizados`);
            process.exit(1);
        }
        
        // Verificar que NO existe la clave "CORE" (duplicada)
        if (organizedAssets.CORE) {
            console.error(`❌ ERROR: Se encontró clave duplicada "CORE" en mayúsculas`);
            process.exit(1);
        }
        
        // Verificar que existen scripts en la sección específica
        if (!organizedAssets[section] || !organizedAssets[section].js || organizedAssets[section].js.length === 0) {
            console.error(`❌ ERROR: No se encontraron scripts para la sección ${section}`);
            process.exit(1);
        }
        
        console.log(`✅ Sección ${section}: ${organizedAssets[section].js.length} scripts detectados`);
        
        // Verificar scripts core
        if (!organizedAssets.core.js || organizedAssets.core.js.length < 5) {
            console.error(`❌ ERROR: No hay suficientes scripts core (mínimo 5 requeridos)`);
            process.exit(1);
        }
        
        console.log(`✅ Scripts core: ${organizedAssets.core.js.length} detectados`);
        
        // Detectar duplicados en core
        const duplicatesCore = findDuplicates(organizedAssets.core.js);
        if (duplicatesCore.length > 0) {
            console.warn(`⚠️ ADVERTENCIA: Se encontraron duplicados en scripts core: ${duplicatesCore.join(', ')}`);
        } else {
            console.log('✅ No se encontraron duplicados en scripts core');
        }
        
        // Detectar duplicados en la sección
        const duplicatesSection = findDuplicates(organizedAssets[section].js);
        if (duplicatesSection.length > 0) {
            console.warn(`⚠️ ADVERTENCIA: Se encontraron duplicados en scripts de ${section}: ${duplicatesSection.join(', ')}`);
        } else {
            console.log(`✅ No se encontraron duplicados en scripts de ${section}`);
        }
    }
    
    console.log('\n✅ TEST COMPLETADO: Verificación de assets organizada correctamente');
})();
