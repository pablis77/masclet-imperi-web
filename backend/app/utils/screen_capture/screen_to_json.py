import json
import os
from datetime import datetime
from PIL import Image
import pytesseract
import re

def extract_screen_content(image_path):
    """Extrae contenido de cualquier captura de pantalla"""
    try:
        # Configurar Tesseract
        pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        
        # Abrir y procesar imagen
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        
        # Extraer información estructurada
        content = {
            "raw_text": text,
            "structured_data": {
                "sections": [],
                "links": [],
                "buttons": [],
                "forms": [],
                "tables": [],
                "navigation": [],
                "headers": []
            }
        }
        
        # Procesar texto línea por línea
        lines = text.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Detectar secciones por indentación o formatos comunes
            if re.match(r'^[A-Z\s]{2,}$', line):
                current_section = {
                    "title": line,
                    "content": []
                }
                content["structured_data"]["sections"].append(current_section)
                continue
            
            # Detectar enlaces
            if re.search(r'https?://', line):
                content["structured_data"]["links"].append(line)
                
            # Detectar encabezados
            if line.startswith('#') or line.startswith('=='):
                content["structured_data"]["headers"].append(line)
                
            # Añadir línea a sección actual si existe
            if current_section:
                current_section["content"].append(line)
        
        return content
        
    except Exception as e:
        print(f"Error procesando imagen: {str(e)}")
        return None

def convert_screen_to_json():
    """Convierte capturas de pantalla a JSON estructurado"""
    
    print("\n=== Convertidor Universal de Capturas a JSON ===")
    print("----------------------------------------------")
    
    while True:
        try:
            # Input
            png_name = input("\nNombre del archivo PNG (sin extensión): ")
            if not png_name.endswith('.png'):
                png_name += '.png'
                
            if not os.path.exists(png_name):
                print(f"Error: No se encuentra {png_name}")
                continue
                
            # Output
            json_name = png_name.replace('.png', '.json')
            
            if os.path.exists(json_name):
                if input(f"¿Sobrescribir {json_name}? (s/n): ").lower() != 's':
                    continue
            
            # Procesar imagen
            content = extract_screen_content(png_name)
            
            if not content:
                print("No se pudo procesar la imagen")
                continue
                
            # Crear estructura JSON
            screen_data = {
                "metadata": {
                    "source": png_name,
                    "timestamp": datetime.now().isoformat(),
                    "resolution": Image.open(png_name).size
                },
                "content": content
            }
            
            # Guardar
            with open(json_name, 'w', encoding='utf-8') as f:
                json.dump(screen_data, f, indent=2, ensure_ascii=False)
                
            print(f"\nJSON creado: {json_name}")
            
            if input("\n¿Procesar otra imagen? (s/n): ").lower() != 's':
                break
                
        except Exception as e:
            print(f"Error: {str(e)}")
            continue

if __name__ == "__main__":
    convert_screen_to_json()