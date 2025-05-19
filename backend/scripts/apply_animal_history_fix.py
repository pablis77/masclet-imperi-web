"""
Script para aplicar automáticamente la corrección del historial de animales
"""
import os
import re

# Ruta al archivo de endpoints de animales
ruta_archivo = os.path.join(os.getcwd(), "backend", "app", "api", "endpoints", "animals.py")

def aplicar_correccion():
    """Aplica la corrección para las fases de edición y registro de historial en animals.py"""
    # Leer el contenido actual del archivo
    with open(ruta_archivo, 'r', encoding='utf-8') as archivo:
        contenido = archivo.read()
    
    # Patrón para identificar el bloque del registro de historial
    patron_inicio = r"# Registrar los cambios en el historial\s+for campo, nuevo_valor in raw_data\.items\(\):"
    # Patrón para identificar el final de ese bloque (donde termina el bloque de creación de historial)
    patron_fin = r"changes=json\.dumps\(cambios_json\)\s+\)\s+"
    
    # Buscar las coincidencias
    match_inicio = re.search(patron_inicio, contenido)
    match_fin = re.search(patron_fin, contenido)
    
    if match_inicio and match_fin:
        # Extraer el bloque a modificar
        inicio_pos = match_inicio.start()
        fin_pos = match_fin.end()
        bloque_original = contenido[inicio_pos:fin_pos]
        
        # Crear el nuevo bloque con try-except
        bloque_nuevo = """# FASE 2: Registrar los cambios en el historial (No debe afectar a la fase 1)
        logger.info(f"Iniciando registro de historial para {len(raw_data)} campos actualizados")
        for campo, nuevo_valor in raw_data.items():
            try:
                logger.info(f"Procesando historial para campo: {campo} = {nuevo_valor}")
                valor_anterior = valores_anteriores.get(campo)
                
                # Convertir fechas a formato legible
                if campo == 'dob' and valor_anterior:
                    valor_anterior = valor_anterior.strftime("%d/%m/%Y") if hasattr(valor_anterior, 'strftime') else str(valor_anterior)
                if campo == 'dob' and nuevo_valor:
                    nuevo_valor = nuevo_valor.strftime("%d/%m/%Y") if hasattr(nuevo_valor, 'strftime') else str(nuevo_valor)
                    
                # Crear descripción del cambio
                if campo == 'estado':
                    descripcion = f"Actualización de estado: {valor_anterior} → {nuevo_valor}"
                elif campo == 'alletar':
                    descripcion = f"Cambio de estado de amamantamiento: {valor_anterior} → {nuevo_valor}"
                elif campo == 'origen':
                    descripcion = f"Cambio de cuadra: {valor_anterior} → {nuevo_valor}"
                else:
                    descripcion = f"Actualización de {campo}"
                
                # Si la descripción está vacía, usar un valor predeterminado
                if not descripcion:
                    descripcion = "Actualización sin detalles"
                    
                # Registrar en historial con compatibilidad para ambos formatos
                # (antiguo y nuevo esquema extendido)
                cambios_json = {campo: {"anterior": str(valor_anterior) if valor_anterior is not None else None, 
                                    "nuevo": str(nuevo_valor) if nuevo_valor is not None else None}}
                
                try:
                    logger.info(f"Creando registro de historial para campo {campo}")
                    history_record = await AnimalHistory.create(
                        # Campos del formato antiguo
                        animal=animal,
                        usuario=current_user.username,
                        cambio=descripcion,
                        campo=campo,
                        valor_anterior=str(valor_anterior) if valor_anterior is not None else None,
                        valor_nuevo=str(nuevo_valor) if nuevo_valor is not None else None,
                        
                        # Campos del nuevo formato extendido
                        action="UPDATE",
                        timestamp=datetime.now(),
                        field=campo,
                        description=descripcion,
                        old_value=str(valor_anterior) if valor_anterior is not None else None,
                        new_value=str(nuevo_valor) if nuevo_valor is not None else None,
                        changes=json.dumps(cambios_json)
                    )
                    logger.info(f"✅ Registro de historial creado con ID: {history_record.id if history_record else 'desconocido'}")
                except Exception as e_db:
                    logger.error(f"❌ Error al crear registro en la base de datos: {str(e_db)}")
            except Exception as e:
                logger.error(f"❌ Error general al procesar el campo {campo}: {str(e)}")
                # No interrumpimos el flujo principal si hay error en el historial"""
        
        # Reemplazar el bloque original con el nuevo
        contenido_nuevo = contenido.replace(bloque_original, bloque_nuevo)
        
        # También actualizar la parte de actualización para indicar que es la fase 1
        patron_actualizacion = r"# Actualización directa usando el método update\(\) de Tortoise ORM"
        bloque_actualizacion = "# FASE 1: Actualización directa usando el método update() de Tortoise ORM"
        contenido_nuevo = contenido_nuevo.replace(patron_actualizacion, bloque_actualizacion)
        
        # Guardar el archivo modificado
        with open(ruta_archivo, 'w', encoding='utf-8') as archivo:
            archivo.write(contenido_nuevo)
        
        print("✅ Corrección aplicada correctamente.")
        print("   - Se ha implementado la separación de fases")
        print("   - La fase de edición ya no depende del registro de historial")
        print("   - Se han añadido logs detallados para diagnosticar problemas")
        return True
    else:
        print("❌ No se pudo encontrar el bloque a modificar en el archivo.")
        return False

if __name__ == "__main__":
    print("Aplicando corrección al historial de animales...")
    resultado = aplicar_correccion()
    if resultado:
        print("\nRECOMENDACIÓN: Reiniciar el servidor backend para aplicar los cambios.")
    else:
        print("\nERROR: No se pudo aplicar la corrección automáticamente.")
        print("Por favor, revisa el archivo manualmente: " + ruta_archivo)
