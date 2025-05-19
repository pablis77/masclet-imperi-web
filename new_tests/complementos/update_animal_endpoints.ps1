# Script para actualizar los endpoints de animales con un correcto registro de historial
# Autor: Cascade AI
# Fecha: 19/05/2025

Write-Host "Iniciando actualización de endpoints para correcto registro del historial..." -ForegroundColor Green

# Ruta al archivo de endpoints de animales
$animalsEndpointsPath = "C:\Proyectos\claude\masclet-imperi-web\backend\app\api\endpoints\animals.py"

# Verificar que el archivo existe
if (-not (Test-Path $animalsEndpointsPath)) {
    Write-Host "ERROR: No se encuentra el archivo $animalsEndpointsPath" -ForegroundColor Red
    exit 1
}

# Leer el contenido actual del archivo
$content = Get-Content -Path $animalsEndpointsPath -Raw

# 1. Actualizar la función delete_animal para registrar en el historial
Write-Host "Actualizando función delete_animal..." -ForegroundColor Yellow

$oldDeleteFunction = @"
@router.delete("/{animal_id}", status_code=204)
async def delete_animal(animal_id: int) -> None:
    """Eliminar un animal"""
    try:
        animal = await Animal.get_or_none(id=animal_id)
        if not animal:
            raise HTTPException(
                status_code=404,
                detail=f"Animal {animal_id} no encontrado"
            )
            
        await animal.delete()
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error eliminando animal {animal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
"@

$newDeleteFunction = @"
@router.delete("/{animal_id}", status_code=204)
async def delete_animal(
    animal_id: int,
    current_user: User = Depends(get_current_user)
) -> None:
    """Eliminar un animal"""
    try:
        # Verificar que el usuario tiene permisos para eliminar animales
        await check_permissions(current_user, Action.BORRAR)
        
        animal = await Animal.get_or_none(id=animal_id)
        if not animal:
            raise HTTPException(
                status_code=404,
                detail=f"Animal {animal_id} no encontrado"
            )
        
        # Guardar información del animal antes de eliminarlo
        animal_info = await animal.to_dict(include_partos=False)
        
        # Registrar la eliminación en el historial
        await AnimalHistory.create(
            animal=animal,
            action="DELETE",
            user=current_user.email if current_user else "sistema",
            description=f"Eliminación del animal {animal.nom}",
            changes=animal_info
        )
            
        await animal.delete()
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error eliminando animal {animal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
"@

# Reemplazar la función delete_animal
$content = $content.Replace($oldDeleteFunction, $newDeleteFunction)

# 2. Actualizar la función get_animal_history para usar el nuevo formato
Write-Host "Actualizando función get_animal_history..." -ForegroundColor Yellow

# Buscar la función get_animal_history actual
$oldHistoryFunction = @"
@router.get("/{animal_id}/history", response_model=List[dict])
async def get_animal_history(
    animal_id: int,
    current_user: User = Depends(get_current_user)
) -> List[dict]:
    """
    Obtener el historial de cambios de un animal
    """
    try:
        # Verificar que el animal existe
        animal = await Animal.get_or_none(id=animal_id)
        if not animal:
            raise HTTPException(
                status_code=404,
                detail=f"Animal con ID {animal_id} no encontrado"
            )
            
        # Obtener el historial de cambios
        historial = await AnimalHistory.filter(animal_id=animal_id).order_by('-id')
        
        # Convertir a diccionarios
        resultado = []
        for registro in historial:
            resultado.append(await registro.to_dict())
            
        return resultado
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo historial del animal {animal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener historial: {str(e)}")
"@

$newHistoryFunction = @"
@router.get("/{animal_id}/history", response_model=List[dict])
async def get_animal_history(
    animal_id: int,
    current_user: User = Depends(get_current_user)
) -> List[dict]:
    """
    Obtener el historial de cambios de un animal
    """
    try:
        # Verificar que el animal existe
        animal = await Animal.get_or_none(id=animal_id)
        if not animal:
            raise HTTPException(
                status_code=404,
                detail=f"Animal con ID {animal_id} no encontrado"
            )
            
        # Obtener el historial de cambios ordenado por timestamp descendente
        historial = await AnimalHistory.filter(animal_id=animal_id).order_by('-timestamp', '-id')
        
        # Convertir a diccionarios
        resultado = []
        for registro in historial:
            resultado.append(await registro.to_dict())
            
        return resultado
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo historial del animal {animal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener historial: {str(e)}")
"@

# Reemplazar la función get_animal_history
$content = $content.Replace($oldHistoryFunction, $newHistoryFunction)

# Guardar los cambios en el archivo
Set-Content -Path $animalsEndpointsPath -Value $content

Write-Host "¡Actualización completada con éxito!" -ForegroundColor Green
Write-Host "Ahora los endpoints de animales registrarán correctamente el historial de cambios." -ForegroundColor Green
