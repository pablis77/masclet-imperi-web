import pytest
from tortoise.contrib.test import TestCase
from app.models.animal import Animal
from app.models.partos import Part
from app.models.explotacion import Explotacio
import asyncio

class TestAnimalCounts(TestCase):
    async def test_count_active_animals_by_gender(self):
        # Crear explotación de prueba
        explotacion = await Explotacio.create(
            nom="Test Explotación",
            explotacio="TEST001"
        )
        
        # Crear animales de prueba
        # 10 toros activos
        for i in range(10):
            await Animal.create(
                nom=f"Toro{i}",
                genere="M",
                estado="OK",
                explotacio=explotacion.explotacio
            )
        
        # 1 toro fallecido
        await Animal.create(
            nom="Toro Fallecido",
            genere="M",
            estado="DEF",
            explotacio=explotacion.explotacio
        )
        
        # 84 vacas activas
        for i in range(84):
            await Animal.create(
                nom=f"Vaca{i}",
                genere="F",
                estado="OK",
                explotacio=explotacion.explotacio
            )
        
        # 5 vacas fallecidas
        for i in range(5):
            await Animal.create(
                nom=f"Vaca Fallecida {i}",
                genere="F",
                estado="DEF",
                explotacio=explotacion.explotacio
            )
        
        # Contar animales activos por género
        active_males = await Animal.filter(genere="M", estado="OK").count()
        active_females = await Animal.filter(genere="F", estado="OK").count()
        
        # Verificar los conteos
        assert active_males == 10, f"Se esperaban 10 toros activos, se encontraron {active_males}"
        assert active_females == 84, f"Se esperaban 84 vacas activas, se encontraron {active_females}"
        
        # Verificar totales
        total_animals = await Animal.all().count()
        assert total_animals == 100, f"Se esperaban 100 animales en total, se encontraron {total_animals}"

    async def test_real_data_counts(self):
        """
        Test que cuenta los animales reales en la base de datos
        para verificar las estadísticas mostradas en el dashboard.
        """
        # Contar animales activos por género en la base de datos real
        active_males = await Animal.filter(genere="M", estado="OK").count()
        active_females = await Animal.filter(genere="F", estado="OK").count()
        
        # Contar animales fallecidos
        dead_males = await Animal.filter(genere="M", estado="DEF").count()
        dead_females = await Animal.filter(genere="F", estado="DEF").count()
        
        # Imprimir resultados para depuración
        print("\n=== Estadísticas de animales ===")
        print(f"Toros activos (M): {active_males}")
        print(f"Toros fallecidos: {dead_males}")
        print(f"Vacas activas (F): {active_females}")
        print(f"Vacas fallecidas: {dead_females}")
        print(f"Total animales: {active_males + active_females + dead_males + dead_females}")
        
        # Verificar que hay al menos un animal (para que la prueba no falle en desarrollo)
        assert (active_males + active_females + dead_males + dead_females) > 0, "No se encontraron animales en la base de datos"

# Para ejecutar este test manualmente:
# pytest new_tests/animals/test_animal_counts.py -v -s
