"""
Tests de integración para el dashboard
"""
import pytest
import asyncio
from datetime import date, timedelta
from fastapi.testclient import TestClient
from tortoise import Tortoise
import os

from app.main import app
from app.core.auth import get_current_user
from app.models.user import User, UserRole
from app.models.animal import Animal, Part
from app.models.explotacio import Explotacio

# Cliente de test para FastAPI
client = TestClient(app)

# Función helper para obtener fechas de prueba válidas
def get_valid_test_date():
    """Devuelve una fecha válida en el pasado para pruebas"""
    return date.today() - timedelta(days=10)

# Fixture para inicializar la base de datos de pruebas
@pytest.fixture(scope="module")
async def initialize_tests():
    """Inicializa Tortoise ORM para las pruebas"""
    # Configuración de la base de datos de pruebas
    DB_URL = "sqlite://:memory:"
    
    # Inicializar Tortoise con todos los modelos
    await Tortoise.init(
        db_url=DB_URL,
        modules={"models": ["app.models.animal", "app.models.user", "app.models.explotacio"]}
    )
    
    # Crear esquemas
    await Tortoise.generate_schemas()
    
    yield
    
    # Cerrar conexiones al finalizar
    await Tortoise._drop_databases()
    await Tortoise.close_connections()

# Fixtures para inicializar la base de datos
@pytest.fixture(scope="module")
async def setup_test_data(initialize_tests):
    """Fixture para inicializar datos de prueba"""
    # Crear explotaciones
    explotacion1 = await Explotacio.create(nom="Integración Test 1", activa=True)
    explotacion2 = await Explotacio.create(nom="Integración Test 2", activa=True)
    
    # Fechas para simular distribución temporal
    hoy = date.today()
    ayer = hoy - timedelta(days=1)
    mes_pasado = hoy - timedelta(days=30)
    
    # Crear animales para explotación 1
    animal1 = await Animal.create(
        nom="Toro-Int-1", 
        explotacio=explotacion1, 
        genere="M", 
        estado="OK",
        data_naixement=hoy - timedelta(days=500)
    )
    
    animal2 = await Animal.create(
        nom="Vaca-Int-1", 
        explotacio=explotacion1, 
        genere="F", 
        estado="OK", 
        alletar=1,
        data_naixement=hoy - timedelta(days=300)
    )
    
    animal3 = await Animal.create(
        nom="Vaca-Int-2", 
        explotacio=explotacion1, 
        genere="F", 
        estado="DEF",
        data_naixement=hoy - timedelta(days=700)
    )
    
    # Crear animales para explotación 2
    animal4 = await Animal.create(
        nom="Toro-Int-3", 
        explotacio=explotacion2, 
        genere="M", 
        estado="OK",
        data_naixement=hoy - timedelta(days=450)
    )
    
    animal5 = await Animal.create(
        nom="Vaca-Int-3", 
        explotacio=explotacion2, 
        genere="F", 
        estado="OK", 
        alletar=2,
        data_naixement=hoy - timedelta(days=350)
    )
    
    # Crear partos para simular actividad
    parto1 = await Part.create(
        animal=animal2,
        data=ayer,
        hora="10:00",
        comentari="Parto de prueba reciente",
        num_fills=2,
        genere_t="F",
        estado_t="OK",
        genere_fill="F",
        numero_part=1
    )
    
    parto2 = await Part.create(
        animal=animal5,
        data=mes_pasado,
        hora="15:30",
        comentari="Parto de prueba anterior",
        num_fills=1,
        genere_t="M",
        estado_t="OK",
        genere_fill="M",
        numero_part=1
    )
    
    yield {
        "explotaciones": [explotacion1, explotacion2],
        "animales": [animal1, animal2, animal3, animal4, animal5],
        "partos": [parto1, parto2]
    }
    
    # Limpiar datos después de las pruebas
    for parto in [parto1, parto2]:
        await parto.delete()
    
    for animal in [animal1, animal2, animal3, animal4, animal5]:
        await animal.delete()
    
    await explotacion1.delete()
    await explotacion2.delete()


@pytest.fixture
def mock_admin_user():
    """Fixture para mockear un usuario admin"""
    usuario = User(
        id=1,
        username="admin@test.com",
        nombre="Admin Test",
        role=UserRole.ADMIN,
        is_active=True
    )
    return usuario


@pytest.fixture
def auth_admin(mock_admin_user):
    """Fixture para autenticar como admin"""
    app.dependency_overrides[get_current_user] = lambda: mock_admin_user
    yield
    app.dependency_overrides = {}


@pytest.fixture
def mock_gerente_user():
    """Fixture para mockear un usuario gerente"""
    usuario = User(
        id=2,
        username="gerente@test.com",
        nombre="Gerente Test",
        role=UserRole.GERENTE,
        is_active=True,
        explotacio_id=None  # Será asignado dinámicamente
    )
    return usuario


@pytest.fixture
def mock_normal_user():
    """Fixture para mockear un usuario normal"""
    usuario = User(
        id=3,
        username="normal@test.com",
        nombre="Usuario Normal",
        role=UserRole.USER,
        is_active=True,
        explotacio_id=None  # Será asignado dinámicamente
    )
    return usuario


@pytest.fixture
def auth_gerente(mock_gerente_user):
    """Fixture para autenticar como gerente"""
    original_override = app.dependency_overrides.get(get_current_user, None)
    class AuthContextManager:
        def __enter__(self):
            app.dependency_overrides[get_current_user] = lambda: mock_gerente_user
            return self
        def __exit__(self, exc_type, exc_value, traceback):
            if original_override:
                app.dependency_overrides[get_current_user] = original_override
            else:
                app.dependency_overrides.pop(get_current_user, None)
    return AuthContextManager()


@pytest.fixture
def auth_normal(mock_normal_user):
    """Fixture para autenticar como usuario normal"""
    original_override = app.dependency_overrides.get(get_current_user, None)
    class AuthContextManager:
        def __enter__(self):
            app.dependency_overrides[get_current_user] = lambda: mock_normal_user
            return self
        def __exit__(self, exc_type, exc_value, traceback):
            if original_override:
                app.dependency_overrides[get_current_user] = original_override
            else:
                app.dependency_overrides.pop(get_current_user, None)
    return AuthContextManager()


@pytest.mark.asyncio
async def test_dashboard_integration(setup_test_data, auth_admin):
    """Test de integración para verificar estadísticas con datos reales"""
    # Obtener estadísticas globales
    response = client.get("/api/v1/dashboard/stats")
    assert response.status_code == 200
    
    data = response.json()
    
    # Verificar que las estadísticas reflejan los datos de prueba
    assert data["animales"]["total"] >= 5  # Al menos nuestros 5 animales
    assert data["animales"]["machos"] >= 2  # Al menos nuestros 2 machos
    assert data["animales"]["hembras"] >= 3  # Al menos nuestras 3 hembras
    
    assert data["partos"]["total"] >= 2  # Al menos nuestros 2 partos
    assert data["partos"]["ultimo_mes"] >= 1  # Al menos 1 parto reciente
    
    # Verificar distribución de edades
    assert "edades" in data["animales"]
    
    # Verificar que hay datos de alletar
    assert "por_alletar" in data["animales"]
    
    # Verificar que hay datos de género de cría
    assert "por_genero_cria" in data["partos"]
    
    # Verificar que hay datos de cuadras (aunque pueden estar vacíos en esta prueba)
    assert "por_quadra" in data["animales"]
    
    # Verificar tendencias
    assert "comparativas" in data
    assert "tendencia_partos" in data["comparativas"]
    assert "tendencia_animales" in data["comparativas"]


@pytest.mark.asyncio
async def test_dashboard_explotacion_integration(setup_test_data, auth_admin):
    """Test de integración para verificar estadísticas filtradas por explotación"""
    # Obtener el ID de la primera explotación
    explotacion_id = setup_test_data["explotaciones"][0].id
    
    # Obtener estadísticas para esa explotación
    response = client.get(f"/api/v1/dashboard/explotacions/{explotacion_id}")
    assert response.status_code == 200
    
    data = response.json()
    
    # Verificar que las estadísticas son específicas para la explotación
    assert data["explotacio_id"] == explotacion_id
    assert data["nombre_explotacio"] == "Integración Test 1"
    
    # Verificar conteos específicos de esta explotación
    assert data["animales"]["total"] == 3  # Exactamente 3 animales
    assert data["animales"]["machos"] == 1  # 1 macho
    assert data["animales"]["hembras"] == 2  # 2 hembras
    
    # Verificar que el parto de esta explotación se contabiliza
    assert data["partos"]["total"] == 1
    
    # Verificar nuevos campos
    assert "por_alletar" in data["animales"]
    assert "por_quadra" in data["animales"]
    assert "edades" in data["animales"]
    assert "por_genero_cria" in data["partos"]
    assert "tasa_supervivencia" in data["partos"]


@pytest.mark.asyncio
async def test_dashboard_filtro_fechas_integration(setup_test_data, auth_admin):
    """Test de integración para verificar filtrado por fechas"""
    # Obtener fechas para el filtro
    hoy = date.today()
    hace_15_dias = hoy - timedelta(days=15)
    
    # Obtener estadísticas filtradas por fecha
    response = client.get(f"/api/v1/dashboard/stats?start_date={hace_15_dias}&end_date={hoy}")
    assert response.status_code == 200
    
    data = response.json()
    
    # Verificar que las estadísticas están filtradas por fecha
    # Solo debería incluir el parto reciente (de ayer)
    assert data["partos"]["total"] == 1
    
    # Verificar que las tendencias también están filtradas
    assert "comparativas" in data
    assert "tendencia_partos" in data["comparativas"]


@pytest.mark.asyncio
async def test_dashboard_combined_filters_integration(setup_test_data, auth_admin):
    """Test de integración para verificar combinación de filtros"""
    # Obtener el ID de la segunda explotación
    explotacion_id = setup_test_data["explotaciones"][1].id
    
    # Obtener fechas para el filtro
    hoy = date.today()
    hace_60_dias = hoy - timedelta(days=60)
    
    # Obtener estadísticas con filtros combinados
    response = client.get(
        f"/api/v1/dashboard/stats?explotacio_id={explotacion_id}&start_date={hace_60_dias}&end_date={hoy}"
    )
    assert response.status_code == 200
    
    data = response.json()
    
    # Verificar que las estadísticas reflejan la combinación de filtros
    assert data["animales"]["total"] == 2  # Solo los animales de explotación 2
    assert data["partos"]["total"] == 1  # Solo el parto de explotación 2
    
    # Verificar que los datos son específicos para esta explotación
    assert data["animales"]["por_quadra"] is not None


@pytest.mark.asyncio
async def test_dashboard_role_permissions(setup_test_data, mock_gerente_user, mock_normal_user, auth_gerente, auth_normal):
    """Test para verificar los permisos según el rol del usuario"""
    # Asignar explotaciones a los usuarios
    explotacion_id_1 = setup_test_data["explotaciones"][0].id
    explotacion_id_2 = setup_test_data["explotaciones"][1].id
    
    # Asignar la primera explotación al gerente
    mock_gerente_user.explotacio_id = explotacion_id_1
    
    # Prueba como gerente - debería poder ver sus explotaciones asignadas
    with auth_gerente:
        # Verificar acceso a su explotación asignada
        response = client.get(f"/api/v1/dashboard/explotacions/{explotacion_id_1}")
        assert response.status_code == 200
        
        # Verificar bloqueo a otras explotaciones
        response = client.get(f"/api/v1/dashboard/explotacions/{explotacion_id_2}")
        assert response.status_code == 403  # Acceso denegado
    
    # Asignar la segunda explotación al usuario normal
    mock_normal_user.explotacio_id = explotacion_id_2
    
    # Prueba como usuario normal - no debería poder acceder a las estadísticas
    with auth_normal:
        # Verificar que no puede acceder a estadísticas generales
        response = client.get("/api/v1/dashboard/stats")
        assert response.status_code == 403  # Acceso denegado
        
        # Verificar que no puede acceder a estadísticas de explotación
        response = client.get(f"/api/v1/dashboard/explotacions/{explotacion_id_2}")
        assert response.status_code == 403  # Acceso denegado


@pytest.mark.asyncio
async def test_dashboard_edge_cases(setup_test_data, auth_admin):
    """Test para verificar casos de borde"""
    # Caso: Sin datos (filtro por fechas futuras)
    future_date = date.today() + timedelta(days=30)
    
    response = client.get(f"/api/v1/dashboard/stats?start_date={future_date}")
    assert response.status_code == 200
    
    data = response.json()
    
    # Verificar que responde correctamente sin datos
    assert data["animales"]["total"] == 0
    assert data["partos"]["total"] == 0
    
    # Caso: Explotación inexistente
    response = client.get("/api/v1/dashboard/explotacions/99999")
    assert response.status_code == 404  # No encontrado