// Script mejorado para corregir URLs duplicadas
const fs = require("fs");
const path = require("path");

console.log("Iniciando corrección mejorada de URLs API...");
const distDir = path.resolve(process.cwd(), "dist");

function findJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findJsFiles(filePath, fileList);
    } else if (file.endsWith(".js") || file.endsWith(".mjs")) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const jsFiles = findJsFiles(distDir);
console.log(`Encontrados ${jsFiles.length} archivos JavaScript`);

let fixCount = 0;
let filesFixed = 0;

jsFiles.forEach(file => {
  try {
    let content = fs.readFileSync(file, "utf8");
    let fileChanged = false;

    // Reemplazar URLs absolutas del backend
    const absolutePattern = /http[s]?:\/\/108\.129\.139\.119(:\d+)?\/api\/v1/g;
    if (absolutePattern.test(content)) {
      content = content.replace(absolutePattern, "/api/v1");
      fileChanged = true;
      fixCount++;
    }

    // Reemplazar URLs con doble prefijo (primer patrón)
    const doublePattern1 = /\/api\/api\/v1/g;
    if (doublePattern1.test(content)) {
      content = content.replace(doublePattern1, "/api/v1");
      fileChanged = true;
      fixCount++;
    }

    // Reemplazar URLs con doble prefijo (segundo patrón)
    const doublePattern2 = /\/api\/v1\/api\/v1/g;
    if (doublePattern2.test(content)) {
      content = content.replace(doublePattern2, "/api/v1");
      fileChanged = true;
      fixCount++;
    }

    if (fileChanged) {
      fs.writeFileSync(file, content, "utf8");
      filesFixed++;
      console.log(`Corregido ${file}`);
    }
  } catch (error) {
    console.error(`Error procesando ${file}:`, error.message);
  }
});

console.log(`Proceso completado. Se realizaron ${fixCount} correcciones en ${filesFixed} archivos de ${jsFiles.length}`);
