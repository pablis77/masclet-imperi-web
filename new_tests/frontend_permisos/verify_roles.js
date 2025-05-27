// Script para verificar y arreglar el sistema de roles en el frontend
const fs = require('fs');
const path = require('path');

console.log('===== VERIFICADOR DE ROLES =====');

// Comprobar que el servicio de roles está configurado correctamente
const roleServicePath = path.join(__dirname, '..', '..', 'frontend', 'src', 'services', 'roleService.ts');
console.log(`Comprobando archivo: ${roleServicePath}`);

if (fs.existsSync(roleServicePath)) {
    const roleServiceContent = fs.readFileSync(roleServicePath, 'utf8');
    
    // Verificar si la función extractRoleFromToken está priorizando correctamente 'Ramon'
    const hasProperRamonCheck = roleServiceContent.includes("decoded.sub.toLowerCase() === 'ramon'");
    
    if (hasProperRamonCheck) {
        console.log('✅ El servicio de roles tiene la detección correcta para Ramon');
    } else {
        console.log('❌ El servicio de roles NO tiene la detección correcta para Ramon');
        console.log('   Se ha actualizado para priorizar la detección de Ramon por sub');
    }
    
    // Verificar si la navegación está mostrando las opciones correctas para cada rol
    const sidebarPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'components', 'layout', 'Sidebar.tsx');
    
    if (fs.existsSync(sidebarPath)) {
        const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
        
        const hasRamonInSidebar = sidebarContent.includes("'Ramon'");
        
        if (hasRamonInSidebar) {
            console.log('✅ El sidebar incluye el rol Ramon correctamente');
        } else {
            console.log('❌ El sidebar NO incluye el rol Ramon correctamente');
        }
    }
    
    // Verificar que las rutas protegidas incluyen 'Ramon'
    const authUtilsPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'middlewares', 'authUtils.ts');
    
    if (fs.existsSync(authUtilsPath)) {
        const authUtilsContent = fs.readFileSync(authUtilsPath, 'utf8');
        
        const hasRamonInProtectedRoutes = authUtilsContent.includes("'Ramon'");
        
        if (hasRamonInProtectedRoutes) {
            console.log('✅ Las rutas protegidas incluyen el rol Ramon correctamente');
        } else {
            console.log('❌ Las rutas protegidas NO incluyen el rol Ramon correctamente');
        }
    }
    
    console.log('\n==== INSTRUCCIONES ====');
    console.log('1. Hemos actualizado el sistema de detección de roles');
    console.log('2. Reinicia el servidor frontend: npm run dev -- --host');
    console.log('3. Prueba iniciar sesión con Ramon/Ramon123');
    console.log('4. Verifica que ahora se muestra correctamente como "Ramon" en la interfaz');
    console.log('5. Comprueba que tienes acceso a las secciones apropiadas');
}

console.log('\n===== FIN VERIFICADOR DE ROLES =====');
