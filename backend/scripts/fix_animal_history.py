"""
Este script contiene la versión corregida del endpoint update_animal_patch
para asegurar que el registro del historial no interfiere con la actualización
del animal.
"""

update_animal_patch_fixed = """
@router.patch("/animals/{animal_id}", response_model=schemas.AnimalResponse)
async def update_animal_patch(
    animal_id: int,
    animal_data: schemas.AnimalUpdate,
    request: Request,
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_user),
):
    """
    Actualizar parcialmente un animal por ID (método PATCH)
    """
    # Verificar que el animal existe
    animal = await Animal.get_or_none(id=animal_id)
    if not animal:
        raise HTTPException(
            status_code=404,
            detail=f"Animal con ID {animal_id} no encontrado"
        )
    
    # Log para depuración detallada
    logger.info(f"Recibida solicitud PATCH para animal ID {animal_id}")
    logger.info(f"Datos recibidos (raw): {animal_data}")
    
    try:
        # Obtener datos directamente del request en lugar de depender de Pydantic
        request_data = await request.json()
        logger.info(f"Datos recibidos directamente del request: {request_data}")
        
        # Procesar todos los campos en la solicitud PATCH, incluyendo null (que indica borrar)
        raw_data = {}
        for field, value in request_data.items():
            # Incluimos todos los campos, incluso los null, ya que un null explícito
            # es una instrucción para borrar el valor actual
            raw_data[field] = value
        
        logger.info(f"Datos procesados para actualización (dict): {raw_data}")
        logger.info(f"Campos a actualizar: {list(raw_data.keys())}")
    except Exception as e:
        # Si hay error leyendo el JSON, usar los datos de Pydantic como fallback
        logger.warning(f"No se pudo leer JSON del request: {str(e)}. Usando datos de Pydantic.")
        try:
            # Intentar acceder a _json usando __dict__
            if hasattr(animal_data, '__dict__'):
                raw_data = {k: v for k, v in animal_data.__dict__.items() 
                           if not k.startswith('_') and v is not None}
            else:
                raw_data = {k: getattr(animal_data, k) for k in animal_data.__fields__
                          if getattr(animal_data, k) is not None}
            logger.info(f"Datos desde Pydantic: {raw_data}")
        except Exception as e2:
            logger.error(f"Error al procesar datos de animal: {str(e2)}")
            raw_data = {}
            # Extraer manualmente los campos más importantes
            if hasattr(animal_data, 'mare'):
                raw_data['mare'] = animal_data.mare
    
    # Si no hay datos para actualizar, devolver el animal sin cambios
    if not raw_data:
        logger.warning(f"No se recibieron campos para actualizar el animal {animal_id}")
        return {
            "status": "success",
            "data": await animal.to_dict()
        }
    
    # Guardar valores anteriores para el historial
    valores_anteriores = {}
    
    try:
        # Procesar fecha de nacimiento si está presente
        if 'dob' in raw_data and raw_data['dob']:
            try:
                raw_data["dob"] = DateConverter.to_db_format(raw_data['dob'])
                logger.info(f"Campo 'dob' convertido: {raw_data['dob']} -> {raw_data['dob']}")
            except ValueError as e:
                logger.error(f"Error al convertir fecha 'dob': {e}")
                raise HTTPException(status_code=400, detail=str(e))
        
        # Validación especial para alletar
        if "alletar" in raw_data and raw_data["alletar"] is not None:
            # Si es macho, solo puede ser "0"
            if animal.genere == Genere.MASCLE.value and raw_data["alletar"] != EstadoAlletar.NO_ALLETAR.value:
                raise HTTPException(
                    status_code=422,
                    detail=f"Los machos solo pueden tener estado de amamantamiento '{EstadoAlletar.NO_ALLETAR.value}' (sin amamantar)"
                )
        
        # Guardar valores anteriores para todos los campos que se van a actualizar
        for campo in raw_data.keys():
            if hasattr(animal, campo):
                valores_anteriores[campo] = getattr(animal, campo)
        
        # FASE 1: Actualización directa usando el método update() de Tortoise ORM
        # Esto actualiza sólo los campos enviados sin validar los demás
        await Animal.filter(id=animal_id).update(**raw_data)
        
        # Recargar el animal para tener los datos actualizados
        animal = await Animal.get(id=animal_id)
        
        # FASE 2: Registrar los cambios en el historial
        # Esta fase no debe interferir con la actualización del animal
        logger.info(f"Iniciando registro de historial para {len(raw_data)} campos actualizados")
        for campo, nuevo_valor in raw_data.items():
            try:
                logger.info(f"Procesando historial para campo: {campo} = {nuevo_valor}")
                valor_anterior = valores_anteriores.get(campo)
                logger.info(f"Valor anterior: {valor_anterior}")
                
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
                    descripcion = f"Actualización de {campo} sin detalles"
                
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
                    logger.info(f"✅ Registro de historial creado con ID: {history_record.id}")
                except Exception as e:
                    logger.error(f"❌ Error al crear registro en la base de datos: {str(e)}")
            except Exception as e:
                logger.error(f"❌ Error general al procesar el campo {campo}: {str(e)}")
                # No interrumpimos el flujo principal si hay error en el historial
        
        # Disparar backup automático tras la modificación
        if background_tasks and len(raw_data) > 0:
            await trigger_backup_after_change(background_tasks, "modificación (PATCH)", animal.nom)
            logger.info(f"Programando backup automático tras modificación (PATCH) del animal {animal.nom}")
        
        # Devolver el animal actualizado
        return {
            "status": "success",
            "data": await animal.to_dict()
        }
        
    except HTTPException as e:
        # Re-lanzar excepciones HTTP para que FastAPI las maneje correctamente
        raise
    except ValidationError as e:
        logger.error(f"Error de validación: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Error actualizando animal {animal_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error interno al actualizar animal: {str(e)}"
        )
"""

# Instrucciones para aplicar el fix:
"""
Para aplicar la corrección:

1. Localiza el archivo C:\\Proyectos\\claude\\masclet-imperi-web\\backend\\app\\api\\endpoints\\animals.py
2. Encuentra la función update_animal_patch
3. Reemplázala completamente con la versión corregida que implementa 
   el manejo de excepciones para que el historial no interfiera con la actualización

La clave está en:
- Separar claramente las dos fases: primero actualización, luego historial
- Manejar las excepciones en el historial sin que afecten a la actualización principal
- Proporcionar valores por defecto para evitar errores en campos obligatorios
"""
