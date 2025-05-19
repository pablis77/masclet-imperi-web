"""
Script para conectar el servicio de historial de animales con los endpoints.
Este script añade imports y llamadas al servicio sin modificar la lógica principal.
"""
import os
import re

# Ruta al archivo de servicios para asegurar que existe el directorio
ruta_servicios = os.path.join(os.getcwd(), "backend", "app", "services")
if not os.path.exists(ruta_servicios):
    os.makedirs(ruta_servicios)
    with open(os.path.join(ruta_servicios, "__init__.py"), "w") as f:
        f.write("# Paquete de servicios\n")

# Ruta al archivo de endpoints de animales
ruta_archivo = os.path.join(os.getcwd(), "backend", "app", "api", "endpoints", "animals.py")

def verificar_imports():
    """Verifica si ya están añadidos los imports del servicio de historial"""
    with open(ruta_archivo, 'r', encoding='utf-8') as archivo:
        contenido = archivo.read()
    
    if "from app.services.animal_history_service import" in contenido:
        print("✅ Los imports del servicio de historial ya están añadidos.")
        return True
    return False

def añadir_imports():
    """Añade los imports del servicio de historial al archivo de endpoints"""
    with open(ruta_archivo, 'r', encoding='utf-8') as archivo:
        contenido = archivo.read()
    
    # Patrón para encontrar la sección de imports
    patron_imports = r"from app\.models\.user import User\n"
    
    # Añadir imports del servicio de historial después de importar User
    imports_historial = """from app.services.animal_history_service import registrar_historial_animal, registrar_multiples_cambios, registrar_creacion_animal
"""
    
    if patron_imports in contenido:
        contenido_nuevo = contenido.replace(patron_imports, patron_imports + imports_historial)
        
        # Guardar el archivo modificado
        with open(ruta_archivo, 'w', encoding='utf-8') as archivo:
            archivo.write(contenido_nuevo)
        
        print("✅ Imports del servicio de historial añadidos correctamente.")
        return True
    else:
        print("❌ No se pudo encontrar el patrón de imports en el archivo.")
        return False

def conectar_endpoint_patch():
    """Conecta el endpoint update_animal_patch con el servicio de historial"""
    with open(ruta_archivo, 'r', encoding='utf-8') as archivo:
        contenido = archivo.read()
    
    # Patrón para encontrar el bloque de registro de historial en el endpoint patch
    patron_inicio = r"# Registrar los cambios en el historial\s+for campo, nuevo_valor in raw_data\.items\(\):"
    patron_fin = r"changes=json\.dumps\(cambios_json\)\s+\)"
    
    # Buscar el bloque
    match = re.search(f"{patron_inicio}.*?{patron_fin}", contenido, re.DOTALL)
    
    if match:
        bloque_original = match.group(0)
        
        # Crear el nuevo bloque que usa el servicio
        bloque_nuevo = """# Registrar los cambios en el historial usando el servicio externo
        for campo, nuevo_valor in raw_data.items():
            # El servicio maneja sus propias excepciones y no afecta a la operación principal
            await registrar_historial_animal(
                animal=animal,
                usuario=current_user.username,
                campo=campo,
                valor_anterior=valores_anteriores.get(campo),
                nuevo_valor=nuevo_valor
            )"""
        
        # Reemplazar el bloque original
        contenido_nuevo = contenido.replace(bloque_original, bloque_nuevo)
        
        # Guardar el archivo modificado
        with open(ruta_archivo, 'w', encoding='utf-8') as archivo:
            archivo.write(contenido_nuevo)
        
        print("✅ Endpoint update_animal_patch conectado con el servicio de historial.")
        return True
    else:
        print("❌ No se pudo encontrar el bloque de registro de historial en el endpoint patch.")
        return False

def conectar_endpoint_put():
    """Conecta el endpoint update_animal con el servicio de historial"""
    with open(ruta_archivo, 'r', encoding='utf-8') as archivo:
        contenido = archivo.read()
    
    # Patrón similar para el método PUT
    patron_inicio_put = r"# Registrar los cambios en el historial\s+for campo, nuevo_valor in update_data\.items\(\):"
    patron_fin_put = r"changes=json\.dumps\(cambios_json\)\s+\)"
    
    # Buscar el bloque
    match = re.search(f"{patron_inicio_put}.*?{patron_fin_put}", contenido, re.DOTALL)
    
    if match:
        bloque_original = match.group(0)
        
        # Crear el nuevo bloque que usa el servicio
        bloque_nuevo = """# Registrar los cambios en el historial usando el servicio externo
        for campo, nuevo_valor in update_data.items():
            # El servicio maneja sus propias excepciones y no afecta a la operación principal
            await registrar_historial_animal(
                animal=animal,
                usuario=current_user.username,
                campo=campo,
                valor_anterior=valores_anteriores.get(campo),
                nuevo_valor=nuevo_valor
            )"""
        
        # Reemplazar el bloque original
        contenido_nuevo = contenido.replace(bloque_original, bloque_nuevo)
        
        # Guardar el archivo modificado
        with open(ruta_archivo, 'w', encoding='utf-8') as archivo:
            archivo.write(contenido_nuevo)
        
        print("✅ Endpoint update_animal conectado con el servicio de historial.")
        return True
    else:
        print("❓ No se encontró el patrón esperado en el endpoint PUT. Es posible que la estructura sea diferente.")
        return False

def conectar_endpoint_post():
    """Conecta el endpoint create_animal con el servicio de historial"""
    with open(ruta_archivo, 'r', encoding='utf-8') as archivo:
        contenido = archivo.read()
    
    # Patrón para el endpoint de creación
    patron_inicio_post = r"# Registrar la creación en el historial\s+history_record = await AnimalHistory\.create\("
    patron_fin_post = r"changes=json\.dumps\(\{\"creacion\": animal_data\}\)\s+\)"
    
    # Buscar el bloque
    match = re.search(f"{patron_inicio_post}.*?{patron_fin_post}", contenido, re.DOTALL)
    
    if match:
        bloque_original = match.group(0)
        
        # Crear el nuevo bloque que usa el servicio
        bloque_nuevo = """# Registrar la creación en el historial usando el servicio externo
        await registrar_creacion_animal(
            animal=new_animal,
            usuario=current_user.username,
            datos_creacion=animal_data
        )"""
        
        # Reemplazar el bloque original
        contenido_nuevo = contenido.replace(bloque_original, bloque_nuevo)
        
        # Guardar el archivo modificado
        with open(ruta_archivo, 'w', encoding='utf-8') as archivo:
            archivo.write(contenido_nuevo)
        
        print("✅ Endpoint create_animal conectado con el servicio de historial.")
        return True
    else:
        print("❓ No se encontró el patrón esperado en el endpoint POST. Es posible que la estructura sea diferente.")
        return False

def ejecutar():
    """Ejecuta todas las modificaciones"""
    print("🔄 Conectando el servicio de historial con los endpoints...")
    
    # Realizar una copia de seguridad primero
    import shutil
    from datetime import datetime
    backup_path = f"{ruta_archivo}.bak.{datetime.now().strftime('%Y%m%d%H%M%S')}"
    shutil.copy2(ruta_archivo, backup_path)
    print(f"✅ Copia de seguridad realizada: {backup_path}")
    
    # Verificar si ya se han añadido los imports
    if not verificar_imports():
        if añadir_imports():
            print("👍 Imports añadidos correctamente.")
        else:
            print("❌ No se pudieron añadir los imports.")
            return False
    
    # Conectar los endpoints con el servicio
    if conectar_endpoint_patch():
        print("👍 Endpoint PATCH conectado correctamente.")
    
    if conectar_endpoint_put():
        print("👍 Endpoint PUT conectado correctamente.")
    
    if conectar_endpoint_post():
        print("👍 Endpoint POST conectado correctamente.")
    
    print("\n✅ Proceso completado. El sistema ahora usa el servicio compartimentado de historial.")
    print("La lógica principal de actualización de animales sigue intacta y funcionará aunque falle el historial.")
    return True

if __name__ == "__main__":
    ejecutar()
