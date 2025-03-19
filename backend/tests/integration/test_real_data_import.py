"""
Test de importación y validación de datos reales desde matriz_master.csv
"""
import pytest
import logging
import os
from pathlib import Path
import pandas as pd
from fastapi.testclient import TestClient
from app.main import app
from app.models.animal import Animal
from app.models.animal import Part
from app.models.explotacio import Explotacio
from tortoise.contrib.test import initializer, finalizer

logger = logging.getLogger(__name__)
client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def initialize_tests():
    initializer(
        modules=["app.models.animal", "app.models.parto", "app.models.explotacio"]
    )
    yield
    finalizer()

@pytest.mark.asyncio
async def test_create_explotaciones_from_csv():
    """Test para crear las explotaciones que aparecen en la matriz_master.csv"""
    try:
        # Leer el archivo CSV
        csv_path = Path("database/matriz_master.csv")
        if not os.path.exists(csv_path):
            csv_path = Path("../database/matriz_master.csv")
        
        # Verificar que el archivo existe
        assert os.path.exists(csv_path), f"No se encontró el archivo en {csv_path}"
        
        # Leer el CSV con pandas para extraer las explotaciones únicas
        df = pd.read_csv(csv_path, delimiter=";", encoding="latin-1")
        unique_explotaciones = df["explotaci�"].unique()
        
        # Crear las explotaciones en la base de datos
        explotaciones_created = []
        for expl in unique_explotaciones:
            if expl and not pd.isna(expl):
                explotacion, created = await Explotacio.get_or_create(nom=expl, defaults={"activa": True})
                explotaciones_created.append(expl)
                logger.info(f"Explotación {'creada' if created else 'existente'}: {expl}")
        
        # Verificar que se hayan creado las explotaciones
        all_explotaciones = await Explotacio.all()
        assert len(all_explotaciones) >= len(explotaciones_created)
        
        # Verificar que Gurans esté entre las explotaciones
        gurans_exists = any(expl.nom == "Gurans" for expl in all_explotaciones)
        assert gurans_exists, "No se encontró la explotación 'Gurans'"
        
        logger.info(f"Total de explotaciones creadas: {len(explotaciones_created)}")
        
    except Exception as e:
        logger.error(f"Error creando explotaciones: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_import_animals_from_csv():
    """Test para importar animales desde la matriz_master.csv"""
    try:
        # Leer el archivo CSV
        csv_path = Path("database/matriz_master.csv")
        if not os.path.exists(csv_path):
            csv_path = Path("../database/matriz_master.csv")
        
        # Verificar que el archivo existe
        assert os.path.exists(csv_path), f"No se encontró el archivo en {csv_path}"
        
        # Leer el CSV con pandas
        df = pd.read_csv(csv_path, delimiter=";", encoding="latin-1")
        
        # Contar registros iniciales
        initial_animals = await Animal.all().count()
        
        # Procesar cada fila del CSV
        animals_created = 0
        for _, row in df.iterrows():
            try:
                # Obtener la explotación
                explotacion_nom = row["explotaci�"]
                if pd.isna(explotacion_nom):
                    continue
                
                explotacion = await Explotacio.get_or_none(nom=explotacion_nom)
                if not explotacion:
                    logger.warning(f"No se encontró la explotación: {explotacion_nom}")
                    continue
                
                # Verificar si el animal ya existe por nom y explotación
                existing = await Animal.get_or_none(nom=row["NOM"], explotacio=explotacion)
                if existing:
                    logger.info(f"Animal ya existe: {row['NOM']} en {explotacion_nom}")
                    continue
                
                # Convertir alletar a formato correcto (0, 1, 2)
                alletar = None
                if not pd.isna(row["Alletar"]):
                    if row["Alletar"].lower() == "si":
                        alletar = 1  # Por defecto asumimos 1 ternero
                    elif row["Alletar"].lower() == "no":
                        alletar = 0
                
                # Crear el animal
                animal = await Animal.create(
                    nom=row["NOM"],
                    explotacio=explotacion,
                    genere=row["Genere"],
                    estado=row["Estado"],
                    alletar=alletar,
                    pare=None if pd.isna(row["Pare"]) else row["Pare"],
                    mare=None if pd.isna(row["Mare"]) else row["Mare"],
                    quadra=None if pd.isna(row["Quadra"]) else row["Quadra"],
                    cod=None if pd.isna(row["COD"]) else str(row["COD"]),
                    num_serie=None if pd.isna(row["N� Serie"]) else row["N� Serie"]
                )
                
                animals_created += 1
                logger.info(f"Animal creado: {animal.nom} ({animal.genere}) en {explotacion.nom}")
            
                # Si tiene parto, crear también el registro de parto
                if not pd.isna(row["part"]) and row["genere"] == "F":
                    try:
                        await Part.create(
                            animal=animal,
                            data=row["part"],
                            genere_fill=row["GenereT"] if not pd.isna(row["GenereT"]) else "M",
                            estat_fill=row["EstadoT"] if not pd.isna(row["EstadoT"]) else "OK",
                            numero_part=1  # Por defecto asumimos que es el primer parto
                        )
                        logger.info(f"Parto registrado para {animal.nom}, fecha: {row['part']}")
                    except Exception as part_error:
                        logger.error(f"Error al crear parto: {str(part_error)}")
            
            except Exception as row_error:
                logger.error(f"Error procesando fila {_}: {str(row_error)}")
                continue
        
        # Verificar que se hayan creado animales
        final_animals = await Animal.all().count()
        assert final_animals > initial_animals, "No se crearon nuevos animales"
        
        logger.info(f"Total de animales creados: {animals_created}")
        logger.info(f"Total de animales en BD: {final_animals}")
        
    except Exception as e:
        logger.error(f"Error importando animales: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_verify_gurans_data():
    """Test para verificar específicamente los datos de la explotación Gurans"""
    try:
        # Obtener la explotación Gurans
        gurans = await Explotacio.get_or_none(nom="Gurans")
        assert gurans is not None, "No se encontró la explotación Gurans"
        
        # Contar animales de Gurans
        gurans_animals = await Animal.filter(explotacio=gurans).count()
        logger.info(f"Total animales en Gurans: {gurans_animals}")
        assert gurans_animals > 0, "No hay animales en la explotación Gurans"
        
        # Contar vacas con alletar=true (si)
        vacas_amamantando = await Animal.filter(
            explotacio=gurans,
            genere="F",
            alletar__gt=0
        ).count()
        
        logger.info(f"Vacas amamantando en Gurans: {vacas_amamantando}")
        
        # Contar partos registrados
        partos = await Part.filter(animal__explotacio=gurans).count()
        logger.info(f"Total partos registrados en Gurans: {partos}")
        
        # Verificar algunos animales específicos
        vaca_r32 = await Animal.get_or_none(nom="R-32", explotacio=gurans)
        assert vaca_r32 is not None, "No se encontró la vaca R-32 en Gurans"
        
        # Verificar partos de R-32
        partos_r32 = await Part.filter(animal=vaca_r32).count()
        logger.info(f"Partos de vaca R-32: {partos_r32}")
        
        # Verificar distribución por género
        machos = await Animal.filter(explotacio=gurans, genere="M").count()
        hembras = await Animal.filter(explotacio=gurans, genere="F").count()
        
        logger.info(f"Distribución en Gurans: {machos} machos, {hembras} hembras")
        assert machos > 0, "No hay machos en Gurans"
        assert hembras > 0, "No hay hembras en Gurans"
        
    except Exception as e:
        logger.error(f"Error verificando datos de Gurans: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_api_endpoints_with_real_data():
    """Test para verificar que los endpoints API funcionan con los datos reales importados"""
    try:
        # Verificar que la API devuelve animales de Gurans
        gurans = await Explotacio.get_or_none(nom="Gurans")
        assert gurans is not None, "No se encontró la explotación Gurans"
        
        # Endpoint de listado por explotación
        response = client.get(f"/api/animals?explotacio_id={gurans.id}")
        assert response.status_code == 200, f"Error en endpoint /api/animals: {response.text}"
        
        data = response.json()
        assert "data" in data, "Respuesta API no tiene campo 'data'"
        assert len(data["data"]) > 0, "No se encontraron animales en la API"
        
        logger.info(f"API devolvió {len(data['data'])} animales de Gurans")
        
        # Verificar dashboard con datos reales
        response = client.get("/api/dashboard/stats")
        assert response.status_code == 200, f"Error en endpoint /api/dashboard/stats: {response.text}"
        
        stats = response.json()
        assert "data" in stats, "Respuesta API de dashboard no tiene campo 'data'"
        assert "total_animals" in stats["data"], "No se encontraron estadísticas de animales"
        
        logger.info(f"Dashboard reporta {stats['data']['total_animals']} animales en total")
        
        # Verificar búsqueda por género
        response = client.get("/api/animals/search?genere=F")
        assert response.status_code == 200
        hembras = response.json()
        
        logger.info(f"Búsqueda API devolvió {len(hembras['data'])} hembras")
        
    except Exception as e:
        logger.error(f"Error verificando endpoints API: {str(e)}")
        raise