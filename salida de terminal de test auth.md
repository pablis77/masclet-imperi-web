(masclet-imperi) PS C:\Proyectos\claude\masclet-imperi-web> pytest new_tests/auth/test_auth.py
====================================== test session starts ======================================
platform win32 -- Python 3.11.11, pytest-8.3.4, pluggy-1.5.0
rootdir: C:\Proyectos\claude\masclet-imperi-web
configfile: pytest.ini
plugins: anyio-3.7.1, asyncio-0.25.3, cov-6.0.0, env-1.1.5, ordering-0.6
asyncio: mode=Mode.AUTO, asyncio_default_fixture_loop_scope=function
collected 1 item

new_tests\auth\test_auth.py F                                                              [100%]

=========================================== FAILURES ============================================
__________________________________________ test_login ___________________________________________

    @pytest.mark.asyncio
    async def test_login():
        """Test para el endpoint de login."""
        url = f"{BASE_URL}/login"
        credentials = {
            "username": "admin",
            "password": "admin123"
        }
    
        async with AsyncClient() as client:
            response = await client.post(url, data=credentials, headers={"Content-Type": "application/x-www-form-urlencoded"})
    
>           assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
E           AssertionError: Error: 401 - {"detail":"Credenciales incorrectos"}
E           assert 401 == 200
E            +  where 401 = <Response [401 Unauthorized]>.status_code

new_tests\auth\test_auth.py:18: AssertionError
==================================== short test summary info ====================================
FAILED new_tests/auth/test_auth.py::test_login - AssertionError: Error: 401 - {"detail":"Credenciales incorrectos"}
======================================= 1 failed in 0.55s =======================================
(masclet-imperi) PS C:\Proyectos\claude\masclet-imperi-web>

### Resultados de Tests de Autenticación

#### `test_auth.py`
- **Estado**: Fallido
- **Problema**: Error de conexión con la dirección `192.168.68.57`.
- **Mensaje de Error**:
  ```
  HTTPConnectionPool(host='192.168.68.57', port=8000): Max retries exceeded with url: /api/v1/auth/login (Caused by ConnectTimeoutError(...))
  ```

#### `test_http_login.py`
- **Estado**: Fallido
- **Problema**: Código de estado `401` con el mensaje `"Credenciales incorrectos"`.
- **Detalles de Respuesta**:
  ```json
  {
    "detail": "Credenciales incorrectos"
  }
  ```

#### `test_auth_simple.py`
- **Estado**: Exitoso
- **Detalles**:
  - Código de estado: `200`
  - Token generado correctamente.
  - **Token**: `eyJhbGciOiJIUzI1NiIs...` (truncado por seguridad).

---

(masclet-imperi) PS C:\Proyectos\claude\masclet-imperi-web> pytest new_tests/auth/test_auth.py
======================================================= test session starts ========================================================
platform win32 -- Python 3.11.11, pytest-8.3.4, pluggy-1.5.0
rootdir: C:\Proyectos\claude\masclet-imperi-web
configfile: pytest.ini
plugins: anyio-3.7.1, asyncio-0.25.3, cov-6.0.0, env-1.1.5, ordering-0.6
asyncio: mode=Mode.AUTO, asyncio_default_fixture_loop_scope=function
collected 1 item

new_tests\auth\test_auth.py F                                                                                                 [100%]

============================================================= FAILURES =============================================================
____________________________________________________________ test_login ____________________________________________________________

    @pytest.mark.asyncio
    async def test_login():
        """Test para el endpoint de login."""
        url = f"{BASE_URL}/login"
        credentials = {
            "username": "admin",
            "password": "admin123"
        }
    
        async with AsyncClient() as client:
            response = await client.post(url, data=credentials, headers={"Content-Type": "application/x-www-form-urlencoded"})
    
>           assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
E           AssertionError: Error: 401 - {"detail":"Credenciales incorrectos"}
E           assert 401 == 200
E            +  where 401 = <Response [401 Unauthorized]>.status_code

new_tests\auth\test_auth.py:18: AssertionError
===================================================== short test summary info ======================================================
FAILED new_tests/auth/test_auth.py::test_login - AssertionError: Error: 401 - {"detail":"Credenciales incorrectos"}
======================================================== 1 failed in 0.49s =========================================================
(masclet-imperi) PS C:\Proyectos\claude\masclet-imperi-web>
