from typing import Dict, List
from datetime import date
from tortoise.transactions import atomic
from app.models.animal import Animal, Part  # Importamos Part desde animal.py
from app.models.explotacio import Explotacio  # Importamos el modelo Explotacio
from fastapi import HTTPException

@atomic()
async def import_animal_with_partos(data: dict) -> Animal:
    """
    Importa un animal y sus partos desde el CSV.
    Args:
        data (dict): Datos del animal y posible parto
    Returns:
        Animal: Instancia del animal creado/actualizado
    Raises:
        HTTPException: Si hay errores de validación
    """
    try:
        # Validar género
        if data.get('genere') == 'M' and (data.get('part') or data.get('alletar')):
            raise HTTPException(
                status_code=400,
                detail="Los machos no pueden tener partos ni amamantar"
            )

        # Procesamos la explotación: convertir nombre a objeto
        if 'explotacio' in data:
            explotacio_nom = data.pop('explotacio')
            if not explotacio_nom:
                raise HTTPException(
                    status_code=400,
                    detail="Se requiere especificar una explotación válida"
                )
            
            # Buscar la explotación por nombre
            explotacio = await Explotacio.filter(nom=explotacio_nom).first()
            if not explotacio:
                raise HTTPException(
                    status_code=400,
                    detail=f"No se encontró la explotación: {explotacio_nom}"
                )
            
            # Añadir la instancia de explotación a los datos
            data['explotacio'] = explotacio

        # Datos básicos del animal (sin info de partos)
        animal_data = {
            k: v for k, v in data.items() 
            if k not in ['part', 'genere_t', 'estado_t', 'genereT', 'estadoT']
        }
        
        # Buscar o crear animal
        animal = await get_or_create_animal(animal_data)

        # Procesar parto si existe
        if data.get('part'):
            # Validar que existan los datos necesarios para el parto
            genere_cria = data.get('genere_t', data.get('genereT'))
            estado_cria = data.get('estado_t', data.get('estadoT', 'OK'))
            
            if not genere_cria:
                raise HTTPException(
                    status_code=400,
                    detail="Para registrar un parto se requiere el género del ternero (genere_t/genereT)"
                )
            
            await add_parto(animal, {
                'fecha': data['part'],
                'genere_cria': genere_cria,
                'estado_cria': estado_cria
            })

        return animal

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error importando animal: {str(e)}"
        )

async def get_or_create_animal(data: Dict) -> Animal:
    """Busca o crea un animal por num_serie o nom"""
    existing_animal = None
    
    if data.get('num_serie'):
        existing_animal = await Animal.filter(num_serie=data['num_serie']).first()
    
    if not existing_animal and data.get('nom'):
        existing_animal = await Animal.filter(nom=data['nom']).first()
    
    if existing_animal:
        # Actualizar datos si es necesario
        for key, value in data.items():
            setattr(existing_animal, key, value)
        await existing_animal.save()
        return existing_animal
    
    return await Animal.create(**data)

async def add_parto(animal: Animal, parto_data: Dict) -> Part:
    """
    Registra un parto para el animal.
    """
    # Calcular número de parto usando el modelo Part:
    num_partos = await Part.filter(animal=animal).count()

    # Crear el parto usando los datos proporcionados.
    # Asegurarse que el campo usado para la FK es 'animal'
    parto_instance = await Part.create(
        animal=animal,
        numero_part=num_partos + 1,  # Incrementar el número de parto
        data=parto_data['fecha'],
        genere_fill=parto_data['genere_cria'],
        estat_fill=parto_data.get('estado_cria', 'OK')
    )
    
    return parto_instance