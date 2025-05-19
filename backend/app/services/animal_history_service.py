"""
Servicio para manejar el historial de animales sin afectar al módulo principal.
Este módulo complementario se encarga solo del registro en el historial.
"""
import json
from datetime import datetime
import logging
from typing import Dict, Any, Optional

from app.models.animal import Animal, AnimalHistory

# Configurar el logger
logger = logging.getLogger(__name__)

async def registrar_historial_animal(
    animal: Animal,
    usuario: str,
    campo: str,
    valor_anterior: Any,
    nuevo_valor: Any,
    description: Optional[str] = None
) -> Optional[AnimalHistory]:
    """
    Registra un cambio en el historial de un animal de forma aséptica.
    Esta función maneja sus propias excepciones y nunca falla la operación principal.
    
    Args:
        animal: Instancia del animal que se está modificando
        usuario: Nombre del usuario que realiza el cambio
        campo: Campo que se está modificando
        valor_anterior: Valor anterior del campo
        nuevo_valor: Nuevo valor del campo
        description: Descripción personalizada (opcional)
    
    Returns:
        Instancia de AnimalHistory si se creó correctamente, None si falló
    """
    try:
        # Convertir fechas a formato legible
        if campo == 'dob' and valor_anterior:
            valor_anterior = valor_anterior.strftime("%d/%m/%Y") if hasattr(valor_anterior, 'strftime') else str(valor_anterior)
        if campo == 'dob' and nuevo_valor:
            nuevo_valor = nuevo_valor.strftime("%d/%m/%Y") if hasattr(nuevo_valor, 'strftime') else str(nuevo_valor)
        
        # Crear descripción del cambio si no se proporciona una
        if not description:
            if campo == 'estado':
                description = f"Actualización de estado: {valor_anterior} → {nuevo_valor}"
            elif campo == 'alletar':
                description = f"Cambio de estado de amamantamiento: {valor_anterior} → {nuevo_valor}"
            elif campo == 'origen':
                description = f"Cambio de cuadra: {valor_anterior} → {nuevo_valor}"
            else:
                description = f"Actualización de {campo}"
        
        # Si la descripción está vacía, usar un valor predeterminado
        if not description:
            description = f"Actualización de {campo} sin detalles"
        
        # Crear la estructura JSON para el cambio
        cambios_json = {campo: {"anterior": str(valor_anterior) if valor_anterior is not None else None, 
                              "nuevo": str(nuevo_valor) if nuevo_valor is not None else None}}
        
        # Crear el registro en el historial
        logger.info(f"Creando registro de historial para campo {campo} del animal {animal.nom}")
        history_record = await AnimalHistory.create(
            # Campos del formato antiguo
            animal=animal,
            usuario=usuario,
            cambio=description,
            campo=campo,
            valor_anterior=str(valor_anterior) if valor_anterior is not None else None,
            valor_nuevo=str(nuevo_valor) if nuevo_valor is not None else None,
            
            # Campos del nuevo formato extendido
            action="UPDATE",
            timestamp=datetime.now(),
            field=campo,
            description=description,
            old_value=str(valor_anterior) if valor_anterior is not None else None,
            new_value=str(nuevo_valor) if nuevo_valor is not None else None,
            changes=json.dumps(cambios_json)
        )
        logger.info(f"✅ Registro de historial creado con ID: {history_record.id}")
        return history_record
    
    except Exception as e:
        logger.error(f"❌ Error al registrar historial para {campo}: {str(e)}")
        # No lanzamos la excepción para no afectar la operación principal
        return None

async def registrar_multiples_cambios(
    animal: Animal,
    usuario: str,
    cambios: Dict[str, Dict[str, Any]]
) -> int:
    """
    Registra múltiples cambios en el historial de un animal.
    
    Args:
        animal: Instancia del animal que se está modificando
        usuario: Nombre del usuario que realiza los cambios
        cambios: Diccionario de cambios en el formato {campo: {"anterior": valor_anterior, "nuevo": nuevo_valor}}
    
    Returns:
        Número de registros creados correctamente
    """
    registros_creados = 0
    
    try:
        logger.info(f"Iniciando registro de historial para {len(cambios)} campos en el animal {animal.nom}")
        
        for campo, valores in cambios.items():
            valor_anterior = valores.get("anterior")
            nuevo_valor = valores.get("nuevo")
            
            history_record = await registrar_historial_animal(
                animal=animal,
                usuario=usuario,
                campo=campo,
                valor_anterior=valor_anterior,
                nuevo_valor=nuevo_valor
            )
            
            if history_record:
                registros_creados += 1
        
        logger.info(f"✅ Creados {registros_creados} de {len(cambios)} registros de historial")
        return registros_creados
    
    except Exception as e:
        logger.error(f"❌ Error general al registrar múltiples cambios: {str(e)}")
        return registros_creados

async def registrar_creacion_animal(
    animal: Animal,
    usuario: str,
    datos_creacion: Dict[str, Any]
) -> Optional[AnimalHistory]:
    """
    Registra la creación de un animal en el historial.
    
    Args:
        animal: Instancia del animal recién creado
        usuario: Nombre del usuario que creó el animal
        datos_creacion: Datos utilizados para crear el animal
    
    Returns:
        Instancia de AnimalHistory si se creó correctamente, None si falló
    """
    try:
        logger.info(f"Registrando creación del animal {animal.nom}")
        
        history_record = await AnimalHistory.create(
            animal=animal,
            usuario=usuario,
            cambio=f"Creación del animal {animal.nom}",
            campo="creacion",
            valor_anterior=None,
            valor_nuevo=animal.nom,
            
            # Campos del nuevo formato extendido
            action="CREATE",
            timestamp=datetime.now(),
            field="creacion",
            description=f"Creación del animal {animal.nom}",
            old_value=None,
            new_value=animal.nom,
            changes=json.dumps({"creacion": datos_creacion})
        )
        
        logger.info(f"✅ Registro de creación añadido con ID: {history_record.id}")
        return history_record
    
    except Exception as e:
        logger.error(f"❌ Error al registrar la creación del animal: {str(e)}")
        return None
