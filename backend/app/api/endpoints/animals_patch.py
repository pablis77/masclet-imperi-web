@router.patch("/{animal_id}", response_model=AnimalResponse)
async def update_animal_patch(
    animal_id: int, 
    animal_data: AnimalUpdate,
    current_user: User = Depends(get_current_user)
) -> dict:
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
    
    # Obtener solo los campos que se enviaron explícitamente
    # El esquema AnimalUpdate ya tiene exclude_unset=True por defecto
    raw_data = animal_data.model_dump()
    logger.info(f"PATCH animal ID={animal_id}: Datos recibidos={raw_data}")
    
    # Si no hay datos para actualizar, devolver el animal sin cambios
    if not raw_data:
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
        
        # Usar una consulta SQL directa para actualizar solo los campos enviados
        # Esto evita completamente la validación de campos no enviados
        conn = animal._meta.db
        table = animal._meta.db_table
        
        # Construir la consulta de actualización
        query_params = []
        set_statements = []
        
        for campo, valor in raw_data.items():
            if hasattr(animal, campo):
                set_statements.append(f'"{campo}" = ${len(query_params) + 1}')
                query_params.append(valor)
        
        if not set_statements:
            # No hay campos para actualizar
            return {
                "status": "success",
                "data": await animal.to_dict()
            }
        
        # Añadir updated_at a la actualización
        set_statements.append('"updated_at" = NOW()')
        
        # Construir y ejecutar la consulta SQL
        query = f'UPDATE "{table}" SET {", ".join(set_statements)} WHERE "id" = ${len(query_params) + 1}'
        query_params.append(animal_id)
        
        await conn.execute_query(query, query_params)
        
        # Recargar el animal para tener los datos actualizados
        animal = await Animal.get(id=animal_id)
        
        # Registrar los cambios en el historial
        for campo, nuevo_valor in raw_data.items():
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
            elif campo == 'quadra':
                descripcion = f"Cambio de cuadra: {valor_anterior} → {nuevo_valor}"
            else:
                descripcion = f"Actualización de {campo}"
                
            # Registrar en historial
            await AnimalHistory.create(
                animal=animal,
                usuario=current_user.username,
                cambio=descripcion,
                campo=campo,
                valor_anterior=str(valor_anterior) if valor_anterior is not None else None,
                valor_nuevo=str(nuevo_valor) if nuevo_valor is not None else None
            )
            
        return {
            "status": "success",
            "data": await animal.to_dict()
        }
    
    except Exception as e:
        logger.error(f"Error al actualizar animal {animal_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar animal: {str(e)}"
        )
