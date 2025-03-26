import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_partos_includes_csv_fields(async_client: AsyncClient):
    response = await async_client.get("/api/v1/partos")
    assert response.status_code == 200
    data = response.json()["data"]
    assert "items" in data
    for parto in data["items"]:
        assert "part" in parto  # Validar que el campo `part` (fecha del parto) está presente
        assert "GenereT" in parto  # Validar que el campo `GenereT` (género del ternero) está presente
        assert "EstadoT" in parto  # Validar que el campo `EstadoT` (estado del ternero) está presente
        assert "id" in parto  # Validar que el campo `id` está presente
        assert "animal_id" in parto  # Validar que el campo `animal_id` está presente
        assert "numero_part" in parto  # Validar que el campo `numero_part` está presente

@pytest.mark.asyncio
async def test_get_parto_includes_csv_fields(async_client: AsyncClient):
    # Crear un parto de prueba
    new_parto = {
        "animal_id": 1,
        "part": "15/03/2023",
        "GenereT": "M",
        "EstadoT": "OK",
        "numero_part": 1
    }
    create_response = await async_client.post("/api/v1/partos", json=new_parto)
    assert create_response.status_code == 201
    parto_id = create_response.json()["data"]["id"]

    # Obtener el parto por ID
    response = await async_client.get(f"/api/v1/partos/{parto_id}")
    assert response.status_code == 200
    parto = response.json()["data"]
    assert "part" in parto  # Validar que el campo `part` está presente
    assert "GenereT" in parto  # Validar que el campo `GenereT` está presente
    assert "EstadoT" in parto  # Validar que el campo `EstadoT` está presente
    assert "id" in parto  # Validar que el campo `id` está presente
    assert "animal_id" in parto  # Validar que el campo `animal_id` está presente
    assert "numero_part" in parto  # Validar que el campo `numero_part` está presente