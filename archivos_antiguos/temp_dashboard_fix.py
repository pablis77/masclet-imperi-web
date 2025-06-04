@router.get("/partos", response_model=PartosResponse)
async def get_partos_stats(
    explotacio: Optional[str] = Query(None, description="Valor del campo 'explotacio' para filtrar (opcional)"),
    animal_id: Optional[int] = Query(None, description="ID del animal (opcional)"),
    start_date: Optional[date] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Fecha de fin (YYYY-MM-DD)"),
    current_user = Depends(get_current_user)  # Requerimos autenticación
):
    """
    Análisis detallado de partos.
    
    Incluye:
    - Métricas temporales (distribución por meses/años)
    - Tasas de éxito
    - Estadísticas por género
    - Análisis por animal
    """
    try:
        # Verificar que el usuario tiene acceso a las estadísticas
        if explotacio and not verify_user_role(current_user, [UserRole.ADMIN, UserRole.GERENTE]):
            # Para usuarios no admin o gerente, solo pueden ver sus explotaciones asignadas
            # Verificar de forma segura si el usuario tiene atributo explotacio
            user_explotacio = getattr(current_user, 'explotacio', None)
            if user_explotacio is None or user_explotacio != explotacio:
                logger.warning(f"Usuario {current_user.username} intentó acceder a explotación {explotacio} sin permisos")
                raise HTTPException(
                    status_code=403, 
                    detail="No tienes permisos para ver estadísticas de esta explotación"
                )
                
        # Si el usuario es GERENTE (Ramon), tiene acceso completo a todas las explotaciones
        # No se requieren verificaciones adicionales
