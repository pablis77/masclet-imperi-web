import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta de la imagen original
const rutaToroOriginal = path.join(__dirname, '../../public/images/toro.png');
const rutaToroMejorado = path.join(__dirname, '../../public/images/toro_sin_borde.png');

async function mejorarToro() {
  try {
    console.log('Procesando imagen del toro...');
    
    // Leer la imagen original
    const buffer = await fs.promises.readFile(rutaToroOriginal);
    
    // Procesar la imagen para quitar el borde negro
    // Aumentamos la saturación y el brillo para resaltar el toro y reducir el borde
    await sharp(buffer)
      .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .modulate({ brightness: 1.2, saturation: 1.2 })
      .threshold(210)  // Esto ayuda a eliminar los bordes oscuros
      .toFile(rutaToroMejorado);
    
    console.log(`Imagen mejorada guardada en: ${rutaToroMejorado}`);
  } catch (error) {
    console.error('Error al procesar la imagen:', error);
  }
}

// Ejecutar la función
mejorarToro();
