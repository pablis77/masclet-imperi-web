(masclet-imperi) PS C:\Proyectos\claude\masclet-imperi-web> python -m pytest backend/tests/services/test_dashboard_integration.py -v
================================================== test session starts ===================================================
platform win32 -- Python 3.11.11, pytest-8.3.4, pluggy-1.5.0 -- C:\Users\Usuario\anaconda3\envs\masclet-imperi\python.exe
cachedir: .pytest_cache
rootdir: C:\Proyectos\claude\masclet-imperi-web\backend
configfile: pytest.ini
plugins: anyio-3.7.1, asyncio-0.25.3, cov-6.0.0, env-1.1.5, ordering-0.6
asyncio: mode=Mode.AUTO, asyncio_default_fixture_loop_scope=session
collected 6 items

backend\tests\services\test_dashboard_integration.py::test_dashboard_integration PASSED                             [ 16%]
backend\tests\services\test_dashboard_integration.py::test_dashboard_explotacion_integration PASSED                 [ 33%]
backend\tests\services\test_dashboard_integration.py::test_dashboard_filtro_fechas_integration PASSED               [ 50%]
backend\tests\services\test_dashboard_integration.py::test_dashboard_combined_filters_integration PASSED            [ 66%]
backend\tests\services\test_dashboard_integration.py::test_dashboard_role_permissions FAILED                        [ 83%]
backend\tests\services\test_dashboard_integration.py::test_dashboard_edge_cases PASSED                              [100%]

======================================================== FAILURES ========================================================
____________________________________________ test_dashboard_role_permissions _____________________________________________

setup_test_data = {'animales': [<Animal: 1>, <Animal: 2>, <Animal: 3>, <Animal: 4>, <Animal: 5>], 'explotaciones': [<Explotacio: 1>, <Explotacio: 2>], 'partos': [<Part: 1>, <Part: 2>]}
mock_gerente_user = <User: 2>, mock_normal_user = <User: 3>
auth_gerente = <tests.services.test_dashboard_integration.auth_gerente.<locals>.AuthContextManager object at 0x00000230F2C39F90>
auth_normal = <tests.services.test_dashboard_integration.auth_normal.<locals>.AuthContextManager object at 0x00000230F30BFA90>

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
>           assert response.status_code == 403  # Acceso denegado
E           assert 200 == 403
E            +  where 200 = <Response [200 OK]>.status_code

backend\tests\services\test_dashboard_integration.py:373: AssertionError
--------------------------------------------------- Captured log call ---------------------------------------------------- 
WARNING  app.api.endpoints.dashboard:dashboard.py:85 Usuario gerente@test.com intentó acceder a explotación 2 sin permisos 
WARNING  app.api.endpoints.dashboard:dashboard.py:36 Usuario normal@test.com intentó acceder a estadísticas generales sin permisos
================================================ short test summary info ================================================= 
FAILED backend\tests\services\test_dashboard_integration.py::test_dashboard_role_permissions - assert 200 == 403
============================================== 1 failed, 5 passed in 1.12s =============================================== 
(masclet-imperi) PS C:\Proyectos\claude\masclet-imperi-web> 