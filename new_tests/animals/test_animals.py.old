import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_animals(async_client: AsyncClient):
    response = await async_client.get("/api/v1/animals/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    for animal in response.json():
        assert "explotacio" in animal
        assert "NOM" in animal
        assert "Genere" in animal
        assert "Estado" in animal
        assert "Alletar" in animal  # Validar que el campo alletar está presente

@pytest.mark.asyncio
async def test_get_animal_by_id(async_client: AsyncClient):
    # Crear un animal de prueba
    new_animal = {
        "explotacio": "Gurans",
        "NOM": "Test Animal",
        "Genere": "M",
        "Estado": "OK",
        "Alletar": 1
    }
    create_response = await async_client.post("/api/v1/animals/", json=new_animal)
    assert create_response.status_code == 201
    animal_id = create_response.json()["id"]

    # Obtener el animal por ID
    response = await async_client.get(f"/api/v1/animals/{animal_id}")
    assert response.status_code == 200
    animal = response.json()
    assert animal["explotacio"] == "Gurans"
    assert animal["NOM"] == "Test Animal"
    assert animal["Genere"] == "M"
    assert animal["Estado"] == "OK"
    assert animal["Alletar"] == 1  # Validar que el campo alletar está presente y correcto

@pytest.mark.asyncio
async def test_create_animal(async_client: AsyncClient):
    new_animal = {
        "explotacio": "Gurans",
        "NOM": "Nuevo Animal",
        "Genere": "F",
        "Estado": "OK",
        "Alletar": 2
    }
    response = await async_client.post("/api/v1/animals/", json=new_animal)
    assert response.status_code == 201
    created_animal = response.json()
    assert created_animal["explotacio"] == "Gurans"
    assert created_animal["NOM"] == "Nuevo Animal"
    assert created_animal["Genere"] == "F"
    assert created_animal["Estado"] == "OK"
    assert created_animal["Alletar"] == 2  # Validar que el campo alletar está presente y correcto

@pytest.mark.asyncio
async def test_update_animal(async_client: AsyncClient):
    # Crear un animal de prueba
    new_animal = {
        "explotacio": "Gurans",
        "NOM": "Animal a Actualizar",
        "Genere": "M",
        "Estado": "OK",
        "Alletar": 0
    }
    create_response = await async_client.post("/api/v1/animals/", json=new_animal)
    assert create_response.status_code == 201
    animal_id = create_response.json()["id"]

    # Actualizar el animal
    updated_data = {
        "NOM": "Animal Actualizado",
        "Estado": "DEF",
        "Alletar": 1
    }
    update_response = await async_client.patch(f"/api/v1/animals/{animal_id}", json=updated_data)
    assert update_response.status_code == 200
    updated_animal = update_response.json()
    assert updated_animal["NOM"] == "Animal Actualizado"
    assert updated_animal["Estado"] == "DEF"
    assert updated_animal["Alletar"] == 1  # Validar que el campo alletar se actualizó correctamente

@pytest.mark.asyncio
async def test_delete_animal(async_client: AsyncClient):
    # Crear un animal de prueba
    new_animal = {
        "explotacio": "Gurans",
        "NOM": "Animal a Eliminar",
        "Genere": "F",
        "Estado": "OK",
        "Alletar": 0
    }
    create_response = await async_client.post("/api/v1/animals/", json=new_animal)
    assert create_response.status_code == 201
    animal_id = create_response.json()["id"]

    # Eliminar el animal
    delete_response = await async_client.delete(f"/api/v1/animals/{animal_id}")
    assert delete_response.status_code == 204

    # Verificar que el animal ya no existe
    get_response = await async_client.get(f"/api/v1/animals/{animal_id}")
    assert get_response.status_code == 404