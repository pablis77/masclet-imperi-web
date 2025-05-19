"""
Implementación corregida para el endpoint de dashboard combinado.
Copia este código en app/api/endpoints/dashboard.py para corregir los errores:
- Error 500 cuando se intenta acceder a current_user.explotacio y current_user no tiene ese atributo
- Falta de autenticación en el endpoint combined
"""

@router.get("/combined", response_model=CombinedDashboardResponse)
async def get_combined_stats(
    explotacio: Optional[str] = Query(None, description="Valor del campo 'explotacio' para filtrar (opcional)"),
    start_date: Optional[date] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Fecha de fin (YYYY-MM-DD)"),
    current_user = Depends(get_current_user)  # Requerimos autenticación (ya no es opcional)
):
    """
    Vista consolidada de todas las estadísticas.
    
    Incluye:
    - Estadísticas de animales
    - Estadísticas de partos
    - Estadísticas por cuadra
    - Indicadores de rendimiento
    - Tendencias temporales
    """
    try:
        # Verificar que el usuario tiene acceso a las estadísticas
        if explotacio and not verify_user_role(current_user, [UserRole.ADMIN]):
            # Para usuarios no admin, solo pueden ver sus explotaciones asignadas
            # Verificamos de forma segura si el usuario tiene el atributo explotacio
            user_explotacio = getattr(current_user, 'explotacio', None)
            
            if user_explotacio is None or user_explotacio != explotacio:
                logger.warning(f"Usuario {current_user.username} intentó acceder a explotación {explotacio} sin permisos")
                raise HTTPException(
                    status_code=403, 
                    detail="No tienes permisos para ver estadísticas de esta explotación"
                )
        
        # Obtener estadísticas reales de la base de datos
        stats = await get_combined_dashboard(
            explotacio=explotacio,
            start_date=start_date,
            end_date=end_date
        )
        return stats
    except HTTPException:
        # Re-lanzar las excepciones HTTP para que mantengan su código original
        raise
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error en combined stats: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error obteniendo estadísticas combinadas")
