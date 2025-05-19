#!/usr/bin/env python
"""
Script para probar la inserción de partos directamente
"""
import asyncio
import sys
import os
import random
from datetime import date, datetime
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)7s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# Aseguramos que estamos en el contexto correcto
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from tortoise import Tortoise
from tortoise.transactions import in_transaction

# URL de la base de datos
DB_URL = "postgres://postgres:1234@localhost:5432/masclet_imperi"

async def init_db():
    """Inicializar la conexión a la base de datos"""
    logger.info(f"URL de base de datos: {DB_URL}")
    
    try:
        # Inicializar ORM
        await Tortoise.init(
            db_url=DB_URL,
            modules={"models": ["app.models.animal", "app.models.explotacio", "app.models.import_model"]}
        )
        logger.info("Base de datos conectada")
    except Exception as e:
        logger.error(f"Error al conectar a la base de datos: {str(e)}")
        raise

async def test_insert_parto():
    """Probar diferentes métodos de inserción de partos"""
    from app.models.animal import Animal, Part
    
    # 1. Obtener todas las vacas
    vacas = await Animal.filter(genere="F").all()
    if not vacas:
        logger.error("No hay vacas en la base de datos!")
        return
    
    logger.info(f"Se encontraron {len(vacas)} vacas")
    vaca = vacas[0]  # Usamos la primera vaca
    logger.info(f"Usando vaca: {vaca.nom} (ID: {vaca.id})")
    
    # Fecha para el parto de prueba
    fecha_parto = date(2023, 1, 1)
    
    # 2. MÉTODO 1: Usando el ORM directamente
    try:
        logger.info("MÉTODO 1: Creando parto usando ORM...")
        parto1 = await Part.create(
            animal_id=vaca.id,
            part=fecha_parto,
            GenereT="F",
            EstadoT="OK"
        )
        logger.info(f"¡ÉXITO! Parto creado con ID: {parto1.id}")
    except Exception as e:
        logger.error(f"ERROR en MÉTODO 1: {str(e)}")
    
    # 3. MÉTODO 2: Usando el objeto animal directamente
    try:
        logger.info("MÉTODO 2: Creando parto usando objeto animal...")
        parto2 = await Part.create(
            animal=vaca,
            part=date(2023, 2, 1),
            GenereT="M",
            EstadoT="OK"
        )
        logger.info(f"¡ÉXITO! Parto creado con ID: {parto2.id}")
    except Exception as e:
        logger.error(f"ERROR en MÉTODO 2: {str(e)}")
    
    # 4. MÉTODO 3: Usando SQL directo en una transacción
    try:
        logger.info("MÉTODO 3: Creando parto usando SQL directo...")
        async with in_transaction() as connection:
            sql = """INSERT INTO part (animal_id, part, "GenereT", "EstadoT", created_at, updated_at) 
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id"""
            
            now = datetime.now()
            row = await connection.execute_query_single(
                sql, 
                [vaca.id, date(2023, 3, 1), "F", "OK", now, now]
            )
            logger.info(f"¡ÉXITO! Parto creado con SQL directo, ID: {row[0]}")
    except Exception as e:
        logger.error(f"ERROR en MÉTODO 3: {str(e)}")
    
    # 5. Verificar partos
    partos = await Part.filter(animal_id=vaca.id).all()
    logger.info(f"Partos encontrados para vaca {vaca.nom}: {len(partos)}")
    for p in partos:
        logger.info(f"  - ID: {p.id}, Fecha: {p.part}, Género: {p.GenereT}")
    
    # 6. Verificar recuento total
    total_partos = await Part.all().count()
    logger.info(f"Total de partos en la base de datos: {total_partos}")

async def main():
    """Función principal"""
    await init_db()
    try:
        await test_insert_parto()
    finally:
        await Tortoise.close_connections()
        logger.info("Conexión a base de datos cerrada")

if __name__ == "__main__":
    asyncio.run(main())
