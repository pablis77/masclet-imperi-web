import sys
from pathlib import Path
from datetime import datetime

# Add backend directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

from app.models.animal import Animal, Genere, Estat
from tortoise import Tortoise, run_async

async def init():
    await Tortoise.init(
        db_url='postgres://postgres:1234@localhost:5432/masclet_imperi',
        modules={'models': ['app.models.animal', 'app.models.parto']}
    )
    
    # Create test animal with REAL fields from CSV
    await Animal.create(
        alletar=False,
        explotacio="Gurans",
        nom="Test-01",
        genere="M",           # M/F como en CSV
        pare=None,            # Opcional
        mare=None,            # Opcional
        quadra=None,          # Opcional
        cod="7892",
        num_serie="ES07090513",
        dob=datetime.strptime("31/01/2020", "%d/%m/%Y").date(),
        estado="OK"           # OK/DEF como en CSV
    )

if __name__ == "__main__":
    run_async(init())